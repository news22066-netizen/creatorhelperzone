import { DEFAULT_SETTINGS, type SiteSettings } from "@/types/database";

export interface SettingRow {
  key: string;
  value: unknown;
}

/** Shared by the public site and the admin Settings page. */
export function parseSettings(rows: SettingRow[] | null | undefined): SiteSettings {
  const map = new Map<string, unknown>();
  for (const r of rows ?? []) map.set(r.key, r.value);
  const siteName = map.get("site_name");
  return {
    store_enabled: map.get("store_enabled") === true,
    collaboration_enabled: map.get("collaboration_enabled") === true,
    site_name: typeof siteName === "string" ? siteName : DEFAULT_SETTINGS.site_name,
  };
}
