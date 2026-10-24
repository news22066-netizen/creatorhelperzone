/** Shape returned by every admin server action (safe to serialize). */
export type ActionResult = { error?: string; success?: boolean };

/** What useActionState holds before the first submit. */
export type ActionState = ActionResult | undefined;
