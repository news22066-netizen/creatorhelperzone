import { BookOpen, HelpCircle, Megaphone, TrendingUp, Users, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/format";

export const metadata = { title: "Dashboard" };

async function count(table: string, eq?: { column: string; value: unknown }) {
  const supabase = await createClient();
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  if (eq) q = q.eq(eq.column, eq.value);
  const { count } = await q;
  return count ?? 0;
}

export default async function AdminDashboardPage() {
  const [users, creators, businesses, tools, guides, faqs, trending, announcements] =
    await Promise.all([
      count("profiles"),
      count("profiles", { column: "role", value: "creator" }),
      count("profiles", { column: "role", value: "business" }),
      count("tools"),
      count("guides"),
      count("faqs"),
      count("trending_items"),
      count("announcements"),
    ]);

  const supabase = await createClient();
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    { label: "Total users", value: users, icon: Users },
    { label: "Creators", value: creators, icon: Users },
    { label: "Businesses", value: businesses, icon: Users },
    { label: "Tools", value: tools, icon: Wrench },
    { label: "Guides", value: guides, icon: BookOpen },
    { label: "FAQs", value: faqs, icon: HelpCircle },
    { label: "Trending items", value: trending, icon: TrendingUp },
    { label: "Announcements", value: announcements, icon: Megaphone },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{label}</p>
              <Icon className="h-4 w-4 text-blue-600" />
            </div>
            <p className="mt-1 text-2xl font-extrabold">{value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-bold">Recent signups</h2>
        {!recentUsers?.length ? (
          <p className="text-sm text-muted-foreground">No users yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Role</th>
                  <th className="pb-2 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-2">{u.full_name ?? "—"}</td>
                    <td className="py-2">{u.email ?? "—"}</td>
                    <td className="py-2 capitalize">{u.role}</td>
                    <td className="py-2 text-muted-foreground">{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
