import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { getPublicProfile } from "@/lib/store/data";
import { DEFAULT_APPEARANCE, getPreset } from "./appearance";
import { parseCreatorSettings, type CreatorSettingsView } from "./links";
import type { PublicProfile, ProfileLink } from "@/types/database";
import type { CreatorPlan, CreatorVideo, CreatorWork, CreatorWorkImage } from "@/types/creator";

/**
 * Public (anonymous) reads for the creator page: /[username], /works, /pricing.
 * Cookie-less client like the store, so pages stay cacheable (ISR); the 0009 public RLS policies
 * decide what is visible (active rows of public CREATOR profiles only).
 */

export interface CreatorView {
  profile: PublicProfile;
  displayName: string;
  settings: CreatorSettingsView & { appearance: string }; // appearance always a valid preset id
}

/** Null for unknown users AND for business accounts (they have a store, not a creator page). */
export const getCreatorView = cache(async (raw: string): Promise<CreatorView | null> => {
  const profile = await getPublicProfile(raw);
  if (!profile || profile.role !== "creator") return null;

  const supabase = createPublicClient();
  // select("*"): still renders (with defaults) on a database where 0009 has not been run yet.
  const { data } = await supabase.from("creator_settings").select("*").eq("profile_id", profile.id).maybeSingle();
  const settings = parseCreatorSettings(data as Record<string, unknown> | null, DEFAULT_APPEARANCE);
  settings.appearance = getPreset(settings.appearance).id;

  return {
    profile,
    displayName: profile.full_name?.trim() || `@${profile.username}`,
    settings,
  };
});

export async function getCreatorLinks(profileId: string): Promise<ProfileLink[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("profile_links")
    .select("*")
    .eq("user_id", profileId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  return (data ?? []) as ProfileLink[];
}

type WorkRow = Omit<CreatorWork, "images"> & { creator_work_images: CreatorWorkImage[] | null };

export function mapWork(row: WorkRow): CreatorWork {
  const { creator_work_images, ...work } = row;
  const images = [...(creator_work_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  return { ...work, images };
}

export const WORK_SELECT = "*, creator_work_images(id, work_id, url, alt, sort_order, created_at)";

export async function getCreatorWorks(profileId: string): Promise<CreatorWork[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("creator_works")
    .select(WORK_SELECT)
    .eq("user_id", profileId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  return ((data ?? []) as unknown as WorkRow[]).map(mapWork);
}

export async function getCreatorPlans(profileId: string): Promise<CreatorPlan[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("creator_plans")
    .select("*")
    .eq("user_id", profileId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  return (data ?? []) as CreatorPlan[];
}

export async function getCreatorVideos(profileId: string): Promise<CreatorVideo[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("creator_videos")
    .select("*")
    .eq("user_id", profileId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  return (data ?? []) as CreatorVideo[];
}
