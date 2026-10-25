import { THEME_INIT_SCRIPT } from "@/lib/theme";
import PublicShell from "@/components/public/public-shell";
import { getAnnouncements } from "@/lib/data/public";
import { getSiteBrand } from "@/lib/data/site";
import { AnnouncementBanner } from "@/components/public/announcement-banner";

export const revalidate = 60;

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  // We pass the promise directly without awaiting it here.
  // The Client Component will resolve it using React's `use()` hook.
  const announcementsPromise = getAnnouncements();
  const brandPromise = getSiteBrand();

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      <PublicShell announcementsPromise={announcementsPromise} brandPromise={brandPromise}>
        {children}
      </PublicShell>
    </>
  );
}