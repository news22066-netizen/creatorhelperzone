"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SafeImg } from "./safe-img";

/** Big photo + thumbnail strip (the Canva product screen). Arrows, thumbnails and swipe all work. */
export function ProductGallery({ images, name }: { images: { id: string; url: string; alt: string }[]; name: string }) {
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const count = images.length;

  const placeholder = (
    <div className="flex aspect-square w-full items-center justify-center bg-store-text/5 text-store-text/40">
      <ShoppingBag className="h-12 w-12" />
    </div>
  );

  if (count === 0) return <div className="overflow-hidden rounded-2xl border border-store-text/10">{placeholder}</div>;

  const go = (i: number) => setIndex((i + count) % count);
  const current = images[Math.min(index, count - 1)];

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative overflow-hidden rounded-2xl border border-store-text/10 bg-store-text/5"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null || count < 2) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        }}
      >
        <SafeImg
          key={current.url}
          src={current.url}
          alt={current.alt || name}
          eager
          className="aspect-square w-full object-contain"
          fallback={placeholder}
        />
        {count > 1 && (
          <>
            <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-xs font-bold text-white">
              {index + 1} of {count}
            </span>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/70"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/70"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4" aria-label="Photos">
          {images.map((img, i) => (
            <li key={img.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "block h-16 w-16 overflow-hidden rounded-xl border-2 bg-store-text/5 transition-colors",
                  i === index ? "border-store-primary" : "border-transparent opacity-80 hover:opacity-100"
                )}
              >
                <SafeImg key={img.url} src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
