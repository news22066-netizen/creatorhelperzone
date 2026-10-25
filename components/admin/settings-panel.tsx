"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "./submit-button";
import type { ActionState } from "@/lib/actions/types";
import { FormFeedback } from "./form-feedback";
import {
  updateSettings,
  upsertAnnouncement,
  deleteAnnouncement,
} from "@/app/actions/admin";
import { formatDate } from "@/lib/utils/format";
import type { Announcement, SiteSettings } from "@/types/database";

function ToggleRow({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border p-4">
      <div>
        <Label htmlFor={name}>{label}</Label>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <input
        type="checkbox"
        name={name}
        id={name}
        defaultChecked={defaultChecked}
        className="mt-1 h-5 w-5 accent-blue-600"
      />
    </div>
  );
}

export function SettingsPanel({
  settings,
  announcements,
}: {
  settings: SiteSettings;
  announcements: Announcement[];
}) {
  const [settingsState, settingsAction] = useActionState<ActionState, FormData>(
    async (_prev, fd) => updateSettings(fd),
    undefined
  );
  const [announceState, announceAction] = useActionState<ActionState, FormData>(
    async (_prev, fd) => upsertAnnouncement(fd),
    undefined
  );
  const [, deleteAction] = useActionState<ActionState, FormData>(
    async (_prev, fd) => deleteAnnouncement(fd),
    undefined
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Settings</h1>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">Page toggles</h2>
        <form action={settingsAction} className="flex flex-col gap-3">
          <ToggleRow
            name="collaboration_enabled"
            label="Collaboration Board"
            description="When off, eg.com/collaboration shows the Coming Soon screen."
            defaultChecked={settings.collaboration_enabled}
          />
          <div><FormFeedback state={settingsState} /></div>
          <div><SubmitButton label="Save settings" /></div>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">Site-wide announcement banner</h2>
        <p className="text-xs text-muted-foreground">
          The newest active announcement shows at the top of every public page.
        </p>
        <form action={announceAction} className="flex flex-col gap-3 rounded-xl border bg-white p-4">
          <div className="flex flex-col gap-1">
            <Label>Title *</Label>
            <Input name="title" placeholder="Big update!" required />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Message *</Label>
            <Textarea name="body" rows={2} required />
          </div>
          <FormFeedback state={announceState} />
          <div><SubmitButton label="Publish announcement" /></div>
        </form>

        <div className="flex flex-col gap-2">
          {announcements.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border bg-white p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {a.is_active && <Badge variant="green">Live</Badge>}
                  <p className="truncate text-sm font-semibold">{a.title}</p>
                </div>
                <p className="text-xs text-muted-foreground">{formatDate(a.created_at)}</p>
              </div>
              <form action={deleteAction}>
                <input type="hidden" name="id" value={a.id} />
                <Button type="submit" variant="ghost" size="icon" aria-label="Delete announcement">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </form>
            </div>
          ))}
          {announcements.length === 0 && (
            <p className="text-sm text-muted-foreground">No announcements yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
