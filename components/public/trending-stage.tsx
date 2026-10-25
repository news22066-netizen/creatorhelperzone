"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as RKeyboardEvent,
  type PointerEvent as RPointerEvent,
} from "react";
import { ChevronLeft, ChevronRight, Flame, Play } from "lucide-react";
import { extractYouTubeId, youtubeEmbedUrl, youtubeThumbnail } from "@/lib/utils/youtube";
import { cn } from "@/lib/utils/cn";

export type StageVideo = { id: string; title: string; youtube_url: string | null };

/**
 * Looping card stage (plain React + rAF port of the GSAP "trending videos" reference):
 * cards travel along one track, grow to full size in the centre and shrink/fade toward the edges.
 * Drag / swipe, arrow keys, and prev/next buttons. No scroll hijacking, no autoplay: the video
 * only loads after the centre card is tapped.
 */

/** Wrap v into [-n/2, n/2) so every card has a shortest signed distance from the centre. */
const wrap = (v: number, n: number) => ((((v + n / 2) % n) + n) % n) - n / 2;
const mod = (v: number, n: number) => ((v % n) + n) % n;

export function TrendingStage({
  videos,
  labels,
}: {
  videos: StageVideo[];
  labels: { prev: string; next: string; hint: string; play: string };
}) {
  const items = useMemo(
    () =>
      videos
        .map((v) => ({ ...v, vid: extractYouTubeId(v.youtube_url) }))
        .filter((v): v is StageVideo & { vid: string } => Boolean(v.vid)),
    [videos]
  );
  const n = items.length;

  const [pos, setPos] = useState(0); // what is drawn (float, animates toward target)
  const [target, setTarget] = useState(0); // where we are heading (integer after snapping)
  const [playing, setPlaying] = useState<string | null>(null);
  const [width, setWidth] = useState(0);
  const [hintGone, setHintGone] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const targetRef = useRef(0);
  const raf = useRef(0);
  const reduced = useRef(false);
  const drag = useRef({ down: false, moved: false, startX: 0, startPos: 0, lastX: 0, lastT: 0, v: 0 });

  const cardW = Math.min(380, Math.max(230, width * 0.6));
  const cardH = cardW * 0.625;
  const step = cardW * 0.62;

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf.current);
    };
  }, []);

  const tick = useCallback(() => {
    const d = targetRef.current - posRef.current;
    if (Math.abs(d) < 0.001) {
      posRef.current = targetRef.current;
      setPos(posRef.current);
      raf.current = 0;
      return;
    }
    posRef.current += d * 0.16;
    setPos(posRef.current);
    raf.current = requestAnimationFrame(tick);
  }, []);

  const goTo = useCallback(
    (t: number) => {
      targetRef.current = t;
      setTarget(t);
      setPlaying(null);
      setHintGone(true);
      if (reduced.current) {
        posRef.current = t;
        setPos(t);
        return;
      }
      if (!raf.current) raf.current = requestAnimationFrame(tick);
    },
    [tick]
  );

  if (n === 0) return null;

  const active = mod(Math.round(target), n);
  const go = (delta: number) => goTo(Math.round(targetRef.current) + delta);

  function onPointerDown(e: RPointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = {
      down: true,
      moved: false,
      startX: e.clientX,
      startPos: posRef.current,
      lastX: e.clientX,
      lastT: performance.now(),
      v: 0,
    };
  }

  function onPointerMove(e: RPointerEvent) {
    const d = drag.current;
    if (!d.down) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      stageRef.current?.setPointerCapture(e.pointerId); // only once it is a real drag, so taps still click
      cancelAnimationFrame(raf.current);
      raf.current = 0;
      setPlaying(null);
    }
    if (!d.moved) return;
    const now = performance.now();
    const dt = Math.max(1, now - d.lastT);
    d.v = (d.lastX - e.clientX) / step / dt; // cards per ms
    d.lastX = e.clientX;
    d.lastT = now;
    posRef.current = d.startPos - dx / step;
    targetRef.current = posRef.current;
    setPos(posRef.current);
  }

  function endDrag() {
    const d = drag.current;
    if (!d.down) return;
    d.down = false;
    if (d.moved) {
      const flick = Math.max(-1.5, Math.min(1.5, d.v * 220));
      goTo(Math.round(posRef.current + flick));
    }
  }

  function onKeyDown(e: RKeyboardEvent) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={stageRef}
        role="group"
        aria-roledescription="carousel"
        aria-label="Trending videos"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(e) => {
          if (drag.current.moved) {
            e.stopPropagation();
            e.preventDefault();
            drag.current.moved = false;
          }
        }}
        className="relative w-full touch-pan-y select-none overflow-hidden rounded-3xl bg-gradient-to-b from-brand-light/25 via-brand-light/10 to-transparent outline-none focus-visible:ring-2 focus-visible:ring-brand"
        style={{ height: cardH + 44, perspective: 900 } as CSSProperties}
      >
        {items.map((v, i) => {
          const r = n > 1 ? wrap(i - pos, n) : 0;
          const a = Math.abs(r);
          const visible = a < 2.75;
          const scale = Math.max(0, 1 - 0.2 * Math.min(a, 3));
          const opacity = a <= 1 ? 1 - 0.18 * a : Math.max(0, 0.82 - (a - 1) * 0.5);
          const isActive = i === active;
          const isPlaying = playing === v.id && isActive;
          const rank = i + 1;

          return (
            <div
              key={v.id}
              className="absolute left-1/2 top-5"
              style={{
                width: cardW,
                marginLeft: -cardW / 2,
                transform: `translate3d(${r * step}px,0,0) rotateY(${-r * 12}deg) scale(${scale})`,
                opacity,
                zIndex: Math.round(100 - a * 20),
                visibility: visible ? "visible" : "hidden",
                pointerEvents: visible ? "auto" : "none",
              }}
            >
              <div
                className={cn(
                  "relative overflow-hidden rounded-2xl bg-black ring-1 ring-brand-light/50",
                  isActive ? "shadow-lift" : "shadow-card"
                )}
                style={{ height: cardH }}
              >
                {isPlaying ? (
                  <iframe
                    src={`${youtubeEmbedUrl(v.vid)}?autoplay=1&rel=0`}
                    title={v.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                ) : (
                  <button
                    type="button"
                    tabIndex={isActive ? 0 : -1}
                    aria-label={isActive ? `Play: ${v.title}` : `Show: ${v.title}`}
                    onClick={() => {
                      if (isActive) setPlaying(v.id);
                      else goTo(Math.round(targetRef.current) + wrap(i - Math.round(targetRef.current), n));
                    }}
                    className="group absolute inset-0 block h-full w-full text-left"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={youtubeThumbnail(v.vid)}
                      alt=""
                      loading={i < 3 ? "eager" : "lazy"}
                      draggable={false}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />

                    {rank === 1 && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-brand-secondary px-2.5 py-1 text-[11px] font-extrabold text-[#0f1f14]">
                        <Flame className="h-3.5 w-3.5" /> #1
                      </span>
                    )}

                    {isActive && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg ring-4 ring-white/60 transition-transform group-hover:scale-110">
                          <Play className="ml-0.5 h-6 w-6 fill-white" />
                        </span>
                      </span>
                    )}

                    <span className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-3">
                      <span
                        aria-hidden="true"
                        className="font-mono text-4xl font-extrabold leading-none text-white/90 [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]"
                      >
                        {String(rank).padStart(2, "0")}
                      </span>
                      <span className="line-clamp-2 pb-0.5 text-sm font-bold leading-snug text-white">
                        {v.title}
                      </span>
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label={labels.prev}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-light bg-surface text-brand-ink shadow-card transition-transform hover:bg-brand-light/30 active:scale-90"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex min-w-[7rem] flex-col items-center gap-1.5">
          <span className="font-mono text-sm font-extrabold tabular-nums text-brand-ink">
            {String(active + 1).padStart(2, "0")}
            <span className="text-gray-500"> / {String(n).padStart(2, "0")}</span>
          </span>
          {n <= 10 && (
            <span className="flex gap-1" aria-hidden="true">
              {items.map((v, i) => (
                <span
                  key={v.id}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-200",
                    i === active ? "w-5 bg-brand" : "w-1.5 bg-brand-light"
                  )}
                />
              ))}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label={labels.next}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-light bg-surface text-brand-ink shadow-card transition-transform hover:bg-brand-light/30 active:scale-90"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <p className={cn("text-center text-xs font-semibold text-gray-600 transition-opacity", hintGone && "opacity-0")}>
        {labels.hint}
      </p>
      <p className="sr-only" aria-live="polite">
        {items[active].title}
      </p>
    </div>
  );
}
