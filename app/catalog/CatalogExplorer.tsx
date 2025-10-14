"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/data/catalog";

type CatalogExplorerProps = {
  categories: Category[];
};

type AccordionCategoryProps = {
  category: Category;
  isOpen: boolean;
  onToggle: () => void;
};

const AccordionCategory = ({ category, isOpen, onToggle }: AccordionCategoryProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setMaxHeight(containerRef.current.scrollHeight);
    }
  }, [category.sub.length, isOpen]);

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-200">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-5 px-6 py-5 text-left transition hover:bg-slate-50"
        aria-expanded={isOpen}
      >
        <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-2xl">
          <Image
            src={category.image}
            alt={category.title}
            fill
            className="object-cover transition duration-500"
            sizes="(min-width: 1024px) 220px, 40vw"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="text-xs uppercase tracking-[0.35em] text-slate-400">Категория</div>
          <h3 className="truncate text-xl font-semibold text-slate-900">{category.title}</h3>
          <p className="line-clamp-2 text-sm text-slate-600">{category.intro}</p>
        </div>
        <div className="flex flex-col items-end gap-1 text-xs font-semibold uppercase tracking-[0.3em] text-blue-700">
          <span>{category.sub.length} подкатегорий</span>
          <span>
            {category.sub.reduce((acc, sub) => acc + sub.items.length, 0)} позиций
          </span>
        </div>
        <span
          className={`ml-3 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition duration-300 ${
            isOpen ? "rotate-180 bg-blue-50 text-blue-700" : "bg-white"
          }`}
          aria-hidden
        >
          ▾
        </span>
      </button>
      <div
        className="overflow-hidden transition-[max-height] duration-500 ease-in-out"
        style={{ maxHeight: isOpen ? maxHeight : 0 }}
      >
        <div ref={containerRef} className="border-t border-slate-200 bg-slate-50 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
            <span className="text-sm text-slate-600">
              Подкатегории раздела &laquo;{category.title}&raquo;
            </span>
            <Link
              href={`/catalog/${category.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-700 transition hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600"
            >
              Открыть раздел →
            </Link>
          </div>
          <ul className="space-y-3">
            {category.sub.map((sub) => (
              <li key={sub.slug}>
                <Link
                  href={`/catalog/${category.slug}/${sub.slug}`}
                  className="group block rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-slate-900">{sub.title}</div>
                      {sub.range && <p className="text-sm text-slate-600">{sub.range}</p>}
                      {!sub.range && sub.intro && <p className="text-sm text-slate-600">{sub.intro}</p>}
                    </div>
                    <span className="flex-shrink-0 text-xs font-semibold uppercase tracking-[0.3em] text-blue-700">
                      {sub.items.length} позиций
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
};

const CatalogExplorer = ({ categories }: CatalogExplorerProps) => {
  const [openSlug, setOpenSlug] = useState<string | null>(categories[0]?.slug ?? null);
  const handleToggle = (slug: string) => {
    setOpenSlug((prev) => (prev === slug ? null : slug));
  };

  const groupedCategories = useMemo(() => categories, [categories]);

  return (
    <div className="space-y-6">
      {groupedCategories.map((category) => (
        <AccordionCategory
          key={category.slug}
          category={category}
          isOpen={openSlug === category.slug}
          onToggle={() => handleToggle(category.slug)}
        />
      ))}
    </div>
  );
};

export default CatalogExplorer;
