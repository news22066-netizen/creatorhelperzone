import { requireBusiness } from "@/lib/auth/business-access";
import { getDashboardGuides } from "@/lib/data/dashboard-guides";
import { DashboardGuideList } from "@/components/shared/dashboard-guide-list";

export const metadata = { title: "Business guide" };

/** Lessons come from /admin/dashboard-guides (audience: business or both). */
export default async function BusinessGuidePage() {
  await requireBusiness();
  const guides = await getDashboardGuides("business");
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Business guide</h1>
      <DashboardGuideList
        guides={guides}
        intro="Short video lessons on setting up your store and selling through WhatsApp."
      />
    </div>
  );
}
