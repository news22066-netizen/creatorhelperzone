import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Admin pages reachable WITHOUT a session (otherwise login could never render). */
const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/admin/unauthorized"]);

function noIndex(response: NextResponse): NextResponse {
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

/**
 * Runs ONLY for /admin/* requests (see /middleware.ts).
 *  - Refreshes the Supabase auth cookie.
 *  - Sends visitors without a session to /admin/login?next=...
 *  - Does NOT check the role and does NOT redirect signed-in users away from
 *    the login page: role checks need the database and happen in the server
 *    pages (getAdminAccess). Keeping middleware dumb is what prevents loops.
 *
 * @param adminPath - The internal path, always starting with /admin
 * @param rewrite   - true on admin.* hosts, where "/tools" is rewritten to
 *                    "/admin/tools". false for plain path-based /admin URLs.
 */
export async function updateSession(
  request: NextRequest,
  adminPath: string,
  rewrite: boolean
) {
  const target = request.nextUrl.clone();
  target.pathname = adminPath;

  const pass = () =>
    rewrite
      ? NextResponse.rewrite(target, { request })
      : NextResponse.next({ request });

  let response = pass();

  const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[]
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = pass();
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  }
);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const normalized = adminPath.replace(/\/+$/, "") || "/admin";
  if (!user && !PUBLIC_ADMIN_PATHS.has(normalized)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", normalized + request.nextUrl.search);

    const redirect = NextResponse.redirect(loginUrl);
    // Keep any refreshed/cleared auth cookies on the redirect response too.
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return noIndex(redirect);
  }

  return noIndex(response);
}
