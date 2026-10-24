import Link from "next/link";
import { Check, Circle, Plus } from "lucide-react";
import { requireBusiness } from "@/lib/auth/business-access";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/constants";
import { ShareButton } from "@/components/store/share-button";

export const metadata = { title: "Store overview" };

export default async function BusinessOverviewPage() {
  const { profile } = await requireBusiness();
  const supabase = await createClient();

  const [all, active, categories, settings, privacy] = await Promise.all([
    supabase.from("store_products").select("id", { count: "exact", head: true }).eq("user_id", profile.id),
    supabase
      .from("store_products")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("is_active", true),
    supabase.from("store_categories").select("id", { count: "exact", head: true }).eq("user_id", profile.id),
    supabase.from("store_settings").select("display_name").eq("profile_id", profile.id).maybeSingle(),
    supabase.from("store_privacy").select("content").eq("user_id", profile.id).maybeSingle(),
  ]);

  const total = all.count ?? 0;
  const live = active.count ?? 0;
  const storeUrl = `${SITE_URL}/${profile.username}`;

  const checklist = [
    { done: Boolean(profile.whatsapp), label: "Add your WhatsApp number", href: "/dashboard/business/profile", why: "Orders arrive here" },
    { done: Boolean(profile.avatar_url), label: "Add a logo / avatar link", href: "/dashboard/business/profile", why: "Shown in the store header" },
    { done: Boolean((settings.data as { display_name?: string } | null)?.display_name?.trim()), label: "Set your store name", href: "/dashboard/business/settings", why: "Falls back to your profile name" },
    { done: total > 0, label: "Add your first product", href: "/dashboard/business/products/new", why: "Customers need something to order" },
    { done: Boolean((privacy.data as { content?: string } | null)?.content?.trim()), label: "Write a privacy policy", href: "/dashboard/business/privacy", why: "Linked from your store footer" },
  ];
  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-brand-light/70 bg-brand-light/15 p-5">
        <h1 className="text-2xl font-extrabold">Store overview</h1>
        <p className="mt-1 break-all text-sm text-gray-600">{storeUrl.replace(/^https?:\/\//, "")}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/dashboard/business/products/new"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-white hover:bg-brand-hover"
          >
            <Plus className="h-4 w-4" /> Add product
          </Link>
          <ShareButton
            url={storeUrl}
            title="My store"
            className="inline-flex h-11 items-center gap-2 rounded-xl border-2 border-brand-light bg-white px-5 text-sm font-bold hover:bg-brand-light/25"
          >
            Share store link
          </ShareButton>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        {[
          { label: "Live products", value: live },
          { label: "All products", value: total },
          { label: "Categories", value: categories.count ?? 0 },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-brand-light/70 bg-white p-4 text-center">
            <p className="text-2xl font-extrabold tabular-nums">{s.value}</p>
            <p className="mt-0.5 text-xs font-semibold text-gray-600">{s.label}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-brand-light/70 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Get your store ready</h2>
          <span className="text-sm font-bold text-brand-deep">
            {doneCount}/{checklist.length}
          </span>
        </div>
        <ul className="flex flex-col">
          {checklist.map((c) => (
            <li key={c.label}>
              <Link
                href={c.href}
                className="flex min-h-12 items-center gap-3 rounded-xl px-2 py-2 hover:bg-brand-light/15"
              >
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
                  <span className={c.done ? "block text-sm font-semibold text-gray-500 line-through" : "block text-sm font-bold"}>
                    {c.label}
                  </span>
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
