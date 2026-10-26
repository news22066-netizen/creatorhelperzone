import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/public/prose-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for using BFEED.",
};

export default function TermsPage() {
  return (
    <ProsePage title="Terms of Service" updated="October 2026" template>
      <h2>1. Using BFEED</h2>
      <p>
        By using the site you agree to these terms. You must provide accurate information and keep your
        login secure.
      </p>
      <h2>2. Your content</h2>
      <p>
        You own what you publish. You are responsible for it and must have the right to share it. You
        give us permission to display it on your public page.
      </p>
      <h2>3. Acceptable use</h2>
      <ul>
        <li>No illegal, hateful, harassing, or misleading content.</li>
        <li>No spam, scams or impersonation.</li>
        <li>No attempts to break or abuse the service.</li>
      </ul>
      <h2>4. Usernames</h2>
      <p>Usernames are first come, first served and may be removed if they violate these terms.</p>
      <h2>5. Free service and changes</h2>
      <p>
        The service is free to start. We may add paid features later and will announce them in
        advance. Features can change or be discontinued.
      </p>
      <h2>6. Termination</h2>
      <p>We may suspend accounts that break these terms. You may delete your account at any time.</p>
      <h2>7. Disclaimer</h2>
      <p>The service is provided as is, without warranties, to the extent allowed by law.</p>
      <h2>8. Contact</h2>
      <p>
        Questions? <Link href="/contact">Contact us</Link>. See also our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </ProsePage>
  );
}
