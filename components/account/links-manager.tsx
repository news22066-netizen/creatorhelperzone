"use client";

import { useActionState, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addLink, deleteLink, moveLink, updateLink } from "@/app/actions/account";
import type { ActionState } from "@/lib/actions/types";
import type { ProfileLink } from "@/types/database";

const MAX_LINKS = 20;

function ErrorText({ state }: { state: ActionState }) {
  return state?.error ? (
    <p role="alert" className="text-sm font-medium text-red-600">
      {state.error}
    </p>
  ) : null;
}

function AddLinkForm({ disabled }: { disabled: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async (_prev, fd) => {
      const r = await addLink(fd);
      if (r.success) formRef.current?.reset();
      return r;
    },
    undefined
  );

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-2 rounded-2xl border border-brand-light/70 bg-brand-light/10 p-3"
    >
      <p className="text-sm font-bold">Add a link</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input name="title" placeholder="Title (e.g. My YouTube)" required maxLength={80} aria-label="Link title" />
        <Input name="url" placeholder="https://…" required aria-label="Link URL" />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending || disabled}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add link
        </Button>
        {disabled && <span className="text-xs text-gray-600">Link limit reached ({MAX_LINKS}).</span>}
      </div>
      <ErrorText state={state} />
    </form>
  );
}

function LinkRow({
  link,
  isFirst,
  isLast,
}: {
  link: ProfileLink;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [editing, setEditing] = useState(false);

  const [editState, editAction, editPending] = useActionState<ActionState, FormData>(
    async (_prev, fd) => {
      const r = await updateLink(fd);
      if (r.success) setEditing(false);
      return r;
    },
    undefined
  );
  const [moveState, moveAction, movePending] = useActionState<ActionState, FormData>(
    async (_prev, fd) => moveLink(fd),
    undefined
  );
  const [delState, deleteAction, deletePending] = useActionState<ActionState, FormData>(
    async (_prev, fd) => deleteLink(fd),
    undefined
  );

  if (editing) {
    return (
      <li className="rounded-2xl border border-brand bg-white p-3">
        <form action={editAction} className="flex flex-col gap-2">
          <input type="hidden" name="id" value={link.id} />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Input name="title" defaultValue={link.title} required maxLength={80} aria-label="Link title" />
            <Input name="url" defaultValue={link.url} required aria-label="Link URL" />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={editPending}>
              {editPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
          <ErrorText state={editState} />
        </form>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-1 rounded-2xl border border-brand-light/60 bg-white p-3">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{link.title}</p>
          <p className="truncate text-xs text-gray-600">{link.url}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <form action={moveAction}>
            <input type="hidden" name="id" value={link.id} />
            <input type="hidden" name="dir" value="up" />
            <Button type="submit" size="icon" variant="ghost" disabled={isFirst || movePending} aria-label="Move up">
              <ArrowUp className="h-4 w-4" />
            </Button>
          </form>
          <form action={moveAction}>
            <input type="hidden" name="id" value={link.id} />
            <input type="hidden" name="dir" value="down" />
            <Button type="submit" size="icon" variant="ghost" disabled={isLast || movePending} aria-label="Move down">
              <ArrowDown className="h-4 w-4" />
            </Button>
          </form>
          <Button size="icon" variant="ghost" onClick={() => setEditing(true)} aria-label="Edit link">
            <Pencil className="h-4 w-4" />
          </Button>
          <form
            action={deleteAction}
            onSubmit={(e) => {
              if (!confirm(`Delete "${link.title}"?`)) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={link.id} />
            <Button type="submit" size="icon" variant="ghost" disabled={deletePending} aria-label="Delete link">
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </form>
        </div>
      </div>
      <ErrorText state={moveState} />
      <ErrorText state={delState} />
    </li>
  );
}

export function LinksManager({ links }: { links: ProfileLink[] }) {
  return (
    <div className="flex flex-col gap-3">
      {links.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-brand-light bg-brand-light/10 p-5 text-center text-sm text-gray-600">
          No links yet — add your first one below.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {links.map((l, i) => (
            <LinkRow key={l.id} link={l} isFirst={i === 0} isLast={i === links.length - 1} />
          ))}
        </ul>
      )}
      <AddLinkForm disabled={links.length >= MAX_LINKS} />
    </div>
  );
}
