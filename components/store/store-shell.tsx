import type { ReactNode } from "react";
import { SITE_URL } from "@/lib/constants";
import { themeToCssVars } from "@/lib/store/theme";
import type { StoreView } from "@/lib/store/data";
import { StoreHeader } from "./store-header";
import { StoreBottomNav } from "./store-bottom-nav";

/**
 * Theme variables + header + bottom nav for the business store branch of /[username].
 * A component (not app/[username]/layout.tsx) so the creator linktree page is never wrapped by it.
 */
export function StoreShell({ view, children }: { view: StoreView; children: ReactNode }) {
  const { profile } = view;
  const themeStyle = themeToCssVars(view.theme);
  return (
    <div style={themeStyle} className="min-h-dvh bg-store-bg text-store-text">
      <StoreHeader
        username={profile.username}
        displayName={view.displayName}
        avatarUrl={profile.avatar_url}
        shareUrl={`${SITE_URL}/${profile.username}`}
        showSearch={view.sections.show_search_on_shop}
        themeStyle={themeStyle}
      />
      <main className="mx-auto w-full max-w-md px-4 pb-28 pt-4 md:max-w-3xl">{children}</main>
      <StoreBottomNav username={profile.username} />
    </div>
  );
}
