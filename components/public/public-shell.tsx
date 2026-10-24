"use client";

import { ReactNode, use, useEffect } from "react";
import { TopBar } from "./top-bar";
import { BottomNav } from "./bottom-nav";
import { LanguageProvider } from "@/lib/i18n/language-provider";
import { AnnouncementBanner } from "./announcement-banner";
import { readPreferredDark } from "@/lib/theme";

// Assuming the type of getAnnouncements is an array
type Announcement = { title: string; body: string };

export default function PublicShell({
  children,
  announcementsPromise,
}: {
  children: ReactNode;
  announcementsPromise: Promise<Announcement[]>;
}) {
  const announcements = use(announcementsPromise);

  // Apply the saved/system theme when entering the public site (also covers client-side navigation
  // from other areas) and clear it when leaving, so /admin, /dashboard and profiles stay untouched.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", readPreferredDark());
    return () => document.documentElement.classList.remove("dark");
  }, []);

  return (
    <LanguageProvider>
      <div className="public-shell min-h-screen bg-surface pb-24 text-brand-ink md:pb-10">
        <TopBar />
        <main className="mx-auto w-full max-w-2xl px-4 py-4 md:max-w-5xl md:px-6 md:py-8">
          {announcements[0] && (
            <div className="mb-4">
              <AnnouncementBanner title={announcements[0].title} body={announcements[0].body} />
            </div>
          )}
          {children}
        </main>
        <BottomNav />
      </div>
    </LanguageProvider>
  );
}