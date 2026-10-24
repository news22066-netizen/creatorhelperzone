"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getUserAccess } from "@/lib/auth/user-access";
import type { ActionResult } from "@/lib/actions/types";
import { CURRENCIES } from "@/lib/store/format";
import { isHexColor } from "@/lib/store/theme";
import { SECTION_OPTIONS } from "@/lib/store/sections";
import { isValidProductSlug, productSlug } from "@/lib/store/slug";
import { normalizeContactUrl, normalizeEmail, normalizePhone, type ContactKey } from "@/lib/store/contact";
import { extractYouTubeId } from "@/lib/utils/youtube";
import { friendlyDbError, int, isUuid, str } from "@/lib/utils/validate";

/**
 * SECURITY MODEL (same as app/actions/account.ts)
 * Every exported action starts with getBusinessContext(): the caller must be a signed-in, non-blocked
 * BUSINESS account with a claimed username. Writes go through the user's own Supabase client, so the
 * RLS policies and triggers from 0006 (own rows only, 100 products / 8 images / 12 categories caps,
 * categories must belong to the owner) are enforced a second time by the database.
 *
 * Media rule: product / store images are https URL strings pasted by the owner (imgbb etc.).
 * There are no file uploads and no Supabase Storage here. Videos are YouTube links only.
 */

const MAX_IMAGES = 8;

function bad(error: string): ActionResult {
  return { error };
}

async function getBusinessContext() {
  const access = await getUserAccess();
  if (access.status !== "member") return null;
  const { profile } = access;
  if (profile.role !== "business" || !profile.username) return null;
  const supabase = await createClient();
  return { supabase, userId: profile.id, username: profile.username };
}

/** Everything visible on the public store (home, shop, contact, privacy) plus the dashboard views. */
function refresh(username: string) {
  revalidatePath(`/${username}`, "layout");
  revalidatePath("/dashboard/business", "layout");
}

/** Limit errors raised by the 0006 triggers carry a readable message; show it. */
function dbError(error: { code?: string; message: string }): string {
  if (/limit reached/i.test(error.message) || /does not belong/i.test(error.message)) return error.message;
  // PostgREST / Postgres "column does not exist": the 0008 migration has not been run on this database yet.
  if (error.code === "PGRST204" || error.code === "42703")
    return "Database update missing: run supabase/migrations/0008_store_slugs_sections_contact.sql in the Supabase SQL Editor.";
  return friendlyDbError(error);
}

// ---------------------------------------------------------------
// Store settings: display name, theme colors, YouTube link, section visibility
// ---------------------------------------------------------------
export async function saveStoreSettings(formData: FormData): Promise<ActionResult> {
  const ctx = await getBusinessContext();
  if (!ctx) return bad("Please sign in again.");

  const displayName = str(formData, "display_name");
  if (displayName.length > 80) return bad("Store name is too long (max 80).");

  const theme = {
    background: str(formData, "theme_background").toLowerCase(),
    primary: str(formData, "theme_primary").toLowerCase(),
    text: str(formData, "theme_text").toLowerCase(),
  };
  if (!isHexColor(theme.background) || !isHexColor(theme.primary) || !isHexColor(theme.text))
    return bad("Colors must be hex values like #111827.");

  // Section visibility: one checkbox per block (checked = shown). An unchecked box is simply absent from FormData.
  const sections = Object.fromEntries(SECTION_OPTIONS.map((o) => [o.key, formData.get(o.key) === "on"]));

  const rawVideo = str(formData, "youtube_url");
  let youtubeUrl: string | null = null;
  if (rawVideo) {
    const id = extractYouTubeId(rawVideo);
    if (!id) return bad("Paste a valid YouTube link (youtube.com or youtu.be).");
    youtubeUrl = `https://www.youtube.com/watch?v=${id}`; // canonical, so only the 11-char id is ever stored
  }

  const { error } = await ctx.supabase.from("store_settings").upsert(
    {
      profile_id: ctx.userId,
      display_name: displayName,
      theme,
      youtube_url: youtubeUrl,
      sections,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "profile_id" }
  );
  if (error) return bad(dbError(error));

  refresh(ctx.username);
  return { success: true };
}

// ---------------------------------------------------------------
// Contact links (phone, email, socials, website, address). All optional; empty = hidden on /contact.
// WhatsApp lives on the profile (Profile form) and is not repeated here.
// ---------------------------------------------------------------
export async function saveStoreContact(formData: FormData): Promise<ActionResult> {
  const ctx = await getBusinessContext();
  if (!ctx) return bad("Please sign in again.");

  const phone = normalizePhone(str(formData, "contact_phone"));
  if (phone === null) return bad("Phone number looks invalid. Example: 01712345678 or +8801712345678.");

  const email = normalizeEmail(str(formData, "contact_email"));
  if (email === null) return bad("Email address looks invalid.");

  const urlFields: { key: Exclude<ContactKey, "phone" | "email" | "address">; label: string }[] = [
    { key: "facebook", label: "Facebook" },
    { key: "instagram", label: "Instagram" },
    { key: "tiktok", label: "TikTok" },
    { key: "youtube", label: "YouTube" },
    { key: "website", label: "Website" },
  ];
  const urls: Record<string, string | null> = {};
  for (const f of urlFields) {
    const v = normalizeContactUrl(f.key, str(formData, `contact_${f.key}`));
    if (v === null) {
      return bad(
        f.key === "website"
          ? "Website link is not valid."
          : `${f.label} link is not valid. Paste your ${f.label} page link (e.g. https://${f.key}.com/yourname).`
      );
    }
    urls[`contact_${f.key}`] = v || null;
  }

  const address = str(formData, "contact_address");
  if (address.length > 200) return bad("Address is too long (max 200 characters).");

  const { error } = await ctx.supabase.from("store_settings").upsert(
    {
      profile_id: ctx.userId,
      contact_phone: phone || null,
      contact_email: email || null,
      ...urls,
      contact_address: address || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "profile_id" }
  );
  if (error) return bad(dbError(error));

  refresh(ctx.username);
  return { success: true };
}

// ---------------------------------------------------------------
// Store FAQ (shown on Home when "FAQ" is visible)
// ---------------------------------------------------------------
export async function addFaq(formData: FormData): Promise<ActionResult> {
  const ctx = await getBusinessContext();
  if (!ctx) return bad("Please sign in again.");

  const question = str(formData, "question");
  const answer = str(formData, "answer");
  if (!question || !answer) return bad("Write both a question and an answer.");
  if (question.length > 160) return bad("Question is too long (max 160).");
  if (answer.length > 1000) return bad("Answer is too long (max 1000).");

  const { data: last } = await ctx.supabase
    .from("store_faqs")
    .select("sort_order")
    .eq("user_id", ctx.userId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const next = ((last?.[0]?.sort_order as number | undefined) ?? -1) + 1;

  const { error } = await ctx.supabase
    .from("store_faqs")
    .insert({ user_id: ctx.userId, question, answer, sort_order: next, is_active: true });
  if (error) return bad(dbError(error));

  refresh(ctx.username);
  return { success: true };
}

export async function deleteFaq(id: string): Promise<ActionResult> {
  const ctx = await getBusinessContext();
  if (!ctx) return bad("Please sign in again.");
  if (!isUuid(id)) return bad("Invalid question.");

  const { error } = await ctx.supabase.from("store_faqs").delete().eq("id", id).eq("user_id", ctx.userId);
  if (error) return bad(dbError(error));

  refresh(ctx.username);
  return { success: true };
}

// ---------------------------------------------------------------
// Privacy policy (1:1, upsert)
// ---------------------------------------------------------------
export async function savePrivacy(formData: FormData): Promise<ActionResult> {
  const ctx = await getBusinessContext();
  if (!ctx) return bad("Please sign in again.");

  const content = str(formData, "content");
  if (content.length > 20000) return bad("Privacy text is too long (max 20,000 characters).");

  const { error } = await ctx.supabase
    .from("store_privacy")
    .upsert({ user_id: ctx.userId, content, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) return bad(dbError(error));

  refresh(ctx.username);
  return { success: true };
}

// ---------------------------------------------------------------
// Categories
// ---------------------------------------------------------------
export async function addCategory(formData: FormData): Promise<ActionResult> {
  const ctx = await getBusinessContext();
  if (!ctx) return bad("Please sign in again.");

  const name = str(formData, "name");
  if (!name) return bad("Category name is required.");
  if (name.length > 60) return bad("Category name is too long (max 60).");

  const { data: last } = await ctx.supabase
    .from("store_categories")
    .select("sort_order")
    .eq("user_id", ctx.userId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const next = ((last?.[0]?.sort_order as number | undefined) ?? -1) + 1;

  const { error } = await ctx.supabase.from("store_categories").insert({ user_id: ctx.userId, name, sort_order: next });
  if (error) {
    if (error.code === "23505") return bad("You already have a category with that name.");
    return bad(dbError(error));
  }
  refresh(ctx.username);
  return { success: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const ctx = await getBusinessContext();
  if (!ctx) return bad("Please sign in again.");
  if (!isUuid(id)) return bad("Invalid category.");

  // Products keep existing: the FK sets their category_id to null.
  const { error } = await ctx.supabase.from("store_categories").delete().eq("id", id).eq("user_id", ctx.userId);
  if (error) return bad(dbError(error));
  refresh(ctx.username);
  return { success: true };
}

// ---------------------------------------------------------------
// Products
// ---------------------------------------------------------------
interface ParsedProduct {
  name: string;
  slug: string; // "" = generate from the name
  price: number;
  currency: string;
  description: string;
  category_id: string | null;
  is_active: boolean;
  sort_order: number;
  images: string[];
}

function readProduct(fd: FormData): ParsedProduct | string {
  const name = str(fd, "name");
  if (!name) return "Product name is required.";
  if (name.length > 120) return "Product name is too long (max 120).";

  const priceRaw = str(fd, "price").replace(/,/g, "");
  const price = Number(priceRaw);
  if (!priceRaw || !Number.isFinite(price) || price < 0 || price >= 1e10)
    return "Enter a valid price (0 or more).";

  const currency = str(fd, "currency") || "BDT";
  if (!(CURRENCIES as readonly string[]).includes(currency)) return "Choose BDT or USD.";

  const description = str(fd, "description");
  if (description.length > 2000) return "Description is too long (max 2000).";

  const category = str(fd, "category_id");
  if (category && !isUuid(category)) return "Invalid category.";

  // Image URLs: pasted text, in display order (first = cover). https only, no uploads.
  const seen = new Set<string>();
  const images: string[] = [];
  for (const v of fd.getAll("image_url")) {
    const url = typeof v === "string" ? v.trim() : "";
    if (!url) continue;
    if (url.length > 1000) return "An image link is too long (max 1000 characters).";
    let ok = false;
    try {
      ok = new URL(url).protocol === "https:";
    } catch {
      ok = false;
    }
    if (!ok) return `Image links must start with https:// (check: ${url.slice(0, 40)}).`;
    if (!seen.has(url)) {
      seen.add(url);
      images.push(url);
    }
  }
  if (images.length > MAX_IMAGES) return `You can add up to ${MAX_IMAGES} images per product.`;

  // Slug: the owner may type their own ("Red Shirt!" is cleaned to "red-shirt"); blank = made from the name.
  const slugRaw = str(fd, "slug");
  const slug = slugRaw ? productSlug(slugRaw) : "";
  if (slugRaw && !isValidProductSlug(slug)) return "Product link can only use English letters, numbers and hyphens.";

  return {
    name,
    slug,
    price: Math.round(price * 100) / 100,
    currency,
    description,
    category_id: category || null,
    is_active: fd.get("is_active") === "on",
    sort_order: int(fd, "sort_order", { min: 0, max: 9999, fallback: 0 }),
    images,
  };
}

/** Atomic ordered replace via the 0007 RPC; sequential fallback if 0007 has not been run yet. */
async function replaceImages(supabase: SupabaseClient, productId: string, urls: string[]) {
  const { error } = await supabase.rpc("replace_product_images", { p_product: productId, p_urls: urls });
  if (!error) return null;

  const missing = error.code === "PGRST202" || error.code === "42883";
  if (!missing) return error;

  const del = await supabase.from("store_product_images").delete().eq("product_id", productId);
  if (del.error) return del.error;
  if (urls.length === 0) return null;
  const ins = await supabase
    .from("store_product_images")
    .insert(urls.map((url, i) => ({ product_id: productId, url, sort_order: i })));
  return ins.error ?? null;
}

/** Smallest free slug in this store: base, base-2, base-3 ... (`excludeId` = the product being edited). */
async function freeSlug(supabase: SupabaseClient, userId: string, base: string, excludeId?: string): Promise<string> {
  let q = supabase.from("store_products").select("slug").eq("user_id", userId).like("slug", `${base}%`);
  if (excludeId) q = q.neq("id", excludeId);
  const { data } = await q;
  const taken = new Set((data ?? []).map((r) => (r as { slug: string }).slug));
  if (!taken.has(base)) return base;
  for (let n = 2; n < 1000; n++) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function saveProduct(formData: FormData): Promise<ActionResult> {
  const ctx = await getBusinessContext();
  if (!ctx) return bad("Please sign in again.");

  const parsed = readProduct(formData);
  if (typeof parsed === "string") return bad(parsed);
  const { images, slug: wantedSlug, ...rest } = parsed;

  const id = str(formData, "id");
  if (id && !isUuid(id)) return bad("Invalid product.");

  // Slug: an owner-typed one must be free (clear message if not); an automatic one just gets -2, -3 ...
  let slug: string;
  if (wantedSlug) {
    slug = await freeSlug(ctx.supabase, ctx.userId, wantedSlug, id || undefined);
    if (slug !== wantedSlug) return bad(`The link "${wantedSlug}" is already used by another product. Try "${slug}" or pick another.`);
  } else {
    slug = await freeSlug(ctx.supabase, ctx.userId, productSlug(rest.name) || "product", id || undefined);
  }
  const fields = { ...rest, slug };

  if (fields.category_id) {
    const { data: cat } = await ctx.supabase
      .from("store_categories")
      .select("id")
      .eq("id", fields.category_id)
      .eq("user_id", ctx.userId)
      .maybeSingle();
    if (!cat) return bad("That category does not exist.");
  }

  if (id) {
    // UPDATE: ownership is part of the filter, and a miss means "not yours / not found".
    const { data, error } = await ctx.supabase
      .from("store_products")
      .update(fields)
      .eq("id", id)
      .eq("user_id", ctx.userId)
      .select("id");
    if (error) return bad(error.code === "23505" ? "That product link is already used. Pick another one." : dbError(error));
    if (!data || data.length === 0) return bad("Product not found.");

    const imgErr = await replaceImages(ctx.supabase, id, images);
    if (imgErr) return bad(dbError(imgErr));

    refresh(ctx.username);
    return { success: true };
  }

  // CREATE
  const { data: created, error } = await ctx.supabase
    .from("store_products")
    .insert({ ...fields, user_id: ctx.userId })
    .select("id")
    .single();
  if (error?.code === "23505") return bad("That product link is already used. Pick another one.");
  if (error || !created) return bad(error ? dbError(error) : "Could not save the product.");

  if (images.length > 0) {
    const imgErr = await replaceImages(ctx.supabase, created.id as string, images);
    if (imgErr) {
      // Do not leave a half-created product behind.
      await ctx.supabase.from("store_products").delete().eq("id", created.id).eq("user_id", ctx.userId);
      return bad(dbError(imgErr));
    }
  }

  refresh(ctx.username);
  redirect("/dashboard/business/products");
}

export async function setProductActive(id: string, active: boolean): Promise<ActionResult> {
  const ctx = await getBusinessContext();
  if (!ctx) return bad("Please sign in again.");
  if (!isUuid(id)) return bad("Invalid product.");

  const { data, error } = await ctx.supabase
    .from("store_products")
    .update({ is_active: active })
    .eq("id", id)
    .eq("user_id", ctx.userId)
    .select("id");
  if (error) return bad(dbError(error));
  if (!data || data.length === 0) return bad("Product not found.");

  refresh(ctx.username);
  return { success: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const ctx = await getBusinessContext();
  if (!ctx) return bad("Please sign in again.");
  if (!isUuid(id)) return bad("Invalid product.");

  // Images are removed by ON DELETE CASCADE.
  const { error } = await ctx.supabase.from("store_products").delete().eq("id", id).eq("user_id", ctx.userId);
  if (error) return bad(dbError(error));

  refresh(ctx.username);
  return { success: true };
}
