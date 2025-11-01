"use client";

import type { CanonicalField, SearchFacet, SearchFilters } from "@/types/search";

const FIELD_LABELS: Record<CanonicalField, string> = {
  product_type: "Тип продукции",
  class: "Класс",
  surface: "Поверхность",
  profile: "Профиль",
  diameter_mm: "Диаметр, мм",
  thickness_mm: "Толщина, мм",
  section: "Сечение",
  steel_grade: "Марка стали",
  gost: "ГОСТ / ТУ",
  category: "Категория",
  subcategory: "Подкатегория",
};

const CHIP_FIELDS: CanonicalField[] = [
  "product_type",
  "class",
  "diameter_mm",
  "surface",
  "steel_grade",
];

export type FiltersPanelProps = {
  facets: Record<CanonicalField, SearchFacet[]>;
  activeFilters: SearchFilters;
  lockedFilters?: SearchFilters;
  onToggle: (field: CanonicalField, value: string) => void;
  onClearField: (field: CanonicalField) => void;
  onReset: () => void;
  layout?: "vertical" | "chips";
};

const isValueActive = (filters: SearchFilters, field: CanonicalField, value: string) =>
  Array.isArray(filters[field]) && (filters[field] as (string | number)[]).includes(value);

const formatFacetValue = (field: CanonicalField, facet: SearchFacet) => {
  if (field === "diameter_mm") return `Ø ${facet.label}`;
  if (field === "thickness_mm") return `${facet.label} мм`;
  return facet.label;
};

const renderChip = (
  facet: SearchFacet,
  field: CanonicalField,
  isActive: boolean,
  isLocked: boolean,
  onToggle: (field: CanonicalField, value: string) => void,
) => (
  <button
    key={`${field}-${facet.value}`}
    type="button"
    className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 ${
      isLocked
        ? "border border-white/25 bg-white/10 text-white/70"
        : isActive
        ? "border border-teal-400 bg-teal-500/20 text-teal-100"
        : "border border-white/10 bg-white/5 text-white/80 hover:border-teal-400"
    }`}
    onClick={() => {
      if (!isLocked) onToggle(field, facet.value);
    }}
    aria-pressed={isActive}
    disabled={isLocked}
  >
    {formatFacetValue(field, facet)}
  </button>
);

const VerticalFilters = ({
  facets,
  activeFilters,
  lockedFilters,
  onToggle,
  onClearField,
  onReset,
}: FiltersPanelProps) => (
  <aside className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_40px_rgba(10,20,45,0.35)] backdrop-blur-lg">
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
        Фильтры
      </span>
      <button
        type="button"
        onClick={onReset}
        className="text-xs font-medium uppercase tracking-[0.2em] text-teal-200 hover:text-teal-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      >
        Сбросить всё
      </button>
    </div>
    <div className="space-y-5">
      {facetFieldsOrdered(facets).map(([field, facetList]) => {
        if (facetList.length === 0) return null;
        const label = FIELD_LABELS[field];
        return (
          <div key={field} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">{label}</h3>
              {Array.isArray(activeFilters[field]) && (activeFilters[field] as unknown[]).length > 0 && (
                <button
                  type="button"
                  onClick={() => onClearField(field)}
                  className="text-[11px] uppercase tracking-[0.16em] text-teal-200 hover:text-teal-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  Очистить
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {facetList.map((facet) =>
                renderChip(
                  facet,
                  field,
                  isValueActive(activeFilters, field, facet.value),
                  lockedFilters ? isValueActive(lockedFilters, field, facet.value) : false,
                  onToggle,
                ),
              )}
            </div>
          </div>
        );
      })}
    </div>
  </aside>
);

const facetFieldsOrdered = (
  facets: Record<CanonicalField, SearchFacet[]>,
): [CanonicalField, SearchFacet[]][] =>
  facetFields
    .map((field) => [field, facets[field] ?? []] as [CanonicalField, SearchFacet[]])
    .filter(([, values]) => values.length > 0);

const facetFields: CanonicalField[] = [
  "product_type",
  "class",
  "diameter_mm",
  "surface",
  "profile",
  "steel_grade",
  "gost",
  "section",
  "category",
  "subcategory",
];

const ChipsFilters = ({
  facets,
  activeFilters,
  lockedFilters,
  onToggle,
}: FiltersPanelProps) => (
  <div className="flex flex-col gap-3">
    {CHIP_FIELDS.filter((field) => (facets[field] ?? []).length > 0).map((field) => (
      <div key={field} className="flex flex-col gap-2">
        <span className="text-[11px] uppercase tracking-[0.2em] text-white/60">
          {FIELD_LABELS[field]}
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(facets[field] ?? []).slice(0, 12).map((facet) =>
            renderChip(
              facet,
              field,
              isValueActive(activeFilters, field, facet.value),
              lockedFilters ? isValueActive(lockedFilters, field, facet.value) : false,
              onToggle,
            ),
          )}
        </div>
      </div>
    ))}
  </div>
);

export default function FiltersPanel(props: FiltersPanelProps) {
  if (props.layout === "chips") {
    return <ChipsFilters {...props} />;
  }
  return <VerticalFilters {...props} />;
}
