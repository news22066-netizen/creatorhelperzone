import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { updateUserSession } from "@/lib/supabase/user-middleware";

/**
 * Routing rules
 *
 *   /auth/*              -> never touched (OAuth callback + sign-out must just run)
 *   /admin, /admin/*     -> admin area on ANY host (path-based: eg.com/admin,
 *                           localhost:3000/admin). Session refreshed; no session
 *                           -> /admin/login. Role is checked in server pages.
 *   admin.* host, other  -> rewritten onto /admin/* (admin.eg.com/tools ->
 *                           /admin/tools), so subdomain access still works.
 *   /dashboard, /dashboard/*
 *                        -> creator/business area: session refreshed; no session
 *                           -> /login?next=... (role is checked in the page).
 *   everything else      -> public site, untouched, no Supabase calls.
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/auth" || pathname.startsWith("/auth/")) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return updateSession(request, pathname, false);
  }

  const host = request.headers.get("host") ?? "";
  if (host.startsWith("admin.")) {
    const adminPath = pathname === "/" ? "/admin" : `/admin${pathname}`;
    return updateSession(request, adminPath, true);
  }

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return updateUserSession(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$).*)",
  ],
};
