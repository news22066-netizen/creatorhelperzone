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
import { upsertFaq, deleteFaq } from "@/app/actions/admin";
import type { Faq } from "@/types/database";

function FaqForm({ faq, onDone }: { faq?: Faq; onDone?: () => void }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    async (_prev, fd) => {
      const r = await upsertFaq(fd);
      if (!r.error) onDone?.();
      return r;
    },
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border bg-white p-4">
      {faq && <input type="hidden" name="id" value={faq.id} />}
      <div className="flex flex-col gap-1">
        <Label>Question *</Label>
        <Input name="question" defaultValue={faq?.question} required />
      </div>
      <div className="flex flex-col gap-1">
        <Label>Answer *</Label>
        <Textarea name="answer" defaultValue={faq?.answer} rows={3} required />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-1">
          <Label>Sort order</Label>
          <Input name="sort_order" type="number" defaultValue={faq?.sort_order ?? 0} className="w-24" />
        </div>
        <div className="flex items-center gap-2 pt-5">
          <input type="checkbox" name="is_active" defaultChecked={faq?.is_active ?? true} id={`fa-${faq?.id ?? "new"}`} />
          <Label htmlFor={`fa-${faq?.id ?? "new"}`}>Active</Label>
        </div>
      </div>
      <FormFeedback state={state} />
      <div><SubmitButton label={faq ? "Save changes" : "Add FAQ"} /></div>
    </form>
  );
}

export function FaqManager({ faqs }: { faqs: Faq[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [, deleteAction] = useActionState<ActionState, FormData>(
    async (_prev, fd) => deleteFaq(fd),
    undefined
  );

  return (
    <div className="flex flex-col gap-4">
      {!adding ? (
        <Button onClick={() => setAdding(true)} className="w-fit">
          <Plus className="h-4 w-4" /> Add FAQ
        </Button>
      ) : (
        <FaqForm onDone={() => setAdding(false)} />
      )}

      <div className="flex flex-col gap-3">
        {faqs.map((faq) =>
          editingId === faq.id ? (
            <FaqForm key={faq.id} faq={faq} onDone={() => setEditingId(null)} />
          ) : (
            <div key={faq.id} className="flex items-start justify-between gap-3 rounded-xl border bg-white p-4">
              <div className="min-w-0">
                <p className="font-semibold">{faq.question}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{faq.answer}</p>
                {!faq.is_active && <p className="mt-1 text-xs text-muted-foreground">(hidden)</p>}
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditingId(faq.id)}>Edit</Button>
                <form action={deleteAction}>
                  <input type="hidden" name="id" value={faq.id} />
                  <SubmitButton label="Delete" variant="destructive" />
                </form>
              </div>
            </div>
          )
        )}
        {faqs.length === 0 && <p className="text-sm text-muted-foreground">No FAQs yet.</p>}
      </div>
    </div>
  );
}
