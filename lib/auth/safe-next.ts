/**
 * Sanitise the ?next= redirect target so login can never become an open redirect.
 * Only internal /admin paths are allowed; anything else becomes "/admin".
 */
export function safeAdminNext(next: string | null | undefined): string {
  const fallback = "/admin";
  if (!next || /[\r\n\\]/.test(next)) return fallback;
  const isAdminPath =
    next === "/admin" ||
    next.startsWith("/admin/") ||
    next.startsWith("/admin?");
  if (!isAdminPath) return fallback;
  if (next.startsWith("/admin/login") || next.startsWith("/admin/unauthorized")) {
    return fallback;
  }
  return next;
}
