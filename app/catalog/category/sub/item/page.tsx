import Link from "next/link";
import { getCategories, getItem } from "@/lib/catalog";

type Props = { params: { category: string; sub: string; item: string } };

export function generateStaticParams() {
  const params: Props["params"][] = [];
  for (const c of getCategories()) for (const s of c.sub) for (const it of s.items)
    params.push({ category: c.slug, sub: s.slug, item: it.slug });
  return params;
}

export async function generateMetadata({ params }: Props) {
  const ctx = getItem(params.category, params.sub, params.item);
  return {
    title: ctx ? `${ctx.item.title} — ${ctx.sub.title}` : "Товар — Каталог",
    description: ctx?.item.desc ?? "Номенклатурная позиция: характеристики и поставка.",
  };
}

export default function ItemPage({ params }: Props) {
  const ctx = getItem(params.category, params.sub, params.item);
  if (!ctx) return <div className="py-12 text-center">Позиция не найдена</div>;
  const { cat, sub, item } = ctx;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <nav className="mb-4 text-sm text-gray-600">
        <Link href="/catalog" className="hover:underline">Каталог</Link>
        <span className="mx-2">/</span>
        <Link href={`/catalog/${cat.slug}`} className="hover:underline">{cat.title}</Link>
        <span className="mx-2">/</span>
        <Link href={`/catalog/${cat.slug}/${sub.slug}`} className="hover:underline">{sub.title}</Link>
        <span className="mx-2">/</span>
        <span>{item.title}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
      {item.sku && <div className="text-sm text-gray-500 mb-4">Артикул: {item.sku}</div>}
      <p className="text-gray-700 mb-6">{item.desc ?? "Описание и характеристики по запросу. Поставки для B2B/B2G."}</p>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Коммерческий запрос</h2>
        <form className="grid grid-cols-1 gap-3 sm:grid-cols-2" onSubmit={(e)=>e.preventDefault()}>
          <input className="rounded-xl border p-3 text-sm" placeholder="Компания" />
          <input className="rounded-xl border p-3 text-sm" placeholder="Контакт (телефон или email)" />
          <input className="rounded-xl border p-3 text-sm sm:col-span-2" placeholder="Количество / характеристики" />
          <textarea className="rounded-xl border p-3 text-sm sm:col-span-2" rows={4} placeholder="Комментарий / сроки / доставка" />
          <button className="rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black sm:col-span-2">Отправить заявку</button>
        </form>
        <div className="mt-3 text-xs text-gray-500">Нажимая «Отправить», вы соглашаетесь с политикой обработки персональных данных.</div>
      </div>
    </div>
  );
}
