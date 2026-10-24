"use client";

import { useActionState, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "./submit-button";
import type { ActionState } from "@/lib/actions/types";
import { setUserBlocked, setUserVerified } from "@/app/actions/admin";
import { formatDate } from "@/lib/utils/format";
import type { Profile } from "@/types/database";

export function UserManager({ users }: { users: Profile[] }) {
  const [query, setQuery] = useState("");
  const [, blockAction] = useActionState<ActionState, FormData>(
    async (_prev, fd) => setUserBlocked(fd),
    undefined
  );
  const [, verifyAction] = useActionState<ActionState, FormData>(
    async (_prev, fd) => setUserVerified(fd),
    undefined
  );

  const filtered = users.filter(
    (u) =>
      (u.email ?? "").toLowerCase().includes(query.toLowerCase()) ||
      (u.full_name ?? "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-3">
      <Input
        placeholder="Search by name or email..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm bg-white"
      />

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Role</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Joined</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="p-3 font-medium">{u.full_name ?? "—"}</td>
                <td className="p-3">{u.email ?? "—"}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {u.is_blocked && <Badge variant="destructive">Blocked</Badge>}
                    {u.is_verified && <Badge variant="green">Verified</Badge>}
                    {!u.is_blocked && !u.is_verified && <span className="text-muted-foreground">—</span>}
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{formatDate(u.created_at)}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <form action={blockAction}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="blocked" value={String(!u.is_blocked)} />
                      <SubmitButton label={u.is_blocked ? "Unblock" : "Block"} variant="outline" />
                    </form>
                    <form action={verifyAction}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="verified" value={String(!u.is_verified)} />
                      <SubmitButton label={u.is_verified ? "Unverify" : "Verify"} variant="outline" />
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
