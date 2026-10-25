/**
 * Username rules (reserved for the future app.eg.com onboarding):
 * 3-30 chars, a-z 0-9 _, English only, unique, permanent in MVP.
 */
export const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

/**
 * Names that can never be a profile URL (they are, or may become, real routes).
 * KEEP IN SYNC with public.is_reserved_username() in
 * supabase/migrations/0004_profiles_links.sql.
 */
export const RESERVED_USERNAMES = [
  "admin", "login", "signup", "register", "logout", "dashboard", "api",
  "tools", "guides", "guide", "trending", "faq", "faqs", "store",
  "collaboration", "notifications", "c", "b", "app", "www", "static",
  "_next", "menu", "settings", "auth", "profile", "support", "help",
  "about", "contact", "privacy", "terms", "cookies", "blog", "news", "search",
  "explore", "reels", "video", "home", "index", "root", "null",
  "undefined", "test", "robots", "sitemap", "favicon", "pricing",
];

export type UsernameCheck = "ok" | "invalid" | "reserved";

/** Lowercase + trim. Usernames are always stored and compared lowercase. */
export function normalizeUsername(input: string): string {
  return input.trim().toLowerCase();
}

/** Format + reserved check (does NOT know whether it is taken — that needs the DB). */
export function checkUsername(input: string): UsernameCheck {
  const u = normalizeUsername(input);
  if (!USERNAME_RE.test(u)) return "invalid";
  if (RESERVED_USERNAMES.includes(u)) return "reserved";
  return "ok";
}

export function isValidUsername(username: string): boolean {
  return checkUsername(username) === "ok";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}
