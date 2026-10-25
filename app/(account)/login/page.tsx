import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/account/auth-card";
import { LoginForm } from "@/components/account/login-form";
import { getUserAccess, safeUserNext } from "@/lib/auth/user-access";
import { destinationAfterLogin } from "@/lib/auth/roles";

export const metadata = { title: "Log in" };

const ERROR_MESSAGES: Record<string, string> = {
  oauth_denied: "Google sign-in was cancelled or denied.",
  oauth_missing_code: "Sign-in did not complete. Please try again.",
  oauth_failed: "Sign-in failed. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const target = safeUserNext(next);

  // Already signed in? Skip the form. (/dashboard itself explains blocked accounts.)
  const access = await getUserAccess();
  if (access.status === "admin") redirect("/admin");
  if (access.status === "member") redirect(destinationAfterLogin(access.profile.role, target, Boolean(access.profile.username)));
  if (access.status !== "anonymous") redirect("/dashboard");

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to manage your page."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="font-semibold text-brand-deep underline">
            Create a free page
          </Link>
        </>
      }
    >
      <LoginForm next={target} initialError={error ? ERROR_MESSAGES[error] ?? null : null} />
    </AuthCard>
  );
}
