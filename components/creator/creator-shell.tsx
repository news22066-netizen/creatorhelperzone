import type { ReactNode } from "react";
import { appearanceVars } from "@/lib/creator/appearance";
import type { CreatorView } from "@/lib/creator/data";
import { PublicNav } from "./public-nav";

/**
 * Theme + bottom nav for the creator branch of /[username]. A component (not app/[username]/layout.tsx)
 * so the business store is never wrapped by it. Colors come from the creator's saved preset.
 */
export function CreatorShell({ view, children }: { view: CreatorView; children: ReactNode }) {
  return (
    <div style={appearanceVars(view.settings.appearance)} className="cp-page min-h-dvh">
      <main className="mx-auto w-full max-w-md px-4 pb-44 pt-8 md:max-w-xl">{children}</main>
      <PublicNav username={view.profile.username} />
    </div>
  );
}
