import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

const LOG_PATH = path.join(process.cwd(), "logs", "unknown-search-tokens.json");

type LogPayload = {
  tokens?: string[];
  query?: string;
};

type StoredEntry = {
  count: number;
  samples: string[];
  lastSeenAt: string;
};

const sanitizeToken = (token: string) =>
  token
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9x]/g, "")
    .trim();

const loadStore = async (): Promise<Record<string, StoredEntry>> => {
  try {
    const raw = await fs.readFile(LOG_PATH, "utf8");
    return JSON.parse(raw) as Record<string, StoredEntry>;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }
    throw error;
  }
};

const persistStore = async (store: Record<string, StoredEntry>) => {
  await fs.mkdir(path.dirname(LOG_PATH), { recursive: true });
  await fs.writeFile(LOG_PATH, JSON.stringify(store, null, 2), "utf8");
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LogPayload;
    const tokens = Array.isArray(payload.tokens) ? payload.tokens : [];
    const uniqueTokens = Array.from(
      new Set(tokens.map((token) => sanitizeToken(token)).filter((token) => token.length > 1)),
    );
    if (uniqueTokens.length === 0) {
      return NextResponse.json({ status: "ignored" });
    }
    const store = await loadStore();
    const now = new Date().toISOString();
    uniqueTokens.forEach((token) => {
      if (!store[token]) {
        store[token] = {
          count: 0,
          samples: [],
          lastSeenAt: now,
        };
      }
      const entry = store[token];
      entry.count += 1;
      entry.lastSeenAt = now;
      if (payload.query) {
        if (!entry.samples.includes(payload.query)) {
          entry.samples.push(payload.query);
        }
        if (entry.samples.length > 5) {
          entry.samples = entry.samples.slice(-5);
        }
      }
    });
    await persistStore(store);
    return NextResponse.json({ status: "ok", tokens: uniqueTokens.length });
  } catch (error) {
    console.error("Failed to log unknown tokens", error);
    return NextResponse.json({ error: "failed_to_log" }, { status: 500 });
  }
}
