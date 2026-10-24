"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "./google-button";

export function LoginForm({
  next = "/dashboard",
  initialError = null,
}: {
  next?: string;
  initialError?: string | null;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (err || !data.user) {
      setLoading(false);
      setError(err?.message ?? "Could not sign in.");
      return;
    }

    // Admins go to the admin panel; creators/businesses to their dashboard.
    // (Both areas re-check the role on the server — this only picks the first stop.)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();
    router.replace(profile?.role === "admin" ? "/admin" : next);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        {error && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {error}
          </p>
        )}
        <Button type="submit" disabled={loading} className="h-11">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Log in
        </Button>
      </form>

      <div className="relative text-center text-xs text-gray-500">
        <span className="relative z-10 bg-white px-2">or</span>
        <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
      </div>

      <GoogleButton disabled={loading} onError={setError} />
    </div>
  );
}
