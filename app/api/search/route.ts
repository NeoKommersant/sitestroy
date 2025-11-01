import { NextResponse } from "next/server";
import { getCategories } from "@/lib/catalog";
import { getSynonymsDictionary, getTaxonomy } from "@/lib/search/data";
import { createSearchEngine } from "@/lib/search/searchIndex";
import type { RunSearchArgs } from "@/types/search";

let cachedEngine: ReturnType<typeof createSearchEngine> | null = null;
let cachedHash = "";

const buildHash = () => JSON.stringify([process.env.NODE_ENV, process.env.VERCEL_GIT_COMMIT_SHA]);

const getEngine = () => {
  const hash = buildHash();
  if (!cachedEngine || hash !== cachedHash) {
    const categories = getCategories();
    const synonyms = getSynonymsDictionary();
    const taxonomy = getTaxonomy();
    cachedEngine = createSearchEngine(categories, synonyms, taxonomy);
    cachedHash = hash;
  }
  return cachedEngine!;
};

const normalizeArgs = (payload: Partial<RunSearchArgs> & { limit?: number }): RunSearchArgs => {
  const q = typeof payload.q === "string" ? payload.q : "";
  const filters = typeof payload.filters === "object" && payload.filters ? payload.filters : undefined;
  const sort: RunSearchArgs["sort"] = payload.sort === "relevance" ? "relevance" : "default";
  const pageSize =
    typeof payload.limit === "number" && payload.limit > 0
      ? Math.min(Math.max(Math.floor(payload.limit), 1), 100)
      : Math.min(Math.max(payload.pageSize ?? 20, 1), 100);
  return { q, filters, sort, page: 1, pageSize };
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<RunSearchArgs> & { limit?: number };
    const args = normalizeArgs(payload);
    const engine = getEngine();
    const result = engine.runSearch(args);
    return NextResponse.json({
      items: result.items,
      facets: result.facets,
      total: result.total,
      meta: {
        filters: result.meta.filters,
        normalized: result.meta.normalized,
      },
    });
  } catch (error) {
    console.error("Search API failure", error);
    return NextResponse.json({ error: "search_failed" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const limitRaw = searchParams.get("limit");
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : undefined;
  const args = normalizeArgs({ q, limit });
  const engine = getEngine();
  const result = engine.runSearch(args);
  return NextResponse.json({
    items: result.items,
    total: result.total,
  });
}
