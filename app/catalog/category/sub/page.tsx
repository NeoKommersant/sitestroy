import Link from "next/link";
import { getCategories, getSubcategory } from "@/lib/catalog";

type Props = { params: { category: string; sub: string } };

export function generateStaticParams() {
  const params: { category: string; sub: string }[] = [];
  for (const c of getCategories()) for (const s of c.sub) params.push({ category: c.slug, sub: s.slug });
  return params;
}

export async function generateMetadata({ params }: Props) {
  const ctx = getSubcategory(params.category, params.sub);
  return {
    title: ctx ? `${ctx.sub.title} — ${ctx.cat.title}` : "Номенклатура — Каталог",
    description: ctx?.cat.intro ?? "Номенклатурные позиции и спецификации.",
  };
}

export default function SubcategoryPage({ params }: Props) {
  const ctx = getSubcategory(params.category, params.sub);
  if (!ctx) return <div className="py-12 text-center">Подкатегория не найдена</div>;
  const { cat, sub } = ctx;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <nav className="mb-4 text-sm text-gray-600">
        <Link href="/catalog" className="hover:underline">Каталог</Link>
        <span className="mx-2">/</span>
        <Link href={`/catalog/${cat.slug}`} className="hover:underline">{cat.title}</Link>
        <span className="mx-2">/</span>
        <span>{sub.title}</span>
      </nav>
      <h1 className="text-2xl font-bold mb-4">{sub.title}</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sub.items.map((it) => (
          <Link key={it.slug} href={`/catalog/${cat.slug}/${sub.slug}/${it.slug}`} className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow">
            <div className="font-semibold">{it.title}</div>
            {it.sku && <div className="text-xs text-gray-500 mt-1">Артикул: {it.sku}</div>}
            {it.desc && <div className="text-sm text-gray-600 mt-2">{it.desc}</div>}
          </Link>
        ))}
      </div>
    </div>
  );
}
