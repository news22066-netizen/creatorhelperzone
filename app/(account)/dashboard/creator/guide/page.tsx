import { requireCreator } from "@/lib/auth/creator-access";
import { getDashboardGuides } from "@/lib/data/dashboard-guides";
import { DashboardGuideList } from "@/components/shared/dashboard-guide-list";

export const metadata = { title: "Creator guide" };

/** Lessons come from /admin/dashboard-guides (audience: creator or both). */
export default async function CreatorGuidePage() {
  await requireCreator();
  const guides = await getDashboardGuides("creator");
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Creator guide</h1>
      <DashboardGuideList
        guides={guides}
        intro="Short video lessons on growing your audience and getting clients through your page."
      />
    </div>
  );
}
