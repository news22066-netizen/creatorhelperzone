import Link from "next/link";
import { Search } from "lucide-react";
import { SafeImg } from "./safe-img";
import { ShareButton } from "./share-button";
import { StoreMenu } from "./store-menu";

/**
 * Sticky header, same layout as the Canva mock: menu (left) · store name (center) · search + share (right).
 * The search icon only exists when the owner left "Search" on (show_search_on_shop).
 */
export function StoreHeader({
  username,
  displayName,
  avatarUrl,
  shareUrl,
  showSearch,
}: {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  shareUrl: string;
  showSearch: boolean;
}) {
  const initial = displayName.replace(/^@/, "").charAt(0).toUpperCase() || "S";
  const fallback = (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-store-primary text-sm font-extrabold text-store-on-primary">
      {initial}
    </span>
  );
  const iconBtn =
    "inline-flex h-11 w-11 items-center justify-center rounded-full text-store-text transition-colors hover:bg-store-text/10";

  return (
    <header className="sticky top-0 z-30 border-b border-store-text/10 bg-store-bg/95 backdrop-blur">
      <div className="mx-auto grid h-14 w-full max-w-md grid-cols-[auto_1fr_auto] items-center gap-1 px-2 md:max-w-3xl">
        <StoreMenu username={username} displayName={displayName} />

        <Link href={`/${username}`} className="flex min-w-0 items-center justify-center gap-2 px-1">
          {avatarUrl ? (
            <SafeImg src={avatarUrl} alt="" eager className="h-8 w-8 shrink-0 rounded-full object-cover" fallback={fallback} />
          ) : (
            fallback
          )}
          <span className="truncate text-base font-extrabold">{displayName}</span>
        </Link>

        <div className="flex items-center">
          {showSearch && (
            <Link href={`/${username}/shop?focus=1`} aria-label="Search products" className={iconBtn}>
              <Search className="h-5 w-5" />
            </Link>
          )}
          <ShareButton url={shareUrl} title={displayName} className={iconBtn} />
        </div>
      </div>
    </header>
  );
}
