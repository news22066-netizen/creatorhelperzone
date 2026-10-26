import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/public/prose-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How BFEED collects, uses and protects your information.",
};

export default function PrivacyPage() {
  return (
    <ProsePage title="Privacy Policy" updated="October 2026" template>
      <h2>1. Information we collect</h2>
      <ul>
        <li>Account details: email address, username, and profile information you choose to add.</li>
        <li>Content you add: links, bio, products and classes shown on your public page.</li>
        <li>Basic usage data: pages visited and device or browser type, to keep the service working.</li>
      </ul>
      <h2>2. Sign-in and authentication</h2>
      <p>
        You can sign in with email or Google. Authentication is handled by our backend provider. We do
        not see or store your Google password.
      </p>
      <h2>3. How we use information</h2>
      <ul>
        <li>To run your account and show your public page.</li>
        <li>To improve the tools and guides.</li>
        <li>To contact you about your account or important changes.</li>
      </ul>
      <h2>4. Analytics</h2>
      <p>
        We may use privacy-conscious analytics to understand how the site is used. Details will be
        listed here if and when analytics are enabled.
      </p>
      <h2>5. Third parties</h2>
      <p>
        We use service providers for hosting, database and authentication. They process data only to
        provide those services. Links on your public page lead to third-party sites with their own
        policies.
      </p>
      <h2>6. Public information</h2>
      <p>Anything you place on your public page can be seen by anyone with the link.</p>
      <h2>7. Your choices</h2>
      <p>
        You can edit your content at any time and ask us to delete your account. See{" "}
        <Link href="/cookies">Cookies</Link> for browser storage.
      </p>
      <h2>8. Contact</h2>
      <p>
        Questions about privacy? <Link href="/contact">Contact us</Link>.
      </p>
    </ProsePage>
  );
}
