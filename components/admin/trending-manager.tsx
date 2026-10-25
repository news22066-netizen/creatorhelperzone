"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "./submit-button";
import type { ActionState } from "@/lib/actions/types";
import { FormFeedback } from "./form-feedback";
import { upsertTrendingItem, deleteTrendingItem } from "@/app/actions/admin";
import { extractYouTubeId, youtubeThumbnail } from "@/lib/utils/youtube";
import type { TrendingItem } from "@/types/database";

const kindLabels: Record<TrendingItem["kind"], string> = {
  video: "Video",
  keyword: "Keyword",
  thumbnail_idea: "Thumbnail idea",
};

function ItemForm({ item, onDone }: { item?: TrendingItem; onDone?: () => void }) {
  const [kind, setKind] = useState<TrendingItem["kind"]>(item?.kind ?? "video");
  const [url, setUrl] = useState(item?.youtube_url ?? "");

  const [state, formAction] = useActionState<ActionState, FormData>(
    async (_prev, fd) => {
      const r = await upsertTrendingItem(fd);
      if (!r.error) onDone?.();
      return r;
    },
    undefined
  );

  const previewId = kind === "video" ? extractYouTubeId(url) : null;

  return (
    <form action={formAction} className="grid grid-cols-1 gap-3 rounded-xl border bg-white p-4 md:grid-cols-2">
      {item && <input type="hidden" name="id" value={item.id} />}
      <input type="hidden" name="kind" value={kind} />

      <div className="flex flex-col gap-1">
        <Label>Type</Label>
        <Select
          value={kind}
          onChange={(e) => setKind(e.target.value as TrendingItem["kind"])}
        >
          <option value="video">YouTube video</option>
          <option value="keyword">Keyword</option>
          <option value="thumbnail_idea">Thumbnail idea</option>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label>Week label</Label>
        <Input name="week_label" defaultValue={item?.week_label} placeholder="2026-W43" />
      </div>

      {kind === "video" && (
        <>
          <div className="flex flex-col gap-1 md:col-span-2">
            <Label>YouTube URL *</Label>
            <Input
              name="youtube_url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
              required
            />
            {url && !previewId && (
              <p className="text-xs text-red-600">Could not read a video ID from this link.</p>
            )}
          </div>
          {previewId && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={youtubeThumbnail(previewId)}
              alt="Thumbnail preview"
              className="h-24 w-40 rounded-lg object-cover md:col-span-2"
            />
          )}
        </>
      )}

      <div className={`flex flex-col gap-1 ${kind === "video" ? "md:col-span-2" : ""}`}>
        <Label>{kind === "video" ? "Video title *" : "Text *"}</Label>
        <Input name="title" defaultValue={item?.title} required />
      </div>

      <div className="flex flex-col gap-1">
        <Label>Sort order</Label>
        <Input name="sort_order" type="number" defaultValue={item?.sort_order ?? 0} />
      </div>
      <div className="flex items-center gap-2 pt-5">
        <input type="checkbox" name="is_active" defaultChecked={item?.is_active ?? true} id={`ta-${item?.id ?? "new"}`} />
        <Label htmlFor={`ta-${item?.id ?? "new"}`}>Active</Label>
      </div>

      <div className="md:col-span-2"><FormFeedback state={state} /></div>
      <div className="md:col-span-2"><SubmitButton label={item ? "Save changes" : "Add item"} /></div>
    </form>
  );
}

export function TrendingManager({ items }: { items: TrendingItem[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [, deleteAction] = useActionState<ActionState, FormData>(
    async (_prev, fd) => deleteTrendingItem(fd),
    undefined
  );

  return (
    <div className="flex flex-col gap-4">
      {!adding ? (
        <Button onClick={() => setAdding(true)} className="w-fit">
          <Plus className="h-4 w-4" /> Add trending item
        </Button>
      ) : (
        <ItemForm onDone={() => setAdding(false)} />
      )}

      <div className="flex flex-col gap-3">
        {items.map((item) =>
          editingId === item.id ? (
            <ItemForm key={item.id} item={item} onDone={() => setEditingId(null)} />
          ) : (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border bg-white p-4">
              <div className="flex min-w-0 items-center gap-3">
                {item.kind === "video" && item.youtube_id && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={youtubeThumbnail(item.youtube_id)} alt="" className="h-12 w-20 shrink-0 rounded object-cover" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{kindLabels[item.kind]}</Badge>
                    <span className="text-xs text-muted-foreground">{item.week_label}</span>
                  </div>
                  <p className="mt-1 truncate text-sm font-semibold">{item.title}</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditingId(item.id)}>Edit</Button>
                <form action={deleteAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <SubmitButton label="Delete" variant="destructive" />
                </form>
              </div>
            </div>
          )
        )}
        {items.length === 0 && <p className="text-sm text-muted-foreground">No trending items yet.</p>}
      </div>
    </div>
  );
}
