import Fuse from "fuse.js";
import type { Category } from "@/types/catalog";
import type {
  CanonicalField,
  NormalizedQuery,
  RunSearch,
  SearchFacet,
  SearchFilters,
  SearchResult,
  SynonymsDictionary,
  Taxonomy,
} from "@/types/search";
import { normalizeQuery } from "./queryNormalizer";
import { flattenCatalog } from "./catalogAdapter";

type FuseRecord = ReturnType<typeof flattenCatalog>[number];

type SearchEngine = {
  runSearch: RunSearch;
  synonyms: SynonymsDictionary;
  taxonomy: Taxonomy;
  items: FuseRecord[];
};

const NUMERIC_FIELDS: CanonicalField[] = ["diameter_mm", "thickness_mm"];

const DEFAULT_PAGE_SIZE = 24;

const createTaxonomyLookup = (taxonomy: Taxonomy) => {
  const lookup = new Map<CanonicalField, Map<string, string>>();
  for (const [field, entries] of Object.entries(taxonomy)) {
    const map = new Map<string, string>();
    entries.forEach((entry) => {
      map.set(entry.id, entry.label ?? entry.id);
    });
    lookup.set(field as CanonicalField, map);
  }
  return lookup;
};

const mergeFilters = (
  normalized: NormalizedQuery,
  filters: SearchFilters | undefined,
): SearchFilters => {
  const merged: SearchFilters = { ...normalized.extracted };
  if (!filters) return merged;
  for (const [field, values] of Object.entries(filters)) {
    if (!values || values.length === 0) continue;
    const key = field as CanonicalField;
    if (NUMERIC_FIELDS.includes(key)) {
      const current = (merged as Record<string, number[]>)[field] ?? [];
      (merged as Record<string, number[]>)[field] = Array.from(
        new Set<number>([...current, ...(values as number[])]),
      );
      continue;
    }
    const current = (merged as Record<string, string[]>)[field] ?? [];
    (merged as Record<string, string[]>)[field] = Array.from(
      new Set<string>([...current, ...(values as string[])]),
    );
  }
  return merged;
};

const toNumberSet = (values: number[] | undefined): Set<number> | null => {
  if (!values || values.length === 0) return null;
  return new Set(values.map((value) => Number(value)));
};

const toStringSet = (values: string[] | undefined): Set<string> | null => {
  if (!values || values.length === 0) return null;
  return new Set(values);
};

const matchesFilters = (item: FuseRecord, filters: SearchFilters): boolean => {
  for (const [field, rawValues] of Object.entries(filters)) {
    if (!rawValues || rawValues.length === 0) continue;
    const fieldKey = field as CanonicalField;
    const itemValues = item.attributes[fieldKey];
    if (!itemValues || itemValues.length === 0) return false;
    if (NUMERIC_FIELDS.includes(fieldKey)) {
      const needle = toNumberSet(rawValues as number[]);
      if (!needle) continue;
      const hay = new Set(itemValues as number[]);
      const intersects = Array.from(needle).some((value) => hay.has(value));
      if (!intersects) return false;
      continue;
    }
    const needle = toStringSet(rawValues as string[]);
    if (!needle) continue;
    const hay = new Set(itemValues as string[]);
    const intersects = Array.from(needle).some((value) => hay.has(value));
    if (!intersects) return false;
  }
  return true;
};

const structuredBonus = (
  item: FuseRecord,
  normalized: NormalizedQuery,
  filters: SearchFilters,
): number => {
  let bonus = 0;
  const addBonus = (amount: number) => {
    bonus += amount;
  };
  const considerField = (
    field: CanonicalField,
    matchBonus: number,
    source: "query" | "filter",
  ) => {
    const targetValues =
      (source === "query"
        ? normalized.extracted[field]
        : (filters as Record<string, unknown>)[field]) ?? [];
    if (!Array.isArray(targetValues) || targetValues.length === 0) return;
    const itemValues = item.attributes[field];
    if (!itemValues) return;
    const hasMatch = targetValues.some((value) => itemValues.includes(value as never));
    if (hasMatch) addBonus(matchBonus);
  };

  considerField("diameter_mm", 0.6, "query");
  considerField("class", 0.5, "query");
  considerField("product_type", 0.5, "query");
  considerField("surface", 0.3, "query");
  considerField("profile", 0.2, "query");
  considerField("steel_grade", 0.2, "query");

  considerField("diameter_mm", 0.8, "filter");
  considerField("class", 0.6, "filter");
  considerField("product_type", 0.6, "filter");
  considerField("surface", 0.4, "filter");
  considerField("profile", 0.4, "filter");
  considerField("steel_grade", 0.3, "filter");
  considerField("gost", 0.3, "filter");

  return bonus;
};

const facetFields: CanonicalField[] = [
  "product_type",
  "class",
  "surface",
  "profile",
  "diameter_mm",
  "steel_grade",
  "gost",
  "section",
  "category",
  "subcategory",
];

const buildFacets = (
  items: FuseRecord[],
  taxonomy: Taxonomy,
  filters: SearchFilters,
): Record<CanonicalField, SearchFacet[]> => {
  const facets: Record<CanonicalField, SearchFacet[]> = {} as Record<
    CanonicalField,
    SearchFacet[]
  >;
  const lookup = createTaxonomyLookup(taxonomy);

  facetFields.forEach((field) => {
    const counts = new Map<string, number>();
    items.forEach((item) => {
      const values = item.attributes[field];
      if (!values) return;
      values.forEach((value) => {
        const key = String(value);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      });
    });
    if (counts.size === 0) return;
    const selected = new Set<string>(
      ((filters as Record<string, unknown>)[field] ?? []) as string[],
    );
    const entries: SearchFacet[] = Array.from(counts.entries()).map(([value, count]) => {
      const label =
        lookup.get(field)?.get(value) ??
        (NUMERIC_FIELDS.includes(field) ? value : value.replace(/-/g, " "));
      const numericValue = NUMERIC_FIELDS.includes(field) ? Number(value) : undefined;
      return {
        field,
        value,
        label,
        count,
        numericValue,
      };
    });
    entries.sort((a, b) => {
      if (NUMERIC_FIELDS.includes(field)) {
        return (a.numericValue ?? 0) - (b.numericValue ?? 0);
      }
      if (selected.has(b.value) !== selected.has(a.value)) {
        return selected.has(b.value) ? 1 : -1;
      }
      if (b.count !== a.count) return b.count - a.count;
      return a.label.localeCompare(b.label);
    });
    facets[field] = entries;
  });

  return facets;
};

export const createSearchEngine = (
  categories: Category[],
  synonyms: SynonymsDictionary,
  taxonomy: Taxonomy,
): SearchEngine => {
  const items = flattenCatalog(categories, synonyms);
  const fuse = new Fuse(items, {
    includeScore: true,
    threshold: 0.35,
    ignoreLocation: true,
    minMatchCharLength: 2,
    keys: [
      { name: "title", weight: 0.45 },
      { name: "subcategoryTitle", weight: 0.25 },
      { name: "categoryTitle", weight: 0.15 },
      { name: "searchVector", weight: 0.25 },
      { name: "sku", weight: 0.2 },
    ],
  });

  const runSearch: RunSearch = ({
    q,
    filters,
    sort = "default",
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  }) => {
    const normalized = normalizeQuery(q ?? "", synonyms);
    const mergedFilters = mergeFilters(normalized, filters);
    const hasQuery = normalized.cleaned.length > 0;
    const baseResults = hasQuery
      ? fuse.search(normalized.cleaned).map((entry) => ({
          item: entry.item,
          score: entry.score ?? 1,
        }))
      : items.map((item, index) => ({
          item,
          score: 1 + index / items.length,
        }));

    const filtered = baseResults.filter((entry) => matchesFilters(entry.item, mergedFilters));

    const ranked = filtered
      .map((entry) => {
        const bonus = structuredBonus(entry.item, normalized, mergedFilters);
        const adjustedScore = Math.max(entry.score - bonus, 0);
        return {
          item: entry.item,
          score: adjustedScore,
        };
      })
      .sort((a, b) => {
        if (a.score === b.score) {
          return a.item.title.localeCompare(b.item.title);
        }
        return a.score - b.score;
      });

    if (sort === "relevance") {
      ranked.sort((a, b) => a.score - b.score);
    }

    const total = ranked.length;
    const start = (Math.max(page, 1) - 1) * pageSize;
    const end = start + pageSize;
    const pagedItems = ranked.slice(start, end).map((entry) => entry.item);
    const facets = buildFacets(
      ranked.map((entry) => entry.item),
      taxonomy,
      mergedFilters,
    );

    const result: SearchResult = {
      items: pagedItems,
      facets,
      total,
      meta: {
        normalized,
        filters: mergedFilters,
      },
    };

    return result;
  };

  return {
    runSearch,
    synonyms,
    taxonomy,
    items,
  };
};
