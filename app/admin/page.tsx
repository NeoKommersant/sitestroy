"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import * as XLSX from "xlsx";
import type { Category, Item, Subcategory } from "@/data/catalog";
import { CATEGORIES } from "@/data/catalog";

type EditableCategory = Category;

const createCategory = (): EditableCategory => ({
  slug: `category-${Date.now()}`,
  title: "Новая категория",
  intro: "",
  image: "",
  sub: [],
});

const createSubcategory = (): Subcategory => ({
  slug: `subcategory-${Date.now()}`,
  title: "Новая подкатегория",
  intro: "",
  items: [],
});

const createItem = (): Item => ({
  slug: `item-${Date.now()}`,
  title: "Новая позиция",
  sku: "",
  desc: "",
});

const CYRILLIC_MAP: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "shh",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

const slugify = (input: string) => {
  const lower = input.trim().toLowerCase();
  let transliterated = "";
  for (const char of lower) {
    transliterated += CYRILLIC_MAP[char] ?? char;
  }
  return transliterated
    .replace(/[^a-z0-9\s_-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "slug";
};

type ImportSummary = {
  categories: number;
  subcategories: number;
  items: number;
};

type ImportPreview = {
  filename: string;
  data: EditableCategory[];
  summary: ImportSummary;
  warnings: string[];
  errors: string[];
};

type ImportState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; preview: ImportPreview }
  | { status: "error"; message: string };

const REQUIRED_COLUMNS = ["category", "subcategory", "item"] as const;

const normalizeCell = (value: unknown) => {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return `${value}`;
  return String(value).trim();
};

const mapRowKeys = (row: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(row).map(([key, value]) => [key.trim().toLowerCase(), value])) as Record<
    string,
    unknown
  >;

const cloneCategories = (data: EditableCategory[]): EditableCategory[] =>
  data.map((category) => ({
    ...category,
    sub: category.sub.map((sub) => ({
      ...sub,
      items: sub.items.map((item) => ({ ...item })),
    })),
  }));

const parseExcelFile = async (file: File): Promise<ImportPreview> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("Файл не содержит листов.");
  }
  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  if (rawRows.length === 0) {
    throw new Error("Файл не содержит данных.");
  }

  const rows = rawRows.map(mapRowKeys);
  const availableColumns = new Set(Object.keys(rows[0] ?? {}));
  const missingColumns = REQUIRED_COLUMNS.filter((column) => !availableColumns.has(column));
  if (missingColumns.length > 0) {
    throw new Error(`В таблице отсутствуют обязательные колонки: ${missingColumns.join(", ")}`);
  }

  const categoryMap = new Map<string, EditableCategory>();
  const subcategoryStore = new Map<string, Map<string, Subcategory>>();
  const warnings = new Set<string>();
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const categoryTitle = normalizeCell(row["category"]);
    const subcategoryTitle = normalizeCell(row["subcategory"]);
    const itemTitle = normalizeCell(row["item"]);

    if (!categoryTitle || !subcategoryTitle || !itemTitle) {
      errors.push(`Строка ${rowNumber}: заполните колонки Category, Subcategory и Item.`);
      return;
    }

    const categorySlug = normalizeCell(row["category_slug"]) || slugify(categoryTitle);
    const categoryIntro = normalizeCell(row["category_intro"]);
    const categoryImage = normalizeCell(row["category_image"]);

    let category = categoryMap.get(categorySlug);
    if (!category) {
      category = {
        slug: categorySlug,
        title: categoryTitle,
        intro: categoryIntro,
        image: categoryImage,
        sub: [],
      };
      categoryMap.set(categorySlug, category);
      subcategoryStore.set(categorySlug, new Map());
    } else {
      if (categoryIntro && !category.intro) category.intro = categoryIntro;
      if (categoryImage && !category.image) category.image = categoryImage;
    }

    const subSlug = normalizeCell(row["subcategory_slug"]) || slugify(subcategoryTitle);
    const subIntro = normalizeCell(row["subcategory_intro"]);
    const subRange = normalizeCell(row["subcategory_range"]);

    const subMap = subcategoryStore.get(categorySlug)!;
    let subcategory = subMap.get(subSlug);
    if (!subcategory) {
      subcategory = {
        slug: subSlug,
        title: subcategoryTitle,
        intro: subIntro,
        range: subRange,
        items: [],
      };
      subMap.set(subSlug, subcategory);
      category.sub.push(subcategory);
    } else {
      if (subIntro && !subcategory.intro) subcategory.intro = subIntro;
      if (subRange && !subcategory.range) subcategory.range = subRange;
      if (subcategory.title !== subcategoryTitle) {
        warnings.add(`Строка ${rowNumber}: подкатегория "${subcategoryTitle}" переопределяет название со слугом ${subSlug}.`);
        subcategory.title = subcategoryTitle;
      }
    }

    const itemSlug = normalizeCell(row["item_slug"]) || slugify(itemTitle);
    const itemSku = normalizeCell(row["sku"] ?? row["item_sku"]);
    const itemDesc = normalizeCell(row["desc"] ?? row["item_desc"]);

    const existingItem = subcategory.items.find((item) => item.slug === itemSlug);
    if (existingItem) {
      warnings.add(`Строка ${rowNumber}: товар "${itemTitle}" перезаписал данные для слага ${itemSlug}.`);
      existingItem.title = itemTitle;
      existingItem.sku = itemSku || undefined;
      existingItem.desc = itemDesc || undefined;
    } else {
      subcategory.items.push({
        slug: itemSlug,
        title: itemTitle,
        sku: itemSku || undefined,
        desc: itemDesc || undefined,
      });
    }
  });

  const data = cloneCategories(Array.from(categoryMap.values()).filter((category) => category.sub.length > 0));
  const summary: ImportSummary = {
    categories: data.length,
    subcategories: data.reduce((total, category) => total + category.sub.length, 0),
    items: data.reduce(
      (total, category) => total + category.sub.reduce((count, subcategory) => count + subcategory.items.length, 0),
      0,
    ),
  };

  return {
    filename: file.name,
    data,
    summary,
    warnings: Array.from(warnings),
    errors,
  };
};

const mergeCategories = (base: EditableCategory[], incoming: EditableCategory[]) => {
  const merged = new Map<string, EditableCategory>(cloneCategories(base).map((category) => [category.slug, category]));

  incoming.forEach((incomingCategory) => {
    const category = cloneCategories([incomingCategory])[0];
    const existing = merged.get(category.slug);
    if (!existing) {
      merged.set(category.slug, category);
      return;
    }

    existing.title = category.title;
    if (category.intro) existing.intro = category.intro;
    if (category.image) existing.image = category.image;

    const subMap = new Map<string, Subcategory>(existing.sub.map((sub) => [sub.slug, sub]));

    category.sub.forEach((incomingSub) => {
      const subExisting = subMap.get(incomingSub.slug);
      if (!subExisting) {
        subMap.set(incomingSub.slug, incomingSub);
        return;
      }
      subExisting.title = incomingSub.title;
      if (incomingSub.intro) subExisting.intro = incomingSub.intro;
      if (incomingSub.range) subExisting.range = incomingSub.range;

      const itemMap = new Map<string, Item>(subExisting.items.map((item) => [item.slug, item]));
      incomingSub.items.forEach((incomingItem) => {
        itemMap.set(incomingItem.slug, incomingItem);
      });
      subExisting.items = Array.from(itemMap.values());
    });

    existing.sub = Array.from(subMap.values());
  });

  return Array.from(merged.values());
};

export default function AdminCatalogPage() {
  const [categories, setCategories] = useState<EditableCategory[]>(() => JSON.parse(JSON.stringify(CATEGORIES)));
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [clipboardStatus, setClipboardStatus] = useState<"idle" | "success" | "error">("idle");
  const [importState, setImportState] = useState<ImportState>({ status: "idle" });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedCategory = categories[selectedCategoryIndex];

  const jsonOutput = useMemo(() => JSON.stringify(categories, null, 2), [categories]);

  const handleImportFile = async (file: File) => {
    setImportState({ status: "loading" });
    try {
      const preview = await parseExcelFile(file);
      setImportState({ status: "ready", preview });
    } catch (error) {
      console.error("Import failed", error);
      setImportState({
        status: "error",
        message: error instanceof Error ? error.message : "Не удалось обработать файл.",
      });
    }
  };

  const onImportInput = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await handleImportFile(file);
  };

  const applyImport = (mode: "replace" | "merge") => {
    if (importState.status !== "ready") return;
    const data = cloneCategories(importState.preview.data);
    if (mode === "replace") {
      setCategories(data);
      setSelectedCategoryIndex(0);
    } else {
      setCategories((prev) => mergeCategories(prev, data));
    }
    setImportState({ status: "idle" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetImportState = () => {
    setImportState({ status: "idle" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateCategory = <K extends keyof EditableCategory>(field: K, value: EditableCategory[K]) => {
    setCategories((prev) =>
      prev.map((cat, idx) => (idx === selectedCategoryIndex ? { ...cat, [field]: value } : cat)),
    );
  };

  const updateSubcategory = <K extends keyof Subcategory>(subIndex: number, field: K, value: Subcategory[K]) => {
    setCategories((prev) =>
      prev.map((cat, idx) => {
        if (idx !== selectedCategoryIndex) return cat;
        const updatedSub = cat.sub.map((sub, sIdx) => (sIdx === subIndex ? { ...sub, [field]: value } : sub));
        return { ...cat, sub: updatedSub };
      }),
    );
  };

  const updateItem = <K extends keyof Item>(subIndex: number, itemIndex: number, field: K, value: Item[K]) => {
    setCategories((prev) =>
      prev.map((cat, idx) => {
        if (idx !== selectedCategoryIndex) return cat;
        const updatedSub = cat.sub.map((sub, sIdx) => {
          if (sIdx !== subIndex) return sub;
          const items = sub.items.map((item, iIdx) => (iIdx === itemIndex ? { ...item, [field]: value } : item));
          return { ...sub, items };
        });
        return { ...cat, sub: updatedSub };
      }),
    );
  };

  const addCategory = () => {
    setCategories((prev) => [...prev, createCategory()]);
    setSelectedCategoryIndex(categories.length);
  };

  const removeCategory = (index: number) => {
    setCategories((prev) => prev.filter((_, idx) => idx !== index));
    setSelectedCategoryIndex((prevIndex) => Math.max(0, Math.min(prevIndex, categories.length - 2)));
  };

  const addSubcategory = () => {
    setCategories((prev) =>
      prev.map((cat, idx) => (idx === selectedCategoryIndex ? { ...cat, sub: [...cat.sub, createSubcategory()] } : cat)),
    );
  };

  const removeSubcategory = (subIndex: number) => {
    setCategories((prev) =>
      prev.map((cat, idx) =>
        idx === selectedCategoryIndex ? { ...cat, sub: cat.sub.filter((_, sIdx) => sIdx !== subIndex) } : cat,
      ),
    );
  };

  const addItem = (subIndex: number) => {
    setCategories((prev) =>
      prev.map((cat, idx) => {
        if (idx !== selectedCategoryIndex) return cat;
        const updatedSub = cat.sub.map((sub, sIdx) =>
          sIdx === subIndex ? { ...sub, items: [...sub.items, createItem()] } : sub,
        );
        return { ...cat, sub: updatedSub };
      }),
    );
  };

  const removeItem = (subIndex: number, itemIndex: number) => {
    setCategories((prev) =>
      prev.map((cat, idx) => {
        if (idx !== selectedCategoryIndex) return cat;
        const updatedSub = cat.sub.map((sub, sIdx) =>
          sIdx === subIndex ? { ...sub, items: sub.items.filter((_, iIdx) => iIdx !== itemIndex) } : sub,
        );
        return { ...cat, sub: updatedSub };
      }),
    );
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonOutput);
      setClipboardStatus("success");
      setTimeout(() => setClipboardStatus("idle"), 2500);
    } catch (error) {
      console.error(error);
      setClipboardStatus("error");
      setTimeout(() => setClipboardStatus("idle"), 3000);
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-24 pt-10 sm:px-6 lg:flex-row lg:px-8">
      <aside className="lg:w-64">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">Категории</h1>
          <button
            type="button"
            onClick={addCategory}
            className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-blue-700 transition hover:border-blue-500 hover:bg-blue-50"
          >
            + Добавить
          </button>
        </div>
        <div className="space-y-2">
          {categories.map((category, index) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => setSelectedCategoryIndex(index)}
              className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left text-sm transition ${
                index === selectedCategoryIndex
                  ? "border-blue-500 bg-blue-50 text-blue-800"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span className="line-clamp-1">{category.title}</span>
              {categories.length > 1 && (
                <span
                  role="button"
                  aria-label="Удалить категорию"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeCategory(index);
                  }}
                  className="ml-3 text-xs text-slate-400 hover:text-red-500"
                >
                  ×
                </span>
              )}
            </button>
          ))}
          {categories.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
              Каталог пуст. Добавьте первую категорию.
            </div>
          )}
        </div>
        <div className="mt-8 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
          <div className="text-sm font-semibold text-slate-900">Как пользоваться</div>
          <ul className="space-y-2">
            <li>Редактор работает локально — изменения надо вручную перенести в файл `data/catalog.ts`.</li>
            <li>Используйте кнопку «Скопировать JSON», чтобы обновить данные в проекте.</li>
            <li>Slug генерируется автоматически, при необходимости можно отредактировать вручную.</li>
          </ul>
        </div>
      </aside>

      <main className="flex-1 space-y-8">
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Импорт из Excel</h2>
              <p className="text-sm text-slate-500">
                Загрузите файл .xlsx/.xls c колонками Category, Subcategory, Item. Дополнительные поля можно включать по мере необходимости.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-teal-500 hover:text-teal-600">
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={onImportInput} />
              Выбрать файл
            </label>
          </header>
          <p className="text-xs text-slate-500">
            Скачайте{" "}
            <a href="/templates/catalog-import.xlsx" className="font-semibold text-teal-600 hover:text-teal-500">
              шаблон для импорта
            </a>{" "}
            с примером заполнения.
          </p>
          {importState.status === "idle" && (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
              Поддерживаются дополнительные колонки: <code>category_intro</code>, <code>category_image</code>,{" "}
              <code>subcategory_intro</code>, <code>subcategory_range</code>, <code>sku</code>, <code>desc</code>.
            </p>
          )}
          {importState.status === "loading" && <p className="text-sm text-slate-500">Обрабатываем файл…</p>}
          {importState.status === "error" && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {importState.message}
              <button
                type="button"
                className="ml-3 text-xs font-semibold underline"
                onClick={resetImportState}
              >
                Сбросить
              </button>
            </div>
          )}
          {importState.status === "ready" && (
            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  {importState.preview.filename}
                </span>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  Категорий: {importState.preview.summary.categories}
                </span>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  Подкатегорий: {importState.preview.summary.subcategories}
                </span>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  Позиции: {importState.preview.summary.items}
                </span>
              </div>
              {importState.preview.errors.length > 0 && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                  <div className="font-semibold text-red-800">Ошибки</div>
                  <ul className="mt-2 space-y-1">
                    {importState.preview.errors.slice(0, 5).map((error) => (
                      <li key={error}>• {error}</li>
                    ))}
                  </ul>
              {importState.preview.errors.length > 5 && (
                    <div className="mt-2 text-[11px] text-red-600">
                      Показаны только 5 ошибок. Исправьте данные и загрузите файл повторно.
                    </div>
                  )}
                </div>
              )}
              {importState.preview.warnings.length > 0 && (
                <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-xs text-yellow-700">
                  <div className="font-semibold text-yellow-800">Предупреждения</div>
                  <ul className="mt-2 space-y-1">
                    {importState.preview.warnings.slice(0, 5).map((warning) => (
                      <li key={warning}>• {warning}</li>
                    ))}
                  </ul>
                  {importState.preview.warnings.length > 5 && (
                    <div className="mt-2 text-[11px] text-yellow-600">Показаны только 5 предупреждений.</div>
                  )}
                </div>
              )}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                <div className="font-semibold text-slate-900">Превью (первые 5 позиций)</div>
                <ul className="mt-2 space-y-1">
                  {importState.preview.data
                    .flatMap((category) =>
                      category.sub.flatMap((sub) =>
                        sub.items.map((item) => ({
                          category: category.title,
                          sub: sub.title,
                          item: item.title,
                          sku: item.sku,
                        })),
                      ),
                    )
                    .slice(0, 5)
                    .map((row, idx) => (
                      <li key={`${row.category}-${row.sub}-${row.item}-${idx}`}>
                        <span className="font-semibold text-slate-900">{row.item}</span>
                        <span className="text-slate-500">
                          {" "}
                          — {row.category} / {row.sub}
                        </span>
                        {row.sku && <span className="text-slate-400"> ({row.sku})</span>}
                      </li>
                    ))}
                </ul>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => applyImport("replace")}
                  className="inline-flex items-center justify-center rounded-full bg-teal-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={importState.preview.errors.length > 0}
                >
                  Заменить каталог
                </button>
                <button
                  type="button"
                  onClick={() => applyImport("merge")}
                  className="inline-flex items-center justify-center rounded-full border border-teal-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={importState.preview.errors.length > 0}
                >
                  Объединить с текущим
                </button>
                <button
                  type="button"
                  onClick={resetImportState}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </section>
        {selectedCategory ? (
          <>
            <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Карточка категории</h2>
                  <p className="text-sm text-slate-600">
                    Настройте slug, заголовок, изображение и описание. Слайдер и каталог используют эти поля.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateCategory("slug", slugify(selectedCategory.title))}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 transition hover:border-blue-500 hover:text-blue-700"
                >
                  Сгенерировать slug
                </button>
              </header>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Slug</span>
                  <input
                    value={selectedCategory.slug}
                    onChange={(event) => updateCategory("slug", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Изображение</span>
                  <input
                    value={selectedCategory.image}
                    onChange={(event) => updateCategory("image", event.target.value)}
                    placeholder="/img/products/..."
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Заголовок</span>
                <input
                  value={selectedCategory.title}
                  onChange={(event) => updateCategory("title", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Описание / интро</span>
                <textarea
                  value={selectedCategory.intro}
                  onChange={(event) => updateCategory("intro", event.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </section>

            <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <header className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Подкатегории ({selectedCategory.sub.length})
                  </h2>
                  <p className="text-sm text-slate-600">Редактируйте структуру и номенклатуру внутри каждой подкатегории.</p>
                </div>
                <button
                  type="button"
                  onClick={addSubcategory}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-blue-700 transition hover:border-blue-500 hover:bg-blue-50"
                >
                  + Подкатегория
                </button>
              </header>

              <div className="space-y-6">
                {selectedCategory.sub.map((sub, subIndex) => (
                  <div key={sub.slug} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">#{subIndex + 1} {sub.title}</h3>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateSubcategory(subIndex, "slug", slugify(sub.title))}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-blue-500 hover:text-blue-700"
                        >
                          slug
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSubcategory(subIndex)}
                          className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:border-red-400 hover:bg-red-50"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-1">
                        <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Slug</span>
                        <input
                          value={sub.slug}
                          onChange={(event) => updateSubcategory(subIndex, "slug", event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Название</span>
                        <input
                          value={sub.title}
                          onChange={(event) => updateSubcategory(subIndex, "title", event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        />
                      </label>
                    </div>
                    <label className="mt-3 block space-y-1">
                      <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Интро</span>
                      <textarea
                        value={sub.intro ?? ""}
                        onChange={(event) => updateSubcategory(subIndex, "intro", event.target.value)}
                        rows={3}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>

                    <div className="mt-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-700">
                          Номенклатура ({sub.items.length})
                        </div>
                        <button
                          type="button"
                          onClick={() => addItem(subIndex)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-blue-700 transition hover:border-blue-500 hover:bg-blue-50"
                        >
                          + Позиция
                        </button>
                      </div>

                      {sub.items.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-sm text-slate-500">
                          Пусто. Добавьте первую позицию.
                        </div>
                      )}

                      <div className="space-y-4">
                        {sub.items.map((item, itemIndex) => (
                          <div key={item.slug} className="rounded-2xl border border-white bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center justify-between">
                              <div className="text-sm font-semibold text-slate-900">
                                {item.title} <span className="text-slate-400">#{itemIndex + 1}</span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateItem(subIndex, itemIndex, "slug", slugify(item.title))}
                                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-blue-500 hover:text-blue-700"
                                >
                                  slug
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeItem(subIndex, itemIndex)}
                                  className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:border-red-400 hover:bg-red-50"
                                >
                                  Удалить
                                </button>
                              </div>
                            </div>
                            <div className="grid gap-3 md:grid-cols-3">
                              <label className="space-y-1 md:col-span-2">
                                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Название</span>
                                <input
                                  value={item.title}
                                  onChange={(event) => updateItem(subIndex, itemIndex, "title", event.target.value)}
                                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                />
                              </label>
                              <label className="space-y-1">
                                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Артикул (SKU)</span>
                                <input
                                  value={item.sku ?? ""}
                                  onChange={(event) => updateItem(subIndex, itemIndex, "sku", event.target.value)}
                                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                />
                              </label>
                            </div>
                            <label className="mt-3 block space-y-1">
                              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Описание</span>
                              <textarea
                                value={item.desc ?? ""}
                                onChange={(event) => updateItem(subIndex, itemIndex, "desc", event.target.value)}
                                rows={3}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                              />
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Выберите категорию или добавьте новую, чтобы начать.
          </div>
        )}

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Экспорт JSON</h2>
              <p className="text-sm text-slate-600">Скопируйте результат и замените массив `CATEGORIES` в `data/catalog.ts`.</p>
            </div>
            <button
              type="button"
              onClick={copyToClipboard}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:border-blue-500 hover:bg-blue-50"
            >
              Скопировать JSON
            </button>
          </header>
          <div className="relative">
            <pre className="max-h-[360px] overflow-auto rounded-2xl border border-slate-200 bg-slate-900/95 p-4 text-xs text-slate-100">
              {jsonOutput}
            </pre>
            {clipboardStatus === "success" && (
              <div className="absolute right-4 top-4 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white shadow">
                Скопировано
              </div>
            )}
            {clipboardStatus === "error" && (
              <div className="absolute right-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow">
                Не удалось скопировать
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}


