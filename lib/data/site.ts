import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { parseSettings } from "@/lib/data/settings";
import { parseLogoUrl } from "@/lib/site/socials";
import type { SiteSocialKey } from "@/types/database";

export interface SiteBrand {
  /** "" = show the text mark. */
  logoUrl: string;
  socials: Partial<Record<SiteSocialKey, string>>;
}

/**
 * Public header/footer branding: the admin setting wins, NEXT_PUBLIC_LOGO_URL is the fallback.
 * Never throws: if the table/rows are unavailable the site simply shows the text mark and no icons.
 * React cache() = one query per render even though both the layout and the footer ask.
 */
export const getSiteBrand = cache(async (): Promise<SiteBrand> => {
  const envLogo = parseLogoUrl(process.env.NEXT_PUBLIC_LOGO_URL ?? "");
  const fallback: SiteBrand = { logoUrl: envLogo.ok ? envLogo.value : "", socials: {} };
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["logo_url", "social_links"]);
    if (error) return fallback;
    const s = parseSettings(data);
    return { logoUrl: s.logo_url || fallback.logoUrl, socials: s.social_links };
  } catch {
    return fallback;
  }
});
