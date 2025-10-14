import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getItem } from "@/lib/catalog";

type Params = { category: string; sub: string; item: string };

export function generateStaticParams(): Params[] {
  const params: Params[] = [];
  for (const category of getCategories()) {
    for (const sub of category.sub) {
      for (const item of sub.items) {
        params.push({ category: category.slug, sub: sub.slug, item: item.slug });
      }
    }
  }
  return params;
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const ctx = getItem(params.category, params.sub, params.item);
  if (!ctx) {
    return {
      title: "Позиция не найдена",
      description: "Запрошенная позиция каталога отсутствует или была обновлена.",
    };
  }
  const { item, sub, cat } = ctx;
  return {
    title: `${item.title} — ${sub.title}`,
    description: item.desc ?? `${item.title} из раздела ${sub.title} (${cat.title}).`,
    alternates: { canonical: `/catalog/${cat.slug}/${sub.slug}/${item.slug}` },
  };
}

export default function ItemPage({ params }: { params: Params }) {
  const ctx = getItem(params.category, params.sub, params.item);
  if (!ctx) {
    notFound();
  }

  const { cat, sub, item } = ctx;

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
      <nav className="mb-8 text-sm text-slate-500">
        <Link href="/catalog" className="hover:text-blue-700">
          Каталог
        </Link>
        <span className="mx-2 text-slate-400">/</span>
        <Link href={`/catalog/${cat.slug}`} className="hover:text-blue-700">
          {cat.title}
        </Link>
        <span className="mx-2 text-slate-400">/</span>
        <Link href={`/catalog/${cat.slug}/${sub.slug}`} className="hover:text-blue-700">
          {sub.title}
        </Link>
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-700">{item.title}</span>
      </nav>

      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">{item.title}</h1>
        {item.sku && (
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
            Артикул: {item.sku}
          </div>
        )}
        <p className="text-base text-slate-600">
          {item.desc ??
            "Позиция доступна к поставке под заказ. Уточним стоимость, сроки производства и доставку в течение рабочего дня."}
        </p>
      </header>

      <section className="mt-10 space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">Что включено в поставку</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Подбор по техническим требованиям и отраслевым стандартам.</li>
            <li>Комплект сопроводительной документации и сертификатов.</li>
            <li>Организация логистики на объект с уведомлением о готовности.</li>
            <li>Опционально — монтаж, ПНР и сервисное сопровождение.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Запросить коммерческое предложение</h2>
          <form className="grid gap-3 sm:grid-cols-2" action="/contacts" method="post">
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="Как к вам обращаться"
              name="name"
              required
            />
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="+7 (___) ___-__-__"
              name="phone"
              required
            />
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 sm:col-span-2"
              placeholder="Компания или проект"
              name="company"
            />
            <textarea
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 sm:col-span-2"
              rows={4}
              placeholder="Опишите задачу или приложите спецификацию — мы уточним наличие и предложим аналог при необходимости."
              name="comment"
            />
            <button
              type="submit"
              className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-blue-500 sm:col-span-2"
            >
              Запросить КП
            </button>
          </form>
          <p className="text-xs text-slate-500">
            Отправляя заявку, вы соглашаетесь с{" "}
            <Link href="/policy" className="text-blue-700 hover:text-blue-800">
              политикой обработки персональных данных
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
