"use client";

import { useMemo, useState } from "react";
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

export default function AdminCatalogPage() {
  const [categories, setCategories] = useState<EditableCategory[]>(() => JSON.parse(JSON.stringify(CATEGORIES)));
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [clipboardStatus, setClipboardStatus] = useState<"idle" | "success" | "error">("idle");

  const selectedCategory = categories[selectedCategoryIndex];

  const jsonOutput = useMemo(() => JSON.stringify(categories, null, 2), [categories]);

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
