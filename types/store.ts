// ============================================================
// CreatorHub BD — business store types (mirror of 0006_business_store.sql + 0007 deltas)
// Field names are snake_case to match Supabase rows directly.
// ============================================================

export interface StoreTheme {
  background: string; // default "#ffffff"
  primary: string; // default "#111827"
  text: string; // default "#1f2937"
}

export const DEFAULT_STORE_THEME: StoreTheme = {
  background: "#ffffff",
  primary: "#111827",
  text: "#1f2937",
};

/** 0008: owner-controlled show/hide flags for the public store blocks (store_settings.sections jsonb). */
export interface StoreSections {
  show_featured_products: boolean;
  show_photo_row: boolean;
  show_categories: boolean;
  show_youtube: boolean;
  show_faq: boolean;
  show_search_on_shop: boolean;
}

/** 0008: optional contact links (store_settings.contact_* columns). null / "" = not filled = not shown. */
export interface StoreContact {
  phone: string | null;
  email: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  website: string | null;
  address: string | null;
}

/** Row from public.store_settings (1:1 with profiles). */
export interface StoreSettings {
  profile_id: string;
  display_name: string;
  theme: StoreTheme; // jsonb: always sanitised through parseTheme() before use
  youtube_url: string | null; // 0007
  sections: StoreSections; // 0008: always sanitised through parseSections() before use
  updated_at: string;
}

export interface StoreCategory {
  id: string;
  user_id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface StoreProductImage {
  id: string;
  product_id: string;
  url: string; // https image link pasted by the owner (imgbb etc.): never an upload
  alt: string;
  sort_order: number;
  created_at: string;
}

export interface StoreProduct {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  slug: string; // 0008: unique per store, used in /[username]/shop/[slug]
  price: number; // numeric comes back as number via PostgREST
  currency: string; // ISO-4217, default "BDT"
  description: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  /** Joined from store_product_images, sorted by sort_order (not a column). */
  images: StoreProductImage[];
}

export interface StoreFaq {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

/** Row from public.store_privacy (1:1 with profiles). */
export interface StorePrivacy {
  user_id: string;
  content: string;
  updated_at: string;
}

// ---------- Dashboard (owner) forms ----------

export interface ProductFormValues {
  id?: string;
  name: string;
  slug: string;
  price: string; // kept as a string in the form, parsed on the server
  currency: string;
  description: string;
  category_id: string | null;
  is_active: boolean;
  sort_order: number;
  images: string[]; // image URLs, order = display order (max 8)
}
