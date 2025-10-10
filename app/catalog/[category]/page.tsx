import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getCategory } from "@/lib/catalog";

type Params = { category: string };

export function generateStaticParams(): Params[] {
  return getCategories().map((category) => ({ category: category.slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const category = getCategory(params.category);
  if (!category) {
    return {
      title: "Категория не найдена",
      description: "Запрашиваемая категория каталога не найдена.",
    };
  }
  return {
    title: `${category.title} — каталог материалов и решений`,
    description: category.intro,
    alternates: { canonical: `/catalog/${category.slug}` },
  };
}

export default function CategoryPage({ params }: { params: Params }) {
  const category = getCategory(params.category);
  if (!category) {
    notFound();
  }
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/catalog" className="hover:text-blue-700">
          Каталог
        </Link>
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-700">{category.title}</span>
      </nav>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">{category.title}</h1>
          <p className="text-base text-slate-600">{category.intro}</p>
        </div>
        <div className="relative h-64 w-full overflow-hidden rounded-3xl border border-slate-200">
          <Image src={category.image} alt={category.title} fill className="object-cover" />
        </div>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {category.sub.map((sub) => (
          <Link
            key={sub.slug}
            href={`/catalog/${category.slug}/${sub.slug}`}
            className="group flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-700">Подкатегория</div>
              <div className="text-xl font-semibold text-slate-900">{sub.title}</div>
              {sub.intro && <p className="text-sm text-slate-600">{sub.intro}</p>}
            </div>
            <div className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              {sub.items.length} позиций · Подробнее →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
