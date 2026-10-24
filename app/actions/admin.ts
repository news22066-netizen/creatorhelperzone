"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminContext, UNAUTHORIZED } from "@/lib/auth/require-admin";
import type { ActionResult } from "@/lib/actions/types";
import { extractYouTubeId } from "@/lib/utils/youtube";
import { currentWeekLabel } from "@/lib/constants";
import { slugify } from "@/lib/utils/username";
import {
  GRADIENT_RE,
  SLUG_RE,
  WEEK_LABEL_RE,
  friendlyDbError,
  int,
  isHttpUrl,
  isUuid,
  str,
} from "@/lib/utils/validate";
import type { PublishStatus, TrendingKind } from "@/types/database";

/**
 * SECURITY MODEL
 * Every exported action starts with getAdminContext(), which re-checks on the
 * server that the caller is a signed-in, non-blocked admin. Client-side
 * guards are UX only. Row Level Security and the DB trigger in
 * 0002_security.sql enforce the same rules a second time.
 */

const PUBLISH_STATUSES: PublishStatus[] = ["draft", "published", "unpublished"];
const TRENDING_KINDS: TrendingKind[] = ["video", "keyword", "thumbnail_idea"];

function bad(error: string): ActionResult {
  return { error };
}

// ---------------------------------------------------------------
// Tools
// ---------------------------------------------------------------
export async function upsertTool(formData: FormData): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return bad(UNAUTHORIZED);

  const id = str(formData, "id");
  if (id && !isUuid(id)) return bad("Invalid tool id.");

  const name = str(formData, "name");
  const description = str(formData, "description");
  const url = str(formData, "url");
  const icon = str(formData, "icon") || "🔧";
  const gradient = str(formData, "gradient") || "from-blue-500 to-indigo-500";
  const isActive = formData.get("is_active") === "on";
  const slug = slugify(str(formData, "slug") || name);
  const content = String(formData.get("content") ?? "").replace(/\r\n?/g, "\n").trim();
  const metaTitle = str(formData, "meta_title");
  const metaDescription = str(formData, "meta_description");

  if (!name || !url) return bad("Name and URL are required.");
  if (name.length > 120) return bad("Name is too long (max 120).");
  if (description.length > 500) return bad("Description is too long (max 500).");
  if (!isHttpUrl(url)) return bad("URL must start with http:// or https://");
  if (icon.startsWith("http") ? !isHttpUrl(icon) : icon.length > 16)
    return bad("Icon must be a short emoji or an http(s) image link.");
  if (!GRADIENT_RE.test(gradient)) return bad("Gradient contains invalid characters.");
  if (content.length > 100_000) return bad("Content is too long (max 100,000 characters).");
  if (metaTitle.length > 120) return bad("Meta title is too long (max 120).");
  if (metaDescription.length > 300) return bad("Meta description is too long (max 300).");

  // Slug: required for active tools; always valid + unique when present.
  if (slug && !SLUG_RE.test(slug))
    return bad("Slug may only contain English letters, numbers and hyphens.");
  if (!slug && isActive)
    return bad("Slug is required for active tools (use English letters, numbers and hyphens).");

  if (slug) {
    let q = ctx.supabase.from("tools").select("id").eq("slug", slug).limit(1);
    if (id) q = q.neq("id", id);
    const { data: clash, error: clashError } = await q;
    if (clashError) return bad(friendlyDbError(clashError));
    if (clash && clash.length > 0) return bad(`The slug "${slug}" is already used by another tool.`);
  }

  // Remember the previous slug so its cached page can be refreshed/removed.
  let previousSlug: string | null = null;
  if (id) {
    const { data: existing } = await ctx.supabase
      .from("tools")
      .select("slug")
      .eq("id", id)
      .maybeSingle();
    previousSlug = existing?.slug ?? null;
  }

  const payload = {
    name,
    slug: slug || null,
    description,
    url,
    icon,
    gradient,
    content,
    meta_title: metaTitle || null,
    meta_description: metaDescription || null,
    sort_order: int(formData, "sort_order"),
    is_active: isActive,
  };

  const { error } = id
    ? await ctx.supabase.from("tools").update(payload).eq("id", id)
    : await ctx.supabase.from("tools").insert(payload);
  if (error) {
    // Race: another save took the slug between our check and the write.
    if (error.code === "23505") return bad(`The slug "${slug}" is already used by another tool.`);
    return bad(friendlyDbError(error));
  }

  revalidateToolPages(slug, previousSlug);
  return { success: true };
}

export async function deleteTool(formData: FormData): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return bad(UNAUTHORIZED);

  const id = str(formData, "id");
  if (!isUuid(id)) return bad("Invalid tool id.");

  const { data: existing } = await ctx.supabase
    .from("tools")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await ctx.supabase.from("tools").delete().eq("id", id);
  if (error) return bad(friendlyDbError(error));

  revalidateToolPages(null, existing?.slug ?? null);
  return { success: true };
}

function revalidateToolPages(slug: string | null, previousSlug: string | null) {
  revalidatePath("/admin/tools");
  revalidatePath("/tools");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  for (const s of new Set([slug, previousSlug])) {
    if (s) revalidatePath(`/tools/${s}`);
  }
}

// ---------------------------------------------------------------
// Trending
// ---------------------------------------------------------------
export async function upsertTrendingItem(formData: FormData): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return bad(UNAUTHORIZED);

  const id = str(formData, "id");
  if (id && !isUuid(id)) return bad("Invalid item id.");

  const kind = str(formData, "kind") as TrendingKind;
  if (!TRENDING_KINDS.includes(kind)) return bad("Invalid item type.");

  const title = str(formData, "title");
  const youtubeUrl = str(formData, "youtube_url");
  const youtubeId = extractYouTubeId(youtubeUrl);
  const week = str(formData, "week_label") || currentWeekLabel();

  if (!WEEK_LABEL_RE.test(week)) return bad("Week label must look like 2026-W43.");
  if (title.length > 200) return bad("Title is too long (max 200).");

  if (kind === "video") {
    if (!youtubeId) return bad("Invalid YouTube URL.");
    if (!title) return bad("Title is required for videos.");
  } else if (!title) {
    return bad("Text is required.");
  }

  const payload = {
    kind,
    title,
    youtube_url: kind === "video" ? youtubeUrl : null,
    youtube_id: kind === "video" ? youtubeId : null,
    week_label: week,
    sort_order: int(formData, "sort_order"),
    is_active: formData.get("is_active") === "on",
  };

  const { error } = id
    ? await ctx.supabase.from("trending_items").update(payload).eq("id", id)
    : await ctx.supabase.from("trending_items").insert(payload);
  if (error) return bad(friendlyDbError(error));

  revalidatePath("/admin/trending");
  revalidatePath("/trending");
  return { success: true };
}

export async function deleteTrendingItem(formData: FormData): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return bad(UNAUTHORIZED);

  const id = str(formData, "id");
  if (!isUuid(id)) return bad("Invalid item id.");

  const { error } = await ctx.supabase.from("trending_items").delete().eq("id", id);
  if (error) return bad(friendlyDbError(error));

  revalidatePath("/admin/trending");
  revalidatePath("/trending");
  return { success: true };
}

// ---------------------------------------------------------------
// Guides
// ---------------------------------------------------------------
export async function upsertGuide(formData: FormData): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return bad(UNAUTHORIZED);

  const id = str(formData, "id");
  if (id && !isUuid(id)) return bad("Invalid guide id.");

  const title = str(formData, "title");
  const slug = slugify(str(formData, "slug") || title);
  const status = str(formData, "status") as PublishStatus;
  const coverUrl = str(formData, "cover_url");
  const content = String(formData.get("content") ?? "");

  if (!title) return bad("Title is required.");
  if (title.length > 200) return bad("Title is too long (max 200).");
  if (!slug || !SLUG_RE.test(slug))
    return bad("Slug is required (use English letters, numbers and hyphens).");
  if (!PUBLISH_STATUSES.includes(status)) return bad("Invalid status.");
  if (!content.trim()) return bad("Content is required.");
  if (content.length > 100_000) return bad("Content is too long.");
  if (coverUrl && !isHttpUrl(coverUrl)) return bad("Cover image must be an http(s) link.");

  // Keep the original publish date stable across edits (matters for SEO).
  let publishedAt: string | null = null;
  if (id) {
    const { data: existing } = await ctx.supabase
      .from("guides")
      .select("published_at")
      .eq("id", id)
      .maybeSingle();
    publishedAt = existing?.published_at ?? null;
  }
  if (status === "published" && !publishedAt) publishedAt = new Date().toISOString();

  const payload = {
    title,
    slug,
    excerpt: str(formData, "excerpt").slice(0, 300),
    content,
    cover_url: coverUrl || null,
    status,
    published_at: publishedAt,
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await ctx.supabase.from("guides").update(payload).eq("id", id)
    : await ctx.supabase.from("guides").insert(payload);
  if (error) return bad(friendlyDbError(error));

  revalidatePath("/admin/guides");
  revalidatePath("/guides");
  revalidatePath("/guides/[slug]", "page");
  redirect("/admin/guides");
}

export async function deleteGuide(formData: FormData): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return bad(UNAUTHORIZED);

  const id = str(formData, "id");
  if (!isUuid(id)) return bad("Invalid guide id.");

  const { error } = await ctx.supabase.from("guides").delete().eq("id", id);
  if (error) return bad(friendlyDbError(error));

  revalidatePath("/admin/guides");
  revalidatePath("/guides");
  revalidatePath("/guides/[slug]", "page");
  return { success: true };
}

// ---------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------
export async function upsertFaq(formData: FormData): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return bad(UNAUTHORIZED);

  const id = str(formData, "id");
  if (id && !isUuid(id)) return bad("Invalid FAQ id.");

  const question = str(formData, "question");
  const answer = str(formData, "answer");
  if (!question || !answer) return bad("Question and answer are required.");
  if (question.length > 300) return bad("Question is too long (max 300).");
  if (answer.length > 5000) return bad("Answer is too long (max 5000).");

  const payload = {
    question,
    answer,
    sort_order: int(formData, "sort_order"),
    is_active: formData.get("is_active") === "on",
  };

  const { error } = id
    ? await ctx.supabase.from("faqs").update(payload).eq("id", id)
    : await ctx.supabase.from("faqs").insert(payload);
  if (error) return bad(friendlyDbError(error));

  revalidatePath("/admin/faqs");
  revalidatePath("/faq");
  return { success: true };
}

export async function deleteFaq(formData: FormData): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return bad(UNAUTHORIZED);

  const id = str(formData, "id");
  if (!isUuid(id)) return bad("Invalid FAQ id.");

  const { error } = await ctx.supabase.from("faqs").delete().eq("id", id);
  if (error) return bad(friendlyDbError(error));

  revalidatePath("/admin/faqs");
  revalidatePath("/faq");
  return { success: true };
}

// ---------------------------------------------------------------
// Settings + Announcements
// ---------------------------------------------------------------
export async function updateSettings(formData: FormData): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return bad(UNAUTHORIZED);

  // Whitelist: only these keys can be written from this form.
  const rows = [
    { key: "store_enabled", value: formData.get("store_enabled") === "on" },
    { key: "collaboration_enabled", value: formData.get("collaboration_enabled") === "on" },
  ];

  const { error } = await ctx.supabase.from("site_settings").upsert(rows);
  if (error) return bad(friendlyDbError(error));

  revalidatePath("/admin/settings");
  revalidatePath("/store");
  revalidatePath("/collaboration");
  return { success: true };
}

export async function upsertAnnouncement(formData: FormData): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return bad(UNAUTHORIZED);

  const title = str(formData, "title");
  const body = str(formData, "body");
  if (!title || !body) return bad("Title and body are required.");
  if (title.length > 120) return bad("Title is too long (max 120).");
  if (body.length > 600) return bad("Message is too long (max 600).");

  // Only the newest announcement shows, so deactivate the live ones first.
  const { error: offError } = await ctx.supabase
    .from("announcements")
    .update({ is_active: false })
    .eq("is_active", true);
  if (offError) return bad(friendlyDbError(offError));

  const { error } = await ctx.supabase
    .from("announcements")
    .insert({ title, body, is_active: true });
  if (error) return bad(friendlyDbError(error));

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteAnnouncement(formData: FormData): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return bad(UNAUTHORIZED);

  const id = str(formData, "id");
  if (!isUuid(id)) return bad("Invalid announcement id.");

  const { error } = await ctx.supabase.from("announcements").delete().eq("id", id);
  if (error) return bad(friendlyDbError(error));

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  return { success: true };
}

// ---------------------------------------------------------------
// Users
// ---------------------------------------------------------------
async function updateUserFlag(
  formData: FormData,
  flag: "is_blocked" | "is_verified",
  value: boolean
): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return bad(UNAUTHORIZED);

  const id = str(formData, "id");
  if (!isUuid(id)) return bad("Invalid user id.");

  if (flag === "is_blocked" && value) {
    if (id === ctx.adminId) return bad("You cannot block yourself.");

    const { data: target } = await ctx.supabase
      .from("profiles")
      .select("role")
      .eq("id", id)
      .maybeSingle();
    if (!target) return bad("User not found.");
    if (target.role === "admin")
      return bad("Admins cannot be blocked here. Demote the account in the database first.");
  }

  const { data, error } = await ctx.supabase
    .from("profiles")
    .update({ [flag]: value })
    .eq("id", id)
    .select("id");
  if (error) return bad(friendlyDbError(error));
  if (!data || data.length === 0) return bad("User not found or update not permitted.");

  revalidatePath("/admin/users");
  return { success: true };
}

export async function setUserBlocked(formData: FormData): Promise<ActionResult> {
  return updateUserFlag(formData, "is_blocked", str(formData, "blocked") === "true");
}

export async function setUserVerified(formData: FormData): Promise<ActionResult> {
  return updateUserFlag(formData, "is_verified", str(formData, "verified") === "true");
}
