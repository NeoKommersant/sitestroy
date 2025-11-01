"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useRequest } from "@/components/providers/RequestProvider";
import type { SearchResultItem } from "@/types/search";
import Modal from "@/components/ui/Modal";

type CategorySummary = {
  slug: string;
  title: string;
  subcategories: {
    slug: string;
    title: string;
    items: { slug: string; title: string; sku?: string | undefined }[];
  }[];
};

type SearchSuggestion = {
  item: SearchResultItem;
};

type SearchUIContextValue = {
  query: string;
  setQuery: (value: string) => void;
  openSearch: () => void;
  closeSearch: () => void;
  openCategories: () => void;
  openSubcategories: (categorySlug: string) => void;
  openFilters: () => void;
  openRequests: () => void;
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  setSelectedCategory: (slug: string | null) => void;
  setSelectedSubcategory: (slug: string | null) => void;
  suggestions: SearchSuggestion[];
  isSuggestionsLoading: boolean;
  categories: CategorySummary[];
  popularQueries: string[];
  isSearchOpen: boolean;
  isCategoriesOpen: boolean;
  isSubcategoriesOpen: boolean;
  isFiltersOpen: boolean;
  isRequestsOpen: boolean;
  navigateToResult: (item: SearchResultItem) => void;
};

const SearchUIContext = createContext<SearchUIContextValue | null>(null);

const POPULAR_FALLBACK = [
  "арматура ф12 а500",
  "труба профильная 40х20х2",
  "уголок 50х50х4",
  "сетка сварная",
  "лист стальной 3мм",
  "бетон b25",
  "гидроизоляция рулонная",
  "пена монтажная зимняя",
];

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 767px)");
    const handler = (event: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile(event.matches);
    handler(media);
    const listener = (event: MediaQueryListEvent) => handler(event);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);
  return isMobile;
};

type SearchModalsState = {
  categories: CategorySummary[];
  suggestions: SearchSuggestion[];
  isSuggestionsLoading: boolean;
  popularQueries: string[];
  query: string;
  isSearchOpen: boolean;
  isCategoriesOpen: boolean;
  isSubcategoriesOpen: boolean;
  isFiltersOpen: boolean;
  isRequestsOpen: boolean;
  selectedCategory: string | null;
  selectedSubcategory: string | null;
};

const initialModalState: SearchModalsState = {
  categories: [],
  suggestions: [],
  isSuggestionsLoading: false,
  popularQueries: POPULAR_FALLBACK,
  query: "",
  isSearchOpen: false,
  isCategoriesOpen: false,
  isSubcategoriesOpen: false,
  isFiltersOpen: false,
  isRequestsOpen: false,
  selectedCategory: null,
  selectedSubcategory: null,
};

const mapPopularQueries = (categories: CategorySummary[]) => {
  const collected: string[] = [];
  categories.forEach((category) => {
    category.subcategories.forEach((sub) => {
      sub.items.slice(0, 2).forEach((item) => {
        if (collected.length < 10) {
          collected.push(item.title);
        }
      });
    });
  });
  if (collected.length === 0) return POPULAR_FALLBACK;
  return collected.slice(0, 10);
};

export function SearchUIProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { items: requestItems } = useRequest();
  const [state, setState] = useState<SearchModalsState>(initialModalState);
  const isMobile = useIsMobile();
  const suggestionsAbortRef = useRef<AbortController | null>(null);
  const fetchTimeoutRef = useRef<number | null>(null);

  const setQuery = useCallback((value: string) => {
    setState((prev) => ({ ...prev, query: value }));
  }, []);

  const fetchCatalog = useCallback(async () => {
    try {
      const response = await fetch("/api/catalog", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to load catalog");
      const payload = (await response.json()) as { categories: CategorySummary[] };
      setState((prev) => ({
        ...prev,
        categories: payload.categories,
        popularQueries: mapPopularQueries(payload.categories),
      }));
    } catch (error) {
      console.warn("Failed to load catalog", error);
      setState((prev) => ({
        ...prev,
        categories: [],
        popularQueries: POPULAR_FALLBACK,
      }));
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const closeAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isSearchOpen: false,
      isCategoriesOpen: false,
      isSubcategoriesOpen: false,
      isFiltersOpen: false,
      isRequestsOpen: false,
    }));
  }, []);

  const openSearch = useCallback(() => {
    setState((prev) => ({ ...prev, isSearchOpen: true }));
  }, []);

  const closeSearch = useCallback(() => {
    setState((prev) => ({ ...prev, isSearchOpen: false }));
  }, []);

  const openCategories = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isCategoriesOpen: true,
      isSubcategoriesOpen: false,
      isFiltersOpen: false,
    }));
  }, []);

  const openSubcategories = useCallback((categorySlug: string) => {
    setState((prev) => ({
      ...prev,
      selectedCategory: categorySlug,
      isCategoriesOpen: false,
      isSubcategoriesOpen: true,
    }));
  }, []);

  const openFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isFiltersOpen: true,
      isCategoriesOpen: false,
      isSubcategoriesOpen: false,
    }));
  }, []);

  const openRequests = useCallback(() => {
    setState((prev) => ({ ...prev, isRequestsOpen: true }));
  }, []);

  const setSelectedCategory = useCallback((slug: string | null) => {
    setState((prev) => ({
      ...prev,
      selectedCategory: slug,
      selectedSubcategory: slug ? prev.selectedSubcategory : null,
    }));
  }, []);

  const setSelectedSubcategory = useCallback((slug: string | null) => {
    setState((prev) => ({
      ...prev,
      selectedSubcategory: slug,
    }));
  }, []);

  const navigateToResult = useCallback(
    (item: SearchResultItem) => {
      setQuery(item.title);
      const params =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : new URLSearchParams();
      params.set("category", item.categorySlug);
      params.set("subcategory", item.subcategorySlug);
      params.set("item", item.slug);
      const nextUrl = params.toString() ? `/catalog?${params.toString()}` : "/catalog";
      router.push(nextUrl);
      closeAll();
    },
    [router, closeAll, setQuery],
  );

  useEffect(() => {
    if (!state.query || state.query.trim().length < 2) {
      if (suggestionsAbortRef.current) {
        suggestionsAbortRef.current.abort();
      }
      if (fetchTimeoutRef.current) {
        window.clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
      setState((prev) => ({ ...prev, suggestions: [], isSuggestionsLoading: false }));
      return;
    }

    if (fetchTimeoutRef.current) {
      window.clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = window.setTimeout(async () => {
      if (suggestionsAbortRef.current) {
        suggestionsAbortRef.current.abort();
      }
      suggestionsAbortRef.current = new AbortController();
      try {
        setState((prev) => ({ ...prev, isSuggestionsLoading: true }));
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: state.query, limit: 15 }),
          signal: suggestionsAbortRef.current.signal,
        });
        if (!response.ok) throw new Error("Search failed");
        const payload = (await response.json()) as { items: SearchResultItem[] };
        setState((prev) => ({
          ...prev,
          suggestions: payload.items.map((item) => ({ item })),
          isSuggestionsLoading: false,
        }));
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.warn("Search suggestions failed", error);
        }
        setState((prev) => ({ ...prev, isSuggestionsLoading: false }));
      }
    }, 200);

    return () => {
      if (fetchTimeoutRef.current) {
        window.clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    };
  }, [state.query]);

  const searchContextValue: SearchUIContextValue = useMemo(
    () => ({
      query: state.query,
      setQuery,
      openSearch,
      closeSearch,
      openCategories,
      openSubcategories,
      openFilters,
      openRequests,
      selectedCategory: state.selectedCategory,
      selectedSubcategory: state.selectedSubcategory,
      setSelectedCategory,
      setSelectedSubcategory,
      suggestions: state.suggestions,
      isSuggestionsLoading: state.isSuggestionsLoading,
      categories: state.categories,
      popularQueries: state.popularQueries,
      isSearchOpen: state.isSearchOpen,
      isCategoriesOpen: state.isCategoriesOpen,
      isSubcategoriesOpen: state.isSubcategoriesOpen,
      isFiltersOpen: state.isFiltersOpen,
      isRequestsOpen: state.isRequestsOpen,
      navigateToResult,
    }),
    [
      state,
      setQuery,
      openSearch,
      closeSearch,
      openCategories,
      openSubcategories,
      openFilters,
      openRequests,
      setSelectedCategory,
      setSelectedSubcategory,
      navigateToResult,
    ],
  );

  const selectedCategoryData = state.categories.find(
    (category) => category.slug === state.selectedCategory,
  );
  const selectedSubcategoryData = selectedCategoryData?.subcategories.find(
    (sub) => sub.slug === state.selectedSubcategory,
  );

  const handlePopularClick = useCallback(
    (value: string) => {
      setQuery(value);
      setState((prev) => ({ ...prev, isSearchOpen: true }));
    },
    [setQuery],
  );

  const handleCategoryPick = useCallback(
    (slug: string) => {
      const target = state.categories.find((category) => category.slug === slug);
      if (!target) return;
      setState((prev) => ({
        ...prev,
        selectedCategory: slug,
        selectedSubcategory: null,
        isCategoriesOpen: false,
        isSubcategoriesOpen: true,
      }));
    },
    [state.categories],
  );

  const handleSubcategoryPick = useCallback(
    (slug: string) => {
      setSelectedSubcategory(slug);
      if (state.selectedCategory) {
        const params =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search)
            : new URLSearchParams();
        params.set("category", state.selectedCategory);
        params.set("subcategory", slug);
        const nextUrl = params.toString() ? `/catalog?${params.toString()}` : "/catalog";
        router.push(nextUrl);
      }
      setState((prev) => ({
        ...prev,
        isSubcategoriesOpen: false,
        isFiltersOpen: true,
      }));
    },
    [setSelectedSubcategory, state.selectedCategory, router],
  );

  const closeFilters = useCallback(() => {
    setState((prev) => ({ ...prev, isFiltersOpen: false }));
  }, []);

  const closeRequests = useCallback(() => {
    setState((prev) => ({ ...prev, isRequestsOpen: false }));
  }, []);

  const closeCategories = useCallback(() => {
    setState((prev) => ({ ...prev, isCategoriesOpen: false }));
  }, []);

  const closeSubcategories = useCallback(() => {
    setState((prev) => ({ ...prev, isSubcategoriesOpen: false }));
  }, []);

  return (
    <SearchUIContext.Provider value={searchContextValue}>
      {children}
      <Modal
        isOpen={state.isSearchOpen}
        onClose={closeSearch}
        variant={isMobile ? "fullscreen" : "panel"}
        className={isMobile ? "rounded-none md:rounded-3xl" : ""}
        overlayClassName={isMobile ? "md:items-start md:pt-16" : "items-start pt-[92px]"}
        contentClassName="md:rounded-3xl"
      >
        <div className="flex flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-teal-500 focus-within:shadow-md">
            <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <circle cx="11" cy="11" r="7" />
              <line x1="20" y1="20" x2="16.65" y2="16.65" />
            </svg>
            <input
              autoFocus
              value={state.query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Что ищем?"
              className="flex-1 border-none bg-transparent text-base outline-none placeholder:text-slate-400"
            />
            {state.query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-100"
              >
                Очистить
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Часто ищут
            </div>
            <div className="flex flex-wrap gap-2">
              {state.popularQueries.map((queryValue) => (
                <button
                  key={queryValue}
                  type="button"
                  onClick={() => handlePopularClick(queryValue)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                >
                  {queryValue}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Подсказки
            </div>
            <div className="flex flex-col divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
              {state.isSuggestionsLoading && (
                <div className="px-4 py-3 text-sm text-slate-500">Загрузка…</div>
              )}
              {!state.isSuggestionsLoading && state.suggestions.length === 0 && (
                <div className="px-4 py-3 text-sm text-slate-400">
                  Начните вводить запрос, чтобы увидеть подсказки
                </div>
              )}
              {state.suggestions.map(({ item }) => (
                <button
                  key={`${item.categorySlug}/${item.subcategorySlug}/${item.slug}`}
                  type="button"
                  onClick={() => navigateToResult(item)}
                  className="flex flex-col items-start gap-1 px-4 py-3 text-left transition hover:bg-teal-50"
                >
                  <span className="text-sm font-semibold text-slate-900">{item.title}</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {item.categoryTitle} — {item.subcategoryTitle}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={state.isCategoriesOpen}
        onClose={closeCategories}
        variant={isMobile ? "fullscreen" : "panel"}
        className={isMobile ? "rounded-none md:rounded-3xl" : ""}
        overlayClassName={isMobile ? "md:items-start md:pt-16" : "items-start pt-[120px]"}
      >
        <div className="flex flex-col gap-4 p-5 md:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Категории каталога</h2>
            <button
              type="button"
              onClick={closeCategories}
              className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-500 hover:border-teal-300 hover:text-teal-600"
            >
              Закрыть
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {state.categories.map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() => handleCategoryPick(category.slug)}
                className="flex h-full flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-teal-300 hover:bg-teal-50"
              >
                <span className="text-sm font-semibold text-slate-900">{category.title}</span>
                <span className="text-xs text-slate-500">
                  {category.subcategories.length} подкатегорий
                </span>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={state.isSubcategoriesOpen}
        onClose={closeSubcategories}
        variant={isMobile ? "fullscreen" : "panel"}
        className={isMobile ? "rounded-none md:rounded-3xl" : ""}
        overlayClassName={isMobile ? "md:items-start md:pt-16" : "items-start pt-[140px]"}
      >
        <div className="flex flex-col gap-4 p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-teal-500">Подкатегории</p>
              <h2 className="text-lg font-semibold text-slate-900">
                {selectedCategoryData?.title ?? "Подкатегории"}
              </h2>
            </div>
            <button
              type="button"
              onClick={closeSubcategories}
              className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-500 hover:border-teal-300 hover:text-teal-600"
            >
              Закрыть
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {selectedCategoryData?.subcategories.map((sub) => (
              <button
                key={sub.slug}
                type="button"
                onClick={() => handleSubcategoryPick(sub.slug)}
                className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-teal-300 hover:bg-teal-50"
              >
                <span className="text-sm font-semibold text-slate-900">{sub.title}</span>
                <span className="text-xs text-slate-500">
                  {sub.items.length > 0
                    ? `${Math.min(sub.items.length, 24)} позиций`
                    : "Позиции в каталоге"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={state.isFiltersOpen}
        onClose={closeFilters}
        variant={isMobile ? "fullscreen" : "panel"}
        className={isMobile ? "rounded-none md:rounded-3xl" : ""}
        overlayClassName={isMobile ? "md:items-start md:pt-16" : "items-start pt-[160px]"}
      >
        <div className="flex flex-col gap-4 p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-teal-500">
                Фильтры (скоро)
              </p>
              <h2 className="text-lg font-semibold text-slate-900">
                {selectedSubcategoryData?.title ?? "Фильтры"}
              </h2>
            </div>
            <button
              type="button"
              onClick={closeFilters}
              className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-500 hover:border-teal-300 hover:text-teal-600"
            >
              Закрыть
            </button>
          </div>
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            Скоро здесь появятся фильтры, настроенные под выбранную номенклатуру. А пока можно
            воспользоваться поиском или переключиться на подкатегорию.
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={state.isRequestsOpen}
        onClose={closeRequests}
        variant={isMobile ? "fullscreen" : "panel"}
        className={isMobile ? "rounded-none md:rounded-3xl" : ""}
        overlayClassName={isMobile ? "md:items-start md:pt-16" : "items-start pt-[140px]"}
      >
        <div className="flex h-full flex-col gap-4 p-5 md:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Мои заявки</h2>
            <button
              type="button"
              onClick={closeRequests}
              className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-500 hover:border-teal-300 hover:text-teал-600"
            >
              Закрыть
            </button>
          </div>
          {requestItems.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              Пока ничего не добавлено. Найдите позицию и нажмите «Добавить», чтобы сформировать заявку.
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Наименование</th>
                    <th className="px-4 py-2 text-left font-medium">Кол-во</th>
                    <th className="px-4 py-2 text-left font-medium">Категория</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {requestItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-slate-900">{item.title || "Своя позиция"}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {item.category} / {item.subcategory}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              closeRequests();
              router.push("/catalog/request");
            }}
            className="rounded-2xl bg-teal-500 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow hover:bg-teal-400"
          >
            Перейти в заявку
          </button>
        </div>
      </Modal>
    </SearchUIContext.Provider>
  );
}

export const useSearchUI = () => {
  const context = useContext(SearchUIContext);
  if (!context) {
    throw new Error("useSearchUI must be used within SearchUIProvider");
  }
  return context;
};
