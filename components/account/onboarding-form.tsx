"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeOnboarding } from "@/app/actions/account";
import type { ActionState } from "@/lib/actions/types";
import { RolePicker, type AccountRole } from "./role-picker";
import { UsernameField } from "./username-field";
import { useUsernameCheck } from "./use-username-check";

/** One-time step for accounts without a username (e.g. Google sign-ups). */
export function OnboardingForm({
  initialRole,
  initialName,
}: {
  initialRole: AccountRole;
  initialName: string;
}) {
  const [role, setRole] = useState<AccountRole>(initialRole);
  const [username, setUsername] = useState("");
  const status = useUsernameCheck(username);
  const ok = status === "available" || status === "unknown";

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async (_prev, fd) => completeOnboarding(fd),
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <RolePicker value={role} onChange={setRole} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="full_name">Display name (optional)</Label>
        <Input id="full_name" name="full_name" defaultValue={initialName} maxLength={60} />
      </div>
      <UsernameField value={username} onChange={setUsername} status={status} />
      {state?.error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending || !ok} className="h-11">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Continue
      </Button>
    </form>
  );
}
