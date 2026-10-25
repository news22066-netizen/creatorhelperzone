"use client";

import { useState } from "react";
import { Chrome, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function GoogleButton({
  disabled,
  onError,
}: {
  disabled?: boolean;
  onError: (message: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function go() {
    setLoading(true);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        // No query string: keeps this an exact match for the Supabase redirect allow-list.
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setLoading(false);
      onError(error.message);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={go} disabled={disabled || loading} className="h-11 w-full">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Chrome className="h-4 w-4" />}
      Continue with Google
    </Button>
  );
}
