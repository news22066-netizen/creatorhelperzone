"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveAppearance } from "@/app/actions/creator";
import { GRADIENT_PRESETS, SOLID_PRESETS, appearanceVars, cssBackground, type AppearancePreset } from "@/lib/creator/appearance";

/** 20 solid + 5 gradient presets with a live preview of the real page styles. Saves the preset id only. */
export function AppearancePicker({ current, name }: { current: string; name: string }) {
  const [selected, setSelected] = useState(current);
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function save() {
    setMessage(null);
    start(async () => {
      const res = await saveAppearance(selected);
      setMessage(res.error ? { ok: false, text: res.error } : { ok: true, text: "Saved ✓" });
    });
  }

  const group = (title: string, list: AppearancePreset[]) => (
    <fieldset>
      <legend className="mb-2 text-sm font-extrabold">{title}</legend>
      <div role="radiogroup" aria-label={title} className="grid grid-cols-5 gap-2.5 sm:grid-cols-7">
        {list.map((p) => {
          const on = p.id === selected;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={p.label}
              onClick={() => {
                setSelected(p.id);
                setMessage(null);
              }}
              className="group flex flex-col items-center gap-1"
            >
              <span
                style={{ background: cssBackground(p) }}
                className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 shadow-sm transition-transform group-hover:scale-105 ${
                  on ? "border-brand ring-2 ring-brand ring-offset-2" : "border-gray-300"
                }`}
              >
                {on && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-brand-deep shadow">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                )}
              </span>
              <span className="w-full truncate text-center text-[10px] font-semibold text-gray-600">{p.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* live preview: same classes and variables as the public page */}
      <div style={appearanceVars(selected)} className="cp-page rounded-3xl border border-gray-200 p-5 shadow-sm">
        <div className="mx-auto flex max-w-[16rem] flex-col items-center gap-3 text-center">
          <span className="cp-card flex h-16 w-16 items-center justify-center rounded-full text-xl font-extrabold">
            {name.replace(/^@/, "").charAt(0).toUpperCase() || "A"}
          </span>
          <p className="text-lg font-extrabold">{name}</p>
          <p className="cp-muted text-sm">Your bio appears here, in a readable color.</p>
          <div className="cp-card w-full rounded-2xl p-3 text-left text-sm">
            <p className="font-bold">A card on your page</p>
            <p className="cp-muted text-xs">Works, plans and contact use this style.</p>
          </div>
          <span className="cp-btn inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-bold">
            <MessageCircle className="h-4 w-4" /> Message me
          </span>
        </div>
      </div>

      {group("Solid colors", SOLID_PRESETS)}
      {group("Gradients", GRADIENT_PRESETS)}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={save} disabled={pending || selected === current && !message} className="h-11 px-6">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save appearance
        </Button>
        {message && (
          <p role={message.ok ? undefined : "alert"} className={`text-sm font-medium ${message.ok ? "text-brand-deep" : "text-red-600"}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
