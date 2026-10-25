import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { getUserAccess } from "@/lib/auth/user-access";
import { homeForRole } from "@/lib/auth/roles";
import { AuthCard } from "@/components/account/auth-card";
import { OnboardingForm } from "@/components/account/onboarding-form";

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

  // Role routing: each role has exactly one dashboard (creator -> /dashboard/creator, business -> /dashboard/business).
  // The guards inside those dashboards send anybody who opens the wrong one back to their own.
  const home = homeForRole(profile.role);
  if (home !== "/dashboard") redirect(home);

  // Defensive: an unexpected role value must never cause a redirect loop back to this page.
  return (
    <AuthCard title="Account type not supported">
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-gray-700">We could not match this account to a dashboard. Please contact support.</p>
        <SignOut />
      </div>
    </AuthCard>
  );
}
