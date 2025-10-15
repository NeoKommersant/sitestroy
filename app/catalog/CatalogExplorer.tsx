"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category, Item, Subcategory } from "@/data/catalog";

type CatalogExplorerProps = {
  categories: Category[];
};

type SelectionState = {
  category: string | null;
  subcategory: string | null;
  item: string | null;
};

const SUB_PLACEHOLDERS = [
  "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
  "bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900",
  "bg-gradient-to-br from-slate-900 via-gray-800 to-slate-950",
];

const ITEM_PLACEHOLDER =
  "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-200 via-white to-slate-200 text-xs font-semibold uppercase text-slate-500";

export default function CatalogExplorer({ categories }: CatalogExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramsKey = searchParams.toString();

  const categoryMap = useMemo(() => new Map(categories.map((cat) => [cat.slug, cat])), [categories]);

  const normalizeSelection = useCallback(
    (categorySlug: string | null, subcategorySlug: string | null, itemSlug: string | null) => {
      const category = categorySlug && categoryMap.has(categorySlug) ? categorySlug : null;
      const subcategory =
        category &&
        subcategorySlug &&
        categoryMap.get(category)?.sub.some((sub) => sub.slug === subcategorySlug)
          ? subcategorySlug
          : null;
      const item =
        category &&
        subcategory &&
        itemSlug &&
        categoryMap
          .get(category)!
          .sub.find((sub) => sub.slug === subcategory)!
          .items.some((itm) => itm.slug === itemSlug)
          ? itemSlug
          : null;
      return { category, subcategory, item };
    },
    [categoryMap],
  );

  const getSelectionFromParams = useCallback((): SelectionState => {
    const categorySlug = searchParams.get("category");
    const subSlug = searchParams.get("subcategory");
    const itemSlug = searchParams.get("item");
    return normalizeSelection(categorySlug, subSlug, itemSlug);
  }, [searchParams, normalizeSelection]);

  const [selection, setSelection] = useState<SelectionState>(getSelectionFromParams);

  useEffect(() => {
    setSelection(getSelectionFromParams());
  }, [getSelectionFromParams]);

  const selectedCategory: Category | null = selection.category
    ? categoryMap.get(selection.category) ?? null
    : null;
  const selectedSubcategory: Subcategory | null =
    selectedCategory?.sub.find((sub) => sub.slug === selection.subcategory) ?? null;
  const selectedItem: Item | null =
    selectedSubcategory?.items.find((itm) => itm.slug === selection.item) ?? null;

  const updateQuery = useCallback(
    (next: SelectionState) => {
      const params = new URLSearchParams(paramsKey);
      if (next.category) params.set("category", next.category);
      else params.delete("category");
      if (next.subcategory) params.set("subcategory", next.subcategory);
      else params.delete("subcategory");
      if (next.item) params.set("item", next.item);
      else params.delete("item");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [paramsKey, pathname, router],
  );

  const closeModal = useCallback(() => {
    setSelection((prev) => {
      if (!prev.item) return prev;
      const next = { ...prev, item: null };
      updateQuery(next);
      return next;
    });
  }, [updateQuery]);

  useEffect(() => {
    if (!selectedItem) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedItem, closeModal]);

  const handleCategoryClick = (slug: string) => {
    setSelection((prev) => {
      const next: SelectionState =
        prev.category === slug
          ? { category: null, subcategory: null, item: null }
          : { category: slug, subcategory: null, item: null };
      updateQuery(next);
      return next;
    });
  };

  const handleSubcategoryClick = (slug: string) => {
    if (!selectedCategory) return;
    setSelection((prev) => {
      const next: SelectionState =
        prev.subcategory === slug
          ? { category: prev.category, subcategory: null, item: null }
          : { category: prev.category, subcategory: slug, item: null };
      updateQuery(next);
      return next;
    });
  };

  const handleItemClick = (slug: string) => {
    if (!selectedSubcategory) return;
    setSelection((prev) => {
      const next: SelectionState =
        prev.item === slug
          ? { category: prev.category, subcategory: prev.subcategory, item: null }
          : { category: prev.category, subcategory: prev.subcategory, item: slug };
      updateQuery(next);
      return next;
    });
  };

  const hasCategory = Boolean(selectedCategory);
  const hasSubcategory = Boolean(selectedCategory && selectedSubcategory);

  const baseColumnClass =
    "w-full transition-[flex-basis,transform,opacity] duration-500 ease-out flex-shrink-0";
  const categoryColumnClass = hasCategory ? "lg:basis-[24%] lg:pr-4" : "lg:basis-full lg:pr-0";
  const subcategoryColumnClass = hasCategory
    ? "lg:basis-[32%] lg:translate-x-0 lg:opacity-100"
    : "lg:basis-0 lg:-translate-x-16 lg:opacity-0 lg:pointer-events-none";
  const itemsColumnClass = hasSubcategory
    ? "lg:basis-[44%] lg:translate-x-0 lg:opacity-100"
    : "lg:basis-0 lg:translate-x-16 lg:opacity-0 lg:pointer-events-none";

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-4">
      <aside className={`${baseColumnClass} ${categoryColumnClass}`}>
        <div className="lg:sticky lg:top-24">
          <div className="flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:gap-2.5 lg:overflow-visible">
            {categories.map((category) => {
              const isActive = selection.category === category.slug;
              return (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => handleCategoryClick(category.slug)}
                  className={`group relative flex min-w-[220px] cursor-pointer overflow-hidden rounded-3xl border shadow-sm transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 lg:min-w-0 ${
                    isActive ? "border-teal-500" : "border-slate-200 hover:border-teal-400"
                  }`}
                  aria-pressed={isActive}
                  aria-label={`Категория ${category.title}`}
                >
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    sizes="(min-width: 1280px) 240px, (min-width: 960px) 200px, 220px"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    className={`absolute inset-0 bg-slate-900/55 transition-colors duration-500 group-hover:bg-teal-900/45 ${
                      isActive ? "bg-slate-900/70" : ""
                    }`}
                  />
                  <span className="relative z-10 flex h-full w-full items-center justify-center px-6 py-8 text-center text-lg font-semibold uppercase tracking-wide text-white">
                    {category.title}
                  </span>
                  <span className="sr-only">
                    {isActive ? "Категория выбрана" : "Нажмите, чтобы раскрыть подкатегории"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <section
        className={`${baseColumnClass} ${subcategoryColumnClass} origin-left rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-sm backdrop-blur-sm`}
        aria-hidden={!hasCategory}
      >
        {!selectedCategory ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">
            Выберите категорию, чтобы увидеть подкатегории и номенклатуру.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-slate-900">{selectedCategory.title}</h2>
            <p className="text-sm text-slate-600">{selectedCategory.intro}</p>
            <div className="mt-2 flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-1 lg:gap-2.5 lg:overflow-visible">
              {selectedCategory.sub.map((sub, index) => {
                const isActive = selectedSubcategory?.slug === sub.slug;
                const placeholderClass = SUB_PLACEHOLDERS[index % SUB_PLACEHOLDERS.length];
                return (
                  <button
                    key={sub.slug}
                    type="button"
                    onClick={() => handleSubcategoryClick(sub.slug)}
                    className={`group relative flex min-w-[220px] cursor-pointer overflow-hidden rounded-3xl border shadow-sm transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 lg:min-w-0 ${
                      isActive ? "border-teal-500" : "border-slate-200 hover:border-teal-400"
                    }`}
                    aria-pressed={isActive}
                    aria-label={`Подкатегория ${sub.title}`}
                  >
                    <div className={`absolute inset-0 ${placeholderClass}`} />
                    <div
                      className={`absolute inset-0 bg-slate-900/55 transition-colors duration-500 group-hover:bg-teal-900/45 ${
                        isActive ? "bg-slate-900/70" : ""
                      }`}
                    />
                    <span className="relative z-10 flex h-full w-full items-center justify-center px-4 py-6 text-center text-base font-semibold uppercase tracking-wide text-white">
                      {sub.title}
                    </span>
                    <span className="sr-only">
                      {isActive ? "Подкатегория выбрана" : "Нажмите, чтобы открыть номенклатуру"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section
        className={`${baseColumnClass} ${itemsColumnClass} origin-left rounded-3xl border border-slate-100 bg-white p-5 shadow-sm backdrop-blur-sm`}
        aria-hidden={!hasSubcategory}
      >
        {!selectedSubcategory ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">
            Выберите подкатегорию, чтобы увидеть позиции номенклатуры.
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <h2 className="text-base font-semibold text-slate-900">{selectedSubcategory.title}</h2>
            <p className="text-sm text-slate-600">
              {selectedSubcategory.intro ?? selectedCategory?.intro}
            </p>
            <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
              {selectedSubcategory.items.map((itm) => {
                const isActive = selection.item === itm.slug;
                return (
                  <button
                    key={itm.slug}
                    type="button"
                    onClick={() => handleItemClick(itm.slug)}
                    className={`group flex w-full items-center gap-4 rounded-3xl border px-4 py-3 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 ${
                      isActive
                        ? "border-teal-500 bg-teal-50"
                        : "border-transparent hover:border-teal-400 hover:bg-teal-50/60"
                    }`}
                    aria-pressed={isActive}
                  >
                    <div className={ITEM_PLACEHOLDER}>{itm.title.slice(0, 2).toUpperCase()}</div>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-slate-900">{itm.title}</div>
                      <p className="text-xs text-slate-600">
                        {itm.desc ?? "Характеристики уточним по запросу."}
                      </p>
                    </div>
                    <div className="ml-auto text-xs font-semibold uppercase tracking-[0.3em] text-teal-600 transition group-hover:text-teal-700">
                      Подробнее
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {selectedCategory && selectedSubcategory && selectedItem && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/70 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="catalog-item-title"
        >
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                closeModal();
              }}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-teal-400 hover:text-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
              aria-label="Закрыть модальное окно"
            >
              ✕
            </button>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
                <span>{selectedCategory.title}</span>
                <span className="text-slate-300">/</span>
                <span>{selectedSubcategory.title}</span>
              </div>
              <h2 id="catalog-item-title" className="text-2xl font-semibold text-slate-900">
                {selectedItem.title}
              </h2>
              {selectedItem.sku && (
                <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
                  Артикул: {selectedItem.sku}
                </div>
              )}
              <p className="text-sm text-slate-600">
                {selectedItem.desc ??
                  "Предоставим характеристики, паспорта и коммерческое предложение по запросу."}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-teal-500"
                  onClick={() => {
                    const label = encodeURIComponent(`Запрос КП: ${selectedItem.title}`);
                    router.push(`/contacts?subject=${label}`);
                  }}
                >
                  Запросить КП
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full border border-teal-500 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-teal-600 transition hover:bg-teal-50"
                >
                  Добавить в спецификацию
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
