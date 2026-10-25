"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { saveWork } from "@/app/actions/creator";
import type { ActionState } from "@/lib/actions/types";
import { ImageUrlFields } from "./image-url-fields";

export interface WorkFormValues {
  id?: string;
  title: string;
  description: string;
  youtube_url: string;
  link_url: string;
  is_active: boolean;
  sort_order: number;
  images: string[];
}

/** Shared by /works/new and /works/[id]. The public Works grid opens each item in a popup. */
export function WorkForm({ work }: { work?: WorkFormValues }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(async (_prev, fd) => saveWork(fd), undefined);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {work?.id && <input type="hidden" name="id" value={work.id} />}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="wf-title">Title</Label>
        <Input id="wf-title" name="title" required maxLength={120} defaultValue={work?.title} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="wf-desc">Description</Label>
        <Textarea id="wf-desc" name="description" rows={5} maxLength={2000} defaultValue={work?.description} />
        <p className="text-xs text-gray-500">Shown in the popup when a visitor taps this work.</p>
      </div>

      <ImageUrlFields initial={work?.images ?? []} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="wf-yt">YouTube video (optional)</Label>
        <Input id="wf-yt" name="youtube_url" type="url" inputMode="url" maxLength={300} defaultValue={work?.youtube_url} placeholder="https://www.youtube.com/watch?v=..." />
        <p className="text-xs text-gray-500">Plays inside the popup. YouTube links only.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="wf-link">Project link (optional)</Label>
        <Input id="wf-link" name="link_url" type="url" inputMode="url" maxLength={500} defaultValue={work?.link_url} placeholder="https://..." />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="wf-sort">Display order</Label>
        <Input id="wf-sort" name="sort_order" type="number" min="0" max="9999" defaultValue={work?.sort_order ?? 0} className="max-w-[8rem]" />
        <p className="text-xs text-gray-500">Lower numbers show first.</p>
      </div>

      <label className="flex min-h-11 items-center gap-2.5 text-sm font-medium">
        <input type="checkbox" name="is_active" defaultChecked={work?.is_active ?? true} className="h-5 w-5 accent-[#2f9a42]" />
        Visible on my page
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending} className="h-11 px-6">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {work?.id ? "Save changes" : "Add work"}
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
