"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Eye, EyeOff, Loader2, Pencil, Trash2 } from "lucide-react";
import { deleteWork, setWorkActive } from "@/app/actions/creator";

const iconBtn =
  "flex h-11 w-11 items-center justify-center rounded-xl text-gray-700 transition-colors hover:bg-brand-light/30 disabled:opacity-50";

/** Edit / show-hide / delete for one row of the works list. */
export function WorkRowActions({ id, title, active }: { id: string; title: string; active: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    setError(null);
    start(async () => {
      const res = await setWorkActive(id, !active);
      if (res.error) setError(res.error);
    });
  }
  function remove() {
    if (!window.confirm(`Delete "${title}"? This also removes its photo links.`)) return;
    setError(null);
    start(async () => {
      const res = await deleteWork(id);
      if (res.error) setError(res.error);
    });
  }

  return (
    <div className="flex shrink-0 flex-col items-end">
      <div className="flex">
        <Link href={`/dashboard/creator/works/${id}`} aria-label={`Edit ${title}`} className={iconBtn}>
          <Pencil className="h-4 w-4" />
        </Link>
        <button type="button" onClick={toggle} disabled={pending} aria-label={active ? `Hide ${title}` : `Show ${title}`} className={iconBtn}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
        <button type="button" onClick={remove} disabled={pending} aria-label={`Delete ${title}`} className={`${iconBtn} text-red-600 hover:bg-red-50`}>
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {error && (
        <p role="alert" className="max-w-[10rem] text-right text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/** Delete button for the edit page (returns to the list afterwards). */
export function DeleteWorkButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove() {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setError(null);
    start(async () => {
      const res = await deleteWork(id);
      if (res.error) setError(res.error);
      else router.push("/dashboard/creator/works");
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-200 px-5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        Delete work
      </button>
      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
