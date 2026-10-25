import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, DollarSign, MessageCircle } from "lucide-react";
import { getCreatorPlans, getCreatorView } from "@/lib/creator/data";
import { buildCreatorUrl } from "@/lib/whatsapp";
import { planFeatures } from "@/types/creator";

export const revalidate = 30;
type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const view = await getCreatorView(username);
  if (!view) return { title: "Page not found", robots: { index: false } };
  return { title: `Pricing · ${view.displayName}`, description: `Plans and prices from ${view.displayName}. Order on WhatsApp.` };
}

export default async function CreatorPricingPublicPage({ params }: Props) {
  const { username } = await params;
  const view = await getCreatorView(username);
  if (!view) notFound();
  const plans = await getCreatorPlans(view.profile.id);
  const { whatsapp } = view.profile;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-extrabold">Pricing</h1>
      {plans.length === 0 ? (
        <div className="cp-card flex flex-col items-center gap-2 rounded-2xl border-dashed px-5 py-12 text-center">
          <DollarSign className="h-8 w-8 opacity-70" />
          <p className="font-bold">No plans yet</p>
          <p className="cp-muted max-w-xs text-sm">No prices are listed yet. Message directly to ask about a project.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {plans.map((p) => {
            const feats = planFeatures(p.features);
            const inverse = p.is_featured;
            const href = whatsapp
              ? buildCreatorUrl({ whatsapp, name: view.displayName, planName: p.name, planPrice: p.price_text || undefined, path: `/${username}/pricing` })
              : null;
            const btn = `flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-bold hover:opacity-90 ${inverse ? "cp-btn-on-inverse" : "cp-btn"}`;
            return (
              <li key={p.id} className={`${inverse ? "cp-inverse" : "cp-card"} flex flex-col gap-3 rounded-3xl p-5`}>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-extrabold">{p.name}</h2>
                  {inverse && <span className="cp-btn-on-inverse rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide">Popular</span>}
                </div>
                {p.price_text && <p className="text-3xl font-extrabold leading-none">{p.price_text}</p>}
                {p.tagline && <p className={`text-sm ${inverse ? "cp-inverse-muted" : "cp-muted"}`}>{p.tagline}</p>}
                {feats.length > 0 && (
                  <ul className="flex flex-col gap-1.5 text-[15px]">
                    {feats.map((f, i) => (
                      <li key={i} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} /><span>{f}</span></li>
                    ))}
                  </ul>
                )}
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className={btn}>
                    <MessageCircle className="h-4 w-4" /> {p.cta_label}
                  </a>
                ) : (
                  <Link href={`/${username}#contact`} className={btn}>{p.cta_label}</Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <p className="cp-muted text-center text-xs">Buttons open WhatsApp with your plan already filled in. No online payment.</p>
    </div>
  );
}
