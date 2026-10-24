import type { Metadata } from "next";

/**
 * Neutral wrapper for EVERYTHING under /admin (login, unauthorized, panel).
 * It must NOT contain any auth redirect — that is exactly what caused the
 * old login loop. The guard lives in (panel)/layout.tsx.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
