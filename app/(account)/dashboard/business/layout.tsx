import type { ReactNode } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireBusiness } from "@/lib/auth/business-access";
import { BusinessNav } from "@/components/business/business-nav";

/** Business dashboard shell: header + section tabs. Nested under the existing (account) layout. */
export default async function BusinessDashboardLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireBusiness();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6">
      <header className="flex items-center justify-between gap-3">
        <Link href="/dashboard/business" className="text-lg font-extrabold tracking-tight">
          CreatorHub<span className="text-brand"> BD</span>
          <span className="ml-2 rounded-full bg-brand-light/60 px-2 py-0.5 align-middle text-[10px] font-extrabold uppercase tracking-wide">
            Store
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/${profile.username}`}
            target="_blank"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input px-3 text-sm font-semibold hover:bg-brand-light/20"
          >
            <ExternalLink className="h-4 w-4" /> View store
          </Link>
          <form action="/auth/signout" method="post">
            <input type="hidden" name="to" value="login" />
            <button
              type="submit"
              className="inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-semibold hover:bg-brand-light/20"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <BusinessNav />
      {children}
    </div>
  );
}
