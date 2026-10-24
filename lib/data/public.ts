import { createPublicClient } from "@/lib/supabase/public";
import { parseSettings } from "@/lib/data/settings";
import {
  type Announcement,
  type Faq,
  type Guide,
  type SiteSettings,
  type Tool,
  type TrendingItem,
} from "@/types/database";

export async function getTools(): Promise<Tool[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("tools")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as Tool[];
}

export async function getToolBySlug(slug: string): Promise<Tool | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("tools")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return (data as Tool | null) ?? null;
}

export async function getTrending(): Promise<TrendingItem[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("trending_items")
    .select("*")
    .eq("is_active", true)
    .order("week_label", { ascending: false })
    .order("sort_order", { ascending: true });
  return (data ?? []) as TrendingItem[];
}

export async function getGuides(): Promise<Guide[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("guides")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return (data ?? []) as Guide[];
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("guides")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return (data as Guide | null) ?? null;
}

export async function getFaqs(): Promise<Faq[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as Faq[];
}

export async function getSettings(): Promise<SiteSettings> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("site_settings").select("key, value");
  return parseSettings(data);
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1);
  return (data ?? []) as Announcement[];
}
