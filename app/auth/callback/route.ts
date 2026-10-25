import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { destinationAfterLogin } from "@/lib/auth/roles";

/**
 * OAuth / email-confirmation callback. Exchanges the one-time code for a
 * session cookie, then routes by role:
 *   admin               -> /admin
 *   creator             -> /dashboard/creator
 *   business            -> /dashboard/business
 *   no username yet     -> /dashboard (new Google users choose account type + username there)
 *
 * Failures go to /login with a fixed error code (never raw text).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const fail = (code: string) => NextResponse.redirect(`${origin}/login?error=${code}`);

  if (searchParams.get("error")) return fail("oauth_denied");

  const code = searchParams.get("code");
  if (!code) return fail("oauth_missing_code");

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return fail("oauth_failed");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let role: string | null = null;
  let hasUsername = false;
  if (user) {
    const { data } = await supabase.from("profiles").select("role, username").eq("id", user.id).maybeSingle();
    role = data?.role ?? null;
    hasUsername = Boolean(data?.username);
  }

  return NextResponse.redirect(`${origin}${destinationAfterLogin(role, null, hasUsername)}`);
}
