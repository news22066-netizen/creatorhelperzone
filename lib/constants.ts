export const SITE_NAME = "CreatorHub BD";
/** Placeholder: set NEXT_PUBLIC_CONTACT_EMAIL once a real inbox exists. */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@bfeed.store";
// Single source of truth lives in lib/site-url.ts (never falls back to localhost in production builds).
export { SITE_URL } from "./site-url";

/** ISO week label like "2026-W43" used for trending sections. */
export function currentWeekLabel(d = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}
