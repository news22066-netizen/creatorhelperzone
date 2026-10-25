import type { Config } from "tailwindcss";

// Theme tokens: channel triplets live in globals.css (:root = light, `.dark .public-shell` = dark).
// Light values equal the old hard-coded colours, so admin / account / profile pages look unchanged.
const v = (name: string) => `rgb(var(${name}) / <alpha-value>)`;
const grays = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Noto Sans Bengali",
          "Hind Siliguri",
          "sans-serif",
        ],
        serif: ["var(--font-lora)", "Georgia", "Noto Serif Bengali", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,31,20,0.04), 0 4px 14px rgba(47,154,66,0.07)",
        lift: "0 2px 4px rgba(15,31,20,0.05), 0 10px 24px rgba(47,154,66,0.14)",
      },
      colors: {
        surface: v("--surface"), // page / card background (white in light mode)
        // Business store theme (set per store by themeToCssVars in lib/store/theme.ts)
        store: {
          bg: v("--store-bg-rgb"),
          primary: v("--store-primary-rgb"),
          text: v("--store-text-rgb"),
          "on-primary": v("--store-on-primary-rgb"),
        },
        gray: Object.fromEntries(grays.map((g) => [g, v(`--gray-${g}`)])),
        // CreatorHub BD public brand — greens only.
        brand: {
          DEFAULT: "#2f9a42", // primary: buttons, active nav, focus
          secondary: "#42e55f", // hover, highlights
          light: v("--brand-light"), // soft surfaces, badges, tints (deep green tint in dark mode)
          deep: v("--brand-deep"), // small link text (AA on both themes)
          hover: "#1e7a30", // fixed dark green for button hover (white text stays readable)
          forest: "#14532d", // darkest green
          ink: v("--brand-ink"), // main text colour (near-black light / near-white dark)
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
export default config;
