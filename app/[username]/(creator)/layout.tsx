import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { getCreatorView } from "@/lib/creator/data";
import { getPublicProfile } from "@/lib/store/data";
import { CreatorShell } from "@/components/creator/creator-shell";

/**
 * Wraps /[username]/works and /[username]/pricing (route group: no effect on the URL).
 * Creators only. A business username is sent to its own store home; unknown users 404.
 */
export default async function CreatorPublicLayout({ children, params }: { children: ReactNode; params: Promise<{ username: string }> }) {
  const { username } = await params;
  const view = await getCreatorView(username);
  if (!view) {
    const profile = await getPublicProfile(username);
    if (profile?.role === "business") redirect(`/${profile.username}`);
    notFound();
  }
  return <CreatorShell view={view}>{children}</CreatorShell>;
}
