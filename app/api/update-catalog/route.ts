import { NextResponse } from "next/server";
import { dump } from "js-yaml";
import type { Category } from "@/types/catalog";

const REPO_OWNER = "NeoKommersant";
const REPO_NAME = "sitestroy";
const TARGET_FILE_PATH = "data/catalog.yml";
const GITHUB_CONTENTS_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${TARGET_FILE_PATH}`;

type UpdateCatalogBody = {
  catalog: Category[];
};

const headersForToken = (token: string) => ({
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  "User-Agent": "sitestroy-admin",
});

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as UpdateCatalogBody;
    if (!body || !Array.isArray(body.catalog)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "Missing GitHub token" }, { status: 500 });
    }

    const yamlContent = dump({ categories: body.catalog }, { lineWidth: 120, noRefs: true });
    const encodedContent = Buffer.from(yamlContent, "utf8").toString("base64");

    const getResponse = await fetch(GITHUB_CONTENTS_URL, {
      headers: headersForToken(token),
      cache: "no-store",
    });

    if (!getResponse.ok) {
      const error = await getResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: "Failed to fetch file metadata", details: error },
        { status: getResponse.status },
      );
    }

    const metadata = (await getResponse.json()) as { sha?: string };
    if (!metadata.sha) {
      return NextResponse.json({ error: "Missing file SHA" }, { status: 500 });
    }

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

    if (!putResponse.ok) {
      const error = await putResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: "Failed to update catalog", details: error },
        { status: putResponse.status },
      );
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
