"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserAccess } from "@/lib/auth/user-access";
import type { ActionResult } from "@/lib/actions/types";
import { checkUsername, normalizeUsername } from "@/lib/utils/username";
import {
  friendlyDbError,
  isHttpUrl,
  isUuid,
  normalizeWhatsapp,
  str,
} from "@/lib/utils/validate";

/**
 * SECURITY MODEL
 * Every exported action starts with getMemberContext(): it re-checks on the
 * server that the caller is a signed-in, non-blocked creator/business.
 * All writes go through the user's own Supabase client, so RLS and the
 * triggers in 0004_profiles_links.sql enforce the same rules a second time
 * (own rows only, no role escalation, permanent username).
 */

const MAX_LINKS = 20;

function bad(error: string): ActionResult {
  return { error };
}

async function getMemberContext() {
  const access = await getUserAccess();
  if (access.status !== "member") return null;
  const supabase = await createClient();
  return { supabase, userId: access.profile.id, username: access.profile.username };
}

function refresh(username: string | null) {
  revalidatePath("/dashboard");
  // "layout" also refreshes /[username]/shop and /contact (business stores show name, bio, avatar, WhatsApp there)
  if (username) revalidatePath(`/${username}`, "layout");
}

/** "example.com" -> "https://example.com"; anything with another scheme is left for isHttpUrl to reject. */
function withScheme(raw: string): string {
  if (!raw) return raw;
  return /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
}

// ---------------------------------------------------------------
// Onboarding (Google sign-ups: choose account type + username once)
// ---------------------------------------------------------------
export async function completeOnboarding(formData: FormData): Promise<ActionResult> {
  const ctx = await getMemberContext();
  if (!ctx) return bad("Please sign in again.");
  if (ctx.username) return bad("Your username is already set.");

  const role = str(formData, "role");
  if (role !== "creator" && role !== "business") return bad("Choose Creator or Business.");

  const username = normalizeUsername(str(formData, "username"));
  const check = checkUsername(username);
  if (check === "invalid")
    return bad("Username must be 3–30 characters: English letters, numbers and underscore.");
  if (check === "reserved") return bad("That username is reserved. Please choose another.");

  const fullName = str(formData, "full_name");
  if (fullName.length > 60) return bad("Name is too long (max 60).");

  const patch: Record<string, string> = { role, username };
  if (fullName) patch.full_name = fullName;

  const { data, error } = await ctx.supabase
    .from("profiles")
    .update(patch)
    .eq("id", ctx.userId)
    .is("username", null)
    .select("id");
  if (error) {
    if (error.code === "23505") return bad("That username is already taken.");
    return bad(friendlyDbError(error));
  }
  if (!data || data.length === 0) return bad("Could not save. Please try again.");

  refresh(username);
  return { success: true };
}

// ---------------------------------------------------------------
// Profile
// ---------------------------------------------------------------
export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const ctx = await getMemberContext();
  if (!ctx) return bad("Please sign in again.");

  const fullName = str(formData, "full_name");
  const bio = str(formData, "bio");
  const avatarUrl = str(formData, "avatar_url");
  const whatsapp = normalizeWhatsapp(str(formData, "whatsapp"));

  if (fullName.length > 60) return bad("Name is too long (max 60).");
  if (bio.length > 280) return bad("Bio is too long (max 280 characters).");
  if (avatarUrl && (!isHttpUrl(avatarUrl) || avatarUrl.length > 500))
    return bad("Avatar must be an http(s) image link (e.g. from imgbb).");
  if (whatsapp === null)
    return bad("WhatsApp number looks invalid. Example: 01712345678 or +8801712345678.");

  const { error } = await ctx.supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      bio: bio || null,
      avatar_url: avatarUrl || null,
      whatsapp: whatsapp || null,
    })
    .eq("id", ctx.userId);
  if (error) return bad(friendlyDbError(error));

  refresh(ctx.username);
  return { success: true };
}

// ---------------------------------------------------------------
// Links
// ---------------------------------------------------------------
function readLink(formData: FormData): { title: string; url: string } | string {
  const title = str(formData, "title");
  const url = withScheme(str(formData, "url"));
  if (!title) return "Title is required.";
  if (title.length > 80) return "Title is too long (max 80).";
  if (!url || !isHttpUrl(url) || url.length > 2000)
    return "URL must be a valid http(s) link.";
  return { title, url };
}

export async function addLink(formData: FormData): Promise<ActionResult> {
  const ctx = await getMemberContext();
  if (!ctx) return bad("Please sign in again.");

  const parsed = readLink(formData);
  if (typeof parsed === "string") return bad(parsed);

  const { data: existing, error: listError } = await ctx.supabase
    .from("profile_links")
    .select("sort_order")
    .eq("user_id", ctx.userId)
    .order("sort_order", { ascending: false });
  if (listError) return bad(friendlyDbError(listError));
  if ((existing?.length ?? 0) >= MAX_LINKS) return bad(`You can add up to ${MAX_LINKS} links.`);

  const next = (existing?.[0]?.sort_order ?? -1) + 1;
  const { error } = await ctx.supabase
    .from("profile_links")
    .insert({ user_id: ctx.userId, title: parsed.title, url: parsed.url, sort_order: next });
  if (error) return bad(friendlyDbError(error));

  refresh(ctx.username);
  return { success: true };
}

export async function updateLink(formData: FormData): Promise<ActionResult> {
  const ctx = await getMemberContext();
  if (!ctx) return bad("Please sign in again.");

  const id = str(formData, "id");
  if (!isUuid(id)) return bad("Invalid link.");
  const parsed = readLink(formData);
  if (typeof parsed === "string") return bad(parsed);

  const { data, error } = await ctx.supabase
    .from("profile_links")
    .update({ title: parsed.title, url: parsed.url })
    .eq("id", id)
    .eq("user_id", ctx.userId)
    .select("id");
  if (error) return bad(friendlyDbError(error));
  if (!data || data.length === 0) return bad("Link not found.");

  refresh(ctx.username);
  return { success: true };
}

export async function deleteLink(formData: FormData): Promise<ActionResult> {
  const ctx = await getMemberContext();
  if (!ctx) return bad("Please sign in again.");

  const id = str(formData, "id");
  if (!isUuid(id)) return bad("Invalid link.");

  const { error } = await ctx.supabase
    .from("profile_links")
    .delete()
    .eq("id", id)
    .eq("user_id", ctx.userId);
  if (error) return bad(friendlyDbError(error));

  refresh(ctx.username);
  return { success: true };
}

export async function moveLink(formData: FormData): Promise<ActionResult> {
  const ctx = await getMemberContext();
  if (!ctx) return bad("Please sign in again.");

  const id = str(formData, "id");
  const dir = str(formData, "dir");
  if (!isUuid(id)) return bad("Invalid link.");
  if (dir !== "up" && dir !== "down") return bad("Invalid direction.");

  const { data: links, error } = await ctx.supabase
    .from("profile_links")
    .select("id, sort_order")
    .eq("user_id", ctx.userId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) return bad(friendlyDbError(error));

  const order = (links ?? []).map((l) => l.id as string);
  const from = order.indexOf(id);
  if (from === -1) return bad("Link not found.");
  const to = dir === "up" ? from - 1 : from + 1;
  if (to < 0 || to >= order.length) return { success: true };

  [order[from], order[to]] = [order[to], order[from]];

  // Re-number 0..n-1 so ties can never make the order ambiguous.
  for (let i = 0; i < order.length; i++) {
    const current = links?.find((l) => l.id === order[i]);
    if (current && current.sort_order === i) continue;
    const { error: upErr } = await ctx.supabase
      .from("profile_links")
      .update({ sort_order: i })
      .eq("id", order[i])
      .eq("user_id", ctx.userId);
    if (upErr) return bad(friendlyDbError(upErr));
  }

  refresh(ctx.username);
  return { success: true };
}
