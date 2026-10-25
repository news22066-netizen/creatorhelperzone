"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "./submit-button";
import { FormFeedback } from "./form-feedback";
import type { ActionState } from "@/lib/actions/types";
import { upsertDashboardGuide, deleteDashboardGuide } from "@/app/actions/admin";
import type { DashboardGuide, GuideAudience } from "@/types/database";

const AUDIENCE_LABEL: Record<GuideAudience, string> = {
  creator: "Creators",
  business: "Businesses",
  both: "Both",
};

function GuideForm({ guide, onDone }: { guide?: DashboardGuide; onDone?: () => void }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    async (_prev, fd) => {
      const r = await upsertDashboardGuide(fd);
      if (!r.error) onDone?.();
      return r;
    },
    undefined
  );
  const key = guide?.id ?? "new";

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border bg-white p-4">
      {guide && <input type="hidden" name="id" value={guide.id} />}
      <div className="flex flex-col gap-1">
        <Label htmlFor={`dg-title-${key}`}>Title *</Label>
        <Input id={`dg-title-${key}`} name="title" defaultValue={guide?.title} maxLength={120} required />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`dg-desc-${key}`}>Short description</Label>
        <Textarea id={`dg-desc-${key}`} name="description" rows={2} maxLength={400} defaultValue={guide?.description} />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`dg-yt-${key}`}>YouTube URL</Label>
        <Input
          id={`dg-yt-${key}`}
          name="youtube_url"
          type="url"
          inputMode="url"
          placeholder="https://youtu.be/xxxxxxxxxxx"
          defaultValue={guide?.youtube_url ?? ""}
        />
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor={`dg-aud-${key}`}>Audience</Label>
          <Select id={`dg-aud-${key}`} name="audience" defaultValue={guide?.audience ?? "both"} className="w-40">
            <option value="creator">Creators</option>
            <option value="business">Businesses</option>
            <option value="both">Both</option>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor={`dg-sort-${key}`}>Sort order</Label>
          <Input id={`dg-sort-${key}`} name="sort_order" type="number" defaultValue={guide?.sort_order ?? 0} className="w-24" />
        </div>
        <div className="flex items-center gap-2 pb-2">
          <input type="checkbox" name="is_active" id={`dg-act-${key}`} defaultChecked={guide?.is_active ?? true} />
          <Label htmlFor={`dg-act-${key}`}>Active</Label>
        </div>
      </div>
      <FormFeedback state={state} />
      <div className="flex gap-2">
        <SubmitButton label={guide ? "Save changes" : "Add guide"} />
        {onDone && (
          <Button type="button" size="sm" variant="outline" onClick={onDone}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export function DashboardGuideManager({ guides }: { guides: DashboardGuide[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [, deleteAction] = useActionState<ActionState, FormData>(
    async (_prev, fd) => deleteDashboardGuide(fd),
    undefined
  );

  return (
    <div className="flex flex-col gap-4">
      {!adding ? (
        <Button onClick={() => setAdding(true)} className="w-fit">
          <Plus className="h-4 w-4" /> Add guide
        </Button>
      ) : (
        <GuideForm onDone={() => setAdding(false)} />
      )}

      <div className="flex flex-col gap-3">
        {guides.map((g) =>
          editingId === g.id ? (
            <GuideForm key={g.id} guide={g} onDone={() => setEditingId(null)} />
          ) : (
            <div key={g.id} className="flex items-start justify-between gap-3 rounded-xl border bg-white p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{g.title}</p>
                  <Badge variant="green">{AUDIENCE_LABEL[g.audience]}</Badge>
                  {!g.is_active && <span className="text-xs text-muted-foreground">(hidden)</span>}
                </div>
                {g.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{g.description}</p>}
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  #{g.sort_order} · {g.youtube_url ?? "no video"}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditingId(g.id)}>
                  Edit
                </Button>
                <form action={deleteAction}>
                  <input type="hidden" name="id" value={g.id} />
                  <SubmitButton label="Delete" variant="destructive" />
                </form>
              </div>
            </div>
          )
        )}
        {guides.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No dashboard guides yet. Add one and it appears in the creator and business dashboards right away.
          </p>
        )}
      </div>
    </div>
  );
}
