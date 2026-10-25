import { createClient } from "@/lib/supabase/server";

export const UNAUTHORIZED = "You are not authorized to do this.";

export interface AdminContext {
  supabase: Awaited<ReturnType<typeof createClient>>;
  adminId: string;
}

/**
 * Server-side admin check used by EVERY admin server action.
 *
 * - getUser() validates the JWT against Supabase Auth (never trust getSession()).
 * - The profile must have role = 'admin' and must not be blocked.
 * - RLS + the DB trigger still enforce the same rules, so this is
 *   defence in depth that also gives clear errors instead of silent no-ops.
 *
 * Returns null when the caller is not an active admin.
 */
export async function getAdminContext(): Promise<AdminContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_blocked")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin" || profile.is_blocked) return null;
  return { supabase, adminId: user.id };
}
