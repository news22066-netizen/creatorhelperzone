"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Header logo. With a logo URL: plain <img> (external CDN, same approach as the rest of the app), height-capped,
 * width auto, object-contain so it can never stretch. No URL (or the image fails to load): short text mark.
 */
export function SiteLogo({ logoUrl, compact = false }: { logoUrl: string; compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [logoUrl]);

  if (logoUrl && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt="CreatorHub BD"
        height={44}
        decoding="async"
        onError={() => setFailed(true)}
        className={cn(
          "block w-auto object-contain object-left",
          compact
            ? "h-8 max-w-[150px]"
            : "h-9 max-w-[132px] sm:max-w-[170px] md:h-11 md:max-w-[220px]"
        )}
      />
    );
  }

  return (
    <span className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className={cn(
          "flex items-center justify-center rounded-xl bg-brand text-[13px] font-extrabold tracking-tight text-white shadow-sm",
          compact ? "h-8 w-8" : "h-9 w-9 md:h-10 md:w-10"
        )}
      >
        CH
      </span>
      <span className="text-[17px] font-extrabold leading-none tracking-tight text-brand-ink">
        CreatorHub<span className="text-brand"> BD</span>
      </span>
    </span>
  );
}
