import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authHeader = (process.env.HTTP_BASIC_AUTH || "").split(":");
const AUTH_USER = authHeader[0] ?? "";
const AUTH_PASS = authHeader[1] ?? "";

const decodeBase64 = (value: string): string => {
  if (typeof atob === "function") {
    return atob(value);
  }
  return Buffer.from(value, "base64").toString("utf8");
};

const authRequiredResponse = () =>
  new NextResponse("Auth required", { status: 401, headers: { "WWW-Authenticate": "Basic" } });

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/admin")) return NextResponse.next();

  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Basic ")) {
    return authRequiredResponse();
  }
  const encoded = auth.split(" ")[1] ?? "";
  if (!encoded) {
    return authRequiredResponse();
  }

  const [user, pass] = decodeBase64(encoded).split(":");
  if (user === AUTH_USER && pass === AUTH_PASS) {
    return NextResponse.next();
  }
  return authRequiredResponse();
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
