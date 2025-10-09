import Link from "next/link";
import { getCategories } from "../../lib/catalog"; // относительный путь

export const metadata = {
  title: "Каталог — Стройальянс",
  description: "Основные направления и подкатегории номенклатуры.",
};

export default function CatalogPage() {
  const cats = getCategories();
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Каталог</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map((c) => (
          <Link key={c.slug} href={`/catalog/${c.slug}`} className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow">
            <div className="text-lg font-semibold mb-1">{c.title}</div>
            {c.intro && <p className="text-sm text-gray-600">{c.intro}</p>}
            <div className="mt-3 text-xs text-gray-500">{c.sub.length} подкатегории</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
