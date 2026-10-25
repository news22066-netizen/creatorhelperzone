"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getUserAccess } from "@/lib/auth/user-access";
import type { ActionResult } from "@/lib/actions/types";
import { ALL_PRESETS } from "@/lib/creator/appearance";
import { SOCIAL_FIELDS } from "@/lib/creator/links";
import { normalizeEmail, normalizePhone, normalizeUrlForHosts } from "@/lib/store/contact";
import { extractYouTubeId } from "@/lib/utils/youtube";
import { friendlyDbError, int, isUuid, str } from "@/lib/utils/validate";

/**
 * SECURITY MODEL (same as app/actions/store.ts, for the CREATOR role)
 * Every exported action starts with getCreatorContext(): the caller must be a signed-in, non-blocked
 * CREATOR with a claimed username. Business accounts are refused here. Writes use the user's own
 * Supabase client, so the 0009 RLS policies (role = 'creator', own rows only) and caps are enforced a
 * second time by the database.
 *
 * Media rule: images are https URL strings pasted by the owner (imgbb etc.), videos are YouTube links
 * only. No file uploads, no Supabase Storage, no payments (pricing buttons open WhatsApp).
 */

const MAX_IMAGES = 8;

function bad(error: string): ActionResult {
  return { error };
}

async function getCreatorContext() {
  const access = await getUserAccess();
  if (access.status !== "member") return null;
  const { profile } = access;
  if (profile.role !== "creator" || !profile.username) return null;
  const supabase = await createClient();
  return { supabase, userId: profile.id, username: profile.username };
}

/** Public creator page (home, works, pricing) + every creator dashboard screen. */
function refresh(username: string) {
  revalidatePath(`/${username}`, "layout");
  revalidatePath("/dashboard/creator", "layout");
}

const MIGRATION_HINT =
  "Database update missing: run supabase/migrations/0009_creator_area.sql in the Supabase SQL Editor.";

function dbError(error: { code?: string; message: string }): string {
  if (/limit reached/i.test(error.message) || /not found/i.test(error.message)) return error.message;
  // table / column / function not found: 0009 has not been run on this database yet
  if (["PGRST205", "PGRST204", "PGRST202", "42P01", "42703", "42883"].includes(error.code ?? "")) return MIGRATION_HINT;
  return friendlyDbError(error);
}

// ---------------------------------------------------------------
// Profile extras: About text, contact (email, phone) and social links.
// Name, bio, avatar and WhatsApp are saved by updateProfile (app/actions/account.ts).
// ---------------------------------------------------------------
export async function saveCreatorContact(formData: FormData): Promise<ActionResult> {
  const ctx = await getCreatorContext();
  if (!ctx) return bad("Please sign in again.");

  const about = str(formData, "about");
  if (about.length > 1500) return bad("About is too long (max 1500 characters).");

  const email = normalizeEmail(str(formData, "contact_email"));
  if (email === null) return bad("Email address looks invalid.");
  const phone = normalizePhone(str(formData, "contact_phone"));
  if (phone === null) return bad("Phone number looks invalid. Example: 01712345678 or +8801712345678.");

  const socials: Record<string, string | null> = {};
  for (const f of SOCIAL_FIELDS) {
    const v = normalizeUrlForHosts(str(formData, `social_${f.key}`), f.hosts);
    if (v === null) {
      return bad(
        f.hosts
          ? `${f.label} link is not valid. Paste your ${f.label} page link (e.g. ${f.placeholder}).`
          : "Website link is not valid."
      );
    }
    socials[`social_${f.key}`] = v || null;
  }

  const { error } = await ctx.supabase.from("creator_settings").upsert(
    {
      profile_id: ctx.userId,
      about,
      contact_email: email || null,
      contact_phone: phone || null,
      ...socials,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "profile_id" }
  );
  if (error) return bad(dbError(error));

  refresh(ctx.username);
  return { success: true };
}

// ---------------------------------------------------------------
// Appearance: one of the 25 presets (id only, never raw CSS)
// ---------------------------------------------------------------
export async function saveAppearance(presetId: string): Promise<ActionResult> {
  const ctx = await getCreatorContext();
  if (!ctx) return bad("Please sign in again.");
  if (!ALL_PRESETS.some((p) => p.id === presetId)) return bad("Choose one of the colors in the list.");

  const { error } = await ctx.supabase
    .from("creator_settings")
    .upsert({ profile_id: ctx.userId, appearance: presetId, updated_at: new Date().toISOString() }, { onConflict: "profile_id" });
  if (error) return bad(dbError(error));

  refresh(ctx.username);
  return { success: true };
}

// ---------------------------------------------------------------
// Works
// ---------------------------------------------------------------
function httpsOrNull(raw: string, max: number): string | null | undefined {
  // undefined = invalid, null = empty, string = ok
  if (!raw) return null;
  if (raw.length > max) return undefined;
  try {
    return new URL(raw).protocol === "https:" ? raw : undefined;
  } catch {
    return undefined;
  }
}

interface ParsedWork {
  title: string;
  description: string;
  youtube_url: string | null;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
  images: string[];
}

function readWork(fd: FormData): ParsedWork | string {
  const title = str(fd, "title");
  if (!title) return "Title is required.";
  if (title.length > 120) return "Title is too long (max 120).";

  const description = str(fd, "description");
  if (description.length > 2000) return "Description is too long (max 2000).";

  // YouTube: any youtube / youtu.be link; stored as given (https), embedded by video id.
  let youtube: string | null = null;
  const ytRaw = str(fd, "youtube_url");
  if (ytRaw) {
    if (!extractYouTubeId(ytRaw)) return "That does not look like a YouTube link.";
    const normalized = ytRaw.startsWith("http") ? ytRaw : `https://${ytRaw}`;
    const ok = httpsOrNull(normalized, 300);
    if (!ok) return "YouTube link must start with https:// and be under 300 characters.";
    youtube = ok;
  }

  const link = httpsOrNull(str(fd, "link_url"), 500);
  if (link === undefined) return "Project link must be a valid https:// address (max 500 characters).";

  const seen = new Set<string>();
  const images: string[] = [];
  for (const v of fd.getAll("image_url")) {
    const url = typeof v === "string" ? v.trim() : "";
    if (!url) continue;
    if (url.length > 1000) return "An image link is too long (max 1000 characters).";
    if (httpsOrNull(url, 1000) === undefined) return `Image links must start with https:// (check: ${url.slice(0, 40)}).`;
    if (!seen.has(url)) {
      seen.add(url);
      images.push(url);
    }
  }
  if (images.length > MAX_IMAGES) return `You can add up to ${MAX_IMAGES} images per work.`;

  return {
    title,
    description,
    youtube_url: youtube,
    link_url: link,
    is_active: fd.get("is_active") === "on",
    sort_order: int(fd, "sort_order", { min: 0, max: 9999, fallback: 0 }),
    images,
  };
}

async function replaceWorkImages(supabase: SupabaseClient, workId: string, urls: string[]) {
  const { error } = await supabase.rpc("replace_creator_work_images", { p_work: workId, p_urls: urls });
  return error ?? null;
}

export async function saveWork(formData: FormData): Promise<ActionResult> {
  const ctx = await getCreatorContext();
  if (!ctx) return bad("Please sign in again.");

  const parsed = readWork(formData);
  if (typeof parsed === "string") return bad(parsed);
  const { images, ...fields } = parsed;

  const id = str(formData, "id");
  if (id && !isUuid(id)) return bad("Invalid work.");

  if (id) {
    const { data, error } = await ctx.supabase
      .from("creator_works")
      .update(fields)
      .eq("id", id)
      .eq("user_id", ctx.userId)
      .select("id");
    if (error) return bad(dbError(error));
    if (!data || data.length === 0) return bad("Work not found.");

    const imgErr = await replaceWorkImages(ctx.supabase, id, images);
    if (imgErr) return bad(dbError(imgErr));

    refresh(ctx.username);
    return { success: true };
  }

  const { data: created, error } = await ctx.supabase
    .from("creator_works")
    .insert({ ...fields, user_id: ctx.userId })
    .select("id")
    .single();
  if (error || !created) return bad(error ? dbError(error) : "Could not save the work.");

  if (images.length > 0) {
    const imgErr = await replaceWorkImages(ctx.supabase, created.id as string, images);
    if (imgErr) {
      await ctx.supabase.from("creator_works").delete().eq("id", created.id).eq("user_id", ctx.userId);
      return bad(dbError(imgErr));
    }
  }

  refresh(ctx.username);
  redirect("/dashboard/creator/works");
}

export async function setWorkActive(id: string, active: boolean): Promise<ActionResult> {
  const ctx = await getCreatorContext();
  if (!ctx) return bad("Please sign in again.");
  if (!isUuid(id)) return bad("Invalid work.");

  const { data, error } = await ctx.supabase
    .from("creator_works")
    .update({ is_active: active })
    .eq("id", id)
    .eq("user_id", ctx.userId)
    .select("id");
  if (error) return bad(dbError(error));
  if (!data || data.length === 0) return bad("Work not found.");

  refresh(ctx.username);
  return { success: true };
}

export async function deleteWork(id: string): Promise<ActionResult> {
  const ctx = await getCreatorContext();
  if (!ctx) return bad("Please sign in again.");
  if (!isUuid(id)) return bad("Invalid work.");

  const { error } = await ctx.supabase.from("creator_works").delete().eq("id", id).eq("user_id", ctx.userId);
  if (error) return bad(dbError(error));

  refresh(ctx.username);
  return { success: true };
}

// ---------------------------------------------------------------
// Pricing plans (display only: the public button opens WhatsApp, there is no checkout)
// ---------------------------------------------------------------
export async function savePlan(formData: FormData): Promise<ActionResult> {
  const ctx = await getCreatorContext();
  if (!ctx) return bad("Please sign in again.");

  const name = str(formData, "name");
  if (!name) return bad("Plan name is required.");
  if (name.length > 60) return bad("Plan name is too long (max 60).");

  const price_text = str(formData, "price_text");
  if (price_text.length > 40) return bad("Price text is too long (max 40).");

  const tagline = str(formData, "tagline");
  if (tagline.length > 200) return bad("Short description is too long (max 200).");

  const features = str(formData, "features");
  if (features.length > 1200) return bad("Features are too long (max 1200 characters).");
  if (features.split(/\r?\n/).filter((l) => l.trim()).length > 12) return bad("Add up to 12 feature lines.");

  const cta_label = str(formData, "cta_label") || "Get started";
  if (cta_label.length > 30) return bad("Button text is too long (max 30).");

  const fields = {
    name,
    price_text,
    tagline,
    features,
    cta_label,
    is_featured: formData.get("is_featured") === "on",
    is_active: formData.get("is_active") === "on",
    sort_order: int(formData, "sort_order", { min: 0, max: 9999, fallback: 0 }),
  };

  const id = str(formData, "id");
  if (id && !isUuid(id)) return bad("Invalid plan.");

  if (id) {
    const { data, error } = await ctx.supabase
      .from("creator_plans")
      .update(fields)
      .eq("id", id)
      .eq("user_id", ctx.userId)
      .select("id");
    if (error) return bad(dbError(error));
    if (!data || data.length === 0) return bad("Plan not found.");
  } else {
    const { error } = await ctx.supabase.from("creator_plans").insert({ ...fields, user_id: ctx.userId });
    if (error) return bad(dbError(error));
  }

  refresh(ctx.username);
  return { success: true };
}

export async function deletePlan(id: string): Promise<ActionResult> {
  const ctx = await getCreatorContext();
  if (!ctx) return bad("Please sign in again.");
  if (!isUuid(id)) return bad("Invalid plan.");

  const { error } = await ctx.supabase.from("creator_plans").delete().eq("id", id).eq("user_id", ctx.userId);
  if (error) return bad(dbError(error));

  refresh(ctx.username);
  return { success: true };
}

// ---------------------------------------------------------------
// Latest YouTube videos (Home)
// ---------------------------------------------------------------
export async function addVideo(formData: FormData): Promise<ActionResult> {
  const ctx = await getCreatorContext();
  if (!ctx) return bad("Please sign in again.");

  const raw = str(formData, "url");
  const id = extractYouTubeId(raw);
  if (!id) return bad("Paste a YouTube video link (youtube.com or youtu.be).");
  const title = str(formData, "title");
  if (title.length > 100) return bad("Title is too long (max 100).");

  // Store a clean canonical link, so the DB check (https youtube) always passes.
  const url = `https://www.youtube.com/watch?v=${id}`;

  const { data: last } = await ctx.supabase
    .from("creator_videos")
    .select("sort_order")
    .eq("user_id", ctx.userId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const next = ((last?.[0]?.sort_order as number | undefined) ?? -1) + 1;

  const { error } = await ctx.supabase.from("creator_videos").insert({ user_id: ctx.userId, url, title, sort_order: next });
  if (error) return bad(dbError(error));

  refresh(ctx.username);
  return { success: true };
}

export async function deleteVideo(id: string): Promise<ActionResult> {
  const ctx = await getCreatorContext();
  if (!ctx) return bad("Please sign in again.");
  if (!isUuid(id)) return bad("Invalid video.");

  const { error } = await ctx.supabase.from("creator_videos").delete().eq("id", id).eq("user_id", ctx.userId);
  if (error) return bad(dbError(error));

  refresh(ctx.username);
  return { success: true };
}
