"use client";

import { useLang } from "@/lib/i18n/language-provider";
import { homeCopy } from "@/lib/i18n/home-copy";

export function useHomeCopy() {
  const { lang } = useLang();
  return { c: homeCopy[lang], lang };
}

export function formatCount(n: number, lang: "bn" | "en") {
  return lang === "bn" ? n.toLocaleString("bn-BD") : String(n);
}
