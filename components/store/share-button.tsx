"use client";

import { useState, type ReactNode } from "react";
import { Check, Share2 } from "lucide-react";

/** Native share sheet when available, otherwise copies the link. */
export function ShareButton({
  url,
  title,
  className,
  children,
}: {
  url: string;
  title: string;
  className?: string;
  children?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: nothing else to do */
    }
  }

  return (
    <button type="button" onClick={share} aria-label={copied ? "Link copied" : "Share link"} className={className}>
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {children && <span>{copied ? "Copied" : children}</span>}
    </button>
  );
}
