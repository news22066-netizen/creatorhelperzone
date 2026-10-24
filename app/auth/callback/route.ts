import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth / email-confirmation callback. Exchanges the one-time code for a
 * session cookie, then routes by role:
 *   admin               -> /admin
 *   creator / business  -> /dashboard (new Google users finish onboarding there)
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
  if (user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    role = data?.role ?? null;
  }

  return NextResponse.redirect(`${origin}${role === "admin" ? "/admin" : "/dashboard"}`);
}
