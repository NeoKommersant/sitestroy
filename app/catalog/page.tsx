import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getCategories } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Каталог решений",
  description:
    "Комплексные поставки инженерных систем, стройматериалов и спецтехники для инфраструктурных проектов. Категории, подкатегории и номенклатура.",
  alternates: { canonical: "/catalog" },
};

export default function CatalogPage() {
  const categories = getCategories();
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Каталог материалов и решений</h1>
          <p className="max-w-3xl text-base text-slate-600">
            Подбор инженерного оборудования, стройматериалов и спецтехники для B2B и B2G проектов. Каждая позиция подтверждается
            сертификатами, паспортами и сопровождается инженерной поддержкой.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
          <div className="font-semibold text-slate-900">{categories.length} основных направлений</div>
          <div className="text-slate-500">Статический экспорт каталога для SEO и офлайн-доступа.</div>
        </div>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/catalog/${category.slug}`}
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative h-52 w-full">
              <Image
                src={category.image}
                alt={category.title}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 space-y-2 p-6 text-white">
                <div className="text-sm uppercase tracking-[0.3em] text-slate-200">Категория</div>
                <div className="text-xl font-semibold">{category.title}</div>
              </div>
            </div>
            <div className="space-y-3 p-6">
              <p className="text-sm text-slate-600">{category.intro}</p>
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-700">
                {category.sub.length} подкатегорий · {category.sub.reduce((acc, sub) => acc + sub.items.length, 0)} позиций
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
