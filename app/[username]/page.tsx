import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";
import { SITE_URL } from "@/lib/constants";
import { getPublicProfile, getStoreView } from "@/lib/store/data";
import { StoreShell } from "@/components/store/store-shell";
import { StoreHome } from "@/components/store/store-home";
import type { ProfileLink, PublicProfile } from "@/types/database";

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
 * Role branch: role === 'business' renders the store (Home) inside StoreShell; its sub-pages are
 * /[username]/shop, /contact and /privacy in the (store) route group. Creators keep this linktree.
 */
export const revalidate = 30;

type Params = { params: Promise<{ username: string }> };

async function loadProfile(raw: string): Promise<{ profile: PublicProfile; links: ProfileLink[] } | null> {
  const profile = await getPublicProfile(raw); // shared, per-request cached lookup (public_profiles view)
  if (!profile) return null;

  // Businesses render the store (it has its own data); only creators use the links list.
  if (profile.role === "business") return { profile, links: [] };

  const supabase = createPublicClient();
  const { data: links } = await supabase
    .from("profile_links")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return { profile, links: (links ?? []) as ProfileLink[] };
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
    description: profile.bio || `${name} on CreatorHub BD`,
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

  const { profile, links } = found;

  // Business accounts get the store; creators keep the linktree page below, unchanged.
  if (profile.role === "business") {
    const view = await getStoreView(username);
    if (!view) notFound();
    return (
      <StoreShell view={view}>
        <StoreHome view={view} />
      </StoreShell>
    );
  }

  const name = profile.full_name || `@${profile.username}`;
  const initial = name.replace(/^@/, "").charAt(0).toUpperCase() || "?";
  const waText = encodeURIComponent(`Hi ${name}, I found you on CreatorHub BD.`);

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-brand-ink">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt={name}
            className="h-24 w-24 rounded-full border-4 border-brand-light object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-brand-light bg-brand-light/40 text-3xl font-extrabold"
          >
            {initial}
          </div>
        )}

        <div className="text-center">
          <h1 className="text-2xl font-extrabold leading-tight">{name}</h1>
          {profile.full_name && <p className="text-sm text-gray-600">@{profile.username}</p>}
          {profile.bio && (
            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-gray-700">
              {profile.bio}
            </p>
          )}
        </div>

        {profile.whatsapp && (
          <a
            href={`https://wa.me/${profile.whatsapp}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-[15px] font-bold text-white shadow-sm hover:bg-brand-deep"
          >
            <MessageCircle className="h-5 w-5" />
            Chat on WhatsApp
          </a>
        )}

        {links.length > 0 && (
          <ul className="flex w-full flex-col gap-3">
            {links.map((l) => (
              <li key={l.id}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow ugc"
                  className="flex min-h-12 w-full items-center justify-center rounded-xl border-2 border-brand-light bg-white px-4 py-3 text-center text-[15px] font-bold hover:border-brand hover:bg-brand-light/20"
                >
                  {l.title}
                </a>
              </li>
            ))}
          </ul>
        )}

        {links.length === 0 && !profile.whatsapp && (
          <p className="rounded-2xl border border-dashed border-brand-light bg-brand-light/10 px-4 py-6 text-center text-sm text-gray-600">
            No links yet.
          </p>
        )}

        <Link href="/signup" className="mt-4 text-xs font-semibold text-gray-500 hover:text-brand-deep">
          Create your free page on <span className="text-brand-deep">CreatorHub BD</span>
        </Link>
      </div>
    </main>
  );
}
