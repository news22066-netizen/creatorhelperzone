import { Search } from "lucide-react";

/** Plain GET form so /[username]/shop?q=… works without JS and keeps the active category. */
export function ShopSearch({
  username,
  initialQuery,
  category,
  autoFocus = false,
}: {
  username: string;
  initialQuery: string;
  category?: string;
  autoFocus?: boolean;
}) {
  return (
    <form action={`/${username}/shop`} method="get" role="search" className="flex gap-2">
      {category && <input type="hidden" name="category" value={category} />}
      <input
        name="q"
        type="search"
        autoFocus={autoFocus}
        defaultValue={initialQuery}
        maxLength={60}
        placeholder="Search products…"
        aria-label="Search products"
        className="h-12 w-full rounded-full border-2 border-store-text/25 bg-transparent px-5 text-sm outline-none placeholder:text-store-text/60 focus:border-store-primary"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-store-primary text-store-on-primary"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}
