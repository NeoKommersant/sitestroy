"use client";

import { useMemo } from "react";
import { useSearchUI } from "@/components/providers/SearchUIProvider";
import { useRequest } from "@/components/providers/RequestProvider";

const badgeFormatter = (count: number) => {
  if (count > 99) return "99+";
  if (count > 9) return `${count}+`;
  return String(count);
};

export default function CatalogSearchPanel() {
  const {
    query,
    openSearch,
    openCategories,
    openFilters,
    openRequests,
    categories,
    selectedCategory,
    selectedSubcategory,
  } = useSearchUI();
  const { items } = useRequest();

  const filterLabel = useMemo(() => {
    if (!selectedCategory) return "Категории";
    const category = categories.find((cat) => cat.slug === selectedCategory);
    if (!category) return "Категории";
    if (!selectedSubcategory) return category.title;
    const sub = category.subcategories.find((item) => item.slug === selectedSubcategory);
    return sub ? sub.title : category.title;
  }, [categories, selectedCategory, selectedSubcategory]);

  const handleFiltersClick = () => {
    if (!selectedCategory) {
      openCategories();
      return;
    }
    if (!selectedSubcategory) {
      openCategories();
      return;
    }
    openFilters();
  };

  const handleSearchFocus = () => {
    openSearch();
  };

  return (
    <section className="rounded-3xl border border-white/15 bg-white/10 p-4 text-white shadow-[0_18px_40px_rgba(10,20,45,0.35)] backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <button
          type="button"
          onClick={handleFiltersClick}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:border-teal-300 hover:bg-teal-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18M6 12h12M10 19h4" />
          </svg>
          <span className="truncate">{filterLabel}</span>
        </button>

        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-white/60">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <circle cx="11" cy="11" r="7" />
              <line x1="20" y1="20" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            readOnly
            value={query}
            onClick={handleSearchFocus}
            onFocus={handleSearchFocus}
            placeholder="Поиск по каталогу"
            className="w-full rounded-full border border-white/15 bg-white/10 px-12 py-2 text-sm text-white placeholder:text-white/60 transition focus:border-teal-300 focus:bg-white/15 focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={openRequests}
          className="relative inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-teal-300 hover:bg-teal-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          aria-label="Мои заявки"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5c0-1.05-.525-2.025-1.425-2.625L13.5 1.725c-.9-.6-2.1-.6-3 0L4.425 4.875C3.525 5.475 3 6.45 3 7.5v8.25c0 1.05.525 2.025 1.425 2.625L10.5 21.75c.9.6 2.1.6 3 0l6.075-3.15C20.475 17.775 21 16.8 21 15.75V7.5Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 9 3.75 3.75L19.5 5.25" />
          </svg>
          {items.length > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-semibold leading-none text-white">
              {badgeFormatter(items.length)}
            </span>
          )}
        </button>
      </div>
      <div className="mt-3 text-xs text-white/70">
        Используйте быстрый поиск или выберите категорию, чтобы открыть фильтры и номенклатуру.
      </div>
    </section>
  );
}
