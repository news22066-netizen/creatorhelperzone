import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getStoreView } from "@/lib/store/data";
import { StoreShell } from "@/components/store/store-shell";

/**
 * Wraps /[username]/shop, /contact and /privacy only (route group: no effect on the URL).
 * Creators and unknown users have no store, so these routes 404 for them.
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
  if (!view) notFound();
  return <StoreShell view={view}>{children}</StoreShell>;
}
