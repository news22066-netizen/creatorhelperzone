import { createClient } from "@/lib/supabase/server";
import { UserManager } from "@/components/admin/user-manager";
import type { Profile } from "@/types/database";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, is_blocked, is_verified, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Users</h1>
      <UserManager users={(data ?? []) as Profile[]} />
    </div>
  );
}
