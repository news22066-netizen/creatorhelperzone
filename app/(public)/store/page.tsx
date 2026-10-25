import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  FolderTree,
  MessageCircle,
  Palette,
  ShoppingBag,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { FooterLinks } from "@/components/public/footer-links";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Business store",
  description:
    "Open a free online store at bfeed.store/yourshop. Add products and categories, and customers order on WhatsApp. No subscription, no commission.",
  alternates: { canonical: "/store" },
};

const features = [
  { icon: ShoppingBag, title: "Products with photos and prices", desc: "Add products with image links, descriptions and prices. Edit or hide them any time." },
  { icon: FolderTree, title: "Categories", desc: "Group products so customers find things fast on a phone." },
  { icon: MessageCircle, title: "Orders on WhatsApp", desc: "The Buy button opens WhatsApp with the product details already written. No payment gateway needed." },
  { icon: Palette, title: "Your store, your colours", desc: "Pick a look that matches your brand and choose which sections to show." },
  { icon: HelpCircle, title: "Shop FAQ and contact links", desc: "Answer the usual questions once and keep every contact link in one place." },
  { icon: ShieldCheck, title: "Privacy page", desc: "A ready page for your store policy, editable from your dashboard." },
];

const steps = [
  "Sign up as a business and pick your shop username.",
  "Add your store details, categories and products.",
  "Share bfeed.store/yourshop on Facebook, Instagram and in your ads.",
];

const cta =
  "inline-flex h-12 min-w-[44px] items-center justify-center gap-2 rounded-xl px-6 text-[15px] font-bold transition duration-150 hover:-translate-y-0.5 hover:shadow-lift active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0";

export default function StorePage() {
  return (
    <div className="flex flex-col gap-10 md:gap-14">
      <section className="rounded-3xl border border-brand-light/60 bg-gradient-to-b from-brand-light/30 via-surface to-surface px-5 py-10 text-center shadow-card md:py-14">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-light bg-surface px-3 py-1 text-xs font-bold text-brand-ink">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          Live now, free forever
        </span>
        <h1 className="mx-auto mt-4 max-w-2xl text-[30px] font-extrabold leading-[1.3] tracking-tight md:text-5xl">
          Your online store, with orders on WhatsApp
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] font-medium leading-relaxed text-gray-700 md:text-lg">
          Put your products on one link, bfeed.store/yourshop. Customers browse, tap Buy, and the order lands in your
          WhatsApp. No subscription, no commission.
        </p>
        <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
          <Link href="/signup?role=business" className={`${cta} bg-brand text-white shadow-sm hover:bg-brand-hover`}>
            Start as a business <ArrowRight className="cta-arrow h-4 w-4" />
          </Link>
          <Link
            href="/pricing"
            className={`${cta} border-2 border-brand-light bg-brand-light/20 text-brand-ink hover:bg-brand-light/50`}
          >
            See what is free
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-extrabold tracking-tight md:text-3xl">What your store includes</h2>
        <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <li
              key={title}
              className="reveal lift-card flex gap-3 rounded-2xl border border-brand-light/60 bg-surface p-4 shadow-card sm:flex-col"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-light/50 text-brand-ink">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-extrabold leading-snug">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-700">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="reveal rounded-3xl border border-brand-light/70 bg-brand-light/15 p-5 md:p-8">
        <h2 className="text-2xl font-extrabold tracking-tight">Open in three steps</h2>
        <ol className="mt-4 flex flex-col gap-3">
          {steps.map((s, i) => (
            <li key={s} className="flex items-start gap-3 text-[15px] leading-relaxed">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-extrabold text-white">
                {i + 1}
              </span>
              <span className="pt-1">{s}</span>
            </li>
          ))}
        </ol>
        <p className="mt-5 flex items-start gap-2 text-sm text-gray-700">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          Running a creator page instead? <Link href="/signup?role=creator" className="font-bold text-brand-deep underline-offset-2 hover:underline">Start as a creator</Link>.
        </p>
      </section>

      <FooterLinks />
    </div>
  );
}
