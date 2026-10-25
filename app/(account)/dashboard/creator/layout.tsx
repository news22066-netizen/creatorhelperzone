import type { ReactNode } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireCreator } from "@/lib/auth/creator-access";
import { CreatorNav } from "@/components/creator/creator-nav";

/**
 * Creator dashboard shell (mobile-native): slim header, content, bottom tab bar on phones and a pill
 * nav on wider screens. Creator accounts only: requireCreator() sends business accounts to /dashboard/business.
 * (Each page calls requireCreator() too: a layout alone is not re-run on client-side navigations.)
 */
export default async function CreatorDashboardLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireCreator();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-brand-light/60 bg-white px-4">
        <Link href="/dashboard/creator" className="text-lg font-extrabold tracking-tight">
          CreatorHub<span className="text-brand"> BD</span>
          <span className="ml-2 rounded-full bg-brand-light/60 px-2 py-0.5 align-middle text-[10px] font-extrabold uppercase tracking-wide">
            Creator
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/${profile.username}`}
            target="_blank"
            aria-label="View my public page"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-input px-3 text-sm font-semibold hover:bg-brand-light/20"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">View page</span>
          </Link>
          <form action="/auth/signout" method="post" className="hidden md:block">
            <input type="hidden" name="to" value="login" />
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-lg border border-input px-3 text-sm font-semibold hover:bg-brand-light/20"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <CreatorNav username={profile.username} />

      <div className="flex-1 px-4 pb-28 pt-4 md:pb-10">{children}</div>
    </div>
  );
}
