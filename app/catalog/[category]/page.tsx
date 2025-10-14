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
      description: "Указанный раздел каталога отсутствует или был перенесён.",
    };
  }
  return {
    title: `${category.title} — каталог поставок`,
    description: category.intro,
    alternates: { canonical: `/catalog/${category.slug}` },
  };
}

export default function CategoryPage({ params }: { params: Params }) {
  const category = getCategory(params.category);
  if (!category) {
    notFound();
  }

  const categories = getCategories();
  const totalItems = category.sub.reduce((sum, sub) => sum + sub.items.length, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
      <nav className="mb-8 text-sm text-slate-500">
        <Link href="/catalog" className="hover:text-blue-700">
          Каталог
        </Link>
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-700">{category.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Разделы</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/catalog/${cat.slug}`}
                    className={`block rounded-xl border px-4 py-3 transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 ${
                      cat.slug === category.slug
                        ? "border-blue-200 bg-blue-50 font-semibold text-blue-800"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                    aria-current={cat.slug === category.slug ? "page" : undefined}
                  >
                    <div className="flex items-center justify-between">
                      <span>{cat.title}</span>
                      <span className="text-xs uppercase tracking-wide text-slate-400">{cat.sub.length}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
            <p>
              {category.sub.length} подкатегорий • {totalItems} позиций — подберём аналоги и сроки поставки под ваш запрос.
            </p>
            <Link href="/contacts" className="inline-flex items-center gap-2 font-semibold text-blue-700 hover:text-blue-600">
              Связаться с отделом снабжения →
            </Link>
          </div>
        </aside>

        <div className="space-y-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">{category.title}</h1>
              <p className="text-base text-slate-600">{category.intro}</p>
            </div>
            <div className="relative h-64 w-full overflow-hidden rounded-3xl border border-slate-200">
              <Image src={category.image} alt={category.title} fill className="object-cover" priority />
            </div>
          </div>

          <section className="space-y-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Подкатегории</h2>
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
              {category.sub.map((sub) => (
                <article
                  key={sub.slug}
                  className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-slate-900">{sub.title}</h3>
                        {sub.range && (
                          <p className="text-sm font-semibold text-slate-700">Диапазон: {sub.range}</p>
                        )}
                        {sub.intro && <p className="text-sm text-slate-600">{sub.intro}</p>}
                      </div>
                      <span className="rounded-full bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-blue-700 whitespace-nowrap">
                        {sub.items.length} позиций
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/catalog/${category.slug}/${sub.slug}`}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600 sm:w-auto sm:justify-start sm:rounded-none sm:border-none sm:px-0 sm:py-0"
                  >
                    Открыть номенклатуру
                    <span aria-hidden>→</span>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
