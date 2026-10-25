import { redirect } from "next/navigation";
import { getUserAccess, type MemberProfile } from "@/lib/auth/user-access";
import { homeForRole } from "@/lib/auth/roles";

/**
 * Gate for /dashboard/business/*. Middleware already requires a session for /dashboard; this checks the role.
 *  - signed out        -> /login (and back here afterwards)
 *  - admin             -> /admin
 *  - creator           -> /dashboard/creator (never shown store screens)
 *  - no username yet / blocked / no profile -> /dashboard (its own page handles those states)
 */
export async function requireBusiness(): Promise<{ profile: MemberProfile & { username: string } }> {
  const access = await getUserAccess();
  if (access.status === "anonymous") redirect("/login?next=/dashboard/business");
  if (access.status === "admin") redirect("/admin");
  if (access.status !== "member") redirect("/dashboard");

  const { profile } = access;
  if (!profile.username) redirect("/dashboard");
  if (profile.role !== "business") redirect(homeForRole(profile.role));
  return { profile: profile as MemberProfile & { username: string } };
}
