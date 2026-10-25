import type { CSSProperties } from "react";
import { contrastRatio } from "@/lib/store/theme";

/**
 * Creator page appearance: 20 solid colours + 5 gradients. The creator picks a PRESET; only its id
 * ("solid-midnight", "grad-aurora") is stored. Colours live here, so nothing user-typed ever reaches a
 * style attribute, and every preset is checked for readable text (see scripts in the test checklist:
 * every preset must reach WCAG 4.5:1 for body text, cards included).
 */
export interface AppearancePreset {
  id: string;
  label: string;
  kind: "solid" | "gradient";
  /** 1 colour (solid) or 2 colours (gradient start -> end). */
  colors: [string] | [string, string];
}

export const SOLID_PRESETS: AppearancePreset[] = [
  // deep & rich
  { id: "solid-midnight", label: "Midnight", kind: "solid", colors: ["#0f1b3d"] },
  { id: "solid-emerald", label: "Emerald", kind: "solid", colors: ["#064e3b"] },
  { id: "solid-forest", label: "Forest", kind: "solid", colors: ["#14532d"] },
  { id: "solid-indigo", label: "Royal Indigo", kind: "solid", colors: ["#312e81"] },
  { id: "solid-plum", label: "Plum", kind: "solid", colors: ["#4a1d6b"] },
  { id: "solid-burgundy", label: "Burgundy", kind: "solid", colors: ["#6b1d2a"] },
  { id: "solid-espresso", label: "Espresso", kind: "solid", colors: ["#3b2417"] },
  { id: "solid-slate", label: "Slate", kind: "solid", colors: ["#1e293b"] },
  { id: "solid-teal", label: "Deep Teal", kind: "solid", colors: ["#134e4a"] },
  { id: "solid-ocean", label: "Ocean", kind: "solid", colors: ["#0c4a6e"] },
  // soft & light
  { id: "solid-white", label: "White", kind: "solid", colors: ["#ffffff"] },
  { id: "solid-ivory", label: "Ivory", kind: "solid", colors: ["#fbf7ef"] },
  { id: "solid-cloud", label: "Cloud", kind: "solid", colors: ["#f1f5f9"] },
  { id: "solid-mint", label: "Mint", kind: "solid", colors: ["#e6f6ee"] },
  { id: "solid-sky", label: "Sky", kind: "solid", colors: ["#e0f0fb"] },
  { id: "solid-lavender", label: "Lavender", kind: "solid", colors: ["#ece8fb"] },
  { id: "solid-blush", label: "Blush", kind: "solid", colors: ["#fbe8ee"] },
  { id: "solid-sand", label: "Sand", kind: "solid", colors: ["#f3ead9"] },
  { id: "solid-peach", label: "Peach", kind: "solid", colors: ["#fde7d9"] },
  { id: "solid-sage", label: "Sage", kind: "solid", colors: ["#e4ebdd"] },
];

export const GRADIENT_PRESETS: AppearancePreset[] = [
  { id: "grad-aurora", label: "Aurora", kind: "gradient", colors: ["#0b5f5a", "#1e3fa8"] },
  { id: "grad-sunset", label: "Sunset", kind: "gradient", colors: ["#9a3412", "#9d174d"] },
  { id: "grad-royal", label: "Royal", kind: "gradient", colors: ["#4c1d95", "#1e3a8a"] },
  { id: "grad-mint-cream", label: "Mint Cream", kind: "gradient", colors: ["#dcfce7", "#e0f2fe"] },
  { id: "grad-peach-bloom", label: "Peach Bloom", kind: "gradient", colors: ["#ffe4e6", "#fef3c7"] },
];

export const ALL_PRESETS: AppearancePreset[] = [...SOLID_PRESETS, ...GRADIENT_PRESETS];
export const DEFAULT_APPEARANCE = "solid-white";

const BY_ID = new Map(ALL_PRESETS.map((p) => [p.id, p]));

/** Unknown / tampered ids fall back to the default instead of breaking the page. */
export function getPreset(id: string | null | undefined): AppearancePreset {
  return (id && BY_ID.get(id)) || BY_ID.get(DEFAULT_APPEARANCE)!;
}

export function cssBackground(p: AppearancePreset): string {
  return p.kind === "gradient" ? `linear-gradient(160deg, ${p.colors[0]}, ${p.colors[1]})` : p.colors[0];
}

const DARK_TEXT = "#0f172a";
const LIGHT_TEXT = "#ffffff";

function rgbChannels(hex: string): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/** The page text colour: whichever of near-black / white has the better WORST-case contrast over all stops. */
export function pickTextColor(colors: readonly string[]): string {
  const worst = (text: string) => Math.min(...colors.map((c) => contrastRatio(c, text)));
  return worst(DARK_TEXT) >= worst(LIGHT_TEXT) ? DARK_TEXT : LIGHT_TEXT;
}

/** Alpha of the white "glass" laid over the page for cards: faint on dark presets, strong on light ones. */
export function surfaceAlpha(text: string): number {
  return text === LIGHT_TEXT ? 0.1 : 0.72;
}

/**
 * CSS variables used by the .cp-* classes in globals.css:
 *   --cp-bg         background (colour or gradient)
 *   --cp-text-rgb   page text, icons, solid buttons
 *   --cp-btn-text   text on a solid button (a preset colour: same contrast as page text on the page)
 *   --cp-surface-*  card glass
 */
export function appearanceVars(id: string | null | undefined): CSSProperties {
  const preset = getPreset(id);
  const text = pickTextColor(preset.colors);
  return {
    "--cp-bg": cssBackground(preset),
    "--cp-text-rgb": rgbChannels(text),
    "--cp-btn-text": preset.colors[0],
    "--cp-surface-a": String(surfaceAlpha(text)),
  } as CSSProperties;
}

// ---- helpers for the contrast self-check (used by the test script) ----

function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = rgbChannels(a).split(" ").map(Number);
  const [br, bg, bb] = rgbChannels(b).split(" ").map(Number);
  const h = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, "0");
  return `#${h(ar, br)}${h(ag, bg)}${h(ab, bb)}`;
}

/** Worst-case contrast figures for one preset: page text, muted text (78%), text on a card, inverted button. */
export function presetContrast(p: AppearancePreset) {
  const text = pickTextColor(p.colors);
  const a = surfaceAlpha(text);
  const min = (fn: (c: string) => number) => Math.min(...p.colors.map(fn));
  return {
    text,
    page: min((c) => contrastRatio(c, text)),
    muted: min((c) => contrastRatio(c, mix(c, text, 0.78))),
    card: min((c) => contrastRatio(mix(c, "#ffffff", a), text)),
    button: min((c) => contrastRatio(text, c)),
  };
}
