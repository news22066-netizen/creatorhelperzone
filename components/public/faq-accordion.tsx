"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function FaqAccordion({
  items,
}: {
  items: { id: string; question: string; answer: string }[];
}) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const open = openId === item.id;
        const panelId = `faq-panel-${item.id}`;
        return (
          <div
            key={item.id}
            className={cn(
              "overflow-hidden rounded-2xl border bg-surface shadow-card transition-colors",
              open ? "border-brand" : "border-brand-light/70"
            )}
          >
            <button
              onClick={() => setOpenId(open ? null : item.id)}
              aria-expanded={open}
              aria-controls={panelId}
              className={cn(
                "flex min-h-16 w-full items-center justify-between gap-3 px-5 py-4 text-left text-[15px] font-bold transition-colors",
                open ? "bg-brand text-white" : "text-brand-ink hover:bg-brand-light/20"
              )}
            >
              {item.question}
              <ChevronDown
                className={cn("h-5 w-5 shrink-0 transition-transform", open && "rotate-180")}
              />
            </button>
            {open && (
              <div
                id={panelId}
                className="bg-brand-light/20 px-5 py-4 text-[15px] leading-relaxed text-gray-800"
              >
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
