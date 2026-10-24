import type { CSSProperties } from "react";
import { DEFAULT_STORE_THEME, type StoreTheme } from "@/types/store";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function isHexColor(v: unknown): v is string {
  return typeof v === "string" && HEX_RE.test(v);
}

/**
 * The DB only checks that the jsonb has the three keys, not what is inside. These values end up in
 * inline styles, so anything that is not a plain #rrggbb falls back to the default (no CSS injection).
 */
export function parseTheme(raw: unknown): StoreTheme {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const pick = (k: keyof StoreTheme) => (isHexColor(o[k]) ? (o[k] as string).toLowerCase() : DEFAULT_STORE_THEME[k]);
  return { background: pick("background"), primary: pick("primary"), text: pick("text") };
}

function channels(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio, 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * CSS variables for the store shell. Hex values (--store-bg …) plus rgb channels so Tailwind's
 * `bg-store-bg/90`, `border-store-text/15` etc. can apply opacity. `--store-on-primary-rgb` is the
 * readable text colour (near-black or white) for buttons filled with the primary colour.
 */
export function themeToCssVars(input: StoreTheme): CSSProperties {
  const t = parseTheme(input);
  const rgb = (hex: string) => channels(hex).join(" ");
  // Whichever of near-black / white reads better on the primary colour (real WCAG contrast, not a fixed cut-off).
  const onPrimary = contrastRatio(t.primary, "#111827") >= contrastRatio(t.primary, "#ffffff") ? "17 24 39" : "255 255 255";
  return {
    "--store-bg": t.background,
    "--store-primary": t.primary,
    "--store-text": t.text,
    "--store-bg-rgb": rgb(t.background),
    "--store-primary-rgb": rgb(t.primary),
    "--store-text-rgb": rgb(t.text),
    "--store-on-primary-rgb": onPrimary,
  } as CSSProperties;
}
