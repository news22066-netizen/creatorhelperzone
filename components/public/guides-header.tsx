"use client";

import { BookOpen } from "lucide-react";
import { useLang } from "@/lib/i18n/language-provider";
import { PageHeader } from "./page-header";

export function GuidesHeader({ count }: { count: number }) {
  const { t } = useLang();
  return (
    <PageHeader
      badge={
        <>
          <BookOpen className="h-3.5 w-3.5 text-brand" />
          {count} {t("guides.badge")}
        </>
      }
      title={t("guides.title")}
      subtitle={t("guides.subtitle")}
    />
  );
}
