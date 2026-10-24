import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type AdminAccess =
  | { status: "anonymous" }
  | { status: "admin"; userId: string; email: string }
  | {
      status: "forbidden";
      reason: "not_admin" | "blocked" | "no_profile";
      email: string;
    };

/**
 * Single source of truth for "who is looking at the admin area".
 * Used by the guarded layout, the login page and the unauthorized page,
 * so all three always agree and can never redirect into each other.
 *
 *   anonymous -> no valid session
 *   admin     -> signed in, role = 'admin', not blocked
 *   forbidden -> signed in but not allowed (show "Not authorized", no loop)
 *
 * getUser() validates the JWT with Supabase Auth (getSession() would not).
 */
export const getAdminAccess = cache(async (): Promise<AdminAccess> => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return { status: "anonymous" };

  const email = user.email ?? "";
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_blocked")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return { status: "forbidden", reason: "no_profile", email };
  if (profile.is_blocked) return { status: "forbidden", reason: "blocked", email };
  if (profile.role !== "admin") return { status: "forbidden", reason: "not_admin", email };
  return { status: "admin", userId: user.id, email };
});
