const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(v: string): boolean {
  return UUID_RE.test(v);
}

/** Only http(s) URLs. Blocks javascript:, data:, etc. (stored XSS via href/src). */
export function isHttpUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Read a string field from FormData, trimmed. */
export function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

/** Integer in [min, max]; falls back to `fallback` on garbage input. */
export function int(
  fd: FormData,
  key: string,
  { min = -9999, max = 9999, fallback = 0 } = {}
): number {
  const n = Number.parseInt(str(fd, key), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/** "2026-W43" */
export const WEEK_LABEL_RE = /^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/;

/** Lowercase-kebab slug: a-z, 0-9, single hyphens. */
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Tailwind-ish gradient classes only, e.g. "from-purple-500 to-pink-500". */
export const GRADIENT_RE = /^[a-z0-9\- ]{1,80}$/;

/** Turn Postgres/PostgREST errors into messages that are safe to show. */
export function friendlyDbError(error: { code?: string; message: string }): string {
  switch (error.code) {
    case "23505":
      return "That value is already used (duplicate).";
    case "23514":
      return "Some values did not pass validation.";
    case "42501":
      return "Permission denied.";
    default:
      return error.message;
  }
}

/**
 * Normalise a WhatsApp number to digits only, international format, no "+".
 * Accepts "+8801712345678", "8801712-345678", "01712 345678" (Bangladesh local).
 * Returns "" for empty input and null when the number is not valid.
 */
export function normalizeWhatsapp(input: string): string | null {
  const raw = input.trim();
  if (!raw) return "";
  if (!/^\+?[0-9\s\-().]+$/.test(raw)) return null;
  let digits = raw.replace(/\D/g, "");
  // Bangladesh local format 01XXXXXXXXX -> 8801XXXXXXXXX
  if (/^01[0-9]{9}$/.test(digits)) digits = `88${digits}`;
  return /^[0-9]{8,15}$/.test(digits) ? digits : null;
}
