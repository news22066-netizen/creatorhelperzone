"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeUsername } from "@/lib/utils/username";
import { RolePicker, type AccountRole } from "./role-picker";
import { UsernameField } from "./username-field";
import { GoogleButton } from "./google-button";
import { useUsernameCheck } from "./use-username-check";

export function SignupForm() {
  const router = useRouter();
  const [role, setRole] = useState<AccountRole>("creator");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const status = useUsernameCheck(username);
  const usernameOk = status === "available" || status === "unknown";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!usernameOk) {
      setError("Please choose a valid, available username.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const { data, error: err } = await createClient().auth.signUp({
      email: email.trim(),
      password,
      options: {
        // Read by the handle_new_user() trigger, which validates everything again.
        data: { role, username: normalizeUsername(username), full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (err) {
      setError(
        /database error saving new user/i.test(err.message)
          ? "That username was just taken or is not allowed. Please try another."
          : err.message
      );
      return;
    }
    // Email already registered: Supabase returns a user with no identities.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError("This email is already registered. Please log in instead.");
      return;
    }
    if (data.session) {
      router.replace("/dashboard");
      router.refresh();
      return;
    }
    setCheckEmail(true); // email confirmation is enabled in Supabase
  }

  if (checkEmail) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light/50">
          <MailCheck className="h-7 w-7" />
        </span>
        <p className="font-bold">Check your email</p>
        <p className="text-sm text-gray-600">
          We sent a confirmation link to <strong>{email}</strong>. Open it to finish creating your
          account, then{" "}
          <Link href="/login" className="font-semibold text-brand-deep underline">
            log in
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate={false}>
        <RolePicker value={role} onChange={setRole} />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="full_name">Display name (optional)</Label>
          <Input
            id="full_name"
            value={fullName}
            maxLength={60}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            placeholder="Your name or brand"
          />
        </div>

        <UsernameField value={username} onChange={setUsername} status={status} />

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
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading || !usernameOk} className="h-11">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </Button>
      </form>

      <div className="relative text-center text-xs text-gray-500">
        <span className="relative z-10 bg-white px-2">or</span>
        <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
      </div>

      <GoogleButton disabled={loading} onError={setError} />
      <p className="text-center text-xs text-gray-500">
        With Google you&apos;ll choose your account type and username on the next screen.
      </p>
    </div>
  );
}
