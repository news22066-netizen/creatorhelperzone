import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/public/prose-page";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How CreatorHub BD uses cookies and browser storage.",
};

export default function CookiesPage() {
  return (
    <ProsePage title="Cookie Policy" updated="October 2026" template>
      <h2>1. What are cookies?</h2>
      <p>
        Cookies and similar browser storage are small pieces of data saved on your device to make a
        website work.
      </p>
      <h2>2. What we use</h2>
      <ul>
        <li>
          <strong>Essential:</strong> keep you signed in and secure your session.
        </li>
        <li>
          <strong>Preferences:</strong> remember your language choice (English or Bangla).
        </li>
        <li>
          <strong>Analytics:</strong> only if enabled in future; this page will be updated first.
        </li>
      </ul>
      <h2>3. Third parties</h2>
      <p>Embedded content (for example YouTube videos) may set its own cookies.</p>
      <h2>4. Your choices</h2>
      <p>You can clear or block cookies in your browser settings. Signing in may not work without essential cookies.</p>
      <h2>5. Contact</h2>
      <p>
        Questions? <Link href="/contact">Contact us</Link> or read our <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </ProsePage>
  );
}
