"use client";

import { useCallback } from "react";
import type { NormalizedQuery } from "@/types/search";

const FIELD_LABELS: Record<string, string> = {
  product_type: "Тип",
  class: "Класс",
  surface: "Поверхность",
  profile: "Профиль",
  diameter_mm: "Диаметр",
  thickness_mm: "Толщина",
  section: "Сечение",
  steel_grade: "Марка стали",
  gost: "ГОСТ / ТУ",
};

export type SmartSearchBarProps = {
  value: string;
  placeholder?: string;
  normalized: NormalizedQuery | null;
  onChange: (next: string) => void;
  onSubmit: () => void;
  onClear: () => void;
};

const formatExtractedValue = (field: string, value: string | number): string => {
  if (field === "diameter_mm") return `Ø ${value} мм`;
  if (field === "thickness_mm") return `${value} мм`;
  return String(value).replace(/-/g, " ");
};

export default function SmartSearchBar({
  value,
  placeholder = "Например: «арматура ф12 a500» или «труба 40x20x2»",
  normalized,
  onChange,
  onSubmit,
  onClear,
}: SmartSearchBarProps) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        onSubmit();
      }
    },
    [onSubmit],
  );

  const renderedHints =
    normalized &&
    Object.entries(normalized.extracted).flatMap(([field, values]) => {
      if (!values || (Array.isArray(values) && values.length === 0)) return [];
      const label = FIELD_LABELS[field] ?? field;
      const typedValues = Array.isArray(values) ? values : [values];
      return typedValues.map((valueEntry) => ({
        key: `${field}-${valueEntry}`,
        label,
        value: formatExtractedValue(field, valueEntry as string | number),
      }));
    });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-3xl border border-white/10 bg-white/10 p-2 shadow-[0_14px_40px_rgba(10,20,45,0.35)] backdrop-blur md:p-3">
        <div className="hidden h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-200 md:flex">
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="20" y1="20" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-base text-white placeholder:text-white/50 focus:outline-none md:text-lg"
          aria-label="Поиск по каталогу"
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-2xl bg-white/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.15em] text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Очистить
          </button>
        )}
        <button
          type="button"
          onClick={onSubmit}
          className="rounded-2xl bg-teal-500 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-teal-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 md:px-6 md:text-xs"
        >
          Найти
        </button>
      </div>
      {renderedHints && renderedHints.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs text-white/80">
          {renderedHints.map((hint) => (
            <span
              key={hint.key}
              className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1"
            >
              <span className="uppercase tracking-[0.2em] text-[10px] text-teal-200">
                {hint.label}
              </span>
              <span>{hint.value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
