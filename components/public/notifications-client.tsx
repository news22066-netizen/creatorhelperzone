"use client";

import { BellOff } from "lucide-react";
import { useLang } from "@/lib/i18n/language-provider";

export function NotificationsClient() {
  const { t } = useLang();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">{t("notifications.title")}</h1>
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-brand-light bg-brand-light/10 px-6 py-14 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-light/50">
          <BellOff className="h-7 w-7 text-brand-ink" />
        </div>
        <p className="text-sm text-gray-600">{t("notifications.empty")}</p>
      </div>
    </div>
  );
}
