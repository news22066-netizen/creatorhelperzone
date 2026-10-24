"use client";

import { useState, type ReactNode } from "react";

/** Plain <img> for externally hosted (imgbb) pictures: falls back instead of showing a broken icon. */
export function SafeImg({
  src,
  alt,
  className,
  fallback,
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  fallback?: ReactNode;
  eager?: boolean;
}) {
  const [bad, setBad] = useState(false);
  if (bad) return <>{fallback ?? null}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setBad(true)}
    />
  );
}
