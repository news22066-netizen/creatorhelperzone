import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserAccess } from "@/lib/auth/user-access";
import { AuthCard } from "@/components/account/auth-card";
import { OnboardingForm } from "@/components/account/onboarding-form";
import { ProfileForm } from "@/components/account/profile-form";
import { LinksManager } from "@/components/account/links-manager";
import { SITE_URL } from "@/lib/constants";
import type { ProfileLink } from "@/types/database";

export const metadata = { title: "Dashboard" };

function SignOut({ className = "" }: { className?: string }) {
  return (
    <form action="/auth/signout" method="post" className={className}>
      <input type="hidden" name="to" value="login" />
      <button
        type="submit"
        className="inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-semibold hover:bg-brand-light/20"
      >
        Sign out
      </button>
    </form>
  );
}

export default async function DashboardPage() {
  const access = await getUserAccess();

  if (access.status === "anonymous") redirect("/login?next=/dashboard");
  if (access.status === "admin") redirect("/admin");

  if (access.status === "blocked" || access.status === "no_profile") {
    return (
      <AuthCard title={access.status === "blocked" ? "Account blocked" : "Profile not found"}>
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <ShieldAlert className="h-7 w-7 text-red-600" />
          </span>
          <p className="text-sm text-gray-700">
            {access.status === "blocked"
              ? "This account has been blocked. Contact support if you think this is a mistake."
              : "We could not find a profile for this account."}
          </p>
          <SignOut />
        </div>
      </AuthCard>
    );
  }

  const { profile } = access;

  // First visit (e.g. Google sign-up): choose account type + username.
  if (!profile.username) {
    return (
      <AuthCard
        title="Finish setting up"
        subtitle="Choose your account type and username. Your username becomes your page address and can't be changed later."
        footer={<SignOut />}
      >
        <OnboardingForm
          initialRole={profile.role === "business" ? "business" : "creator"}
          initialName={profile.full_name ?? ""}
        />
      </AuthCard>
    );
  }

  // Business accounts manage a store (products, theme, privacy) instead of a links list.
  if (profile.role === "business") redirect("/dashboard/business");

  const supabase = await createClient();
  const { data } = await supabase
    .from("profile_links")
    .select("*")
    .eq("user_id", profile.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const links = (data ?? []) as ProfileLink[];

  const pageHref = `/${profile.username}`;
  const pageLabel = `${SITE_URL.replace(/^https?:\/\//, "")}${pageHref}`;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6">
      <header className="flex items-center justify-between gap-3">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          CreatorHub<span className="text-brand"> BD</span>
        </Link>
        <SignOut />
      </header>

      <section className="rounded-3xl border border-brand-light/70 bg-brand-light/15 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-extrabold">@{profile.username}</h1>
          <span className="rounded-full bg-brand-light/60 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide">
            {profile.role}
          </span>
        </div>
        <p className="mt-1 break-all text-sm text-gray-600">{pageLabel}</p>
        <Link
          href={pageHref}
          target="_blank"
          className="mt-3 inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-white hover:bg-brand-deep"
        >
          <ExternalLink className="h-4 w-4" />
          View my public page
        </Link>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold">Profile</h2>
        <ProfileForm
          fullName={profile.full_name ?? ""}
          bio={profile.bio ?? ""}
          avatarUrl={profile.avatar_url ?? ""}
          whatsapp={profile.whatsapp ?? ""}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold">Links</h2>
        <LinksManager links={links} />
      </section>
    </div>
  );
}
