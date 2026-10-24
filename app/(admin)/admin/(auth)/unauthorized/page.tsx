import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { getAdminAccess } from "@/lib/auth/admin-access";

export const metadata = { title: "Not authorized" };

const REASONS = {
  not_admin: "This account does not have admin access.",
  blocked: "This account has been blocked.",
  no_profile: "No profile was found for this account.",
} as const;

export default async function UnauthorizedPage() {
  const access = await getAdminAccess();

  // Only signed-in, non-admin visitors belong here.
  if (access.status === "anonymous") redirect("/admin/login");
  if (access.status === "admin") redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <ShieldAlert className="h-7 w-7 text-red-600" />
        </div>
        <h1 className="text-lg font-bold">Not authorized</h1>
        <p className="text-sm text-muted-foreground">{REASONS[access.reason]}</p>
        {access.email && (
          <p className="break-all text-xs text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{access.email}</span>
          </p>
        )}
        <form action="/auth/signout" method="post" className="mt-2 w-full">
          <button
            type="submit"
            className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Sign out and use another account
          </button>
        </form>
      </div>
    </div>
  );
}
