
/** Social / website fields of the creator profile. `hosts` = accepted domains (omit = any https site). */
export const SOCIAL_FIELDS = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourname", hosts: ["instagram.com", "instagr.am"] },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourpage", hosts: ["facebook.com", "fb.com", "fb.me", "m.me"] },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@yourname", hosts: ["tiktok.com"] },
  { key: "youtube", label: "YouTube channel", placeholder: "https://youtube.com/@yourchannel", hosts: ["youtube.com", "youtu.be"] },
  { key: "x", label: "X (Twitter)", placeholder: "https://x.com/yourname", hosts: ["x.com", "twitter.com"] },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/yourname", hosts: ["linkedin.com"] },
  { key: "telegram", label: "Telegram", placeholder: "https://t.me/yourname", hosts: ["t.me", "telegram.me", "telegram.org"] },
  { key: "website", label: "Website", placeholder: "https://yourwebsite.com", hosts: undefined },
] as const;

export type SocialKey = (typeof SOCIAL_FIELDS)[number]["key"];
export const SOCIAL_KEYS = SOCIAL_FIELDS.map((f) => f.key) as SocialKey[];

export type CreatorSocials = Record<SocialKey, string | null>;

export interface CreatorSettingsView {
  appearance: string;
  about: string;
  email: string | null;
  phone: string | null;
  socials: CreatorSocials;
}

export const EMPTY_SOCIALS: CreatorSocials = {
  instagram: null,
  facebook: null,
  tiktok: null,
  youtube: null,
  x: null,
  linkedin: null,
  telegram: null,
  website: null,
};

/** Row of creator_settings (select "*") -> view. Missing columns / table row = defaults. */
export function parseCreatorSettings(row: Record<string, unknown> | null | undefined, defaultAppearance: string): CreatorSettingsView {
  const text = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  const socials = { ...EMPTY_SOCIALS };
  for (const k of SOCIAL_KEYS) socials[k] = text(row?.[`social_${k}`]);
  return {
    appearance: typeof row?.appearance === "string" ? row.appearance : defaultAppearance,
    about: typeof row?.about === "string" ? row.about : "",
    email: text(row?.contact_email),
    phone: text(row?.contact_phone),
    socials,
  };
}

