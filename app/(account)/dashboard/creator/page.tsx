import Link from "next/link";
import { Check, Circle, Plus } from "lucide-react";
import { requireCreator } from "@/lib/auth/creator-access";
import { createClient } from "@/lib/supabase/server";
import { absoluteUrl } from "@/lib/site-url";
import { ShareButton } from "@/components/store/share-button";

export const metadata = { title: "Creator overview" };

export default async function CreatorOverviewPage() {
  const { profile } = await requireCreator();
  const supabase = await createClient();

  const count = (table: string, active = false) => {
    let q = supabase.from(table).select("id", { count: "exact", head: true }).eq("user_id", profile.id);
    if (active) q = q.eq("is_active", true);
    return q;
  };
  const [works, livePlans, videos, links, settings] = await Promise.all([
    count("creator_works"),
    count("creator_plans", true),
    count("creator_videos"),
    count("profile_links"),
    supabase.from("creator_settings").select("*").eq("profile_id", profile.id).maybeSingle(),
  ]);

  const s = (settings.data ?? {}) as Record<string, unknown>;
  const hasSocial = Object.keys(s).some((k) => k.startsWith("social_") && typeof s[k] === "string" && s[k]);
  const pageUrl = absoluteUrl(`/${profile.username}`);

  const checklist = [
    { done: Boolean(profile.avatar_url), label: "Add your avatar link", href: "/dashboard/creator/profile", why: "Shown at the top of your page" },
    { done: Boolean(profile.whatsapp), label: "Add your WhatsApp number", href: "/dashboard/creator/profile", why: "Plan and contact buttons open it" },
    { done: typeof s.about === "string" && s.about.trim().length > 0, label: "Write your About text", href: "/dashboard/creator/profile", why: "Tell visitors who you are" },
    { done: hasSocial, label: "Add a social link", href: "/dashboard/creator/profile", why: "Icons appear under your name" },
    { done: (works.count ?? 0) > 0, label: "Add your first work", href: "/dashboard/creator/works/new", why: "Photos open in a popup" },
    { done: (livePlans.count ?? 0) > 0, label: "Add a pricing plan", href: "/dashboard/creator/pricing", why: "Buttons message you on WhatsApp" },
    { done: typeof s.appearance === "string" && s.appearance !== "solid-white", label: "Choose your colors", href: "/dashboard/creator/appearance", why: "20 colors and 5 gradients" },
  ];
  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-brand-light/70 bg-brand-light/15 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-extrabold">@{profile.username}</h1>
          <span className="rounded-full bg-brand-light/60 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide">creator</span>
        </div>
        <p className="mt-1 break-all text-sm text-gray-600">{pageUrl.replace(/^https?:\/\//, "")}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/dashboard/creator/works/new"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-white hover:bg-brand-hover"
          >
            <Plus className="h-4 w-4" /> Add work
          </Link>
          <ShareButton
            url={pageUrl}
            title={profile.full_name ?? `@${profile.username}`}
            className="inline-flex h-11 items-center gap-2 rounded-xl border-2 border-brand-light bg-white px-5 text-sm font-bold hover:bg-brand-light/25"
          >
            Share my page
          </ShareButton>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Works", value: works.count ?? 0 },
          { label: "Live plans", value: livePlans.count ?? 0 },
          { label: "Videos", value: videos.count ?? 0 },
          { label: "Links", value: links.count ?? 0 },
        ].map((x) => (
          <div key={x.label} className="rounded-2xl border border-brand-light/70 bg-white p-4 text-center">
            <p className="text-2xl font-extrabold tabular-nums">{x.value}</p>
            <p className="mt-0.5 text-xs font-semibold text-gray-600">{x.label}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-brand-light/70 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Get your page ready</h2>
          <span className="text-sm font-bold text-brand-deep">
            {doneCount}/{checklist.length}
          </span>
        </div>
        <ul className="flex flex-col">
          {checklist.map((c) => (
            <li key={c.label}>
              <Link href={c.href} className="flex min-h-12 items-center gap-3 rounded-xl px-2 py-2 hover:bg-brand-light/15">
                <span
                  className={
                    c.done
                      ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-white"
                      : "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-brand-light text-brand-light"
                  }
                >
                  {c.done ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-2.5 w-2.5" />}
                </span>
                <span className="min-w-0">
                  <span className={c.done ? "block text-sm font-semibold text-gray-500 line-through" : "block text-sm font-bold"}>{c.label}</span>
                  {!c.done && <span className="block text-xs text-gray-500">{c.why}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
