import fs from "fs";
import path from "path";
import { load } from "js-yaml";
import type { CatalogData, Category, Subcategory, Item } from "@/types/catalog";

const catalogFilePath = path.join(process.cwd(), "data", "catalog.yml");

const readCatalog = (): Category[] => {
  const content = fs.readFileSync(catalogFilePath, "utf8");
  const parsed = load(content) as CatalogData | undefined;
  if (!parsed || !Array.isArray(parsed.categories)) {
    throw new Error("Invalid catalog.yml format");
  }
  return parsed.categories;
};

const getCatalog = (): Category[] => {
  if (process.env.NODE_ENV === "production") {
    if (!globalThis.__catalogCache) {
      globalThis.__catalogCache = readCatalog();
    }
    return globalThis.__catalogCache as Category[];
  }
  return readCatalog();
};

declare global {
  var __catalogCache: Category[] | undefined;
}

const cloneCatalog = (catalog: Category[]): Category[] =>
  catalog.map((category) => ({
    ...category,
    sub: category.sub.map((sub) => ({
      ...sub,
      items: sub.items.map((item) => ({ ...item })),
    })),
  }));

export const getCategories = (): Category[] => cloneCatalog(getCatalog());

export const getCategory = (slug: string): Category | undefined => {
  const category = getCatalog().find(c => c.slug === slug);
  return category ? cloneCatalog([category])[0] : undefined;
};

export const getSubcategory = (catSlug: string, subSlug: string):
  { cat: Category; sub: Subcategory } | undefined => {
  const cat = getCatalog().find(c => c.slug === catSlug);
  if (!cat) return;
  const sub = cat.sub.find(s => s.slug === subSlug);
  if (!sub) return;
  return {
    cat: cloneCatalog([cat])[0],
    sub: {
      ...sub,
      items: sub.items.map((item) => ({ ...item })),
    },
  };
};

export const getItem = (catSlug: string, subSlug: string, itemSlug: string):
  { cat: Category; sub: Subcategory; item: Item } | undefined => {
  const cat = getCatalog().find(c => c.slug === catSlug);
  if (!cat) return;
  const sub = cat.sub.find(s => s.slug === subSlug);
  if (!sub) return;
  const item = sub.items.find(i => i.slug === itemSlug);
  if (!item) return;
  return {
    cat: cloneCatalog([cat])[0],
    sub: {
      ...sub,
      items: sub.items.map((itm) => ({ ...itm })),
    },
    item: { ...item },
  };
};
