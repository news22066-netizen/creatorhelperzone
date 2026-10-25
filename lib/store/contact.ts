import type { StoreContact } from "@/types/store";

export const CONTACT_KEYS = ["phone", "email", "facebook", "instagram", "tiktok", "youtube", "website", "address"] as const;
export type ContactKey = (typeof CONTACT_KEYS)[number];

export const EMPTY_CONTACT: StoreContact = {
  phone: null,
  email: null,
  facebook: null,
  instagram: null,
  tiktok: null,
  youtube: null,
  website: null,
  address: null,
};

/** Reads the contact_* columns of a store_settings row (select("*")): missing columns = not filled. */
export function parseContact(row: Record<string, unknown> | null | undefined): StoreContact {
  const out = { ...EMPTY_CONTACT };
  if (!row) return out;
  for (const k of CONTACT_KEYS) {
    const v = row[`contact_${k}`];
    out[k] = typeof v === "string" && v.trim() ? v.trim() : null;
  }
  return out;
}

export function hasAnyContact(c: StoreContact): boolean {
  return CONTACT_KEYS.some((k) => Boolean(c[k]));
}

// ---------- validation (server actions) ----------

/** Allowed hostnames per platform (the host itself or any subdomain of it). */
const HOSTS: Partial<Record<ContactKey, string[]>> = {
  facebook: ["facebook.com", "fb.com", "fb.me", "m.me"],
  instagram: ["instagram.com", "instagr.am"],
  tiktok: ["tiktok.com"],
  youtube: ["youtube.com", "youtu.be"],
};

function withHttps(raw: string): string {
  return /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
}

/**
 * "" = empty (clears the field), string = normalised https URL, null = invalid.
 * `allowedHosts`: the host itself or any subdomain of it must match (e.g. ["facebook.com", "fb.me"]).
 */
export function normalizeUrlForHosts(input: string, allowedHosts?: readonly string[]): string | "" | null {
  const raw = input.trim();
  if (!raw) return "";
  if (raw.length > 300) return null;
  let u: URL;
  try {
    u = new URL(withHttps(raw));
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  u.protocol = "https:";
  const host = u.hostname.toLowerCase();
  if (!host.includes(".")) return null;
  if (allowedHosts && !allowedHosts.some((h) => host === h || host.endsWith(`.${h}`))) return null;
  return u.toString();
}

export function normalizeContactUrl(key: ContactKey, input: string): string | "" | null {
  return normalizeUrlForHosts(input, HOSTS[key]);
}

/** Phone: "+8801712345678" style. BD local 01XXXXXXXXX becomes +8801XXXXXXXXX. "" = empty, null = invalid. */
export function normalizePhone(input: string): string | "" | null {
  const raw = input.trim();
  if (!raw) return "";
  if (!/^\+?[0-9\s\-().]+$/.test(raw)) return null;
  let digits = raw.replace(/\D/g, "");
  if (/^01[0-9]{9}$/.test(digits)) digits = `88${digits}`;
  if (!/^[0-9]{6,15}$/.test(digits)) return null;
  return `+${digits}`;
}

export function normalizeEmail(input: string): string | "" | null {
  const raw = input.trim().toLowerCase();
  if (!raw) return "";
  if (raw.length > 120 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(raw)) return null;
  return raw;
}

export function mapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/** Shows "facebook.com/mypage" instead of the long https URL. */
export function prettyUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname === "/" ? "" : u.pathname.replace(/\/$/, "");
    return `${u.hostname.replace(/^www\./, "")}${path}`;
  } catch {
    return url;
  }
}
