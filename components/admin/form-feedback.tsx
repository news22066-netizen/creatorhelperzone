"use client";

import type { ActionState } from "@/lib/actions/types";

export function FormFeedback({ state }: { state?: ActionState }) {
  if (!state) return null;
  if (state.error) return <p className="text-sm font-medium text-red-600">{state.error}</p>;
  if (state.success) return <p className="text-sm font-medium text-green-600">Saved ✓</p>;
  return null;
}
