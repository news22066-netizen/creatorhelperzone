import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/auth/admin-access";
import { AdminShell } from "@/components/admin/admin-shell";

/**
 * Guard for the admin panel (dashboard, tools, guides, ...).
 * Login and "not authorized" live in the sibling (auth) group, OUTSIDE this
 * layout, so these redirects can never target the page that issued them.
 *
 *   anonymous -> /admin/login
 *   forbidden -> /admin/unauthorized   (explains why; offers sign-out; no loop)
 *   admin     -> render
 *
 * Note: layouts do not re-run on every client-side navigation. This is UX
 * only; real protection is middleware (session), RLS, the DB trigger and
 * getAdminContext() in every server action.
 */
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const access = await getAdminAccess();

  if (access.status === "anonymous") redirect("/admin/login");
  if (access.status === "forbidden") redirect("/admin/unauthorized");

  return <AdminShell email={access.email}>{children}</AdminShell>;
}
