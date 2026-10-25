import type { Metadata } from "next";

/** Login, signup and dashboard: never indexed, no marketing shell. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white text-brand-ink">{children}</div>;
}
