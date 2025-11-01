import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");

const CATALOG_PATH = path.join(ROOT, "data", "catalog.yml");
const TAXONOMY_PATH = path.join(ROOT, "data", "taxonomy.json");
const SYNONYMS_GENERATED_PATH = path.join(ROOT, "data", "synonyms.generated.json");
const SYNONYMS_MANUAL_PATH = path.join(ROOT, "data", "synonyms.manual.json");
const SYNONYMS_FINAL_PATH = path.join(ROOT, "data", "synonyms.json");

const STOP_WORDS = new Set([
  "и",
  "в",
  "во",
  "на",
  "от",
  "до",
  "для",
  "по",
  "из",
  "с",
  "со",
  "о",
  "об",
  "при",
  "над",
  "под",
  "между",
  "меж",
  "это",
  "этот",
  "эта",
  "эти",
  "то",
  "же",
  "как",
  "а",
  "the",
  "and",
  "or",
  "of",
  "with",
  "from",
  "mm",
  "мм",
  "pn",
  "sdr",
]);

const SECTION_STOP_TOKENS = new Set(["от", "до", "по"]);

const SURFACE_RULES = [
  { id: "smooth", label: "Гладкая", token: "гладк" },
  { id: "smooth", label: "Гладкая", token: "smooth" },
  { id: "ribbed", label: "Рифленая", token: "рифлен" },
  { id: "ribbed", label: "Рифленая", token: "рифлён" },
  { id: "ribbed", label: "Рифленая", token: "профилиров" },
  { id: "ribbed", label: "Рифленая", token: "ribbed" },
];

const PROFILE_HINTS = [
  { id: "round", token: "круг" },
  { id: "round", token: "кругл" },
  { id: "round", token: "кругляк" },
  { id: "flat", token: "лист" },
  { id: "angle", token: "уголок" },
  { id: "pipe", token: "труба" },
  { id: "profile_pipe", token: "профильная" },
];

const CLASS_REGEX = /\b[аa]\s?-?\s?\d{3}[сc]?\b/gi;
const DIAMETER_REGEXES = [
  /[фf⌀ø∅]\s*(\d{1,3}(?:[.,]\d{1,2})?)/gi,
  /\bd\s*-?\s*(\d{1,3}(?:[.,]\d{1,2})?)/gi,
  /\b(\d{1,3}(?:[.,]\d{1,2})?)\s*(?:мм|mm)\b/gi,
];
const SECTION_REGEX = /(\d{1,4}(?:[.,]\d{1,2})?)[\s×xх](\d{1,4}(?:[.,]\d{1,2})?)(?:[\s×xх](\d{1,4}(?:[.,]\d{1,2})?))?/gi;
const STEEL_GRADE_REGEX = /\b(?:ст\s?-?\s?\d+[а-я]?|[0-9]{2}[гg][0-9]{1,2}[сc]|c\d{3}|s\d{3}|c\d{3}[cс])\b/gi;
const GOST_REGEX = /\b(?:гост|gost)\s*-?\s*\d{3,5}(?:[-–]\d{2})?\b/gi;

const ensureDir = async (filePath) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
};

const readCatalog = async () => {
  const raw = await fs.readFile(CATALOG_PATH, "utf8");
  const parsed = load(raw);
  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.categories)) {
    throw new Error("Invalid catalog.yml structure");
  }
  return parsed.categories;
};

const lower = (value) => value.toLowerCase();

const normalizeText = (text) =>
  lower(text ?? "")
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9\s×xх.,/-]/g, " ")
    .replace(/[«»"'()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const sanitizeForKey = (token) =>
  token
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/х/g, "x")
    .replace(/[^a-zа-я0-9x]/g, "")
    .trim();

const translitMap = {
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

const transliterate = (value) =>
  value
    .toLowerCase()
    .replace(/ё/g, "e")
    .split("")
    .map((char) => translitMap[char] ?? char)
    .join("");

const slugify = (value) =>
  transliterate(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const uniq = (values) => [...new Set(values)];

const collectTokens = (text) => {
  if (!text) return [];
  const normalized = normalizeText(text);
  if (!normalized) return [];
  return normalized.split(" ").filter((token) => token && !STOP_WORDS.has(token));
};

const generateTokenVariants = (token) => {
  const variants = new Set();
  const normalized = token.toLowerCase().replace(/ё/g, "е").trim();
  if (!normalized) return variants;
  const noPunct = normalized.replace(/[«»"'()]/g, "");
  const collapsed = noPunct.replace(/[\s_-]+/g, "");
  const base = collapsed.replace(/х/g, "x");
  const keys = uniq([normalized, noPunct, collapsed, base]);
  keys.forEach((key) => {
    const cleaned = sanitizeForKey(key);
    if (cleaned) variants.add(cleaned);
    const transliterated = sanitizeForKey(transliterate(key));
    if (transliterated) variants.add(transliterated);
  });
  return variants;
};

const deriveProductType = (title, slug) => {
  const tokens = collectTokens(title);
  const productTokens = [];
  for (const token of tokens) {
    if (SECTION_STOP_TOKENS.has(token)) break;
    if (/\d/.test(token)) break;
    productTokens.push(token);
  }
  if (!productTokens.length) {
    const slugParts = slug.split("-");
    const fallback = [];
    for (const part of slugParts) {
      if (!part || /\d/.test(part)) break;
      fallback.push(part);
    }
    const label = fallback.length ? fallback.join(" ") : slug;
    return { id: slugify(label), label: label.replace(/-/g, " ") };
  }
  const label = productTokens.join(" ");
  return { id: slugify(label), label };
};

const extractMatches = (regex, text) => {
  if (!text) return [];
  const matches = [];
  let match;
  const cloned = new RegExp(regex.source, regex.flags);
  while ((match = cloned.exec(text)) !== null) {
    matches.push(match);
  }
  return matches;
};

const parseDiameter = (text) => {
  const values = [];
  for (const regex of DIAMETER_REGEXES) {
    const matches = extractMatches(regex, text);
    for (const match of matches) {
      const raw = match[1] ?? match[0];
      const cleaned = raw.replace(",", ".").replace(/[^0-9.]/g, "");
      const value = Number.parseFloat(cleaned);
      if (Number.isFinite(value)) {
        values.push({ value, token: match[0] });
      }
    }
  }
  return values;
};

const parseSection = (text) => {
  const matches = extractMatches(SECTION_REGEX, text);
  return matches.map((match) => {
    const numbers = match
      .slice(1)
      .filter(Boolean)
      .map((part) => part.replace(",", "."));
    const value = numbers.join("x");
    return { value, token: match[0] };
  });
};

const parseSteelGrade = (text) => {
  const matches = extractMatches(STEEL_GRADE_REGEX, text);
  return matches.map((match) => {
    const raw = match[0].replace(/\s+/g, "");
    return { value: raw.toUpperCase().replace(/СТ/, "СТ"), token: match[0] };
  });
};

const parseGost = (text) => {
  const matches = extractMatches(GOST_REGEX, text);
  return matches.map((match) => {
    const raw = match[0].toUpperCase().replace(/\s+/g, "");
    const normalized = raw.replace(/^ГOСТ/, "ГОСТ").replace(/^GOST/, "ГОСТ");
    return { value: normalized, token: match[0] };
  });
};

const parseClasses = (text) => {
  const matches = extractMatches(CLASS_REGEX, text);
  return matches.map((match) => {
    const raw = match[0]
      .toUpperCase()
      .replace(/[А]/g, "A")
      .replace(/[СC]/g, "C")
      .replace(/\s+/g, "");
    return { value: raw, token: match[0] };
  });
};

const detectSurface = (tokens) => {
  for (const rule of SURFACE_RULES) {
    if (tokens.some((token) => token.includes(rule.token))) {
      return { id: rule.id, label: rule.label, token: rule.token };
    }
  }
  return null;
};

const detectProfiles = (tokens) =>
  PROFILE_HINTS.filter((hint) => tokens.some((token) => token.includes(hint.token))).map((hint) => ({
    id: hint.id,
    token: hint.token,
  }));

const bumpTaxonomy = (taxonomy, field, id, label, tokenCandidates = []) => {
  if (!taxonomy.has(field)) taxonomy.set(field, new Map());
  const byField = taxonomy.get(field);
  if (!byField.has(id)) {
    byField.set(id, {
      field,
      id,
      label,
      count: 0,
      aliases: new Set(),
    });
  }
  const entry = byField.get(id);
  entry.count += 1;
  tokenCandidates.forEach((token) => {
    if (token) {
      entry.aliases.add(token);
    }
  });
};

const bumpNumericTaxonomy = (taxonomy, field, value, tokenCandidates = []) => {
  const id = `${value}`;
  bumpTaxonomy(taxonomy, field, id, id, tokenCandidates);
  const entry = taxonomy.get(field).get(id);
  entry.numericValue = value;
};

const bumpSynonym = (synonyms, token, field, value, weight = 1, source = "catalog") => {
  const variants = generateTokenVariants(token);
  variants.forEach((variant) => {
    if (!variant) return;
    if (variant.length < 2) return;
    if (!synonyms.has(variant)) synonyms.set(variant, new Map());
    const byToken = synonyms.get(variant);
    if (!byToken.has(field)) byToken.set(field, new Map());
    const byField = byToken.get(field);
    const existing = byField.get(value);
    const nextWeight = (existing?.weight ?? 0) + weight;
    byField.set(value, { weight: nextWeight, source });
  });
};

const collectItemData = (categories) => {
  const taxonomy = new Map();
  const synonyms = new Map();
  const enrichedItems = [];

  for (const category of categories) {
    const categoryTokens = collectTokens(`${category.title} ${category.intro ?? ""}`);
    const categoryLabel = category.title;
    const categoryId = category.slug;
    bumpTaxonomy(taxonomy, "category", categoryId, categoryLabel, categoryTokens);

    for (const sub of category.sub) {
      const subTokens = collectTokens(`${sub.title} ${sub.intro ?? ""} ${sub.range ?? ""}`);
      const subLabel = sub.title;
      const subId = `${category.slug}/${sub.slug}`;
      bumpTaxonomy(taxonomy, "subcategory", subId, subLabel, subTokens.concat(categoryTokens));

      for (const item of sub.items) {
        const contextText = [
          category.title,
          category.intro ?? "",
          sub.title,
          sub.intro ?? "",
          sub.range ?? "",
          item.title,
          item.desc ?? "",
          item.sku ?? "",
        ]
          .filter(Boolean)
          .join(" ");
        const tokens = collectTokens(contextText);
        const normalizedText = normalizeText(contextText);

        const productType = deriveProductType(item.title, item.slug);
        bumpTaxonomy(taxonomy, "product_type", productType.id, productType.label, tokens);
        bumpSynonym(synonyms, productType.label, "product_type", productType.id);

        const classes = parseClasses(normalizedText);
        classes.forEach(({ value, token }) => {
          bumpTaxonomy(taxonomy, "class", value, value, [token]);
          bumpSynonym(synonyms, token, "class", value);
          bumpSynonym(synonyms, value, "class", value);
        });

        const diameters = parseDiameter(normalizedText);
        diameters.forEach(({ value, token }) => {
          bumpNumericTaxonomy(taxonomy, "diameter_mm", value, [token]);
          bumpSynonym(synonyms, token, "diameter_mm", `${value}`);
          bumpSynonym(synonyms, `${value}`, "diameter_mm", `${value}`, 0.4);
        });

        const sections = parseSection(normalizedText);
        sections.forEach(({ value, token }) => {
          bumpTaxonomy(taxonomy, "section", value, value, [token]);
          bumpSynonym(synonyms, token, "section", value);
          bumpSynonym(synonyms, value, "section", value);
        });

        const steelGrades = parseSteelGrade(normalizedText);
        steelGrades.forEach(({ value, token }) => {
          const label = value.replace(/^СТ/, "Ст");
          bumpTaxonomy(taxonomy, "steel_grade", value, label, [token]);
          bumpSynonym(synonyms, token, "steel_grade", value);
          bumpSynonym(synonyms, value, "steel_grade", value);
        });

        const gosts = parseGost(normalizedText);
        gosts.forEach(({ value, token }) => {
          bumpTaxonomy(taxonomy, "gost", value, value, [token]);
          bumpSynonym(synonyms, token, "gost", value);
          bumpSynonym(synonyms, value, "gost", value);
        });

        const surface = detectSurface(tokens);
        if (surface) {
          bumpTaxonomy(taxonomy, "surface", surface.id, surface.label, [surface.token]);
          bumpSynonym(synonyms, surface.token, "surface", surface.id);
          bumpSynonym(synonyms, surface.label, "surface", surface.id);
        }

        const profiles = detectProfiles(tokens);
        profiles.forEach((profile) => {
          bumpTaxonomy(taxonomy, "profile", profile.id, profile.id, [profile.token]);
          bumpSynonym(synonyms, profile.token, "profile", profile.id);
        });

        tokens.forEach((token) => {
          if (/[a-zа-я]/i.test(token)) {
            bumpSynonym(synonyms, token, "product_type", productType.id, 0.05);
          }
        });

        enrichedItems.push({
          categorySlug: category.slug,
          categoryTitle: category.title,
          subcategorySlug: sub.slug,
          subcategoryTitle: sub.title,
          slug: item.slug,
          title: item.title,
          sku: item.sku,
          desc: item.desc,
          tokens,
          productType,
          classes,
          diameters,
          sections,
          steelGrades,
          gosts,
          surface,
          profiles,
        });
      }
    }
  }

  return { taxonomy, synonyms, items: enrichedItems };
};

const finalizeTaxonomy = (taxonomy) => {
  const result = {};
  for (const [field, values] of taxonomy.entries()) {
    const list = Array.from(values.values()).map((entry) => ({
      field,
      id: entry.id,
      label: entry.label,
      count: entry.count,
      numericValue: entry.numericValue,
      aliases: Array.from(entry.aliases ?? []),
    }));
    list.sort((a, b) => {
      if (typeof a.numericValue === "number" && typeof b.numericValue === "number") {
        return a.numericValue - b.numericValue;
      }
      if (b.count !== a.count) return b.count - a.count;
      return a.label.localeCompare(b.label);
    });
    result[field] = list;
  }
  return result;
};

const finalizeSynonyms = (synonyms) => {
  const plain = {};
  for (const [token, byField] of synonyms.entries()) {
    const matches = [];
    for (const [field, byValue] of byField.entries()) {
      for (const [value, meta] of byValue.entries()) {
        matches.push({
          field,
          value,
          weight: meta.weight,
          score: 0,
          source: meta.source ?? "catalog",
        });
      }
    }
    if (!matches.length) continue;
    matches.sort((a, b) => b.weight - a.weight);
    const topWeight = matches[0]?.weight ?? 1;
    matches.forEach((match) => {
      match.score = Number((match.weight / topWeight).toFixed(3));
    });
    plain[token] = matches;
  }
  return plain;
};

const mergeManualSynonyms = async (autoSynonyms) => {
  let manual = {};
  try {
    const raw = await fs.readFile(SYNONYMS_MANUAL_PATH, "utf8");
    manual = JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") {
      manual = {};
    } else {
      throw error;
    }
  }

  const merged = { ...autoSynonyms };
  for (const [token, entries] of Object.entries(manual)) {
    const normalized = sanitizeForKey(token);
    if (!normalized) continue;
    const manualEntries = entries.map((entry) => ({
      ...entry,
      source: "manual",
      weight: entry.weight ?? 10,
      score: entry.score ?? 1,
    }));
    const auto = merged[normalized] ?? [];
    const filteredAuto = auto.filter(
      (autoEntry) =>
        !manualEntries.some(
          (manualEntry) =>
            manualEntry.field === autoEntry.field && manualEntry.value === autoEntry.value,
        ),
    );
    merged[normalized] = [...manualEntries, ...filteredAuto];
  }
  return merged;
};

const writeJson = async (filePath, data) => {
  await ensureDir(filePath);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
};

const main = async () => {
  const categories = await readCatalog();
  const { taxonomy, synonyms } = collectItemData(categories);
  const taxonomyJson = finalizeTaxonomy(taxonomy);
  const synonymsJson = finalizeSynonyms(synonyms);
  await writeJson(TAXONOMY_PATH, taxonomyJson);
  await writeJson(SYNONYMS_GENERATED_PATH, synonymsJson);
  const mergedSynonyms = await mergeManualSynonyms(synonymsJson);
  await writeJson(SYNONYMS_FINAL_PATH, mergedSynonyms);
  console.log("Search taxonomy and synonym dictionaries rebuilt.");
};

main().catch((error) => {
  console.error("Failed to build search data:", error);
  process.exitCode = 1;
});
