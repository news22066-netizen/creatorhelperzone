import type { Metadata } from "next";
import { PricingView } from "@/components/public/pricing-view";
import { FooterLinks } from "@/components/public/footer-links";

export const revalidate = 3600;

const TITLE = "Pricing: free forever for creators and businesses";
const DESCRIPTION =
  "BFEED is completely free for Bangladeshi creators and businesses. Public username page, online store, WhatsApp buttons, tools and guides, with no subscription and no commission.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/pricing" },
  openGraph: { title: `${TITLE} | BFEED`, description: DESCRIPTION, type: "website", url: "/pricing" },
};

export default function PricingPage() {
  return (
    <div className="flex flex-col gap-10 md:gap-14">
      <PricingView />
      <FooterLinks />
    </div>
  );
}
