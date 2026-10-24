"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SubmitButton({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "default" | "destructive" | "outline" | "red" | "secondary";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending} size="sm">
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {label}
    </Button>
  );
}
