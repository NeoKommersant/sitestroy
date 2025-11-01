import { NextResponse } from "next/server";
import { getCategories } from "@/lib/catalog";

const pickCatalog = () => {
  const categories = getCategories();
  return categories.map((category) => ({
    slug: category.slug,
    title: category.title,
    subcategories: category.sub.map((sub) => ({
      slug: sub.slug,
      title: sub.title,
      items: sub.items.slice(0, 24).map((item) => ({
        slug: item.slug,
        title: item.title,
        sku: item.sku,
      })),
    })),
  }));
};

let cachedCatalog:
  | {
      data: ReturnType<typeof pickCatalog>;
      cachedAt: number;
    }
  | null = null;

const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

const getCatalogSnapshot = () => {
  if (cachedCatalog && Date.now() - cachedCatalog.cachedAt < CACHE_TTL) {
    return cachedCatalog.data;
  }
  const data = pickCatalog();
  cachedCatalog = { data, cachedAt: Date.now() };
  return data;
};

export async function GET() {
  const catalog = getCatalogSnapshot();
  return NextResponse.json({ categories: catalog });
}
