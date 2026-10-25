import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getAdminAccess } from "@/lib/auth/admin-access";
import { safeAdminNext } from "@/lib/auth/safe-next";

export const metadata = { title: "Admin Login" };

const ERROR_MESSAGES: Record<string, string> = {
  oauth_denied: "Google sign-in was cancelled or denied.",
  oauth_missing_code: "Google sign-in did not complete. Please try again.",
  oauth_failed: "Google sign-in failed. Please try again.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const target = safeAdminNext(next);

  // Already signed in? Send them where they belong instead of showing the form.
  const access = await getAdminAccess();
  if (access.status === "admin") redirect(target);
  if (access.status === "forbidden") redirect("/admin/unauthorized");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-lg font-bold text-blue-600">CreatorHub BD</p>
          <p className="text-sm text-muted-foreground">Admin Panel — sign in</p>
        </div>
        <LoginForm next={target} initialError={error ? ERROR_MESSAGES[error] ?? null : null} />
      </div>
    </div>
  );
}
