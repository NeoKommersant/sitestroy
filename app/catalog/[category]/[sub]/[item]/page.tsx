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
      description: "Запрашиваемая позиция каталога недоступна.",
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
      <nav className="mb-6 text-sm text-slate-500">
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
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">{item.title}</h1>
        {item.sku && (
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
            Артикул: {item.sku}
          </div>
        )}
        <p className="text-base text-slate-600">
          {item.desc ??
            "Позиция доступна к поставке со склада и под заказ. Подготовим коммерческое предложение, спецификацию и сопроводительную документацию."}
        </p>
      </div>
      <div className="mt-10 space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">Что включено</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Проверка соответствия проекту и нормативам.</li>
            <li>Подготовка паспортов, сертификатов и протоколов испытаний.</li>
            <li>Логистика до объекта, разгрузка и складирование по требованию.</li>
            <li>Инженерно-техническое сопровождение и консультации.</li>
          </ul>
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Получить предложение</h2>
          <form className="grid gap-3 sm:grid-cols-2" action="/contacts" method="post">
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="Ваше имя"
              required
            />
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="+7 (___) ___-__-__"
              required
            />
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 sm:col-span-2"
              placeholder="Компания и проект"
            />
            <textarea
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 sm:col-span-2"
              rows={4}
              placeholder="Комментарий к заявке, требуемые сроки, объемы."
            />
            <button
              type="submit"
              className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-blue-500 sm:col-span-2"
            >
              Запросить КП
            </button>
          </form>
          <p className="text-xs text-slate-500">
            Нажимая кнопку, вы подтверждаете согласие с{" "}
            <Link href="/policy" className="text-blue-700 hover:text-blue-800">
              политикой обработки данных
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
