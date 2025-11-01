const loggedTokens = new Set<string>();

const sanitizeToken = (token: string) =>
  token
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9x]/g, "")
    .trim();

export const logUnknownTokens = async (tokens: string[], query: string) => {
  if (!Array.isArray(tokens) || tokens.length === 0) return;
  const filtered = Array.from(
    new Set(tokens.map((token) => sanitizeToken(token)).filter((token) => token.length > 1)),
  ).filter((token) => {
    if (loggedTokens.has(token)) return false;
    loggedTokens.add(token);
    return true;
  });
  if (filtered.length === 0) return;
  try {
    await fetch("/api/search/log-unknown", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokens: filtered, query }),
    });
  } catch {
    // ignore client-side logging failures
  }
};
