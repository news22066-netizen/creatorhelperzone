import { normalizeWhatsapp } from "@/lib/utils/validate";
import type { SiteSocialKey } from "@/types/database";

/**
 * Site-wide social links (managed in /admin/branding, NOT per user).
 * `hosts` = accepted domains (subdomains allowed). WhatsApp also accepts a bare phone number.
 */
export const SITE_SOCIALS: {
  key: SiteSocialKey;
  label: string;
  placeholder: string;
  hosts: string[];
}[] = [
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourpage", hosts: ["facebook.com", "fb.com", "fb.me"] },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourname", hosts: ["instagram.com", "instagr.am"] },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@yourchannel", hosts: ["youtube.com", "youtu.be"] },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@yourname", hosts: ["tiktok.com"] },
  { key: "whatsapp", label: "WhatsApp", placeholder: "01712345678 or https://wa.me/8801712345678", hosts: ["wa.me", "whatsapp.com", "api.whatsapp.com"] },
  { key: "x", label: "X (Twitter)", placeholder: "https://x.com/yourname", hosts: ["x.com", "twitter.com"] },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/yourname", hosts: ["linkedin.com"] },
  { key: "telegram", label: "Telegram", placeholder: "https://t.me/yourname", hosts: ["t.me", "telegram.me"] },
];

export const SITE_SOCIAL_KEYS = SITE_SOCIALS.map((s) => s.key);

function hostMatches(hostname: string, hosts: string[]): boolean {
  const h = hostname.toLowerCase().replace(/^www\./, "");
  return hosts.some((d) => h === d || h.endsWith(`.${d}`));
}

export type SocialParse = { ok: true; value: string } | { ok: false; error: string };

/** Validate + normalise one admin-entered value. Empty string = "not set" (valid). https only. */
export function parseSocialInput(key: SiteSocialKey, raw: string): SocialParse {
  const input = raw.trim();
  if (!input) return { ok: true, value: "" };
  const def = SITE_SOCIALS.find((s) => s.key === key);
  if (!def) return { ok: false, error: "Unknown social network." };
  if (input.length > 300) return { ok: false, error: `${def.label}: link is too long.` };

  // WhatsApp: a plain phone number becomes a wa.me link.
  if (key === "whatsapp" && !/^https?:\/\//i.test(input)) {
    const digits = normalizeWhatsapp(input);
    return digits
      ? { ok: true, value: `https://wa.me/${digits}` }
      : { ok: false, error: "WhatsApp: enter a phone number like 01712345678 or a wa.me link." };
  }

  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return { ok: false, error: `${def.label}: enter a full link starting with https://` };
  }
  if (url.protocol !== "https:") return { ok: false, error: `${def.label}: link must start with https://` };
  if (!hostMatches(url.hostname, def.hosts))
    return { ok: false, error: `${def.label}: link must be on ${def.hosts[0]}.` };
  return { ok: true, value: url.toString() };
}

/** Re-validate a stored value when reading (defence in depth: only https links on known hosts render). */
export function cleanStoredSocials(raw: unknown): Partial<Record<SiteSocialKey, string>> {
  const out: Partial<Record<SiteSocialKey, string>> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const { key, hosts } of SITE_SOCIALS) {
    const v = (raw as Record<string, unknown>)[key];
    if (typeof v !== "string" || !v) continue;
    try {
      const u = new URL(v);
      if (u.protocol === "https:" && hostMatches(u.hostname, hosts)) out[key] = u.toString();
    } catch {
      /* ignore bad value */
    }
  }
  return out;
}

/** Logo must be an https image link (imgbb / CDN). Empty = text mark. */
export function parseLogoUrl(raw: string): SocialParse {
  const v = raw.trim();
  if (!v) return { ok: true, value: "" };
  if (v.length > 500) return { ok: false, error: "Logo URL is too long (max 500)." };
  try {
    const u = new URL(v);
    if (u.protocol !== "https:") return { ok: false, error: "Logo URL must start with https://" };
    return { ok: true, value: u.toString() };
  } catch {
    return { ok: false, error: "Logo URL is not a valid link." };
  }
}
