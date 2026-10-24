import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/public/prose-page";

export const metadata: Metadata = {
  title: "About",
  description:
    "CreatorHub BD is a free platform for Bangladeshi creators: free tools, guides and your own public page in one place.",
};

export default function AboutPage() {
  return (
    <ProsePage
      title="About CreatorHub BD"
      intro="One free place for Bangladeshi creators and small businesses to grow online."
    >
      <h2>What we do</h2>
      <p>
        CreatorHub BD (bfeed.store) gives creators a free public page for their links, products and
        classes, plus hand-picked free tools and practical guides written for the Bangladeshi market.
      </p>
      <h2>Who it is for</h2>
      <ul>
        <li>Content creators on YouTube, Facebook, TikTok and Instagram</li>
        <li>Small online sellers and local businesses</li>
        <li>Teachers and course creators</li>
      </ul>
      <h2>What is free</h2>
      <p>
        Creating your page and using our tools is free to start. If pricing for extra features is
        introduced later, we will announce it clearly in advance.
      </p>
      <h2>Get started</h2>
      <p>
        <Link href="/signup">Create your free page</Link> or <Link href="/tools">explore the free tools</Link>.
        Questions? Visit the <Link href="/help">Help Center</Link> or <Link href="/contact">contact us</Link>.
      </p>
    </ProsePage>
  );
}
