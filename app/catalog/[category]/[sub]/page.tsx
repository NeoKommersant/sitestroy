import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getSubcategory } from "@/lib/catalog";

type Params = { category: string; sub: string };

export function generateStaticParams(): Params[] {
  const params: Params[] = [];
  for (const category of getCategories()) {
    for (const sub of category.sub) {
      params.push({ category: category.slug, sub: sub.slug });
    }
  }
  return params;
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const ctx = getSubcategory(params.category, params.sub);
  if (!ctx) {
    return {
      title: "Подкатегория не найдена",
      description: "Запрашиваемая подкатегория каталога недоступна.",
    };
  }
  return {
    title: `${ctx.sub.title} — ${ctx.cat.title}`,
    description: ctx.sub.intro ?? ctx.cat.intro,
    alternates: { canonical: `/catalog/${ctx.cat.slug}/${ctx.sub.slug}` },
  };
}

export default function SubcategoryPage({ params }: { params: Params }) {
  const ctx = getSubcategory(params.category, params.sub);
  if (!ctx) {
    notFound();
  }
  const { cat, sub } = ctx;
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/catalog" className="hover:text-blue-700">
          Каталог
        </Link>
        <span className="mx-2 text-slate-400">/</span>
        <Link href={`/catalog/${cat.slug}`} className="hover:text-blue-700">
          {cat.title}
        </Link>
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-700">{sub.title}</span>
      </nav>
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">{sub.title}</h1>
        <p className="max-w-3xl text-base text-slate-600">{sub.intro ?? cat.intro}</p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {sub.items.map((item) => (
          <Link
            key={item.slug}
            href={`/catalog/${cat.slug}/${sub.slug}/${item.slug}`}
            className="group flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-700">Позиция</div>
              <div className="text-xl font-semibold text-slate-900">{item.title}</div>
              {item.desc && <p className="text-sm text-slate-600">{item.desc}</p>}
            </div>
            <div className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Подробнее →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
