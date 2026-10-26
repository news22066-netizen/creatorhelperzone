import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/public/prose-page";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Help for BFEED: creating your page, logging in, managing links and getting support.",
};

const topics = [
  {
    q: "How do I create my page?",
    a: "Go to Sign up, choose an account type and a username, then add your links from the dashboard.",
  },
  {
    q: "Can I change my username?",
    a: "Usernames are permanent for now, so pick one you will be happy with. Contact us if you have a special case.",
  },
  {
    q: "I cannot log in.",
    a: "Check that you are using the same method you signed up with (email or Google). If it still fails, contact us.",
  },
  {
    q: "Is it really free?",
    a: "Creating a page and using the free tools is free to start. We will announce any pricing well in advance.",
  },
  {
    q: "How do I report a problem or a page?",
    a: "Email us with the page address and what is wrong, and we will look into it.",
  },
];

export default function HelpPage() {
  return (
    <ProsePage title="Help Center" intro="Quick answers to common questions.">
      {topics.map((t) => (
        <section key={t.q}>
          <h3>{t.q}</h3>
          <p>{t.a}</p>
        </section>
      ))}
      <h2>Still stuck?</h2>
      <p>
        See the <Link href="/faq">FAQ</Link> or <Link href="/contact">contact us</Link>.
      </p>
    </ProsePage>
  );
}
