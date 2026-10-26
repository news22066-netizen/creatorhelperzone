"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "./submit-button";
import { FormFeedback } from "./form-feedback";
import type { ActionState } from "@/lib/actions/types";
import { updateBranding } from "@/app/actions/admin";
import { SITE_SOCIALS } from "@/lib/site/socials";
import type { SiteSettings } from "@/types/database";

export function BrandingForm({
  settings,
  envLogoSet,
}: {
  settings: SiteSettings;
  /** NEXT_PUBLIC_LOGO_URL is set (used only while the field below is empty). */
  envLogoSet: boolean;
}) {
  const [state, action] = useActionState<ActionState, FormData>(
    async (_prev, fd) => updateBranding(fd),
    undefined
  );

  return (
    <form action={action} className="flex flex-col gap-6">
      <section className="flex flex-col gap-3 rounded-xl border bg-white p-4">
        <div>
          <h2 className="font-semibold">Header logo</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Paste an https image link (imgbb or any CDN). Shown at about 36px tall on phones and 44px on desktop,
            width automatic. Leave empty to show the text mark.
            {envLogoSet && " While empty, the NEXT_PUBLIC_LOGO_URL environment value is used."}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="logo_url">Logo URL</Label>
          <Input
            id="logo_url"
            name="logo_url"
            type="url"
            inputMode="url"
            defaultValue={settings.logo_url}
            placeholder="https://i.ibb.co/xxxx/creatorhub-logo.png"
            maxLength={500}
          />
        </div>
        {settings.logo_url && (
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <span className="text-xs text-muted-foreground">Current:</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={settings.logo_url} alt="BFEED" className="h-9 w-auto max-w-[200px] object-contain" />
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-xl border bg-white p-4">
        <div>
          <h2 className="font-semibold">Social links</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Site-wide, shown in the public footer and the menu. Only the filled ones appear. WhatsApp also accepts a
            plain number (01712345678).
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {SITE_SOCIALS.map((s) => (
            <div key={s.key} className="flex flex-col gap-1">
              <Label htmlFor={`social_${s.key}`}>{s.label}</Label>
              <Input
                id={`social_${s.key}`}
                name={`social_${s.key}`}
                inputMode="url"
                defaultValue={settings.social_links[s.key] ?? ""}
                placeholder={s.placeholder}
                maxLength={300}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-2">
        <FormFeedback state={state} />
        <div>
          <SubmitButton label="Save branding" />
        </div>
      </div>
    </form>
  );
}
