import { Megaphone } from "lucide-react";

export function AnnouncementBanner({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-brand-light bg-brand-light/25 px-4 py-3 text-sm text-brand-ink">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand text-white">
        <Megaphone className="h-4 w-4" />
      </span>
      <div>
        <p className="font-bold">{title}</p>
        <p className="text-gray-700">{body}</p>
      </div>
    </div>
  );
}
