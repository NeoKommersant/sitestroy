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
      description: "Запрошенная подкатегория отсутствует или была обновлена.",
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
  const categories = getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
      <nav className="mb-8 text-sm text-slate-500">
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

      <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Разделы</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/catalog/${category.slug}`}
                    className={`block rounded-xl border px-4 py-3 transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 ${
                      category.slug === cat.slug
                        ? "border-blue-200 bg-blue-50 font-semibold text-blue-800"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {category.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Подкатегории</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {cat.sub.map((subcat) => (
                <li key={subcat.slug}>
                  <Link
                    href={`/catalog/${cat.slug}/${subcat.slug}`}
                    className={`block rounded-xl border px-4 py-3 transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 ${
                      subcat.slug === sub.slug
                        ? "border-blue-200 bg-blue-50 font-semibold text-blue-800"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                    aria-current={subcat.slug === sub.slug ? "page" : undefined}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{subcat.title}</span>
                      <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{subcat.items.length}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="space-y-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">{sub.title}</h1>
              <p className="max-w-3xl text-base text-slate-600">{sub.intro ?? cat.intro}</p>
            </div>
            <div className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">
              {sub.items.length} позиций
            </div>
          </header>

          {sub.items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
              Номенклатура уточняется. Оставьте заявку, и мы подберём позиции под ваш проект.
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <div className="hidden min-w-[560px] grid-cols-[minmax(240px,0.6fr)_minmax(240px,1fr)_auto] border-b border-slate-200 bg-slate-50 px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 md:grid">
                  <div>Полное наименование</div>
                  <div>Важные характеристики</div>
                  <div className="text-right">Действия</div>
                </div>
                <div className="divide-y divide-slate-200">
                  {sub.items.map((item) => (
                    <div
                      key={item.slug}
                      className="grid gap-4 px-4 py-5 transition hover:bg-slate-50 md:min-w-[560px] md:grid-cols-[minmax(240px,0.6fr)_minmax(240px,1fr)_auto] md:px-6"
                    >
                      <div>
                        <div className="text-base font-semibold text-slate-900">{item.title}</div>
                        {item.sku && (
                          <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">Артикул: {item.sku}</div>
                        )}
                      </div>
                      <div className="text-sm text-slate-600">{item.desc ?? "Характеристики уточняются по запросу."}</div>
                      <div className="flex items-start justify-end">
                        <Link
                          href={`/catalog/${cat.slug}/${sub.slug}/${item.slug}`}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-blue-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-700 transition hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600 sm:w-auto"
                        >
                          Подробнее
                          <span aria-hidden>→</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
