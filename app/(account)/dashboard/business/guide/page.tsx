import { BookOpen } from "lucide-react";
import { requireBusiness } from "@/lib/auth/business-access";

export const metadata = { title: "Business guide" };

/** Placeholder only: videos (YouTube links) will come from an admin-curated source later. */
export default async function BusinessGuidePage() {
  await requireBusiness();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Business guide</h1>
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-brand-light bg-brand-light/10 px-6 py-14 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light/50">
          <BookOpen className="h-7 w-7" />
        </span>
        <p className="font-bold">Guides are coming soon</p>
        <p className="max-w-xs text-sm text-gray-600">
          Short YouTube lessons on selling through WhatsApp will appear here.
        </p>
      </div>
    </div>
  );
}
