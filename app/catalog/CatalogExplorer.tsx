"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category, Subcategory, Item } from "@/data/catalog";

type CatalogExplorerProps = {
  categories: Category[];
  initialCategory: string | null;
  initialSubcategory: string | null;
  initialItem: string | null;
};

const SUB_PLACEHOLDERS = [
  "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
  "bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900",
  "bg-gradient-to-br from-slate-900 via-gray-800 to-slate-950",
];

const ITEM_PLACEHOLDER =
  "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 text-xs font-semibold uppercase text-slate-500";

export default function CatalogExplorer({
  categories,
  initialCategory,
  initialSubcategory,
  initialItem,
}: CatalogExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramsKey = searchParams.toString();

  const categoryMap = useMemo(() => new Map(categories.map((cat) => [cat.slug, cat])), [categories]);

  const [categorySlug, setCategorySlug] = useState<string | null>(() => {
    if (initialCategory && categoryMap.has(initialCategory)) {
      return initialCategory;
    }
    return null;
  });

  const [subcategorySlug, setSubcategorySlug] = useState<string | null>(() => {
    if (!initialCategory || !categoryMap.has(initialCategory)) {
      return null;
    }
    const parent = categoryMap.get(initialCategory)!;
    return parent.sub.some((sub) => sub.slug === initialSubcategory) ? initialSubcategory : null;
  });

  const [itemSlug, setItemSlug] = useState<string | null>(() => {
    if (
      !initialCategory ||
      !initialSubcategory ||
      !categoryMap.has(initialCategory) ||
      !categoryMap.get(initialCategory)!.sub.some((sub) => sub.slug === initialSubcategory)
    ) {
      return null;
    }
    const sub = categoryMap
      .get(initialCategory)!
      .sub.find((sub) => sub.slug === initialSubcategory)!;
    return sub.items.some((itm) => itm.slug === initialItem) ? initialItem : null;
  });

  const selectedCategory: Category | null = categorySlug
    ? categoryMap.get(categorySlug) ?? null
    : null;
  const selectedSubcategory: Subcategory | null =
    selectedCategory?.sub.find((sub) => sub.slug === subcategorySlug) ?? null;
  const selectedItem: Item | null =
    selectedSubcategory?.items.find((itm) => itm.slug === itemSlug) ?? null;

  const updateQuery = useCallback(
    (next: { category?: string | null; subcategory?: string | null; item?: string | null }) => {
      const params = new URLSearchParams(paramsKey);
      if (next.category !== undefined) {
        if (next.category) params.set("category", next.category);
        else params.delete("category");
      }
      if (next.subcategory !== undefined) {
        if (next.subcategory) params.set("subcategory", next.subcategory);
        else params.delete("subcategory");
      }
      if (next.item !== undefined) {
        if (next.item) params.set("item", next.item);
        else params.delete("item");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, paramsKey],
  );

  useEffect(() => {
    const params = new URLSearchParams(paramsKey);
    const nextCategory = params.get("category");
    const validCategory = nextCategory && categoryMap.has(nextCategory) ? nextCategory : null;
    if (validCategory !== categorySlug) {
      setCategorySlug(validCategory);
    }

    const nextSubcategory = params.get("subcategory");
    const parent = validCategory ? categoryMap.get(validCategory) : null;
    const validSubcategory =
      parent?.sub.some((sub) => sub.slug === nextSubcategory) ? nextSubcategory : null;
    if (validSubcategory !== subcategorySlug) {
      setSubcategorySlug(validSubcategory);
    }

    const nextItem = params.get("item");
    const sub =
      validCategory && validSubcategory
        ? categoryMap
            .get(validCategory)
            ?.sub.find((candidate) => candidate.slug === validSubcategory)
        : null;
    const validItem = sub?.items.some((itm) => itm.slug === nextItem) ? nextItem : null;
    if (validItem !== itemSlug) {
      setItemSlug(validItem);
    }
  }, [paramsKey, categoryMap, categorySlug, subcategorySlug, itemSlug]);

  const closeModal = useCallback(() => {
    setItemSlug(null);
    updateQuery({ item: null });
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
    if (categorySlug === slug) {
      setCategorySlug(null);
      setSubcategorySlug(null);
      setItemSlug(null);
      updateQuery({ category: null, subcategory: null, item: null });
      return;
    }

    setCategorySlug(slug);
    setSubcategorySlug(null);
    setItemSlug(null);
    updateQuery({ category: slug, subcategory: null, item: null });
  };

  const handleSubcategoryClick = (slug: string) => {
    if (!selectedCategory) return;
    if (subcategorySlug === slug) {
      setSubcategorySlug(null);
      setItemSlug(null);
      updateQuery({ subcategory: null, item: null });
      return;
    }
    setSubcategorySlug(slug);
    setItemSlug(null);
    updateQuery({ subcategory: slug, item: null });
  };

  const handleItemClick = (slug: string) => {
    if (!selectedSubcategory) return;
    if (itemSlug === slug) {
      closeModal();
      return;
    }
    setItemSlug(slug);
    updateQuery({ item: slug });
  };

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(220px,0.28fr)_minmax(0,0.35fr)_minmax(0,0.37fr)] lg:items-start lg:gap-6">
      <aside className="lg:sticky lg:top-24">
        <div className="flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:gap-3 lg:overflow-visible">
          {categories.map((category) => {
            const isActive = categorySlug === category.slug;
            return (
              <button
                key={category.slug}
                type="button"
                onClick={() => handleCategoryClick(category.slug)}
                className={`group relative flex min-w-[220px] cursor-pointer overflow-hidden rounded-3xl border shadow-sm transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 lg:min-w-0 ${
                  isActive
                    ? "border-teal-500 md:w-11/12 md:self-end"
                    : "border-slate-200 hover:border-teal-400 lg:w-full"
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
      </aside>

      <section className="rounded-3xl border border-slate-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm lg:min-h-[32rem]">
        {!selectedCategory ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">
            Выберите категорию, чтобы увидеть подкатегории и номенклатуру.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-slate-900">{selectedCategory.title}</h2>
            <p className="text-sm text-slate-600">{selectedCategory.intro}</p>
            <div className="mt-2 flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-1 lg:gap-3 lg:overflow-visible">
              {selectedCategory.sub.map((sub, index) => {
                const isActive = selectedSubcategory?.slug === sub.slug;
                const placeholderClass = SUB_PLACEHOLDERS[index % SUB_PLACEHOLDERS.length];
                return (
                  <button
                    key={sub.slug}
                    type="button"
                    onClick={() => handleSubcategoryClick(sub.slug)}
                    className={`group relative flex min-w-[220px] cursor-pointer overflow-hidden rounded-3xl border shadow-sm transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 lg:min-w-0 ${
                      isActive
                        ? "border-teal-500 md:w-11/12 md:self-end"
                        : "border-slate-200 hover:border-teal-400 lg:w-full"
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

      <section className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-sm backdrop-blur-sm lg:min-h-[32rem]">
        {!selectedSubcategory ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">
            Выберите подкатегорию, чтобы увидеть позиции номенклатуры.
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <h2 className="text-base font-semibold text-slate-900">{selectedSubcategory.title}</h2>
            <p className="text-sm text-slate-600">{selectedSubcategory.intro ?? selectedCategory?.intro}</p>
            <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
              {selectedSubcategory.items.map((itm) => {
                const isActive = itemSlug === itm.slug;
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
                        {itm.desc ?? "Описание уточним при запросе."}
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
              onClick={closeModal}
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
                  "Мы предоставим развернутые характеристики и техническую документацию по запросу."}
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
