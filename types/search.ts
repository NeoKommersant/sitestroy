export type CanonicalField =
  | "product_type"
  | "class"
  | "surface"
  | "profile"
  | "diameter_mm"
  | "thickness_mm"
  | "section"
  | "steel_grade"
  | "gost"
  | "category"
  | "subcategory";

export type NumericCanonicalField = "diameter_mm" | "thickness_mm";

export type CanonicalValue = {
  field: CanonicalField;
  id: string;
  label: string;
  count: number;
  numericValue?: number;
  aliases?: string[];
};

export type Taxonomy = Record<CanonicalField, CanonicalValue[]>;

export type SynonymMatch = {
  field: CanonicalField;
  value: string;
  score: number;
  weight: number;
  source?: "catalog" | "pattern" | "manual";
};

export type SynonymsDictionary = Record<string, SynonymMatch[]>;

export type StructuredFilters = {
  product_type?: string[];
  class?: string[];
  surface?: string[];
  profile?: string[];
  section?: string[];
  steel_grade?: string[];
  gost?: string[];
  category?: string[];
  subcategory?: string[];
  diameter_mm?: number[];
  thickness_mm?: number[];
};

export type NormalizedQuery = {
  cleaned: string;
  tokens: string[];
  extracted: StructuredFilters;
  unknownTokens: string[];
};

export type SearchFilters = {
  product_type?: string[];
  class?: string[];
  surface?: string[];
  profile?: string[];
  section?: string[];
  steel_grade?: string[];
  gost?: string[];
  category?: string[];
  subcategory?: string[];
  diameter_mm?: number[];
  thickness_mm?: number[];
};

export type SearchFacet = {
  field: CanonicalField;
  value: string;
  label: string;
  count: number;
  numericValue?: number;
};

export type SearchResultItem = {
  categorySlug: string;
  categoryTitle: string;
  subcategorySlug: string;
  subcategoryTitle: string;
  slug: string;
  title: string;
  sku?: string;
  desc?: string;
  attributes: StructuredFilters;
  tags: string[];
};

export type SearchResult = {
  items: SearchResultItem[];
  facets: Record<CanonicalField, SearchFacet[]>;
  total: number;
  meta: {
    normalized: NormalizedQuery;
    filters: SearchFilters;
  };
};

export type RunSearchArgs = {
  q: string;
  filters?: SearchFilters;
  sort?: "default" | "relevance";
  page?: number;
  pageSize?: number;
};

export type RunSearch = (args: RunSearchArgs) => SearchResult;
