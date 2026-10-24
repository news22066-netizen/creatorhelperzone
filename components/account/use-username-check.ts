"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { checkUsername, normalizeUsername } from "@/lib/utils/username";

export type UsernameStatus =
  | "empty"
  | "checking"
  | "available"
  | "taken"
  | "reserved"
  | "invalid"
  | "unknown"; // availability could not be checked (the server still validates on submit)

export const USERNAME_MESSAGES: Record<Exclude<UsernameStatus, "empty">, string> = {
  checking: "Checking…",
  available: "Available ✓",
  taken: "Already taken",
  reserved: "Reserved — choose another",
  invalid: "3–30 characters: a–z, 0–9 and _ only",
  unknown: "Could not check availability right now",
};

/**
 * Live username validation: instant local format/reserved check, then a
 * debounced availability lookup through the public check_username() RPC.
 */
export function useUsernameCheck(raw: string): UsernameStatus {
  const [status, setStatus] = useState<UsernameStatus>("empty");
  const ticket = useRef(0);

  useEffect(() => {
    const value = normalizeUsername(raw);
    const id = ++ticket.current;

    if (!value) {
      setStatus("empty");
      return;
    }
    const local = checkUsername(value);
    if (local !== "ok") {
      setStatus(local);
      return;
    }

    setStatus("checking");
    const timer = setTimeout(async () => {
      const { data, error } = await createClient().rpc("check_username", {
        p_username: value,
      });
      if (id !== ticket.current) return; // a newer keystroke superseded this one
      if (error || typeof data !== "string") return setStatus("unknown");
      setStatus(
        data === "available" || data === "taken" || data === "reserved" || data === "invalid"
          ? data
          : "unknown"
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [raw]);

  return status;
}
