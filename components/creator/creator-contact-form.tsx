"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { saveCreatorContact } from "@/app/actions/creator";
import { SOCIAL_FIELDS, type CreatorSettingsView } from "@/lib/creator/links";
import type { ActionState } from "@/lib/actions/types";

/** About text + "Get in touch" details + social links. Everything is optional: only filled fields appear publicly. */
export function CreatorContactForm({ settings }: { settings: CreatorSettingsView }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async (_prev, fd) => saveCreatorContact(fd),
    undefined
  );

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-1.5 md:col-span-2">
        <Label htmlFor="cc-about">About</Label>
        <Textarea id="cc-about" name="about" rows={5} maxLength={1500} defaultValue={settings.about} />
        <p className="text-xs text-gray-500">Shown in the About section of your page. Up to 1500 characters.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cc-email">Email</Label>
        <Input id="cc-email" name="contact_email" type="email" inputMode="email" maxLength={120} defaultValue={settings.email ?? ""} placeholder="you@example.com" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cc-phone">Phone</Label>
        <Input id="cc-phone" name="contact_phone" type="tel" inputMode="tel" maxLength={20} defaultValue={settings.phone ?? ""} placeholder="01712345678" />
      </div>

      {SOCIAL_FIELDS.map((f) => (
        <div key={f.key} className="flex flex-col gap-1.5">
          <Label htmlFor={`cc-${f.key}`}>{f.label}</Label>
          <Input
            id={`cc-${f.key}`}
            name={`social_${f.key}`}
            type="url"
            inputMode="url"
            maxLength={300}
            defaultValue={settings.socials[f.key] ?? ""}
            placeholder={f.placeholder}
          />
        </div>
      ))}

      <p className="text-xs text-gray-500 md:col-span-2">
        Your WhatsApp number (in the profile form above) is always shown first. Everything here is public.
      </p>

      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <Button type="submit" disabled={pending} className="h-11 px-6">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save About &amp; contact
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
