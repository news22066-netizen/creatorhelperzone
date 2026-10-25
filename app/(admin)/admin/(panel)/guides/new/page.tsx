import { GuideForm } from "@/components/admin/guide-form";

export const metadata = { title: "New Guide" };

export default function NewGuidePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">New guide</h1>
      <GuideForm />
    </div>
  );
}
