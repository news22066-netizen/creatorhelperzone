"use client";

import { useActionState, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveStoreSettings } from "@/app/actions/store";
import { contrastRatio, themeToCssVars } from "@/lib/store/theme";
import { SECTION_OPTIONS } from "@/lib/store/sections";
import type { ActionState } from "@/lib/actions/types";
import { DEFAULT_STORE_THEME, type StoreSections, type StoreTheme } from "@/types/store";

const PRESETS: { name: string; theme: StoreTheme }[] = [
  { name: "Classic", theme: DEFAULT_STORE_THEME },
  { name: "Forest", theme: { background: "#f7fdf8", primary: "#2f9a42", text: "#14532d" } },
  { name: "Night", theme: { background: "#0b1220", primary: "#42e55f", text: "#e5e7eb" } },
  { name: "Warm", theme: { background: "#fffaf3", primary: "#c2410c", text: "#44403c" } },
];

const FIELDS = [
  { key: "background", label: "Background", name: "theme_background" },
  { key: "primary", label: "Buttons & accents", name: "theme_primary" },
  { key: "text", label: "Text", name: "theme_text" },
] as const;

export function StoreSettingsForm({
  displayName,
  theme: initialTheme,
  youtubeUrl,
  sections,
  fallbackName,
}: {
  displayName: string;
  theme: StoreTheme;
  youtubeUrl: string;
  sections: StoreSections;
  fallbackName: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async (_prev, fd) => saveStoreSettings(fd),
    undefined
  );
  const [theme, setTheme] = useState<StoreTheme>(initialTheme);
  const [name, setName] = useState(displayName);

  const lowContrast = contrastRatio(theme.text, theme.background) < 4.5;
  const lowAccent = contrastRatio(theme.primary, theme.background) < 3;

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ss-name">Store name</Label>
        <Input
          id="ss-name"
          name="display_name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          placeholder={fallbackName}
        />
        <p className="text-xs text-gray-500">Shown in the store header. Leave empty to use {fallbackName}.</p>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-medium">Theme colors</legend>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Color presets">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => setTheme(p.theme)}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-input px-3 text-sm font-semibold hover:bg-brand-light/20"
            >
              <span className="flex">
                {[p.theme.background, p.theme.primary, p.theme.text].map((c) => (
                  <span key={c} className="-ml-1 h-4 w-4 rounded-full border border-black/10 first:ml-0" style={{ backgroundColor: c }} />
                ))}
              </span>
              {p.name}
            </button>
          ))}
        </div>

        {FIELDS.map(({ key, label, name: inputName }) => (
          <label key={key} className="flex min-h-11 items-center justify-between gap-4 text-sm font-medium">
            {label}
            <span className="flex items-center gap-2">
              <code className="text-xs text-gray-500">{theme[key]}</code>
              <input
                type="color"
                name={inputName}
                value={theme[key]}
                onChange={(e) => setTheme((t) => ({ ...t, [key]: e.target.value }))}
                className="h-10 w-12 cursor-pointer rounded-md border border-input bg-transparent p-1"
              />
            </span>
          </label>
        ))}

        {lowContrast && (
          <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            Text and background are too similar, so your store may be hard to read. Pick colors with more contrast.
          </p>
        )}

        {lowAccent && (
          <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            Buttons and prices are too close to the background color, so they may be hard to see.
          </p>
        )}

        {/* Live preview: same CSS variables the public store uses */}
        <div
          style={themeToCssVars(theme)}
          className="rounded-2xl border border-black/10 bg-store-bg p-4 text-store-text"
          aria-label="Preview"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-store-text/60">Preview</p>
          <p className="mt-1 text-lg font-extrabold">{name || fallbackName}</p>
          <p className="text-sm text-store-text/75">A short line about your products.</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="font-extrabold text-store-primary">৳1,200</span>
            <span className="inline-flex h-10 items-center rounded-full bg-store-primary px-5 text-sm font-bold text-store-on-primary">
              Order on WhatsApp
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setTheme(DEFAULT_STORE_THEME)}
          className="w-fit text-sm font-semibold text-gray-600 underline"
        >
          Reset to defaults (black / white / gray)
        </button>
      </fieldset>

      <fieldset className="flex flex-col gap-1">
        <legend className="mb-1 text-sm font-medium">Store sections</legend>
        <p className="text-xs text-gray-500">Tick what visitors should see. Unticked sections are hidden on your public store.</p>
        {SECTION_OPTIONS.map((o) => (
          <label key={o.key} className="flex min-h-12 items-start gap-3 rounded-xl border border-brand-light/70 bg-white px-3 py-2.5">
            <input
              type="checkbox"
              name={o.key}
              defaultChecked={sections[o.key]}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#2f9a42]"
            />
            <span>
              <span className="block text-sm font-bold">{o.label}</span>
              <span className="block text-xs text-gray-500">{o.hint}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ss-video">YouTube video (optional)</Label>
        <Input
          id="ss-video"
          name="youtube_url"
          type="url"
          inputMode="url"
          defaultValue={youtubeUrl}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <p className="text-xs text-gray-500">Shown on your store home. YouTube links only, videos are never uploaded.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending} className="h-11 px-6">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save settings
        </Button>
        {state?.error && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {state.error}
          </p>
        )}
        {state?.success && <p className="text-sm font-medium text-brand-deep">Saved ✓</p>}
      </div>
    </form>
  );
}
