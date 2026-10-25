"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import { SITE_URL } from "@/lib/constants";
import { USERNAME_MESSAGES, type UsernameStatus } from "./use-username-check";

export function UsernameField({
  value,
  onChange,
  status,
}: {
  value: string;
  onChange: (v: string) => void;
  status: UsernameStatus;
}) {
  const host = SITE_URL.replace(/^https?:\/\//, "");
  const good = status === "available";
  const bad = status === "taken" || status === "reserved" || status === "invalid";

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="username">Username</Label>
      <div className="flex items-center rounded-md border border-input bg-card focus-within:ring-2 focus-within:ring-ring">
        <span className="select-none pl-3 text-sm text-gray-500">{host}/</span>
        <Input
          id="username"
          name="username"
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase().replace(/\s/g, ""))}
          required
          minLength={3}
          maxLength={30}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="yourname"
          aria-describedby="username-status"
          className="border-0 pl-0.5 shadow-none focus-visible:ring-0"
        />
      </div>
      <p
        id="username-status"
        aria-live="polite"
        className={cn(
          "min-h-4 text-xs font-medium",
          good && "text-brand-deep",
          bad && "text-red-600",
          !good && !bad && "text-gray-500"
        )}
      >
        {status === "empty"
          ? "English letters, numbers and underscore. Cannot be changed later."
          : USERNAME_MESSAGES[status]}
      </p>
    </div>
  );
}
