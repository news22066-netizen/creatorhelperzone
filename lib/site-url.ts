/**
 * The public base URL of the site, used for every absolute link we generate: WhatsApp messages,
 * share links, canonical URLs, sitemap.
 *
 * Rules
 *  1. NEXT_PUBLIC_SITE_URL wins (trailing slash / path removed, scheme added if missing).
 *  2. In a PRODUCTION build a local address (localhost, 127.x, *.local ...) is never used: a value copied
 *     from .env.local into the hosting dashboard must not leak into customer-facing WhatsApp texts.
 *     It is ignored and the production default below is used instead.
 *  3. Not set at all: development -> http://localhost:3000, production -> the real domain.
 *
 * NEXT_PUBLIC_* values are inlined at BUILD time: after changing the variable in Vercel, redeploy.
 */
export const DEFAULT_PRODUCTION_URL = "https://bfeed.store";
export const DEFAULT_DEV_URL = "http://localhost:3000";

const LOCAL_HOST_RE = /^(localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0|\[::1\]|[^.]+\.local|[^.]+\.localhost)$/i;

export function isLocalHost(hostname: string): boolean {
  return LOCAL_HOST_RE.test(hostname);
}

function toOrigin(raw: string | undefined | null): URL | null {
  const v = (raw ?? "").trim();
  if (!v) return null;
  try {
    const u = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(v) ? v : `https://${v}`);
    return u.protocol === "http:" || u.protocol === "https:" ? u : null;
  } catch {
    return null;
  }
}

/** Pure function (testable): env value + mode in, base URL out. No trailing slash. */
export function resolveSiteUrl(envValue: string | undefined, isProduction: boolean): string {
  const u = toOrigin(envValue);
  if (u && !(isProduction && isLocalHost(u.hostname))) return u.origin;
  return isProduction ? DEFAULT_PRODUCTION_URL : DEFAULT_DEV_URL;
}

// The two process.env reads must stay literal so Next can inline them in server AND client bundles.
export const SITE_URL = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL, process.env.NODE_ENV === "production");

/** "/alice/shop/red-shirt" -> "https://bfeed.store/alice/shop/red-shirt" */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
