"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addFaq, deleteFaq } from "@/app/actions/store";
import type { ActionState } from "@/lib/actions/types";

const MAX_FAQS = 12;

/** Short store FAQ (max 12; the store Home shows the first 5). Shown only while "FAQ" is ticked above. */
export function FaqManager({ faqs }: { faqs: { id: string; question: string; answer: string }[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [removing, startRemove] = useTransition();
  const [removeError, setRemoveError] = useState<string | null>(null);

  const [state, formAction, pending] = useActionState<ActionState, FormData>(async (_prev, fd) => {
    const res = await addFaq(fd);
    if (res.success) formRef.current?.reset();
    return res;
  }, undefined);

  function remove(id: string) {
    if (!window.confirm("Delete this question?")) return;
    setRemoveError(null);
    startRemove(async () => {
      const res = await deleteFaq(id);
      if (res.error) setRemoveError(res.error);
    });
  }

  return (
    <section className="max-w-xl rounded-2xl border border-brand-light/70 bg-white p-4">
      <h2 className="text-lg font-extrabold">FAQ</h2>
      <p className="mt-0.5 text-sm text-gray-600">Short answers to common questions (delivery, returns, payment on WhatsApp...).</p>

      {faqs.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-brand-light bg-brand-light/10 px-3 py-4 text-center text-sm text-gray-600">
          No questions yet. Add your first one below.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {faqs.map((f) => (
            <li key={f.id} className="flex items-start gap-2 rounded-xl border border-brand-light/70 p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{f.question}</p>
                <p className="mt-0.5 line-clamp-2 whitespace-pre-line text-sm text-gray-600">{f.answer}</p>
              </div>
              <button
                type="button"
                onClick={() => remove(f.id)}
                disabled={removing}
                aria-label={`Delete question: ${f.question}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {faqs.length < MAX_FAQS ? (
        <form ref={formRef} action={formAction} className="mt-3 flex flex-col gap-2">
          <Input name="question" required maxLength={160} placeholder="Question, e.g. Do you deliver outside Dhaka?" aria-label="Question" className="h-11" />
          <Textarea name="answer" required maxLength={1000} rows={3} placeholder="Answer" aria-label="Answer" />
          <Button type="submit" disabled={pending} className="h-11 w-fit px-5">
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Add question
          </Button>
        </form>
      ) : (
        <p className="mt-3 text-xs text-gray-500">You reached the limit of {MAX_FAQS} questions.</p>
      )}
      {(state?.error || removeError) && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-600">
          {state?.error ?? removeError}
        </p>
      )}
    </section>
  );
}
