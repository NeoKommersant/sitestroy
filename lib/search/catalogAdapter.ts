import type { Category } from "@/types/catalog";
import type {
  SearchResultItem,
  StructuredFilters,
  SynonymsDictionary,
} from "@/types/search";
import { normalizeQuery } from "./queryNormalizer";

const SECTION_STOP_TOKENS = new Set(["от", "до", "по"]);

const translitMap: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ы: "y",
  э: "e",
  ю: "yu",
  я: "ya",
};

const transliterate = (value: string): string =>
  value
    .toLowerCase()
    .replace(/ё/g, "e")
    .split("")
    .map((char) => translitMap[char] ?? char)
    .join("");

const slugify = (value: string): string =>
  transliterate(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

type IndexRecord = SearchResultItem & {
  searchVector: string;
};

const deriveProductType = (title: string, slug: string) => {
  const cleaned = title
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[«»"'()]/g, " ");
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  const result: string[] = [];
  for (const token of tokens) {
    if (SECTION_STOP_TOKENS.has(token)) break;
    if (/\d/.test(token)) break;
    result.push(token);
  }
  if (result.length === 0) {
    const slugParts = slug.split("-");
    const fallback: string[] = [];
    for (const part of slugParts) {
      if (!part || /\d/.test(part)) break;
      fallback.push(part);
    }
    if (fallback.length === 0) fallback.push(slug);
    return fallback.join(" ");
  }
  return result.join(" ");
};

export const flattenCatalog = (
  categories: Category[],
  synonyms: SynonymsDictionary,
): IndexRecord[] => {
  const items: IndexRecord[] = [];
  for (const category of categories) {
    for (const sub of category.sub) {
      for (const item of sub.items) {
        const contextParts = [
          category.title,
          category.intro ?? "",
          sub.title,
          sub.intro ?? "",
          sub.range ?? "",
          item.title,
          item.desc ?? "",
          item.sku ?? "",
        ].filter(Boolean);
        const context = contextParts.join(" ");
        const normalized = normalizeQuery(context, synonyms);
        const attributes: StructuredFilters = {
          ...normalized.extracted,
          category: [category.slug],
          subcategory: [`${category.slug}/${sub.slug}`],
        };

        if (!attributes.product_type || attributes.product_type.length === 0) {
          const productTypeLabel = deriveProductType(item.title, item.slug);
          attributes.product_type = [slugify(productTypeLabel)];
        }

        const rawTags = new Set<string>();
        normalized.tokens.forEach((token) => rawTags.add(token));
        rawTags.add(item.slug);
        rawTags.add(category.slug);
        rawTags.add(sub.slug);
        if (item.sku) rawTags.add(item.sku);
        if (attributes.product_type) {
          attributes.product_type.forEach((value) => rawTags.add(value));
        }
        if (attributes.class) {
          attributes.class.forEach((value) => rawTags.add(value));
        }
        if (attributes.diameter_mm) {
          attributes.diameter_mm.forEach((value) => rawTags.add(`d${value}`));
        }
        if (attributes.section) {
          attributes.section.forEach((value) => rawTags.add(value));
        }
        if (attributes.surface) {
          attributes.surface.forEach((value) => rawTags.add(value));
        }

        const searchVector = Array.from(rawTags).join(" ");

        items.push({
          categorySlug: category.slug,
          categoryTitle: category.title,
          subcategorySlug: sub.slug,
          subcategoryTitle: sub.title,
          slug: item.slug,
          title: item.title,
          sku: item.sku,
          desc: item.desc,
          attributes,
          tags: Array.from(rawTags),
          searchVector,
        });
      }
    }
  }
  return items;
};
