// Hand-written types matching supabase/migrations/0001_init.sql + 0003_tools_seo.sql
// Regenerate with `supabase gen types typescript` when the CLI is available.

export type UserRole = "admin" | "creator" | "business";
export type PublishStatus = "draft" | "published" | "unpublished";
export type TrendingKind = "video" | "keyword" | "thumbnail_idea";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_blocked: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  // 0004_profiles_links.sql
  username: string | null;
  bio: string | null;
  whatsapp: string | null;
}

/** Row of the public_profiles view (safe public columns only). */
export interface PublicProfile {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  whatsapp: string | null;
  role: UserRole;
}

export interface ProfileLink {
  id: string;
  user_id: string;
  title: string;
  url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  gradient: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  // 0003_tools_seo.sql
  slug: string | null;
  content: string;
  meta_title: string | null;
  meta_description: string | null;
}

export interface TrendingItem {
  id: string;
  kind: TrendingKind;
  title: string;
  youtube_url: string | null;
  youtube_id: string | null;
  week_label: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Guide {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_url: string | null;
  status: PublishStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  is_active: boolean;
  created_at: string;
}

export interface SiteSettings {
  store_enabled: boolean;
  collaboration_enabled: boolean;
  site_name: string;
  /** https image URL for the public header logo ("" = use the text mark). 0010: site_settings key "logo_url". */
  logo_url: string;
  /** Site-wide social links, only filled ones. 0010: site_settings key "social_links". */
  social_links: Partial<Record<SiteSocialKey, string>>;
}

export type SiteSocialKey =
  | "facebook" | "instagram" | "youtube" | "tiktok"
  | "whatsapp" | "x" | "linkedin" | "telegram";

export const DEFAULT_SETTINGS: SiteSettings = {
  store_enabled: false,
  collaboration_enabled: false,
  site_name: "CreatorHub BD",
  logo_url: "",
  social_links: {},
};

export type GuideAudience = "creator" | "business" | "both";

/** 0010_marketing_admin.sql — lessons shown inside the creator / business dashboards. */
export interface DashboardGuide {
  id: string;
  title: string;
  description: string;
  youtube_url: string | null;
  audience: GuideAudience;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
