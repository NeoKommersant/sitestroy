import Link from "next/link";
import { getCategories, getCategory } from "@/lib/catalog";

type Props = { params: { category: string } };

export function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const cat = getCategory(params.category);
  return {
    title: cat ? `${cat.title} — Каталог` : "Категория — Каталог",
    description: cat?.intro ?? "Подкатегории и номенклатура.",
  };
}

export default function CategoryPage({ params }: Props) {
  const cat = getCategory(params.category);
  if (!cat) return <div className="py-12 text-center">Категория не найдена</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-2">{cat.title}</h1>
      {cat.intro && <p className="text-gray-600 mb-6">{cat.intro}</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cat.sub.map((s) => (
          <Link key={s.slug} href={`/catalog/${cat.slug}/${s.slug}`} className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow">
            <div className="text-base font-semibold mb-1">{s.title}</div>
            <div className="text-sm text-gray-600">{s.items.length} позиций</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
