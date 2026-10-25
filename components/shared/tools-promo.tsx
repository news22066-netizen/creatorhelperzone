import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const TEXT = "Grow fast with our free tools";

/**
 * Animated promo strip pointing to bfeed.store/tools (same site, so a plain /tools link: works on
 * every domain and preview URL). Text scrolls like a ticker and a faint light band sweeps across;
 * both stop for people who prefer reduced motion. Pure CSS, no client JS.
 */
export function ToolsPromo({ className, rounded = false }: { className?: string; rounded?: boolean }) {
  const item = (dup: boolean) => (
    <span className={cn("promo-item", dup && "promo-dup")} aria-hidden={dup || undefined}>
      <Sparkles className="h-3.5 w-3.5 shrink-0" />
      <span>{TEXT}</span>
      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
    </span>
  );
  return (
    <Link
      href="/tools"
      aria-label={`${TEXT}: open free tools`}
      className={cn("promo-strip h-9 text-[13px] font-bold", rounded && "rounded-xl", className)}
    >
      <span className="promo-track">
        {item(false)}
        {item(true)}
        {item(true)}
        {item(true)}
      </span>
    </Link>
  );
}
