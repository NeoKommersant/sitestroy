import type {
  CanonicalField,
  NormalizedQuery,
  NumericCanonicalField,
  StructuredFilters,
  SynonymMatch,
  SynonymsDictionary,
} from "@/types/search";

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
]);

const RUS_SUFFIXES = [
  "ами",
  "ями",
  "ами",
  "ями",
  "ов",
  "ев",
  "ёв",
  "ей",
  "ий",
  "ый",
  "ой",
  "ая",
  "яя",
  "ою",
  "ею",
  "ам",
  "ям",
  "ах",
  "ях",
  "ою",
  "ею",
  "ью",
  "ую",
  "юю",
  "у",
  "ю",
  "а",
  "я",
  "ы",
  "и",
];

const DIAMETER_REGEXES = [
  /[фf⌀ø∅]\s*(\d{1,3}(?:[.,]\d{1,2})?)/gi,
  /\bd\s*-?\s*(\d{1,3}(?:[.,]\d{1,2})?)/gi,
  /\b(\d{1,3}(?:[.,]\d{1,2})?)\s*(?:мм|mm)\b/gi,
];
const CLASS_REGEX = /\b[аa]\s?-?\s?\d{3}[сc]?\b/gi;
const SECTION_REGEX = /(\d{1,4}(?:[.,]\d{1,2})?)[\s×xх](\d{1,4}(?:[.,]\d{1,2})?)(?:[\s×xх](\d{1,4}(?:[.,]\d{1,2})?))?/gi;
const GOST_REGEX = /\b(?:гост|gost)\s*-?\s*\d{3,5}(?:[-–]\d{2})?\b/gi;
const STEEL_GRADE_REGEX = /\b(?:ст\s?-?\s?\d+[а-я]?|[0-9]{2}[гg][0-9]{1,2}[сc]|c\d{3}[сc]?|s\d{3})\b/gi;

type TokenInfo = {
  raw: string;
  key: string;
  matched: boolean;
};

type AggregatedMatch = {
  value: string;
  weight: number;
  score: number;
  tokens: Set<string>;
  numericValue?: number;
};

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

const sanitizeTokenKey = (token: string): string =>
  token
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/х/g, "x")
    .replace(/[^a-zа-я0-9x]/g, "")
    .trim();

const removeRusSuffix = (key: string): string | null => {
  for (const suffix of RUS_SUFFIXES) {
    if (key.endsWith(suffix) && key.length > suffix.length + 2) {
      return key.slice(0, -suffix.length);
    }
  }
  return null;
};

const collectTokenVariants = (token: string): string[] => {
  const variants = new Set<string>();
  const base = token.toLowerCase().replace(/ё/g, "е").trim();
  if (!base) return [];
  const cleaned = sanitizeTokenKey(base);
  if (cleaned) variants.add(cleaned);
  const transliterated = sanitizeTokenKey(transliterate(base));
  if (transliterated) variants.add(transliterated);
  const stemmed = removeRusSuffix(cleaned);
  if (stemmed && stemmed.length >= 3) variants.add(stemmed);
  return Array.from(variants);
};

const prepareInput = (value: string): string =>
  value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[«»"'()]/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/×/g, "x")
    .replace(/\s+/g, " ")
    .trim();

const buildTokenInfos = (input: string): TokenInfo[] =>
  input
    .split(/\s+/)
    .map((raw) => ({
      raw,
      key: sanitizeTokenKey(raw),
      matched: false,
    }))
    .filter((token) => token.key.length > 0);

const markTokensMatched = (tokenInfos: TokenInfo[], value: string) => {
  const normalized = sanitizeTokenKey(value);
  tokenInfos.forEach((info) => {
    if (!info.key) return;
    if (info.key === normalized || normalized.includes(info.key) || info.key.includes(normalized)) {
      info.matched = true;
    }
  });
};

const pushMatch = (
  store: Map<CanonicalField, Map<string, AggregatedMatch>>,
  field: CanonicalField,
  value: string,
  weight: number,
  score: number,
  token?: string,
) => {
  if (!store.has(field)) {
    store.set(field, new Map());
  }
  const byValue = store.get(field)!;
  const key = value;
  const existing = byValue.get(key);
  const numericValue =
    (field === "diameter_mm" || field === "thickness_mm") && !Number.isNaN(Number.parseFloat(value))
      ? Number.parseFloat(value)
      : undefined;
  if (existing) {
    existing.weight += weight;
    existing.score = Math.max(existing.score, score);
    if (typeof numericValue === "number") existing.numericValue = numericValue;
    if (token) existing.tokens.add(token);
    return;
  }
  byValue.set(key, {
    value,
    weight,
    score,
    tokens: new Set(token ? [token] : []),
    numericValue,
  });
};

const collectRegexMatches = (
  store: Map<CanonicalField, Map<string, AggregatedMatch>>,
  field: CanonicalField,
  regex: RegExp,
  input: string,
  tokenInfos: TokenInfo[],
  weight = 1,
) => {
  const localRegex = new RegExp(regex.source, regex.flags);
  let match: RegExpExecArray | null = null;
  while ((match = localRegex.exec(input)) !== null) {
    const raw = match[0];
    const value = (match[1] ?? raw).replace(",", ".").replace(/[^0-9a-zа-я.]/g, "");
    if (!value) continue;
    if (field === "class") {
      const normalized = raw
        .toUpperCase()
        .replace(/[А]/g, "A")
        .replace(/[СC]/g, "C")
        .replace(/\s+/g, "");
      pushMatch(store, field, normalized, weight, 1, raw);
      markTokensMatched(tokenInfos, raw);
      continue;
    }
    if (field === "gost") {
      const normalized = raw.toUpperCase().replace(/\s+/g, "").replace(/^GOST/, "ГОСТ");
      pushMatch(store, field, normalized, weight, 1, raw);
      markTokensMatched(tokenInfos, raw);
      continue;
    }
    if (field === "steel_grade") {
      const normalized = raw.toUpperCase().replace(/\s+/g, "");
      pushMatch(store, field, normalized, weight, 1, raw);
      markTokensMatched(tokenInfos, raw);
      continue;
    }
    pushMatch(store, field, value, weight, 1, raw);
    markTokensMatched(tokenInfos, raw);
  }
};

const detectSurfaceAndProfile = (
  tokenInfos: TokenInfo[],
  store: Map<CanonicalField, Map<string, AggregatedMatch>>,
) => {
  const hasToken = (substring: string) =>
    tokenInfos.some((token) => token.key.includes(sanitizeTokenKey(substring)));

  if (
    tokenInfos.some(
      (token) => token.key.includes("гладк") || token.key.includes("smooth"),
    )
  ) {
    pushMatch(store, "surface", "smooth", 1, 1);
  }
  if (
    tokenInfos.some(
      (token) =>
        token.key.includes("рифлен") ||
        token.key.includes("рифлен") ||
        token.key.includes("профилиров") ||
        token.key.includes("ribbed"),
    )
  ) {
    pushMatch(store, "surface", "ribbed", 1, 1);
  }
  if (hasToken("круг") || hasToken("кругл") || hasToken("кругляк") || hasToken("krug")) {
    pushMatch(store, "profile", "round", 1, 1);
  }
  if (hasToken("лист") || hasToken("list")) {
    pushMatch(store, "profile", "flat", 0.6, 0.8);
  }
  if (hasToken("уголок") || hasToken("ugolok")) {
    pushMatch(store, "profile", "angle", 0.8, 1);
  }
  if (hasToken("труба") || hasToken("truba")) {
    pushMatch(store, "profile", "pipe", 0.4, 0.6);
  }
};

const aggregateSynonymMatches = (
  tokenInfos: TokenInfo[],
  synonyms: SynonymsDictionary,
  store: Map<CanonicalField, Map<string, AggregatedMatch>>,
) => {
  tokenInfos.forEach((info) => {
    const variants = collectTokenVariants(info.raw);
    let hasMatches = false;
    variants.forEach((variant) => {
      if (!variant) return;
      const matches = synonyms[variant];
      if (!matches || matches.length === 0) return;
      hasMatches = true;
      matches.forEach((match: SynonymMatch) => {
        pushMatch(store, match.field, match.value, match.weight ?? 1, match.score ?? 1, info.raw);
      });
    });
    if (hasMatches) {
      info.matched = true;
    }
  });
};

const finalizeExtracted = (
  store: Map<CanonicalField, Map<string, AggregatedMatch>>,
): StructuredFilters => {
  const extracted: StructuredFilters = {};
  for (const [field, byValue] of store.entries()) {
    const entries = Array.from(byValue.values());
    entries.sort((a, b) => {
      if (b.weight !== a.weight) return b.weight - a.weight;
      if (b.score !== a.score) return b.score - a.score;
      return a.value.localeCompare(b.value);
    });
    const values = entries.map((entry) => entry.value);
    if (values.length === 0) continue;
    if (field === "diameter_mm" || field === "thickness_mm") {
      const numbers = entries
        .map((entry) => entry.numericValue ?? Number.parseFloat(entry.value))
        .filter((value) => Number.isFinite(value));
      if (numbers.length) {
        (extracted[field as NumericCanonicalField] as number[] | undefined) = numbers;
      }
      continue;
    }
    (extracted[field] as string[] | undefined) = values;
  }
  return extracted;
};

const collectUnknownTokens = (tokenInfos: TokenInfo[]): string[] =>
  tokenInfos
    .filter((token) => !token.matched && token.key && !STOP_WORDS.has(token.key))
    .map((token) => token.raw);

const buildCleanedQuery = (
  tokenInfos: TokenInfo[],
  extracted: StructuredFilters,
): { cleaned: string; tokens: string[] } => {
  const baseTokens = tokenInfos.map((token) => token.raw);
  const extraTokens: string[] = [];
  const pushUnique = (value: string) => {
    if (!value) return;
    if (!extraTokens.includes(value)) extraTokens.push(value);
  };

  for (const [field, values] of Object.entries(extracted)) {
    if (!values) continue;
    if (Array.isArray(values)) {
      values.forEach((value) => pushUnique(String(value)));
    }
    if (field === "diameter_mm") {
      (values as number[]).forEach((value) => pushUnique(`d${value}`));
    }
  }

  const cleaned = [...baseTokens, ...extraTokens].join(" ").trim();
  return { cleaned, tokens: baseTokens };
};

export const normalizeQuery = (
  query: string,
  synonyms: SynonymsDictionary,
): NormalizedQuery => {
  const prepared = prepareInput(query);
  const tokenInfos = buildTokenInfos(prepared);
  const store = new Map<CanonicalField, Map<string, AggregatedMatch>>();

  collectRegexMatches(store, "diameter_mm", DIAMETER_REGEXES[0], prepared, tokenInfos, 1.2);
  collectRegexMatches(store, "diameter_mm", DIAMETER_REGEXES[1], prepared, tokenInfos, 1.1);
  collectRegexMatches(store, "diameter_mm", DIAMETER_REGEXES[2], prepared, tokenInfos, 1);
  collectRegexMatches(store, "class", CLASS_REGEX, prepared, tokenInfos, 1);
  collectRegexMatches(store, "gost", GOST_REGEX, prepared, tokenInfos, 1);
  collectRegexMatches(store, "steel_grade", STEEL_GRADE_REGEX, prepared, tokenInfos, 0.8);
  collectRegexMatches(store, "section", SECTION_REGEX, prepared, tokenInfos, 0.9);

  detectSurfaceAndProfile(tokenInfos, store);
  aggregateSynonymMatches(tokenInfos, synonyms, store);

  const extracted = finalizeExtracted(store);
  const unknownTokens = collectUnknownTokens(tokenInfos);
  const { cleaned, tokens } = buildCleanedQuery(tokenInfos, extracted);

  return {
    cleaned,
    tokens,
    extracted,
    unknownTokens,
  };
};
