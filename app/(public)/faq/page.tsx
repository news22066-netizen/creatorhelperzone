import type { Metadata } from "next";
import { getFaqs } from "@/lib/data/public";
import { FaqAccordion } from "@/components/public/faq-accordion";
import { FaqTitle } from "@/components/public/faq-title";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about CreatorHub BD.",
};

export default async function FaqPage() {
  const faqs = await getFaqs();

  return (
    <div className="flex flex-col gap-4">
      <FaqTitle />
      {faqs.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-brand-light bg-brand-light/10 p-8 text-center text-sm text-gray-600">
          No FAQs yet.
        </p>
      ) : (
        <FaqAccordion items={faqs} />
      )}
    </div>
  );
}
