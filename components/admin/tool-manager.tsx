"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "./submit-button";
import type { ActionState } from "@/lib/actions/types";
import { FormFeedback } from "./form-feedback";
import { upsertTool, deleteTool } from "@/app/actions/admin";
import { slugify } from "@/lib/utils/username";
import type { Tool } from "@/types/database";

const empty = {
  name: "", description: "", url: "", icon: "🔧",
  gradient: "from-blue-500 to-indigo-500", sort_order: 0, is_active: true,
};

function ToolForm({ tool, onDone }: { tool?: Tool; onDone?: () => void }) {
  const [name, setName] = useState(tool?.name ?? "");
  const [slug, setSlug] = useState(tool?.slug ?? "");
  // Existing slugs are never auto-rewritten (changing a live URL hurts SEO).
  const [slugEdited, setSlugEdited] = useState(Boolean(tool?.slug));
  const [metaTitleLen, setMetaTitleLen] = useState(tool?.meta_title?.length ?? 0);
  const [metaDescLen, setMetaDescLen] = useState(tool?.meta_description?.length ?? 0);
  const [state, formAction] = useActionState<ActionState, FormData>(
    async (_prev, fd) => {
      const r = await upsertTool(fd);
      if (!r.error) onDone?.();
      return r;
    },
    undefined
  );

  return (
    <form action={formAction} className="grid grid-cols-1 gap-3 rounded-xl border bg-white p-4 md:grid-cols-2">
      {tool && <input type="hidden" name="id" value={tool.id} />}
      <div className="flex flex-col gap-1">
        <Label>Name *</Label>
        <Input
          name="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugEdited) setSlug(slugify(e.target.value));
          }}
          required
          placeholder="Canva"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label>External URL *</Label>
        <Input name="url" type="url" defaultValue={tool?.url} required placeholder="https://..." />
      </div>
      <div className="flex flex-col gap-1 md:col-span-2">
        <Label>Slug * (page URL: /tools/{slug || "your-slug"})</Label>
        <Input
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlugEdited(true);
            setSlug(e.target.value.toLowerCase());
          }}
          placeholder="canva"
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          title="Lowercase English letters, numbers and single hyphens"
        />
        {tool?.slug && (
          <p className="text-xs text-muted-foreground">
            Changing the slug changes the live URL — the old address will stop working.
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1 md:col-span-2">
        <Label>Short description</Label>
        <Textarea name="description" defaultValue={tool?.description} rows={2} />
      </div>
      <div className="flex flex-col gap-1">
        <Label>Icon (emoji or imgbb link)</Label>
        <Input name="icon" defaultValue={tool?.icon ?? "🔧"} />
      </div>
      <div className="flex flex-col gap-1">
        <Label>Gradient classes</Label>
        <Input name="gradient" defaultValue={tool?.gradient ?? empty.gradient} placeholder="from-purple-500 to-pink-500" />
      </div>
      <div className="flex flex-col gap-1">
        <Label>Sort order</Label>
        <Input name="sort_order" type="number" defaultValue={tool?.sort_order ?? 0} />
      </div>
      <div className="flex items-center gap-2 pt-5">
        <input type="checkbox" name="is_active" defaultChecked={tool?.is_active ?? true} id={`active-${tool?.id ?? "new"}`} />
        <Label htmlFor={`active-${tool?.id ?? "new"}`}>Active (publicly visible)</Label>
      </div>
      <div className="flex flex-col gap-1 md:col-span-2">
        <Label>Article content (shown on the tool page)</Label>
        <Textarea
          name="content"
          defaultValue={tool?.content ?? ""}
          rows={12}
          placeholder={"## What is it?\n\nParagraph...\n\n- bullet\n- bullet\n\n## FAQ\n\n### Is it free?\n\nAnswer..."}
          className="font-mono text-xs"
        />
        <p className="text-xs text-muted-foreground">
          Supports ## / ### headings, - bullet lists, 1. numbered lists, **bold** and
          [text](https://link). Questions under a <code>## FAQ</code> heading (### Question, then
          the answer) become the FAQ block.
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <Label>Meta title ({metaTitleLen}/60 recommended)</Label>
        <Input
          name="meta_title"
          defaultValue={tool?.meta_title ?? ""}
          maxLength={120}
          onChange={(e) => setMetaTitleLen(e.target.value.length)}
          placeholder="Defaults to the tool name"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label>Meta description ({metaDescLen}/160 recommended)</Label>
        <Textarea
          name="meta_description"
          defaultValue={tool?.meta_description ?? ""}
          rows={2}
          maxLength={300}
          onChange={(e) => setMetaDescLen(e.target.value.length)}
          placeholder="Defaults to the short description"
        />
      </div>
      <div className="md:col-span-2">
        <FormFeedback state={state} />
      </div>
      <div className="md:col-span-2">
        <SubmitButton label={tool ? "Save changes" : "Add tool"} />
      </div>
    </form>
  );
}

export function ToolManager({ tools }: { tools: Tool[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [, deleteAction] = useActionState<ActionState, FormData>(
    async (_prev, fd) => deleteTool(fd),
    undefined
  );

  return (
    <div className="flex flex-col gap-4">
      {!adding ? (
        <Button onClick={() => setAdding(true)} className="w-fit">
          <Plus className="h-4 w-4" /> Add tool
        </Button>
      ) : (
        <ToolForm onDone={() => setAdding(false)} />
      )}

      <div className="flex flex-col gap-3">
        {tools.map((tool) =>
          editingId === tool.id ? (
            <ToolForm key={tool.id} tool={tool} onDone={() => setEditingId(null)} />
          ) : (
            <div key={tool.id} className="flex items-center justify-between gap-3 rounded-xl border bg-white p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="text-2xl">{tool.icon.startsWith("http") ? "🔗" : tool.icon}</span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {tool.name}{" "}
                    {!tool.is_active && <span className="text-xs font-normal text-muted-foreground">(hidden)</span>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    /tools/{tool.slug ?? "—"} · {tool.description}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditingId(tool.id)}>Edit</Button>
                <form action={deleteAction}>
                  <input type="hidden" name="id" value={tool.id} />
                  <SubmitButton label="Delete" variant="destructive" />
                </form>
              </div>
            </div>
          )
        )}
        {tools.length === 0 && <p className="text-sm text-muted-foreground">No tools yet — add the first one.</p>}
      </div>
    </div>
  );
}
