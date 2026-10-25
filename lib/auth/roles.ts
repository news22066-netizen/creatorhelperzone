/**
 * Role -> area map. Pure (no server imports), so the client login form and server code share it.
 *
 *   admin     -> /admin
 *   creator   -> /dashboard/creator   (+ the creator public page)
 *   business  -> /dashboard/business  (+ the business store)
 *
 * Wrong area? Each dashboard guard (requireCreator / requireBusiness) redirects to the right home,
 * so nobody ever sees the other role's screens.
 */
export type AppRole = "admin" | "creator" | "business";

export const ROLE_HOME: Record<AppRole, string> = {
  admin: "/admin",
  creator: "/dashboard/creator",
  business: "/dashboard/business",
};

export function isAppRole(v: unknown): v is AppRole {
  return v === "admin" || v === "creator" || v === "business";
}

/** Home screen of a role. Unknown role (no profile yet) -> /dashboard, which explains what is missing. */
export function homeForRole(role: unknown): string {
  return isAppRole(role) ? ROLE_HOME[role] : "/dashboard";
}

/**
 * Where to send someone right after login / when they open /dashboard.
 * `next` (already sanitised to an internal /dashboard path) is honoured only if it lies inside the
 * user's OWN area, e.g. a creator opening /dashboard/creator/works keeps it; /dashboard/business is dropped.
 * `hasUsername=false` (Google sign-up that has not chosen an account type yet) must go through /dashboard onboarding.
 */
export function destinationAfterLogin(role: unknown, next?: string | null, hasUsername = true): string {
  if (role === "admin") return ROLE_HOME.admin;
  if (!isAppRole(role) || !hasUsername) return "/dashboard";
  const home = ROLE_HOME[role];
  if (next && (next === home || next.startsWith(`${home}/`) || next.startsWith(`${home}?`))) return next;
  return home;
}
