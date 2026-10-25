export const THEME_KEY = "chbd-theme";

/** Runs before first paint (inlined in the public layout) so there is no light-to-dark flash. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark");}catch(e){}})();`;

export function readPreferredDark(): boolean {
  try {
    const t = window.localStorage.getItem(THEME_KEY);
    if (t === "dark") return true;
    if (t === "light") return false;
  } catch {
    /* storage blocked: fall through to system preference */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
