"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { Loader2, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { deletePlan, savePlan } from "@/app/actions/creator";
import type { ActionState } from "@/lib/actions/types";
import type { CreatorPlan } from "@/types/creator";

const MAX_PLANS = 6;

function PlanForm({ plan, onSaved }: { plan?: CreatorPlan; onSaved?: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(async (_prev, fd) => {
    const res = await savePlan(fd);
    if (res.success) {
      if (!plan) formRef.current?.reset();
      onSaved?.();
    }
    return res;
  }, undefined);
  const k = plan?.id ?? "new";

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      {plan && <input type="hidden" name="id" value={plan.id} />}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`pl-name-${k}`}>Plan name</Label>
          <Input id={`pl-name-${k}`} name="name" required maxLength={60} defaultValue={plan?.name} placeholder="Free, Premium, Starter..." />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`pl-price-${k}`}>Price text</Label>
          <Input id={`pl-price-${k}`} name="price_text" maxLength={40} defaultValue={plan?.price_text} placeholder="৳500 / month" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`pl-tag-${k}`}>Short description</Label>
        <Input id={`pl-tag-${k}`} name="tagline" maxLength={200} defaultValue={plan?.tagline} placeholder="Who it is for" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`pl-feat-${k}`}>What you get</Label>
        <Textarea id={`pl-feat-${k}`} name="features" rows={5} maxLength={1200} defaultValue={plan?.features} placeholder={"One feature per line\n10 social posts\nMonthly report"} />
        <p className="text-xs text-gray-500">One feature per line, up to 12 lines.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`pl-cta-${k}`}>Button text</Label>
          <Input id={`pl-cta-${k}`} name="cta_label" maxLength={30} defaultValue={plan?.cta_label ?? "Get started"} />
          <p className="text-xs text-gray-500">The button opens WhatsApp with this plan&apos;s name filled in.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`pl-sort-${k}`}>Display order</Label>
          <Input id={`pl-sort-${k}`} name="sort_order" type="number" min="0" max="9999" defaultValue={plan?.sort_order ?? 0} className="max-w-[8rem]" />
        </div>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-1">
        <label className="flex min-h-11 items-center gap-2.5 text-sm font-medium">
          <input type="checkbox" name="is_featured" defaultChecked={plan?.is_featured ?? false} className="h-5 w-5 accent-[#2f9a42]" />
          Highlight this plan
        </label>
        <label className="flex min-h-11 items-center gap-2.5 text-sm font-medium">
          <input type="checkbox" name="is_active" defaultChecked={plan?.is_active ?? true} className="h-5 w-5 accent-[#2f9a42]" />
          Visible on my page
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending} className="h-11 px-6">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {plan ? "Save plan" : "Add plan"}
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

/** Pricing plans the creator defines. Public buttons open WhatsApp: no checkout, no payments. */
export function PlansManager({ plans }: { plans: CreatorPlan[] }) {
  const [removing, startRemove] = useTransition();
  const [removeError, setRemoveError] = useState<string | null>(null);

  function remove(p: CreatorPlan) {
    if (!window.confirm(`Delete the plan "${p.name}"?`)) return;
    setRemoveError(null);
    startRemove(async () => {
      const res = await deletePlan(p.id);
      if (res.error) setRemoveError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {plans.length === 0 && (
        <div className="rounded-2xl border border-dashed border-brand-light bg-brand-light/10 px-5 py-8 text-center">
          <p className="font-bold">No plans yet</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-gray-600">
            Add plans like Free and Premium. Visitors tap the button and message you on WhatsApp.
          </p>
        </div>
      )}

      {plans.map((p) => (
        <details key={p.id} className="group rounded-2xl border border-brand-light/70 bg-white">
          <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-2 [&::-webkit-details-marker]:hidden">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate text-sm font-bold">
                {p.name}
                {p.is_featured && <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-500" aria-label="Highlighted" />}
                {!p.is_active && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-gray-600">Hidden</span>
                )}
              </p>
              <p className="truncate text-xs text-gray-500">{p.price_text || "No price text"}</p>
            </div>
            <span className="text-xs font-bold text-brand-deep group-open:hidden">Edit</span>
            <span className="hidden text-xs font-bold text-brand-deep group-open:inline">Close</span>
          </summary>
          <div className="border-t border-brand-light/60 p-4">
            <PlanForm plan={p} />
            <div className="mt-3 border-t border-gray-200 pt-3">
              <button
                type="button"
                onClick={() => remove(p)}
                disabled={removing}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-200 px-5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" /> Delete plan
              </button>
            </div>
          </div>
        </details>
      ))}
      {removeError && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {removeError}
        </p>
      )}

      {plans.length < MAX_PLANS ? (
        <details open={plans.length === 0} className="group rounded-2xl border border-brand-light/70 bg-brand-light/10">
          <summary className="flex min-h-14 cursor-pointer list-none items-center gap-2 px-4 text-sm font-bold [&::-webkit-details-marker]:hidden">
            <Plus className="h-4 w-4" /> Add a plan
          </summary>
          <div className="border-t border-brand-light/60 p-4">
            <PlanForm />
          </div>
        </details>
      ) : (
        <p className="text-xs text-gray-500">You reached the limit of {MAX_PLANS} plans.</p>
      )}
    </div>
  );
}
