import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getItem, getCategories } from "@/lib/catalog";

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
      description: "Запрошенная позиция каталога отсутствует или была перенесена.",
    };
  }
  const { item, sub, cat } = ctx;
  return {
    title: `${item.title} — ${sub.title}`,
    description: item.desc ?? `${item.title} в разделе ${sub.title} (${cat.title}).`,
    alternates: {
      canonical: `/catalog?category=${cat.slug}&subcategory=${sub.slug}&item=${item.slug}`,
    },
  };
}

export default function ItemRedirect({ params }: { params: Params }) {
  const ctx = getItem(params.category, params.sub, params.item);
  if (!ctx) {
    notFound();
  }
  const { cat, sub, item } = ctx;
  redirect(`/catalog?category=${cat.slug}&subcategory=${sub.slug}&item=${item.slug}`);
}
