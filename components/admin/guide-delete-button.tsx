"use client";

import { useActionState } from "react";
import { deleteGuide } from "@/app/actions/admin";
import { SubmitButton } from "./submit-button";
import type { ActionState } from "@/lib/actions/types";

export function GuideDeleteButton({ id }: { id: string }) {
  const [, action] = useActionState<ActionState, FormData>(
    async (_prev, fd) => deleteGuide(fd),
    undefined
  );
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <SubmitButton label="Delete" variant="destructive" />
    </form>
  );
}
