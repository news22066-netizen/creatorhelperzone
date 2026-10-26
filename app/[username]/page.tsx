import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/constants";
import { getPublicProfile, getStoreView } from "@/lib/store/data";
import { StoreShell } from "@/components/store/store-shell";
import { StoreHome } from "@/components/store/store-home";
import { getCreatorView } from "@/lib/creator/data";
import { CreatorShell } from "@/components/creator/creator-shell";
import { CreatorHome } from "@/components/creator/public-home";
import type { PublicProfile } from "@/types/database";

/**
 * Public Linktree-style page at /<username>.
 *
 * Route order: Next.js always prefers static routes (/tools, /guides, /login,
 * /signup, /dashboard, /admin, /auth, …) over this dynamic one, so it can never
 * shadow them. Reserved or malformed names are rejected here without a DB call
 * as a second line of defence.
 *
 * Data comes from the public_profiles VIEW (safe columns only) through the
 * cookie-less client, so the page is cacheable (ISR). Saving in /dashboard
 * revalidates it immediately.
 *
 * Role branch (never mixed): role === 'business' renders the store Home inside StoreShell (sub-pages /shop, /contact,
 * /privacy in the (store) group); role === 'creator' renders the creator Home inside CreatorShell (sub-pages /works,
 * /pricing in the (creator) group).
 */
export const revalidate = 30;

type Params = { params: Promise<{ username: string }> };

async function loadProfile(raw: string): Promise<{ profile: PublicProfile } | null> {
  const profile = await getPublicProfile(raw); // shared, per-request cached lookup (public_profiles view)
  return profile ? { profile } : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username } = await params;
  const found = await loadProfile(username);
  if (!found) return { title: "Page not found", robots: { index: false } };

  const { profile } = found;
  const canonical = `${SITE_URL}/${profile.username}`;

  if (profile.role === "business") {
    const view = await getStoreView(username);
    const storeName = view?.displayName ?? profile.full_name ?? `@${profile.username}`;
    const description = profile.bio || `${storeName}: shop and order on WhatsApp.`;
    return {
      title: storeName,
      description,
      alternates: { canonical },
      openGraph: {
        type: "website",
        url: canonical,
        title: storeName,
        description,
        images: profile.avatar_url ? [profile.avatar_url] : undefined,
      },
    };
  }

  const name = profile.full_name || `@${profile.username}`;
  return {
    title: `${name} (@${profile.username})`,
    description: profile.bio || `${name} on BFEED`,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      url: canonical,
      title: name,
      description: profile.bio || undefined,
      images: profile.avatar_url ? [profile.avatar_url] : undefined,
    },
  };
}

export default async function PublicProfilePage({ params }: Params) {
  const { username } = await params;
  const found = await loadProfile(username);
  if (!found) notFound();

  const { profile } = found;

  // Business accounts get the store; creators get the Home tab of the creator page (Works / Pricing are sub-routes).
  if (profile.role === "business") {
    const view = await getStoreView(username);
    if (!view) notFound();
    return (
      <StoreShell view={view}>
        <StoreHome view={view} />
      </StoreShell>
    );
  }

  const view = await getCreatorView(username);
  if (!view) notFound();
  return (
    <CreatorShell view={view}>
      <CreatorHome view={view} />
    </CreatorShell>
  );
}
