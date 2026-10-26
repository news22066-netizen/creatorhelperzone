import type { Metadata } from "next";
import { getTools } from "@/lib/data/public";
import { FooterLinks } from "@/components/public/footer-links";
import { HomeHero } from "@/components/public/home/home-hero";
import {
  AudienceSplit,
  FeaturesGrid,
  FinalCta,
  HomeFaq,
  HowItWorks,
  PopularTools,
  TrustStrip,
} from "@/components/public/home/home-sections";

// ISR: one cached Supabase read (tools) per revalidation window. No per-visit or per-scroll queries.
export const revalidate = 120;

export const metadata: Metadata = {
  title: { absolute: "BFEED — বাংলাদেশি ক্রিয়েটরদের ফ্রি ওয়েবসাইট" },
  description:
    "ফেসবুক, ইউটিউব আর হোয়াটসঅ্যাপের সব লিংক এক ফ্রি পেজে। বাংলাদেশি ক্রিয়েটর ও ছোট ব্যবসার জন্য ফ্রি টুলস, গাইড আর পাবলিক পেজ।",
};

export default async function HomePage() {
  const tools = await getTools();

  const marqueeTools = tools.slice(0, 10).map((t) => ({ id: t.id, name: t.name, icon: t.icon }));
  const popular = tools.slice(0, 6).map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    icon: t.icon,
    slug: t.slug,
  }));

  return (
    <div className="flex flex-col gap-10 md:gap-14">
      <HomeHero marqueeTools={marqueeTools} />
      <TrustStrip toolCount={tools.length} />
      <HowItWorks />
      <FeaturesGrid />
      <PopularTools tools={popular} />
      <AudienceSplit />
      <HomeFaq />
      <FinalCta />
      <FooterLinks />
    </div>
  );
}
