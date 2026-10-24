"use client";

import { useLang } from "@/lib/i18n/language-provider";

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === "bn" ? "en" : "bn")}
      className="flex h-9 min-w-9 items-center justify-center rounded-full border border-brand-light bg-brand-light/20 px-3 text-xs font-bold text-brand-ink hover:bg-brand-light/50"
      aria-label="Toggle language"
    >
      {lang === "bn" ? "EN" : "বাং"}
    </button>
  );
}
