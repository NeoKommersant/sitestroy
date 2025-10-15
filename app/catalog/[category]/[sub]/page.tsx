import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
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
      description: "Запрошенная подкатегория отсутствует или была перенесена.",
    };
  }
  return {
    title: `${ctx.sub.title} — ${ctx.cat.title}`,
    description: ctx.sub.intro ?? ctx.cat.intro,
    alternates: {
      canonical: `/catalog?category=${ctx.cat.slug}&subcategory=${ctx.sub.slug}`,
    },
  };
}

export default function SubcategoryRedirect({ params }: { params: Params }) {
  const ctx = getSubcategory(params.category, params.sub);
  if (!ctx) {
    notFound();
  }
  redirect(`/catalog?category=${ctx.cat.slug}&subcategory=${ctx.sub.slug}`);
}
