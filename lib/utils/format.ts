export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/** Format a DB error for quick debugging in admin UI. */
export function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}
