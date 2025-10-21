import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { dump } from "js-yaml";
import type { Category } from "@/types/catalog";

const REPO_OWNER = "NeoKommersant";
const REPO_NAME = "sitestroy";
const TARGET_FILE_PATH = "data/catalog.yml";
const GITHUB_CONTENTS_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${TARGET_FILE_PATH}`;
const LOCAL_CATALOG_PATH = path.join(process.cwd(), TARGET_FILE_PATH);
const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "admin-update.log");

type UpdateCatalogBody = {
  catalog: Category[];
};

const headersForToken = (token: string) => ({
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  "User-Agent": "sitestroy-admin",
});

const truncate = (value: string, limit = 2_000) =>
  value.length <= limit ? value : `${value.slice(0, limit)}...<truncated>`;

const summarizeCatalog = (catalog: Category[]) => {
  const subcategories = catalog.reduce(
    (acc, category) => acc + category.sub.length,
    0,
  );
  const items = catalog.reduce(
    (acc, category) =>
      acc +
      category.sub.reduce((subAcc, subcategory) => subAcc + subcategory.items.length, 0),
    0,
  );
  return {
    categories: catalog.length,
    subcategories,
    items,
  };
};

const appendLog = async (entry: Record<string, unknown>) => {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
    await fs.appendFile(
      LOG_FILE,
      `${new Date().toISOString()} ${JSON.stringify(entry)}\n`,
      "utf8",
    );
  } catch (error) {
    console.error("Failed to write admin update log", error);
  }
};

export async function POST(request: Request) {
  const requestStartedAt = new Date().toISOString();
  try {
    const body = (await request.json()) as UpdateCatalogBody;
    if (!body || !Array.isArray(body.catalog)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const summary = summarizeCatalog(body.catalog);
    await appendLog({
      event: "request_received",
      startedAt: requestStartedAt,
      ...summary,
    });

    const yamlContent = dump(
      { categories: body.catalog },
      { lineWidth: 120, noRefs: true },
    );
    const encodedContent = Buffer.from(yamlContent, "utf8").toString("base64");

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      await fs.mkdir(path.dirname(LOCAL_CATALOG_PATH), { recursive: true });
      await fs.writeFile(LOCAL_CATALOG_PATH, yamlContent, "utf8");
      await appendLog({
        event: "written_local",
        targetPath: LOCAL_CATALOG_PATH,
        ...summary,
      });
      return NextResponse.json({ status: "ok", target: "local" });
    }

    const getResponse = await fetch(GITHUB_CONTENTS_URL, {
      headers: headersForToken(token),
      cache: "no-store",
    });
    const metadataRaw = await getResponse.text();

    if (!getResponse.ok) {
      await appendLog({
        event: "github_get_error",
        status: getResponse.status,
        body: truncate(metadataRaw),
      });
      let details: unknown = metadataRaw;
      try {
        details = JSON.parse(metadataRaw);
      } catch {
        // leave as string
      }
      return NextResponse.json(
        { error: "Failed to fetch file metadata", details },
        { status: getResponse.status },
      );
    }

    let metadata: { sha?: string } | null = null;
    try {
      metadata = JSON.parse(metadataRaw) as { sha?: string };
    } catch (error) {
      await appendLog({
        event: "github_get_parse_error",
        body: truncate(metadataRaw),
        error: error instanceof Error ? error.message : String(error),
      });
      return NextResponse.json(
        { error: "Invalid metadata response from GitHub" },
        { status: 500 },
      );
    }
    if (!metadata.sha) {
      await appendLog({
        event: "github_missing_sha",
        body: truncate(metadataRaw),
      });
      return NextResponse.json({ error: "Missing file SHA" }, { status: 500 });
    }

    await appendLog({
      event: "github_metadata_ok",
      sha: metadata.sha,
    });

    const putResponse = await fetch(GITHUB_CONTENTS_URL, {
      method: "PUT",
      headers: headersForToken(token),
      body: JSON.stringify({
        message: "Update catalog via admin",
        content: encodedContent,
        sha: metadata.sha,
        branch: "main",
      }),
    });
    const putRaw = await putResponse.text();

    if (!putResponse.ok) {
      await appendLog({
        event: "github_put_error",
        status: putResponse.status,
        body: truncate(putRaw),
      });
      let details: unknown = putRaw;
      try {
        details = JSON.parse(putRaw);
      } catch {
        // keep string form
      }
      return NextResponse.json(
        { error: "Failed to update catalog", details },
        { status: putResponse.status },
      );
    }

    await appendLog({
      event: "github_put_success",
      status: putResponse.status,
      sha: metadata.sha,
    });

    return NextResponse.json({ status: "ok", target: "github" });
  } catch (error) {
    await appendLog({
      event: "unexpected_error",
      occurredAt: new Date().toISOString(),
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        error: "Unexpected error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
