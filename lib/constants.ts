export const SITE_NAME = "CreatorHub BD";
/** Placeholder: set NEXT_PUBLIC_CONTACT_EMAIL once a real inbox exists. */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@bfeed.store";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://eg.com";

/** ISO week label like "2026-W43" used for trending sections. */
export function currentWeekLabel(d = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}
