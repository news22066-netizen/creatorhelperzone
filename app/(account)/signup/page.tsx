import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/account/auth-card";
import { SignupForm } from "@/components/account/signup-form";
import { getUserAccess } from "@/lib/auth/user-access";

export const metadata = { title: "Create your free page" };

export default async function SignupPage() {
  const access = await getUserAccess();
  if (access.status === "admin") redirect("/admin");
  if (access.status !== "anonymous") redirect("/dashboard");

  return (
    <AuthCard
      title="Create your free page"
      subtitle="Pick an account type and your username. It takes a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-deep underline">
            Log in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}
