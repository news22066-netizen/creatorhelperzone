"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, ExternalLink, ImageIcon, MessageCircle, X } from "lucide-react";
import { SafeImg } from "@/components/store/safe-img";
import { YoutubeLite } from "./youtube-lite";
import { buildCreatorUrl } from "@/lib/whatsapp";

export interface PublicWork {
  id: string;
  title: string;
  description: string;
  youtube_url: string | null;
  link_url: string | null;
  images: { id: string; url: string; alt: string }[];
}

function Gallery({ images, title }: { images: PublicWork["images"]; title: string }) {
  const [i, setI] = useState(0);
  const touchX = useRef<number | null>(null);
  const n = images.length;
  if (n === 0) return null;
  const go = (k: number) => setI((k + n) % n);
  const cur = images[Math.min(i, n - 1)];
  return (
    <div className="flex flex-col gap-2">
      <div
        className="relative overflow-hidden rounded-2xl bg-gray-100"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null || n < 2) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
        }}
      >
        <SafeImg key={cur.url} src={cur.url} alt={cur.alt || title} eager className="aspect-[4/3] w-full object-contain" fallback={<div className="flex aspect-[4/3] items-center justify-center text-gray-400"><ImageIcon className="h-10 w-10" /></div>} />
        {n > 1 && (
          <>
            <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/65 px-2.5 py-1 text-xs font-bold text-white">{i + 1} / {n}</span>
            <button type="button" onClick={() => go(i - 1)} aria-label="Previous photo" className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white"><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" onClick={() => go(i + 1)} aria-label="Next photo" className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white"><ChevronRight className="h-5 w-5" /></button>
          </>
        )}
      </div>
      {n > 1 && (
        <ul className="no-scrollbar flex gap-2 overflow-x-auto">
          {images.map((img, k) => (
            <li key={img.id} className="shrink-0">
              <button type="button" onClick={() => setI(k)} aria-label={`Show photo ${k + 1}`} aria-current={k === i ? "true" : undefined}
                className={`block h-14 w-14 overflow-hidden rounded-lg border-2 ${k === i ? "border-gray-900" : "border-transparent opacity-80"}`}>
                <SafeImg key={img.url} src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Works popup. Rendered into <body> (portal) with fixed, theme-independent colours (white sheet, dark text),
 * so it is always readable whatever page colour the creator chose, and no ancestor can clip it.
 */
function WorkModal({ work, whatsapp, name, onClose }: { work: PublicWork; whatsapp: string | null; name: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/60" />
      <div role="dialog" aria-modal="true" aria-label={work.title}
        className="pb-safe relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white text-gray-900 shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-2.5">
          <h2 className="min-w-0 truncate text-base font-extrabold">{work.title}</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col gap-4 overflow-y-auto overscroll-contain p-4">
          <Gallery images={work.images} title={work.title} />
          {work.youtube_url && <YoutubeLite url={work.youtube_url} title={work.title} />}
          {work.description && <p className="whitespace-pre-line text-[15px] leading-relaxed text-gray-700">{work.description}</p>}
          <div className="flex flex-col gap-2">
            {work.link_url && (
              <a href={work.link_url} target="_blank" rel="noopener noreferrer nofollow"
                className="flex h-12 items-center justify-center gap-2 rounded-full border-2 border-gray-300 text-sm font-bold hover:bg-gray-50">
                <ExternalLink className="h-4 w-4" /> Open project link
              </a>
            )}
            {whatsapp && (
              <a href={buildCreatorUrl({ whatsapp, name, workTitle: work.title })} target="_blank" rel="noopener noreferrer"
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#1e7a30] text-sm font-bold text-white hover:bg-[#14532d]">
                <MessageCircle className="h-4 w-4" /> Message me about this
              </a>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/** Grid of works (2 columns on phones, 3 from sm). Tap a tile: popup with photos, video, description. */
export function WorksGrid({ works, whatsapp, name }: { works: PublicWork[]; whatsapp: string | null; name: string }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = works.find((w) => w.id === openId) ?? null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {works.map((w) => (
          <li key={w.id}>
            <button type="button" onClick={() => setOpenId(w.id)} aria-haspopup="dialog" aria-label={`Open ${w.title}`}
              className="cp-card group relative block aspect-square w-full overflow-hidden rounded-2xl">
              {w.images[0] ? (
                <SafeImg src={w.images[0].url} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  fallback={<span className="flex h-full w-full items-center justify-center"><ImageIcon className="h-8 w-8 opacity-60" /></span>} />
              ) : (
                <span className="flex h-full w-full items-center justify-center p-3 text-center text-sm font-bold">{w.title}</span>
              )}
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2.5 pb-2 pt-8 text-left text-xs font-bold leading-tight text-white">
                <span className="line-clamp-2">{w.title}</span>
              </span>
              {(w.images.length > 1 || w.youtube_url) && (
                <span className="absolute right-1.5 top-1.5 rounded-full bg-black/65 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {w.youtube_url ? "▶ video" : `${w.images.length} photos`}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
      {open && <WorkModal work={open} whatsapp={whatsapp} name={name} onClose={() => setOpenId(null)} />}
    </>
  );
}
