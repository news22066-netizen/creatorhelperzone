"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/app/actions/account";
import type { ActionState } from "@/lib/actions/types";

export function ProfileForm({
  fullName,
  bio,
  avatarUrl,
  whatsapp,
}: {
  fullName: string;
  bio: string;
  avatarUrl: string;
  whatsapp: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async (_prev, fd) => updateProfile(fd),
    undefined
  );

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="p-name">Display name</Label>
        <Input id="p-name" name="full_name" defaultValue={fullName} maxLength={60} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="p-wa">WhatsApp number</Label>
        <Input
          id="p-wa"
          name="whatsapp"
          defaultValue={whatsapp}
          inputMode="tel"
          placeholder="01712345678"
        />
        <p className="text-xs text-gray-500">Shows a WhatsApp button on your page. Leave empty to hide.</p>
      </div>
      <div className="flex flex-col gap-1.5 md:col-span-2">
        <Label htmlFor="p-avatar">Avatar image link</Label>
        <Input
          id="p-avatar"
          name="avatar_url"
          type="url"
          defaultValue={avatarUrl}
          placeholder="https://i.ibb.co/..."
        />
        <p className="text-xs text-gray-500">Upload to imgbb.com and paste the direct image link.</p>
      </div>
      <div className="flex flex-col gap-1.5 md:col-span-2">
        <Label htmlFor="p-bio">Bio</Label>
        <Textarea id="p-bio" name="bio" defaultValue={bio} rows={3} maxLength={280} />
        <p className="text-xs text-gray-500">Up to 280 characters.</p>
      </div>
      <div className="flex items-center gap-3 md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save profile
        </Button>
        {state?.error && <p role="alert" className="text-sm font-medium text-red-600">{state.error}</p>}
        {state?.success && <p className="text-sm font-medium text-brand-deep">Saved ✓</p>}
      </div>
    </form>
  );
}
