"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { savePrivacy } from "@/app/actions/store";
import type { ActionState } from "@/lib/actions/types";

const MAX = 20000;

function starter(storeName: string) {
  return `Privacy Policy for ${storeName}

What we collect
When you message us on WhatsApp to order or ask a question, we receive your name, phone number and the details you send (such as your delivery address).

How we use it
We use this only to answer you, confirm your order and deliver it. We do not sell your information.

Sharing
We share delivery details with couriers only as needed to deliver your order.

Your choices
You can ask us to delete your messages and details at any time by contacting us on WhatsApp.

Changes
We may update this page. The latest version is always here.`;
}

export function PrivacyForm({ content, storeName }: { content: string; storeName: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async (_prev, fd) => savePrivacy(fd),
    undefined
  );
  const [text, setText] = useState(content);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-3">
      <Textarea
        name="content"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={16}
        maxLength={MAX}
        aria-label="Privacy policy text"
        placeholder="Write your store's privacy policy…"
      />
      <div className="flex items-center justify-between text-xs text-gray-500">
        <button
          type="button"
          onClick={() => setText(starter(storeName))}
          disabled={Boolean(text.trim())}
          className="font-semibold text-brand-deep underline disabled:no-underline disabled:opacity-40"
        >
          Insert a starter template
        </button>
        <span className="tabular-nums">
          {text.length.toLocaleString()} / {MAX.toLocaleString()}
        </span>
      </div>
      <p className="text-xs text-gray-500">Plain text. Leave a blank line between paragraphs. A template is only a starting point: adapt it to how your business works.</p>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending} className="h-11 px-6">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save
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
