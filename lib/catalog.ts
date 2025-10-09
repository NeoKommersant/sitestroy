import { CATEGORIES, type Category, type Subcategory, type Item } from "@/data/catalog";

export const getCategories = (): Category[] => CATEGORIES;

export const getCategory = (slug: string): Category | undefined =>
  CATEGORIES.find(c => c.slug === slug);

export const getSubcategory = (catSlug: string, subSlug: string):
  { cat: Category; sub: Subcategory } | undefined => {
  const cat = getCategory(catSlug);
  if (!cat) return;
  const sub = cat.sub.find(s => s.slug === subSlug);
  if (!sub) return;
  return { cat, sub };
};

export const getItem = (catSlug: string, subSlug: string, itemSlug: string):
  { cat: Category; sub: Subcategory; item: Item } | undefined => {
  const ctx = getSubcategory(catSlug, subSlug);
  if (!ctx) return;
  const item = ctx.sub.items.find(i => i.slug === itemSlug);
  if (!item) return;
  return { cat: ctx.cat, sub: ctx.sub, item };
};
