"use client";

import { useState } from "react";

export type MarqueeTool = { id: string; name: string; icon: string };

const UNIQUE = 10; // never more than 10 distinct icons (same URLs repeat, so the browser fetches each once)

function IconTile({ tool }: { tool: MarqueeTool }) {
  const [failed, setFailed] = useState(false);
  const isUrl = tool.icon.startsWith("http");
  return (
    <div className="flex w-[88px] shrink-0 flex-col items-center gap-1.5 rounded-2xl border border-brand-light/70 bg-surface/90 p-2 shadow-card">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light/30 text-xl">
        {isUrl && !failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tool.icon}
            alt=""
            width={28}
            height={28}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="h-7 w-7 rounded object-contain"
          />
        ) : isUrl ? (
          <span className="text-base font-extrabold text-brand-deep">{tool.name.trim().charAt(0)}</span>
        ) : (
          <span>{tool.icon}</span>
        )}
      </span>
      <span className="w-full truncate text-center text-[11px] font-bold text-brand-ink">{tool.name}</span>
    </div>
  );
}

const ROWS = [
  { offset: 0, shift: "0px", duration: "80s", reverse: false },
  { offset: 3, shift: "-46px", duration: "95s", reverse: true },
  { offset: 6, shift: "-20px", duration: "88s", reverse: false },
];

/** Diagonal CSS marquee of real tool icons. The only decorative motion on the home page. */
export function ToolMarquee({ tools }: { tools: MarqueeTool[] }) {
  if (tools.length < 4) return null;
  const base = Array.from({ length: UNIQUE }, (_, i) => tools[i % tools.length]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-1/2 flex w-[1500px] -translate-x-1/2 -translate-y-1/2 -rotate-[10deg] flex-col gap-[4.5rem]">
        {ROWS.map((row, r) => {
          const ordered = base.map((_, i) => base[(i + row.offset) % base.length]);
          return (
            <div
              key={r}
              className="home-marquee-row"
              data-reverse={row.reverse}
              style={{ marginLeft: row.shift, animationDuration: row.duration }}
            >
              {[0, 1].map((copy) => (
                <div className="home-marquee-group" key={copy}>
                  {ordered.map((t, i) => (
                    <IconTile key={`${copy}-${i}`} tool={t} />
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
