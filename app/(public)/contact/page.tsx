import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { ProsePage } from "@/components/public/prose-page";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the BFEED team: questions, feedback and partnership ideas.",
};

export default function ContactPage() {
  return (
    <ProsePage
      title="Contact us"
      intro="Questions, feedback or ideas? We read every message."
    >
      <p>
        The fastest way to reach us is email. Please include your username (if you have one) so we can
        help you faster.
      </p>
      <p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="!no-underline inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-5 font-bold !text-white hover:bg-brand-hover"
        >
          <Mail className="h-4 w-4" /> {CONTACT_EMAIL}
        </a>
      </p>
      <h2>Before you write</h2>
      <p>
        Many answers are already in the <Link href="/help">Help Center</Link> and the{" "}
        <Link href="/faq">FAQ</Link>.
      </p>
      <p className="text-sm text-gray-600">We usually reply within a few working days.</p>
    </ProsePage>
  );
}
