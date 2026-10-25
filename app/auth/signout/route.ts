import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /auth/signout
 * Cookies cannot be cleared while rendering a Server Component, so sign-out
 * lives in a Route Handler. Plain <form method="post"> works without JS.
 */
export async function POST(request: NextRequest) {
  // Basic CSRF guard: reject cross-site form posts.
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const supabase = await createClient();
  await supabase.auth.signOut();

  // Admin forms post no field (-> /admin/login). The member dashboard posts to=login.
  let to = "/admin/login";
  try {
    const form = await request.formData();
    if (form.get("to") === "login") to = "/login";
  } catch {
    // no/invalid body: keep the admin default
  }

  const { origin: base } = new URL(request.url);
  return NextResponse.redirect(`${base}${to}`, { status: 303 });
}
