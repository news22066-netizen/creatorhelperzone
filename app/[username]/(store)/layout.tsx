import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { getPublicProfile, getStoreView } from "@/lib/store/data";
import { StoreShell } from "@/components/store/store-shell";

/**
 * Wraps /[username]/shop, /contact and /privacy only (route group: no effect on the URL).
 * Unknown users 404. A creator has no store: /creator/shop sends visitors to the creator's own page
 * (never a store UI on a creator, never a dead end).
 */
export default async function StoreLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const view = await getStoreView(username);
  if (!view) {
    const profile = await getPublicProfile(username);
    if (profile?.role === "creator") redirect(`/${profile.username}`);
    notFound();
  }
  return <StoreShell view={view}>{children}</StoreShell>;
}
