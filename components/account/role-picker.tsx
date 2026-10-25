"use client";

import { Briefcase, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type AccountRole = "creator" | "business";

const OPTIONS: { value: AccountRole; title: string; desc: string; icon: typeof Sparkles }[] = [
  { value: "creator", title: "Creator", desc: "YouTube, Facebook, TikTok, Instagram", icon: Sparkles },
  { value: "business", title: "Business", desc: "Shop, course or service", icon: Briefcase },
];

export function RolePicker({
  value,
  onChange,
}: {
  value: AccountRole;
  onChange: (r: AccountRole) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-medium">Account type</legend>
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map(({ value: v, title, desc, icon: Icon }) => (
          <label
            key={v}
            className={cn(
              "flex cursor-pointer flex-col gap-1 rounded-xl border p-3 transition-colors",
              value === v
                ? "border-brand bg-brand-light/25 ring-2 ring-brand/30"
                : "border-brand-light/70 hover:bg-brand-light/10"
            )}
          >
            <input
              type="radio"
              name="role"
              value={v}
              checked={value === v}
              onChange={() => onChange(v)}
              className="sr-only"
            />
            <Icon className="h-5 w-5 text-brand-deep" />
            <span className="text-sm font-bold">{title}</span>
            <span className="text-xs leading-snug text-gray-600">{desc}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
