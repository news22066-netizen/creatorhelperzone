"use client";

import { useLang } from "@/lib/i18n/language-provider";

export function TrendingLabels({
  labelKey,
  as: Tag = "h1",
  className,
}: {
  labelKey: string;
  as?: "h1" | "h2" | "p" | "span";
  className?: string;
}) {
  const { t } = useLang();
  return <Tag className={className}>{t(labelKey)}</Tag>;
}
