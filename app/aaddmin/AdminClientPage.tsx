"use client";
import { useMemo, useRef, useState, type ChangeEvent } from "react";
import * as XLSX from "xlsx";
import type { Category, Item } from "@/types/catalog";
type EditableCategory = Category;
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
type AdminClientPageProps = { initialCatalog: Category[] };

type ItemDraft = {
  title: string;
  desc?: string;
  sku?: string;
  slug: string;
};

type ItemModalState =
  | {
      mode: "create";
      categorySlug: string;
      subcategorySlug: string;
      draft: ItemDraft;
    }
  | {
      mode: "edit";
      categorySlug: string;
      subcategorySlug: string;
      originalCategorySlug: string;
      originalSubcategorySlug: string;
      draft: ItemDraft;
      originalSlug: string;
    };
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
  const normalized = transliterated
    .replace(/[^a-z0-9\s_-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized || `item-${Date.now()}`;
};
const generateSku = (value: string) => {
  const base = slugify(value);
  const normalized = base.replace(/[^a-z0-9-]/g, "");
  return normalized
    ? normalized.toUpperCase().replace(/-/g, "_")
    : `SKU-${Date.now()}`;
};
const ensureUniqueSlug = (
  catalog: EditableCategory[],
  categorySlug: string,
  subcategorySlug: string,
  desiredSlug: string,
  skipSlug?: string,
) => {
  const base = desiredSlug || `item-${Date.now()}`;
  let unique = base;
  let counter = 1;
  const targetSub = catalog
    .find((cat) => cat.slug === categorySlug)
    ?.sub.find((sub) => sub.slug === subcategorySlug);
  if (!targetSub) return unique;
  while (
    targetSub.items.some(
      (item) => item.slug === unique && item.slug !== skipSlug,
    )
  ) {
    unique = `${base}-${counter}`;
    counter += 1;
  }
  return unique;
};
const cloneCatalog = (data: Category[]): EditableCategory[] =>
  data.map((category) => ({
    ...category,
    sub: category.sub.map((sub) => ({
      ...sub,
      items: sub.items.map((item) => ({ ...item })),
    })),
  }));
const prepareEmptyCatalog = (catalog: EditableCategory[]): EditableCategory[] =>
  catalog.map((category) => ({
    ...category,
    sub: category.sub.map((sub) => ({ ...sub, items: [] })),
  }));
const ensureItemShape = (item: Item): Item => {
  const title = item.title.trim();
  const slug = item.slug?.trim() || slugify(title);
  const sku = item.sku?.trim() || generateSku(title);
  return {
    ...item,
    title,
    slug,
    sku,
    desc: item.desc?.trim() ? item.desc.trim() : undefined,
  };
};
const prepareCatalogForExport = (
  catalog: EditableCategory[],
): EditableCategory[] =>
  cloneCatalog(catalog).map((category) => ({
    ...category,
    sub: category.sub.map((sub) => ({
      ...sub,
      items: sub.items.map((item) => ensureItemShape(item)),
    })),
  }));
const normalizeCell = (value: unknown) => {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return `${value}`;
  return String(value).trim();
};
const REQUIRED_HEADERS = ["категория", "подкатегория", "наименование"] as const;
const normalizeHeader = (header: string) => header.trim().toLowerCase();
const parseExcelFile = async (
  file: File,
  baseCatalog: EditableCategory[],
): Promise<ImportPreview> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("Файл не содержит листов.");
  }
  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });
  if (rawRows.length === 0) {
    throw new Error("Файл не содержит данных.");
  }
  const emptyCatalog = prepareEmptyCatalog(baseCatalog);
  const categoryTitleMap = new Map(
    baseCatalog.map((category) => [
      category.title.trim().toLowerCase(),
      category.slug,
    ]),
  );
  const subcategoryTitleMap = new Map<string, Map<string, string>>();
  baseCatalog.forEach((category) => {
    const subMap = new Map<string, string>();
    category.sub.forEach((sub) =>
      subMap.set(sub.title.trim().toLowerCase(), sub.slug),
    );
    subcategoryTitleMap.set(category.slug, subMap);
  });
  const catalogIndex = new Map<string, EditableCategory>();
  emptyCatalog.forEach((category) => catalogIndex.set(category.slug, category));
  const warnings = new Set<string>();
  const errors: string[] = [];
  rawRows.forEach((row, index) => {
    const rowNumber = index + 2;
    const normalizedRow = Object.entries(row).reduce<Record<string, unknown>>(
      (acc, [key, value]) => {
        acc[normalizeHeader(key)] = value;
        return acc;
      },
      {},
    );
    for (const header of REQUIRED_HEADERS) {
      if (
        !normalizedRow[header] ||
        normalizeCell(normalizedRow[header]) === ""
      ) {
        errors.push(`Строка ${rowNumber}: заполните столбец "${header}".`);
      }
    }
    if (
      errors.length &&
      errors[errors.length - 1].includes(`Строка ${rowNumber}`)
    ) {
      return;
    }
    const categoryTitle = normalizeCell(normalizedRow["категория"]);
    const subcategoryTitle = normalizeCell(normalizedRow["подкатегория"]);
    const itemTitle = normalizeCell(normalizedRow["наименование"]);
    const itemDescription = normalizeCell(normalizedRow["описание"]);
    const categorySlug = categoryTitleMap.get(categoryTitle.toLowerCase());
    if (!categorySlug) {
      errors.push(
        `Строка ${rowNumber}: категория "${categoryTitle}" не найдена в каталоге.`,
      );
      return;
    }
    const subMap = subcategoryTitleMap.get(categorySlug);
    const subSlug = subMap?.get(subcategoryTitle.toLowerCase());
    if (!subSlug) {
      errors.push(
        `Строка ${rowNumber}: подкатегория "${subcategoryTitle}" не найдена в категории "${categoryTitle}".`,
      );
      return;
    }
    const targetCategory = catalogIndex.get(categorySlug);
    const targetSubcategory = targetCategory?.sub.find(
      (sub) => sub.slug === subSlug,
    );
    if (!targetSubcategory) {
      errors.push(
        `Строка ${rowNumber}: не удалось определить подкатегорию "${subcategoryTitle}" в категории "${categoryTitle}".`,
      );
      return;
    }
    const slug = slugify(itemTitle);
    const sku = generateSku(itemTitle);
    if (targetSubcategory.items.some((item) => item.slug === slug)) {
      warnings.add(
        `Строка ${rowNumber}: позиция "${itemTitle}" заменит существующую в "${categoryTitle} / ${subcategoryTitle}".`,
      );
      targetSubcategory.items = targetSubcategory.items.map((item) =>
        item.slug === slug
          ? { ...item, title: itemTitle, sku, desc: itemDescription }
          : item,
      );
    } else {
      targetSubcategory.items.push({
        slug,
        title: itemTitle,
        sku,
        desc: itemDescription || undefined,
      });
    }
  });
  const summary: ImportSummary = {
    categories: emptyCatalog.length,
    subcategories: emptyCatalog.reduce(
      (acc, category) => acc + category.sub.length,
      0,
    ),
    items: emptyCatalog.reduce(
      (acc, category) =>
        acc +
        category.sub.reduce(
          (subAcc, subcategory) => subAcc + subcategory.items.length,
          0,
        ),
      0,
    ),
  };
  return {
    filename: file.name,
    data: emptyCatalog,
    summary,
    warnings: Array.from(warnings),
    errors,
  };
};
const mergeCatalogs = (
  base: EditableCategory[],
  incoming: EditableCategory[],
) => {
  const next = cloneCatalog(base);
  incoming.forEach((incomingCategory) => {
    const category = next.find((cat) => cat.slug === incomingCategory.slug);
    if (!category) return;
    incomingCategory.sub.forEach((incomingSub) => {
      const sub = category.sub.find(
        (candidate) => candidate.slug === incomingSub.slug,
      );
      if (!sub) return;
      incomingSub.items.forEach((incomingItem) => {
        const formatted = ensureItemShape(incomingItem);
        const existingIndex = sub.items.findIndex(
          (item) => item.slug === formatted.slug,
        );
        if (existingIndex >= 0) {
          sub.items[existingIndex] = formatted;
        } else {
          sub.items.unshift(formatted);
        }
      });
    });
  });
  return next;
};
export default function AdminClientPage({
  initialCatalog,
}: AdminClientPageProps) {
  const [catalog, setCatalog] = useState<EditableCategory[]>(() =>
    cloneCatalog(initialCatalog),
  );
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("all");
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] =
    useState<string>("all");
  const [clipboardStatus, setClipboardStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [importState, setImportState] = useState<ImportState>({
    status: "idle",
  });
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [itemModal, setItemModal] = useState<ItemModalState | null>(null);
  const [itemModalError, setItemModalError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const categoryOptions = useMemo(
    () =>
      catalog.map((category) => ({
        value: category.slug,
        label: category.title,
      })),
    [catalog],
  );
  const subcategoryOptions = useMemo(() => {
    if (selectedCategoryFilter === "all") return [];
    const category = catalog.find((cat) => cat.slug === selectedCategoryFilter);
    return (
      category?.sub.map((sub) => ({ value: sub.slug, label: sub.title })) ?? []
    );
  }, [catalog, selectedCategoryFilter]);
  const rows = useMemo(
    () =>
      catalog.flatMap((category) =>
        category.sub.flatMap((subcategory) =>
          subcategory.items.map((item) => ({
            categorySlug: category.slug,
            categoryTitle: category.title,
            subcategorySlug: subcategory.slug,
            subcategoryTitle: subcategory.title,
            item,
          })),
        ),
      ),
    [catalog],
  );
  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const matchCategory =
          selectedCategoryFilter === "all" ||
          row.categorySlug === selectedCategoryFilter;
        const matchSub =
          selectedSubcategoryFilter === "all" ||
          row.subcategorySlug === selectedSubcategoryFilter;
        return matchCategory && matchSub;
      }),
    [rows, selectedCategoryFilter, selectedSubcategoryFilter],
  );
  const sortedRows = useMemo(
    () =>
      [...filteredRows].sort((a, b) => {
        const categoryCompare = a.categoryTitle.localeCompare(
          b.categoryTitle,
          "ru",
        );
        if (categoryCompare !== 0) return categoryCompare;
        const subCompare = a.subcategoryTitle.localeCompare(
          b.subcategoryTitle,
          "ru",
        );
        if (subCompare !== 0) return subCompare;
        return a.item.title.localeCompare(b.item.title, "ru");
      }),
    [filteredRows],
  );
  const modalCategory = itemModal
    ? (catalog.find((cat) => cat.slug === itemModal.categorySlug) ?? null)
    : null;
  const modalSubcategories = modalCategory?.sub ?? [];
  const jsonForExport = useMemo(
    () => JSON.stringify(prepareCatalogForExport(catalog), null, 2),
    [catalog],
  );
  const saveStatusMessage =
    saveStatus === "idle"
      ? ""
      : saveMessage ||
        (saveStatus === "saving"
          ? "Сохраняем…"
          : saveStatus === "success"
            ? "Сохранено"
            : "Ошибка");
  const saveStatusTone =
    saveStatus === "success"
      ? "text-emerald-600"
      : saveStatus === "error"
        ? "text-red-600"
        : "text-slate-500";
  const removeItemFromCatalog = (
    categorySlug: string,
    subcategorySlug: string,
    itemSlug: string,
  ) => {
    setCatalog((prev) =>
      prev.map((category) => {
        if (category.slug !== categorySlug) return category;
        return {
          ...category,
          sub: category.sub.map((subcategory) => {
            if (subcategory.slug !== subcategorySlug) return subcategory;
            return {
              ...subcategory,
              items: subcategory.items.filter((item) => item.slug !== itemSlug),
            };
          }),
        };
      }),
    );
  };
  const openCreateItemModal = () => {
    const targetCategorySlug =
      selectedCategoryFilter !== "all"
        ? selectedCategoryFilter
        : categoryOptions[0]?.value;
    if (!targetCategorySlug) return;
    const category = catalog.find((cat) => cat.slug === targetCategorySlug);
    if (!category || category.sub.length === 0) return;
    const targetSubSlug =
      selectedCategoryFilter !== "all" && selectedSubcategoryFilter !== "all"
        ? selectedSubcategoryFilter
        : category.sub[0]?.slug;
    if (!targetSubSlug) return;
    setItemModal({
      mode: "create",
      categorySlug: targetCategorySlug,
      subcategorySlug: targetSubSlug,
      draft: {
        title: "",
        desc: "",
        sku: "",
        slug: "",
      },
    });
    setItemModalError("");
  };
  const openEditItemModal = (
    categorySlug: string,
    subcategorySlug: string,
    item: Item,
  ) => {
    setItemModal({
      mode: "edit",
      categorySlug,
      subcategorySlug,
      originalCategorySlug: categorySlug,
      originalSubcategorySlug: subcategorySlug,
      originalSlug: item.slug,
      draft: {
        title: item.title,
        desc: item.desc ?? "",
        sku: item.sku ?? "",
        slug: item.slug,
      },
    });
    setItemModalError("");
  };
  const handleAddItem = () => {
    openCreateItemModal();
  };
  const closeItemModal = () => {
    setItemModal(null);
    setItemModalError("");
  };
  const updateItemDraftField = <Key extends keyof ItemDraft>(
    field: Key,
    value: ItemDraft[Key],
  ) => {
    setItemModal((prev) =>
      prev
        ? {
            ...prev,
            draft: {
              ...prev.draft,
              [field]: value,
            },
          }
        : prev,
    );
    setItemModalError("");
  };
  const submitItemModal = (nextAction: "close" | "add-more") => {
    if (!itemModal) return;
    const title = itemModal.draft.title.trim();
    if (!title) {
      setItemModalError("Введите наименование позиции");
      return;
    }
    const desc = itemModal.draft.desc?.trim();
    const desiredSlug = slugify(itemModal.draft.slug || title);
    const uniqueSlug = ensureUniqueSlug(
      catalog,
      itemModal.categorySlug,
      itemModal.subcategorySlug,
      desiredSlug,
      itemModal.mode === "edit" ? itemModal.originalSlug : undefined,
    );
    const itemToSave: Item = {
      slug: uniqueSlug,
      title,
      sku: itemModal.draft.sku?.trim() || generateSku(title),
      desc: desc ? desc : undefined,
    };
    setCatalog((prev) => {
      const next = cloneCatalog(prev);
      if (itemModal.mode === "edit") {
        const originalCategory = next.find(
          (cat) => cat.slug === itemModal.originalCategorySlug,
        );
        const originalSubcategory = originalCategory?.sub.find(
          (sub) => sub.slug === itemModal.originalSubcategorySlug,
        );
        let originalIndex = 0;
        if (originalSubcategory) {
          originalIndex = originalSubcategory.items.findIndex(
            (existing) => existing.slug === itemModal.originalSlug,
          );
          if (originalIndex >= 0) {
            originalSubcategory.items.splice(originalIndex, 1);
          }
        }
        const targetCategory = next.find(
          (cat) => cat.slug === itemModal.categorySlug,
        );
        const targetSubcategory = targetCategory?.sub.find(
          (sub) => sub.slug === itemModal.subcategorySlug,
        );
        if (targetSubcategory) {
          const targetIndex =
            itemModal.originalCategorySlug === itemModal.categorySlug &&
            itemModal.originalSubcategorySlug === itemModal.subcategorySlug
              ? Math.min(originalIndex, targetSubcategory.items.length)
              : 0;
          targetSubcategory.items.splice(targetIndex, 0, itemToSave);
        }
      } else {
        const targetCategory = next.find(
          (cat) => cat.slug === itemModal.categorySlug,
        );
        const targetSubcategory = targetCategory?.sub.find(
          (sub) => sub.slug === itemModal.subcategorySlug,
        );
        if (targetSubcategory) {
          targetSubcategory.items.unshift(itemToSave);
        }
      }
      return next;
    });
    setSelectedCategoryFilter(itemModal.categorySlug);
    setSelectedSubcategoryFilter(itemModal.subcategorySlug);
    setItemModalError("");
    if (nextAction === "add-more") {
      setItemModal({
        mode: "create",
        categorySlug: itemModal.categorySlug,
        subcategorySlug: itemModal.subcategorySlug,
        draft: {
          title: "",
          desc: "",
          sku: "",
          slug: "",
        },
      });
      return;
    }
    closeItemModal();
  };
  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonForExport);
      setClipboardStatus("success");
      setTimeout(() => setClipboardStatus("idle"), 2600);
    } catch (error) {
      console.error(error);
      setClipboardStatus("error");
      setTimeout(() => setClipboardStatus("idle"), 2600);
    }
  };
  const saveCatalogToRepo = async () => {
    try {
      setSaveStatus("saving");
      setSaveMessage("Сохраняем…");
      const prepared = prepareCatalogForExport(catalog);
      const response = await fetch("/api/update-catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catalog: prepared }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const detail =
          (payload && (payload.error || payload.message)) ||
          "Не удалось сохранить каталог";
        console.error("Failed to save catalog", detail);
        setSaveMessage(detail);
        setSaveStatus("error");
        return;
      }
      setSaveStatus("success");
      setSaveMessage("Сохранено");
      setTimeout(() => {
        setSaveStatus("idle");
        setSaveMessage("");
      }, 4000);
    } catch (error) {
      console.error("Failed to save catalog", error);
      setSaveMessage(
        error instanceof Error
          ? `Ошибка: ${error.message}`
          : "Не удалось сохранить каталог",
      );
      setSaveStatus("error");
    }
  };
  const handleImportFile = async (file: File) => {
    setImportState({ status: "loading" });
    try {
      const preview = await parseExcelFile(file, catalog);
      setImportState({ status: "ready", preview });
    } catch (error) {
      console.error("Import failed", error);
      setImportState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Не удалось обработать файл.",
      });
    }
  };
  const applyImport = (mode: "replace" | "merge") => {
    if (importState.status !== "ready") return;
    const prepared = prepareCatalogForExport(importState.preview.data);
    if (mode === "replace") {
      setCatalog(prepared);
    } else {
      setCatalog((prev) => mergeCatalogs(prev, prepared));
    }
    resetImportState();
  };
  const onImportInput = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await handleImportFile(file);
  };
  const resetImportState = () => {
    setImportState({ status: "idle" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-24 pt-10 sm:px-6 lg:flex-row lg:px-8">
      {" "}
      <aside className="lg:w-72">
        {" "}
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {" "}
          <h1 className="text-lg font-semibold text-slate-900">
            Настройка каталога
          </h1>{" "}
          <p className="text-sm text-slate-600">
            {" "}
            Менеджеры работают только с номенклатурой: категории и подкатегории
            выбираются из существующего справочника. Новые разделы добавляются
            только через разработчиков.{" "}
          </p>{" "}
        </div>{" "}
        <section className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {" "}
          <header className="flex flex-wrap items-center justify-between gap-3">
            {" "}
            <div>
              {" "}
              <h2 className="text-base font-semibold text-slate-900">
                Импорт из Excel
              </h2>{" "}
              <p className="text-xs text-slate-500">
                {" "}
                Столбцы: «Категория», «Подкатегория», «Наименование»,
                «Описание». Новые разделы не создаются.{" "}
              </p>{" "}
            </div>{" "}
            <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:border-teal-500 hover:text-teal-600">
              {" "}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={onImportInput}
              />{" "}
              Выбрать файл{" "}
            </label>{" "}
          </header>{" "}
          <p className="text-xs text-slate-500">
            {" "}
            Скачайте {""}{" "}
            <a
              href="/templates/catalog-import.xlsx"
              className="font-semibold text-teal-600 hover:text-teal-500"
            >
              {" "}
              шаблон для импорта{" "}
            </a>{" "}
            и заполните нужные строки.{" "}
          </p>{" "}
          {importState.status === "loading" && (
            <p className="text-sm text-slate-500">Обрабатываем файл…</p>
          )}{" "}
          {importState.status === "error" && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {" "}
              {importState.message}{" "}
              <button
                type="button"
                className="ml-2 text-xs font-semibold underline"
                onClick={resetImportState}
              >
                {" "}
                Сбросить{" "}
              </button>{" "}
            </div>
          )}{" "}
          {importState.status === "ready" && (
            <div className="space-y-3 text-xs text-slate-600">
              {" "}
              <div className="flex flex-wrap items-center gap-2">
                {" "}
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                  {" "}
                  {importState.preview.filename}{" "}
                </span>{" "}
                <span className="rounded-full bg-teal-50 px-3 py-1 text-[11px] font-semibold text-teal-700">
                  {" "}
                  Категорий: {importState.preview.summary.categories}{" "}
                </span>{" "}
                <span className="rounded-full bg-teal-50 px-3 py-1 text-[11px] font-semibold text-teal-700">
                  {" "}
                  Подкатегорий: {importState.preview.summary.subcategories}{" "}
                </span>{" "}
                <span className="rounded-full bg-teal-50 px-3 py-1 text-[11px] font-semibold text-teal-700">
                  {" "}
                  Позиции: {importState.preview.summary.items}{" "}
                </span>{" "}
              </div>{" "}
              {importState.preview.errors.length > 0 && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
                  {" "}
                  <div className="font-semibold text-red-800">Ошибки</div>{" "}
                  <ul className="mt-1 space-y-1">
                    {" "}
                    {importState.preview.errors.slice(0, 5).map((error) => (
                      <li key={error}>• {error}</li>
                    ))}{" "}
                  </ul>{" "}
                </div>
              )}{" "}
              {importState.preview.warnings.length > 0 && (
                <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-[11px] text-yellow-700">
                  {" "}
                  <div className="font-semibold text-yellow-800">
                    Предупреждения
                  </div>{" "}
                  <ul className="mt-1 space-y-1">
                    {" "}
                    {importState.preview.warnings.slice(0, 5).map((warning) => (
                      <li key={warning}>• {warning}</li>
                    ))}{" "}
                  </ul>{" "}
                </div>
              )}{" "}
              <div className="flex flex-wrap items-center gap-2">
                {" "}
                <button
                  type="button"
                  onClick={() => applyImport("replace")}
                  className="inline-flex items-center justify-center rounded-full bg-teal-600 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-teal-500"
                >
                  {" "}
                  Заменить каталог{" "}
                </button>{" "}
                <button
                  type="button"
                  onClick={() => applyImport("merge")}
                  className="inline-flex items-center justify-center rounded-full border border-teal-500 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-600 transition hover:bg-teal-50"
                >
                  {" "}
                  Объединить{" "}
                </button>{" "}
                <button
                  type="button"
                  onClick={resetImportState}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
                >
                  {" "}
                  Отмена{" "}
                </button>{" "}
              </div>{" "}
            </div>
          )}{" "}
        </section>{" "}
        <section className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {" "}
          <header className="flex flex-wrap items-center justify-between gap-4">
            {" "}
            <div>
              {" "}
              <h2 className="text-base фонт-semibold text-slate-900">
                Экспорт JSON
              </h2>{" "}
              <p className="text-xs text-slate-500">
                Используйте экспорт для резервного копирования и отправляйте
                каталог напрямую в `data/catalog.yml`.
              </p>{" "}
            </div>{" "}
            <div className="flex flex-wrap items-center gap-2">
              {" "}
              <button
                type="button"
                onClick={handleCopyJson}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-teal-600 transition hover:border-teal-400 hover:text-teal-500"
              >
                {" "}
                Скопировать JSON{" "}
              </button>{" "}
              <button
                type="button"
                onClick={saveCatalogToRepo}
                disabled={saveStatus === "saving"}
                className="rounded-full bg-teal-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {" "}
                Сохранить в репозитории{" "}
              </button>{" "}
            </div>{" "}
          </header>{" "}
          {saveStatus !== "idle" && saveStatusMessage && (
            <p className={`text-xs font-semibold ${saveStatusTone}`}>
              {saveStatusMessage}
            </p>
          )}{" "}
          <div className="relative">
            {" "}
            <pre className="max-h-[320px] overflow-auto rounded-2xl border border-slate-200 bg-slate-900/95 p-4 text-xs text-slate-100">
              {" "}
              {jsonForExport}{" "}
            </pre>{" "}
            {clipboardStatus === "success" && (
              <span className="absolute right-4 top-4 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-white shadow">
                {" "}
                Скопировано{" "}
              </span>
            )}{" "}
            {clipboardStatus === "error" && (
              <span className="absolute right-4 top-4 rounded-full bg-red-500 px-3 py-1 text-[11px] font-semibold text-white shadow">
                {" "}
                Не удалось{" "}
              </span>
            )}{" "}
          </div>{" "}
        </section>{" "}
      </aside>{" "}
      <main className="flex-1 space-y-6">
        {" "}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {" "}
          <header className="flex flex-wrap items-center justify-between gap-4">
            {" "}
            <div>
              {" "}
              <h2 className="text-xl font-semibold text-slate-900">
                Номенклатура
              </h2>{" "}
              <p className="text-sm text-slate-600">
                {" "}
                Изменяйте только позиции. Для каждой строки можно выбрать
                категорию и подкатегорию из справочника.{" "}
              </p>{" "}
            </div>{" "}
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center justify-center rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-500"
            >
              {" "}
              Добавить позицию{" "}
            </button>{" "}
          </header>{" "}
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {" "}
            <label className="flex flex-col">
              {" "}
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Категория
              </span>{" "}
              <select
                value={selectedCategoryFilter}
                onChange={(event) => {
                  setSelectedCategoryFilter(event.target.value);
                  setSelectedSubcategoryFilter("all");
                }}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
                {" "}
                <option value="all">Все категории</option>{" "}
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {" "}
                    {option.label}{" "}
                  </option>
                ))}{" "}
              </select>{" "}
            </label>{" "}
            <label className="flex flex-col">
              {" "}
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Подкатегория
              </span>{" "}
              <select
                value={selectedSubcategoryFilter}
                onChange={(event) =>
                  setSelectedSubcategoryFilter(event.target.value)
                }
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                disabled={selectedCategoryFilter === "all"}
              >
                {" "}
                <option value="all">Все подкатегории</option>{" "}
                {subcategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {" "}
                    {option.label}{" "}
                  </option>
                ))}{" "}
              </select>{" "}
            </label>{" "}
          </div>{" "}
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Категория
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Подкатегория
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Наименование
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Описание
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-5 text-center text-sm text-slate-500"
                    >
                      В выбранном разделе пока нет позиций.
                    </td>
                  </tr>
                ) : (
                  sortedRows.map((row) => (
                    <tr
                      key={`${row.categorySlug}-${row.subcategorySlug}-${row.item.slug}`}
                      className="bg-white"
                    >
                      <td className="whitespace-nowrap px-4 py-3 align-top">
                        {row.categoryTitle}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 align-top">
                        {row.subcategoryTitle}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="font-semibold text-slate-900">
                          {row.item.title}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Артикул: {row.item.sku || "—"}
                        </div>
                        <div className="text-xs text-slate-400">
                          Slug: {row.item.slug}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-slate-600">
                        {row.item.desc ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 align-top">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditItemModal(
                                row.categorySlug,
                                row.subcategorySlug,
                                row.item,
                              )
                            }
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-teal-400 hover:text-teal-600"
                          >
                            Редактировать
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              removeItemFromCatalog(
                                row.categorySlug,
                                row.subcategorySlug,
                                row.item.slug,
                              )
                            }
                            className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:border-red-400 hover:bg-red-50"
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>{" "}
        </section>{" "}
        {itemModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-6"
            role="dialog"
            aria-modal="true"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                closeItemModal();
              }
            }}
          >
            <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={closeItemModal}
                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-teal-400 hover:text-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
                aria-label="Закрыть"
              >
                ×
              </button>
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-slate-900">
                  {itemModal.mode === "create"
                    ? "Новая позиция"
                    : "Редактирование позиции"}
                </h3>
                {itemModalError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                    {itemModalError}
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-semibold text-slate-700">
                      Категория
                    </span>
                    <select
                      value={itemModal.categorySlug}
                      onChange={(event) => {
                        const nextCategorySlug = event.target.value;
                        const nextCategory = catalog.find(
                          (cat) => cat.slug === nextCategorySlug,
                        );
                        if (!nextCategory || nextCategory.sub.length === 0)
                          return;
                        setItemModal((prev) =>
                          prev
                            ? {
                                ...prev,
                                categorySlug: nextCategorySlug,
                                subcategorySlug: nextCategory.sub.some(
                                  (sub) => sub.slug === prev.subcategorySlug,
                                )
                                  ? prev.subcategorySlug
                                  : nextCategory.sub[0].slug,
                              }
                            : prev,
                        );
                        setItemModalError("");
                      }}
                      className="rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    >
                      {catalog.map((category) => (
                        <option key={category.slug} value={category.slug}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="font-semibold text-slate-700">
                      Подкатегория
                    </span>
                    <select
                      value={itemModal.subcategorySlug}
                      onChange={(event) => {
                        const nextSubSlug = event.target.value;
                        setItemModal((prev) =>
                          prev
                            ? { ...prev, subcategorySlug: nextSubSlug }
                            : prev,
                        );
                        setItemModalError("");
                      }}
                      className="rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    >
                      {modalSubcategories.map((subcategory) => (
                        <option key={subcategory.slug} value={subcategory.slug}>
                          {subcategory.title}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-semibold text-slate-700">
                    Наименование
                  </span>
                  <input
                    value={itemModal.draft.title}
                    onChange={(event) =>
                      updateItemDraftField("title", event.target.value)
                    }
                    className="rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    placeholder="Например, Комплект фланцев"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-semibold text-slate-700">Slug</span>
                  <input
                    value={itemModal.draft.slug}
                    onChange={(event) =>
                      updateItemDraftField("slug", event.target.value)
                    }
                    className="rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    placeholder="Можно оставить пустым для автогенерации"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-semibold text-slate-700">Артикул</span>
                  <input
                    value={itemModal.draft.sku ?? ""}
                    onChange={(event) =>
                      updateItemDraftField("sku", event.target.value)
                    }
                    className="rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    placeholder="Например, SKU-001"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-semibold text-slate-700">Описание</span>
                  <textarea
                    value={itemModal.draft.desc ?? ""}
                    onChange={(event) =>
                      updateItemDraftField("desc", event.target.value)
                    }
                    rows={4}
                    className="rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    placeholder="Короткое описание позиции"
                  />
                </label>
              </div>
              <div className="mt-6 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={closeItemModal}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                >
                  Отмена
                </button>
                {itemModal.mode === "create" && (
                  <button
                    type="button"
                    onClick={() => submitItemModal("add-more")}
                    className="rounded-full border border-teal-500 px-4 py-2 text-xs font-semibold text-teal-600 transition hover:bg-teal-50"
                  >
                    Сохранить и добавить ещё
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => submitItemModal("close")}
                  className="rounded-full bg-teal-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-500"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        )}
      </main>{" "}
    </div>
  );
}
