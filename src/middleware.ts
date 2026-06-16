import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { STORAGE_KEYS } from "@/constants";

const PUBLIC_PATHS = ["/login", "/favicon.ico"];
const PUBLIC_PREFIXES = ["/_next", "/api/", "/assets/"];

/**
 * SSR-side route protection.
 *  • If hitting a private route without an access token → /login?from=…
 *  • If hitting /login while already authed → /dashboard
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(STORAGE_KEYS.ACCESS_TOKEN)?.value;
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!token && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (token && pathname === "/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp|.*\\.ico).*)",
  ],
};
