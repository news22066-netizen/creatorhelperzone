"use client";

import { useActionState, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "./submit-button";
import type { ActionState } from "@/lib/actions/types";
import { FormFeedback } from "./form-feedback";
import { upsertGuide } from "@/app/actions/admin";
import { slugify } from "@/lib/utils/username";
import type { Guide } from "@/types/database";

export function GuideForm({ guide }: { guide?: Guide }) {
  const [slug, setSlug] = useState(guide?.slug ?? "");
  const slugManuallyEdited = useRef(Boolean(guide?.slug));

  const [state, formAction] = useActionState<ActionState, FormData>(
    async (_prev, fd) => upsertGuide(fd),
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-2xl border bg-white p-5">
      {guide && <input type="hidden" name="id" value={guide.id} />}

      <div className="flex flex-col gap-1">
        <Label>Title *</Label>
        <Input
          name="title"
          defaultValue={guide?.title}
          onChange={(e) => {
            if (!slugManuallyEdited.current) setSlug(slugify(e.target.value));
          }}
          required
          placeholder="How to grow a Facebook page in Bangladesh"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label>Slug *</Label>
        <Input
          name="slug"
          value={slug}
          onChange={(e) => {
            slugManuallyEdited.current = true;
            setSlug(e.target.value);
          }}
          required
          placeholder="grow-facebook-page-bd"
        />
        <p className="text-xs text-muted-foreground">Public URL: eg.com/guides/your-slug</p>
      </div>

      <div className="flex flex-col gap-1">
        <Label>Excerpt</Label>
        <Textarea name="excerpt" defaultValue={guide?.excerpt} rows={2} placeholder="One or two sentences for SEO and listings." />
      </div>

      <div className="flex flex-col gap-1">
        <Label>Content *</Label>
        <Textarea
          name="content"
          defaultValue={guide?.content}
          rows={14}
          required
          placeholder={"Write in plain text.\n\nSeparate paragraphs with a blank line.\n\n## Section heading\n### Sub heading"}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label>Cover image URL (imgbb or similar)</Label>
        <Input name="cover_url" type="url" defaultValue={guide?.cover_url ?? ""} placeholder="https://i.ibb.co/..." />
      </div>

      <div className="flex flex-col gap-1">
        <Label>Status</Label>
        <Select name="status" defaultValue={guide?.status ?? "draft"}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="unpublished">Unpublished</option>
        </Select>
        <p className="text-xs text-muted-foreground">Only published guides are visible on eg.com.</p>
      </div>

      <FormFeedback state={state} />
      <SubmitButton label={guide ? "Save guide" : "Create guide"} />
    </form>
  );
}
