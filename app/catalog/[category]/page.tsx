import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCategory, getCategories } from "@/lib/catalog";

type Params = { category: string };

export function generateStaticParams(): Params[] {
  return getCategories().map((category) => ({ category: category.slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const category = getCategory(params.category);
  if (!category) {
    return {
      title: "Категория не найдена",
      description: "Запрошенный раздел отсутствует или был перенесён.",
    };
  }
  return {
    title: `${category.title} — Каталог решений`,
    description: category.intro,
    alternates: { canonical: `/catalog?category=${category.slug}` },
  };
}

export default function CategoryRedirect({ params }: { params: Params }) {
  const category = getCategory(params.category);
  if (!category) {
    notFound();
  }
  redirect(`/catalog?category=${category.slug}`);
}
