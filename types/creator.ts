// Row shapes of supabase/migrations/0009_creator_area.sql (hand-written like types/store.ts).

export interface CreatorWorkImage {
  id: string;
  work_id: string;
  url: string;
  alt: string;
  sort_order: number;
  created_at: string;
}

export interface CreatorWork {
  id: string;
  user_id: string;
  title: string;
  description: string;
  youtube_url: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  images: CreatorWorkImage[]; // joined + sorted by the data layer
}

export interface CreatorPlan {
  id: string;
  user_id: string;
  name: string;
  price_text: string;
  tagline: string;
  features: string; // one feature per line
  cta_label: string;
  is_featured: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface CreatorVideo {
  id: string;
  user_id: string;
  url: string;
  title: string;
  sort_order: number;
  created_at: string;
}

/** "line1\nline2" -> ["line1","line2"], max 12 non-empty lines. */
export function planFeatures(features: string): string[] {
  return features
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 12);
}
