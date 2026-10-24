"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addCategory, deleteCategory } from "@/app/actions/store";
import type { ActionState } from "@/lib/actions/types";

const MAX_CATEGORIES = 12;

/** Optional product categories (max 12): they become filter chips on the public shop. */
export function CategoriesManager({ categories }: { categories: { id: string; name: string }[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [removing, startRemove] = useTransition();
  const [removeError, setRemoveError] = useState<string | null>(null);

  const [state, formAction, pending] = useActionState<ActionState, FormData>(async (_prev, fd) => {
    const res = await addCategory(fd);
    if (res.success) formRef.current?.reset();
    return res;
  }, undefined);

  function remove(id: string, name: string) {
    if (!window.confirm(`Delete category "${name}"? Its products stay in your store.`)) return;
    setRemoveError(null);
    startRemove(async () => {
      const res = await deleteCategory(id);
      if (res.error) setRemoveError(res.error);
    });
  }

  return (
    <section className="rounded-2xl border border-brand-light/70 bg-white p-4">
      <h2 className="text-lg font-extrabold">Categories</h2>
      <p className="mt-0.5 text-sm text-gray-600">Optional. Customers can filter your shop by category.</p>

      {categories.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <li
              key={c.id}
              className="inline-flex items-center gap-1 rounded-full border border-brand-light bg-brand-light/20 py-1 pl-3 pr-1 text-sm font-semibold"
            >
              {c.name}
              <button
                type="button"
                onClick={() => remove(c.id, c.name)}
                disabled={removing}
                aria-label={`Delete category ${c.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {categories.length < MAX_CATEGORIES ? (
        <form ref={formRef} action={formAction} className="mt-3 flex gap-2">
          <Input name="name" required maxLength={60} placeholder="e.g. T-shirts" aria-label="New category name" className="h-11" />
          <Button type="submit" disabled={pending} className="h-11 shrink-0 px-5">
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Add
          </Button>
        </form>
      ) : (
        <p className="mt-3 text-xs text-gray-500">You reached the limit of {MAX_CATEGORIES} categories.</p>
      )}
      {(state?.error || removeError) && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-600">
          {state?.error ?? removeError}
        </p>
      )}
    </section>
  );
}
