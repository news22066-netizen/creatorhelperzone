"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveStoreContact } from "@/app/actions/store";
import type { ActionState } from "@/lib/actions/types";
import type { StoreContact } from "@/types/store";

/** Optional contact links for the public Contact page. Only filled fields are shown to customers. */
export function ContactLinksForm({ contact }: { contact: StoreContact }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async (_prev, fd) => saveStoreContact(fd),
    undefined
  );

  const urlField = (key: keyof StoreContact, label: string, placeholder: string) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`cl-${key}`}>{label}</Label>
      <Input
        id={`cl-${key}`}
        name={`contact_${key}`}
        type="url"
        inputMode="url"
        defaultValue={contact[key] ?? ""}
        placeholder={placeholder}
        maxLength={300}
      />
    </div>
  );

  return (
    <section className="rounded-2xl border border-brand-light/70 bg-white p-4">
      <h2 className="text-lg font-extrabold">More contact links</h2>
      <p className="mt-0.5 text-sm text-gray-600">
        All optional. Customers see only the ones you fill in, on your store&apos;s Contact page. Your WhatsApp number above
        is always shown first. Everything here is public.
      </p>

      <form action={formAction} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cl-phone">Phone (calls)</Label>
          <Input
            id="cl-phone"
            name="contact_phone"
            type="tel"
            inputMode="tel"
            defaultValue={contact.phone ?? ""}
            placeholder="01712345678"
            maxLength={20}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cl-email">Email</Label>
          <Input
            id="cl-email"
            name="contact_email"
            type="email"
            inputMode="email"
            defaultValue={contact.email ?? ""}
            placeholder="hello@yourshop.com"
            maxLength={120}
          />
        </div>
        {urlField("facebook", "Facebook page", "https://facebook.com/yourpage")}
        {urlField("instagram", "Instagram", "https://instagram.com/yourname")}
        {urlField("tiktok", "TikTok", "https://tiktok.com/@yourname")}
        {urlField("youtube", "YouTube channel", "https://youtube.com/@yourchannel")}
        {urlField("website", "Website", "https://yourshop.com")}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cl-address">Address / location</Label>
          <Input
            id="cl-address"
            name="contact_address"
            defaultValue={contact.address ?? ""}
            placeholder="Shop 12, Gulshan 1, Dhaka"
            maxLength={200}
          />
          <p className="text-xs text-gray-500">Customers can tap it to open Google Maps.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:col-span-2">
          <Button type="submit" disabled={pending} className="h-11 px-6">
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save contact links
          </Button>
          {state?.error && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {state.error}
            </p>
          )}
          {state?.success && <p className="text-sm font-medium text-brand-deep">Saved ✓</p>}
        </div>
      </form>
    </section>
  );
}
