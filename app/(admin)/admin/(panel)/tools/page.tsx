import { createClient } from "@/lib/supabase/server";
import { ToolManager } from "@/components/admin/tool-manager";
import type { Tool } from "@/types/database";

export const metadata = { title: "Manage Tools" };

export default async function AdminToolsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tools")
    .select("*")
    .order("sort_order", { ascending: true });
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Tools</h1>
      <ToolManager tools={(data ?? []) as Tool[]} />
    </div>
  );
}
