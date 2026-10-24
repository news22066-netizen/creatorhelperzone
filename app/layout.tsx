import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "CreatorHub BD — Free website for Bangladeshi creators",
    template: "%s | CreatorHub BD",
  },
  description:
    "Free Linktree-style page + storefront for Bangladeshi content creators and small businesses. Links, products and free classes in one place.",
  // Favicon package: files live in /public (see public/site.webmanifest for the install icons).
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2f9a42",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" suppressHydrationWarning className={`${inter.variable} ${lora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
