import type { CSSProperties } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { SafeImg } from "./safe-img";
import { StoreMenu } from "./store-menu";

/**
 * Sticky header: store logo + name (left) · search · ⋮ menu (right).
 * The search icon only exists when the owner left "Search" on (show_search_on_shop).
 * Share, privacy and the free-tools link live in the ⋮ menu.
 */
export function StoreHeader({
  username,
  displayName,
  avatarUrl,
  shareUrl,
  showSearch,
  themeStyle,
}: {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  shareUrl: string;
  showSearch: boolean;
  themeStyle: CSSProperties;
}) {
  const initial = displayName.replace(/^@/, "").charAt(0).toUpperCase() || "S";
  const fallback = (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-store-primary text-sm font-extrabold text-store-on-primary">
      {initial}
    </span>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-store-text/10 bg-store-bg/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-md items-center gap-1 px-3 md:max-w-3xl">
        <Link href={`/${username}`} className="flex min-w-0 flex-1 items-center gap-2.5 py-1">
          {avatarUrl ? (
            <SafeImg src={avatarUrl} alt="" eager className="h-8 w-8 shrink-0 rounded-full object-cover" fallback={fallback} />
          ) : (
            fallback
          )}
          <span className="truncate text-base font-extrabold">{displayName}</span>
        </Link>

        {showSearch && (
          <Link
            href={`/${username}/shop?focus=1`}
            aria-label="Search products"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-store-text transition-colors hover:bg-store-text/10"
          >
            <Search className="h-5 w-5" />
          </Link>
        )}
        <StoreMenu username={username} displayName={displayName} shareUrl={shareUrl} themeStyle={themeStyle} />
      </div>
    </header>
  );
}
