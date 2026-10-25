import { requireCreator } from "@/lib/auth/creator-access";
import { WorkForm } from "@/components/creator/work-form";

export const metadata = { title: "Add work" };

export default async function NewWorkPage() {
  await requireCreator();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Add work</h1>
      <WorkForm />
    </div>
  );
}
