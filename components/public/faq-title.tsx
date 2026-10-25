"use client";

import { HelpCircle } from "lucide-react";
import { useLang } from "@/lib/i18n/language-provider";
import { PageHeader } from "./page-header";

export function FaqTitle() {
  const { t } = useLang();
  return (
    <PageHeader
      badge={
        <>
          <HelpCircle className="h-3.5 w-3.5 text-brand" />
          {t("faq.badge")}
        </>
      }
      title={t("faq.title")}
      subtitle={t("faq.subtitle")}
    />
  );
}
