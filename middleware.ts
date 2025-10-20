import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const [AUTH_USER, AUTH_PASS] = (process.env.HTTP_BASIC_AUTH || "").split(":");

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/admin")) return NextResponse.next();

  const auth = req.headers.get("authorization");
  if (!auth) {
    return new NextResponse("Auth required", { status: 401, headers: { "WWW-Authenticate": "Basic" } });
  }
  const [, encoded] = auth.split(" ");
  const [user, pass] = Buffer.from(encoded, "base64").toString().split(":");
  if (user === AUTH_USER && pass === AUTH_PASS) {
    return NextResponse.next();
  }
  return new NextResponse("Auth required", { status: 401, headers: { "WWW-Authenticate": "Basic" } });
}

export const config = { matcher: ["/admin/:path*"] };
