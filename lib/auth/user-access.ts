import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export type MemberProfile = Pick<
  Profile,
  "id" | "role" | "is_blocked" | "username" | "full_name" | "bio" | "avatar_url" | "whatsapp"
>;

export type UserAccess =
  | { status: "anonymous" }
  | { status: "admin"; email: string }
  | { status: "blocked"; email: string }
  | { status: "no_profile"; email: string }
  | { status: "member"; email: string; profile: MemberProfile };

/**
 * Who is looking at /dashboard? Single source of truth for pages and actions.
 * getUser() validates the JWT with Supabase Auth (getSession() would not).
 * "member" = signed-in creator or business that is not blocked.
 */
export const getUserAccess = cache(async (): Promise<UserAccess> => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return { status: "anonymous" };

  const email = user.email ?? "";
  const { data } = await supabase
    .from("profiles")
    .select("id, role, is_blocked, username, full_name, bio, avatar_url, whatsapp")
    .eq("id", user.id)
    .maybeSingle();
  const profile = data as MemberProfile | null;

  if (!profile) return { status: "no_profile", email };
  if (profile.is_blocked) return { status: "blocked", email };
  if (profile.role === "admin") return { status: "admin", email };
  return { status: "member", email, profile };
});

/** Only internal /dashboard paths may be used as a post-login target. */
export function safeUserNext(next: string | null | undefined): string {
  const fallback = "/dashboard";
  if (!next || /[\r\n\\]/.test(next)) return fallback;
  if (next === "/dashboard" || next.startsWith("/dashboard/") || next.startsWith("/dashboard?")) {
    return next;
  }
  return fallback;
}
