"use client";

import { useRef, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Flame, Home, Store, Wrench } from "lucide-react";
import { useLang } from "@/lib/i18n/language-provider";
import { cn } from "../../lib/utils/cn";

// Notifications live in the top bar; FAQ + Collaboration are in the menu drawer.
const items = [
  { href: "/", icon: Home, key: "nav.home" },
  { href: "/tools", icon: Wrench, key: "nav.tools" },
  { href: "/trending", icon: Flame, key: "nav.trending" },
  { href: "/guides", icon: BookOpen, key: "nav.guides" },
  { href: "/store", icon: Store, key: "nav.store" },
];

const REST_ACTIVE = 1.09; // active item rest scale
const MAX_LIFT = 0.2; // extra scale under the finger
const REACH = 1.5; // how many item-widths the effect spreads (neighbours get a small share)

/**
 * Bottom nav with a minimal Mac-dock feel for touch:
 * - the item under a pressed/sliding finger lifts and grows a little, neighbours follow with the
 *   same cosine falloff as the dock demo, then everything springs back on release;
 * - the active item rests at scale 1.09 and does one small dock bounce when it becomes active.
 * No hover magnification, no layout shift (only transforms). Off under prefers-reduced-motion.
 */
export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLang();
  const refs = useRef<(HTMLSpanElement | null)[]>([]);

  function magnify(clientX: number | null) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    refs.current.forEach((el) => {
      if (!el) return;
      if (clientX === null) {
        el.style.removeProperty("--s");
        el.style.removeProperty("--ty");
        return;
      }
      const rect = el.parentElement!.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const d = Math.abs(clientX - center) / rect.width;
      const m = d < REACH ? Math.cos((d / REACH) * (Math.PI / 2)) : 0;
      el.style.setProperty("--s", String(1 + MAX_LIFT * m));
      el.style.setProperty("--ty", `${-6 * m}px`);
    });
  }

  function onPointerDown(e: RPointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    magnify(e.clientX);
  }
  function onPointerMove(e: RPointerEvent) {
    if (e.pointerType === "mouse" && e.buttons !== 1) return;
    magnify(e.clientX);
  }
  const release = () => magnify(null);

  return (
    <nav
      aria-label="Primary"
      className="pb-safe fixed bottom-0 left-0 right-0 z-40 border-t border-brand-light/60 bg-surface/95 backdrop-blur md:hidden"
    >
      <div
        className="mx-auto grid max-w-2xl grid-cols-5"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={release}
        onPointerCancel={release}
        onPointerLeave={release}
      >
        {items.map(({ href, icon: Icon, key }, idx) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-16 min-w-[44px] flex-col items-center justify-center text-[11px] font-semibold transition-colors duration-200",
                active ? "text-brand" : "text-gray-500"
              )}
            >
              {active && <span className="absolute top-0 h-[3px] w-8 rounded-b-full bg-brand" />}
              <span
                ref={(el) => {
                  refs.current[idx] = el;
                }}
                className="flex flex-col items-center gap-1 will-change-transform [transform:translateY(var(--ty,0px))_scale(var(--s,var(--rest)))] [transition:transform_260ms_cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none"
                style={{ "--rest": active ? REST_ACTIVE : 1 } as CSSProperties}
              >
                <span
                  className={cn(
                    "flex h-8 w-12 items-center justify-center rounded-full transition-colors duration-200",
                    active && "dock-bounce bg-brand-light/40"
                  )}
                >
                  <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.5 : 2} />
                </span>
                <span className="-mt-1 leading-none">{t(key)}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
