/**
 * YouTube URL -> video ID -> embed helpers.
 * Supports: youtube.com/watch?v=ID, youtu.be/ID,
 *           youtube.com/shorts|embed|live|v/ID, and bare IDs.
 * Never stores video files — embed only.
 */

const ID_RE = /^[A-Za-z0-9_-]{11}$/;

export function extractYouTubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  const url = input.trim();
  if (!url) return null;
  if (ID_RE.test(url)) return url;

  try {
    const u = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    const host = u.hostname.replace(/^www\./, "").replace(/^m\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0] ?? "";
      return ID_RE.test(id) ? id : null;
    }

    if (host === "youtube.com" || host.endsWith(".youtube.com")) {
      const v = u.searchParams.get("v");
      if (v && ID_RE.test(v)) return v;
      const m = u.pathname.match(/^\/(shorts|embed|live|v)\/([A-Za-z0-9_-]{11})/);
      if (m) return m[2];
    }
    return null;
  } catch {
    return null;
  }
}

export function youtubeEmbedUrl(id: string): string {
  // nocookie domain: privacy-friendly + lighter than standard embed
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

export function youtubeThumbnail(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
