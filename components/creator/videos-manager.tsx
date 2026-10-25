"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SafeImg } from "@/components/store/safe-img";
import { addVideo, deleteVideo } from "@/app/actions/creator";
import { extractYouTubeId, youtubeThumbnail } from "@/lib/utils/youtube";
import type { ActionState } from "@/lib/actions/types";

const MAX_VIDEOS = 12;

/** "Latest YouTube videos" on the public Home. YouTube links only; thumbnails come from YouTube. */
export function VideosManager({ videos }: { videos: { id: string; url: string; title: string }[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [removing, startRemove] = useTransition();
  const [removeError, setRemoveError] = useState<string | null>(null);

  const [state, formAction, pending] = useActionState<ActionState, FormData>(async (_prev, fd) => {
    const res = await addVideo(fd);
    if (res.success) formRef.current?.reset();
    return res;
  }, undefined);

  function remove(id: string) {
    setRemoveError(null);
    startRemove(async () => {
      const res = await deleteVideo(id);
      if (res.error) setRemoveError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {videos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-brand-light bg-brand-light/10 px-3 py-4 text-center text-sm text-gray-600">
          No videos yet. Paste a YouTube link below. The newest one you add shows last, the first one is shown big.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {videos.map((v) => {
            const id = extractYouTubeId(v.url);
            return (
              <li key={v.id} className="flex items-center gap-3 rounded-xl border border-brand-light/70 p-2">
                <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-black">
                  {id && <SafeImg src={youtubeThumbnail(id)} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{v.title || "YouTube video"}</p>
                  <p className="truncate text-xs text-gray-500">{v.url.replace(/^https:\/\/(www\.)?/, "")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(v.id)}
                  disabled={removing}
                  aria-label={`Remove video ${v.title || v.url}`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {videos.length < MAX_VIDEOS ? (
        <form ref={formRef} action={formAction} className="flex flex-col gap-2 rounded-2xl border border-brand-light/70 bg-brand-light/10 p-3">
          <p className="text-sm font-bold">Add a video</p>
          <Input name="url" type="url" inputMode="url" required placeholder="https://www.youtube.com/watch?v=..." aria-label="YouTube link" className="h-11" />
          <Input name="title" maxLength={100} placeholder="Title (optional)" aria-label="Video title" className="h-11" />
          <Button type="submit" disabled={pending} className="h-11 w-fit px-5">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add video
          </Button>
        </form>
      ) : (
        <p className="text-xs text-gray-500">You reached the limit of {MAX_VIDEOS} videos.</p>
      )}
      {(state?.error || removeError) && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {state?.error ?? removeError}
        </p>
      )}
    </div>
  );
}
