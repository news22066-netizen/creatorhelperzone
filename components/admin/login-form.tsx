"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Chrome, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  next = "/admin",
  initialError = null,
}: {
  next?: string;
  initialError?: string | null;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState<"email" | "google" | null>(null);

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading("email");
    const { error } = await createClient().auth.signInWithPassword({
      email,
      password,
    });
    setLoading(null);
    if (error) {
      setError(error.message);
      return;
    }
    // `next` was sanitised on the server (always an internal /admin path).
    // The panel layout then decides: admin -> dashboard, non-admin -> /admin/unauthorized.
    router.replace(next);
    router.refresh();
  }

  async function signInWithGoogle() {
    setError(null);
    setLoading("google");
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        // No query string: keeps this URL an exact match for the Supabase allow-list.
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setLoading(null);
      setError(error.message);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={signInWithEmail} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@eg.com"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading !== null}>
          {loading === "email" && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </Button>
      </form>

      <div className="relative text-center text-xs text-muted-foreground">
        <span className="relative z-10 bg-white px-2">or</span>
        <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
      </div>

      <Button variant="outline" onClick={signInWithGoogle} disabled={loading !== null}>
        {loading === "google" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Chrome className="h-4 w-4" />
        )}
        Continue with Google
      </Button>
    </div>
  );
}
