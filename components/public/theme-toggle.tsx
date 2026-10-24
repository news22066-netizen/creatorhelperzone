"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { THEME_KEY } from "@/lib/theme";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    const root = document.documentElement;
    root.classList.add("theme-fade");
    root.classList.toggle("dark", next);
    window.setTimeout(() => root.classList.remove("theme-fade"), 260);
    try {
      window.localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {
      /* private mode: preference just won't persist */
    }
    setDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-light bg-brand-light/20 text-brand-ink transition-colors hover:bg-brand-light/50"
    >
      {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}
