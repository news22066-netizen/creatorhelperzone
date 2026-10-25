import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { checkUsername, normalizeUsername } from "@/lib/utils/username";
import { parseTheme } from "./theme";
import { parseSections } from "./sections";
import { parseContact } from "./contact";
import { isUuid } from "@/lib/utils/validate";
import type { PublicProfile } from "@/types/database";
import type {
  StoreCategory,
  StoreContact,
  StoreSections,
  StoreFaq,
  StoreProduct,
  StoreProductImage,
  StoreTheme,
} from "@/types/store";

/**
 * Public (anonymous) reads for /[username] and its store sub-pages.
 * Uses the cookie-less client like the existing profile page, so the pages stay cacheable (ISR) and
 * the 0006 public RLS policies decide what is visible (active products of public stores only).
 * `cache()` de-duplicates the lookups between layout, page and generateMetadata in one request.
 */

export const getPublicProfile = cache(async (raw: string): Promise<PublicProfile | null> => {
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null; // malformed %-escape
  }
  const username = normalizeUsername(decoded);
  if (checkUsername(username) !== "ok") return null;

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("public_profiles")
    .select("id, username, full_name, bio, avatar_url, whatsapp, role")
    .eq("username", username)
    .maybeSingle();
  return (data as PublicProfile | null) ?? null;
});

export interface StoreView {
  profile: PublicProfile;
  displayName: string;
  theme: StoreTheme;
  youtubeUrl: string | null;
  sections: StoreSections; // 0008: show/hide flags (all visible when the column is missing)
  contact: StoreContact; // 0008: optional contact links
}

/** Business store header data. Returns null for unknown users and for creators (they have no store). */
export const getStoreView = cache(async (raw: string): Promise<StoreView | null> => {
  const profile = await getPublicProfile(raw);
  if (!profile || profile.role !== "business") return null;

  const supabase = createPublicClient();
  // select("*") on purpose: still works if the optional youtube_url column (0007) is not there yet.
  const { data } = await supabase.from("store_settings").select("*").eq("profile_id", profile.id).maybeSingle();

  // A missing settings row (brand-new store) is fine: defaults apply.
  const row = (data ?? {}) as {
    display_name?: string;
    theme?: unknown;
    youtube_url?: string | null;
    sections?: unknown;
  } & Record<string, unknown>;
  return {
    profile,
    displayName: row.display_name?.trim() || profile.full_name?.trim() || `@${profile.username}`,
    theme: parseTheme(row.theme),
    youtubeUrl: row.youtube_url ?? null,
    sections: parseSections(row.sections),
    contact: parseContact(row),
  };
});

type ProductRow = Omit<StoreProduct, "images"> & { store_product_images: StoreProductImage[] | null };

export function mapProduct(row: ProductRow): StoreProduct {
  const { store_product_images, ...rest } = row;
  return {
    ...rest,
    price: Number(rest.price),
    images: [...(store_product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
  };
}

/** Active products with their ordered images (one query). Max 100 per store (DB trigger). */
export async function getStoreProducts(profileId: string): Promise<StoreProduct[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("store_products")
    .select("*, store_product_images(id, product_id, url, alt, sort_order, created_at)")
    .eq("user_id", profileId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  return ((data ?? []) as unknown as ProductRow[]).map(mapProduct);
}

/**
 * One ACTIVE product of one store by its slug. The query filters on the store AND is_active, and RLS
 * repeats both, so a slug from another store or a hidden product is simply "not found" (-> 404).
 * Falls back to the product id so links keep working on a database that has no slug column yet.
 */
export async function getStoreProductBySlug(profileId: string, slugOrId: string): Promise<StoreProduct | null> {
  const supabase = createPublicClient();
  const select = "*, store_product_images(id, product_id, url, alt, sort_order, created_at)";

  const bySlug = await supabase
    .from("store_products")
    .select(select)
    .eq("user_id", profileId)
    .eq("is_active", true)
    .eq("slug", slugOrId)
    .maybeSingle();
  if (bySlug.data) return mapProduct(bySlug.data as unknown as ProductRow);

  if (!isUuid(slugOrId)) return null;
  const byId = await supabase
    .from("store_products")
    .select(select)
    .eq("user_id", profileId)
    .eq("is_active", true)
    .eq("id", slugOrId)
    .maybeSingle();
  return byId.data ? mapProduct(byId.data as unknown as ProductRow) : null;
}

export async function getStoreCategories(profileId: string): Promise<StoreCategory[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("store_categories")
    .select("*")
    .eq("user_id", profileId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  return (data ?? []) as StoreCategory[];
}

export async function getStoreFaqs(profileId: string): Promise<StoreFaq[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("store_faqs")
    .select("*")
    .eq("user_id", profileId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(5);
  return (data ?? []) as StoreFaq[];
}

export async function getStorePrivacy(profileId: string): Promise<string> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("store_privacy").select("content").eq("user_id", profileId).maybeSingle();
  return (data as { content: string } | null)?.content?.trim() ?? "";
}
