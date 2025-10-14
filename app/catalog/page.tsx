import type { Metadata } from "next";
import { getCategories } from "@/lib/catalog";
import CatalogExplorer from "./CatalogExplorer";

export const metadata: Metadata = {
  title: "Каталог решений",
  description:
    "Комплексные поставки материалов, инженерного оборудования и услуг: водо-, газо- и электроснабжение, строительные материалы и сервис для B2B/B2G проектов.",
  alternates: { canonical: "/catalog" },
};

export default function CatalogPage() {
  const categories = getCategories();
  const totalSub = categories.reduce((acc, category) => acc + category.sub.length, 0);
  const totalItems = categories.reduce(
    (acc, category) => acc + category.sub.reduce((sum, sub) => sum + sub.items.length, 0),
    0,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Каталог материалов и услуг</h1>
          <p className="max-w-3xl text-base text-slate-600">
            Выберите направление и мгновенно переходите к нужным подкатегориям. Собрали ключевые группы поставок для
            магистральных сетей, промышленных площадок и строительных проектов — от труб и арматуры до услуг монтажа и
            логистики.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
          <div className="font-semibold text-slate-900">
            {categories.length} разделов • {totalSub} подкатегорий • {totalItems} позиций
          </div>
          <p className="mt-1 text-xs text-slate-500">Перечень регулярно дополняем под требования действующих проектов.</p>
        </div>
      </div>
      <div className="mt-10">
        <CatalogExplorer categories={categories} />
      </div>
    </div>
  );
}
