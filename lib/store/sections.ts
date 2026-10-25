import type { StoreSections } from "@/types/store";

export const DEFAULT_SECTIONS: StoreSections = {
  show_featured_products: true,
  show_photo_row: true,
  show_categories: true,
  show_youtube: true,
  show_faq: true,
  show_search_on_shop: true,
};

export const SECTION_OPTIONS: { key: keyof StoreSections; label: string; hint: string }[] = [
  { key: "show_featured_products", label: "Featured products", hint: "Sliding product strip at the top of Home." },
  { key: "show_photo_row", label: "Photo row", hint: "Row of extra product photos on Home (needs 3+ photos)." },
  { key: "show_categories", label: "Categories", hint: "Category list on Home and category filter on Shop." },
  { key: "show_youtube", label: "YouTube video", hint: "Your YouTube embed on Home (set the link below)." },
  { key: "show_faq", label: "FAQ", hint: "Short questions and answers on Home." },
  { key: "show_search_on_shop", label: "Search", hint: "Search bar on Shop and the search icon in the header." },
];

/**
 * jsonb from the DB -> a complete flag set. Missing keys (older rows, migration not run yet) and
 * anything that is not a real boolean fall back to "visible", so a store never goes blank by accident.
 */
export function parseSections(raw: unknown): StoreSections {
  const o = (raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {}) as Record<string, unknown>;
  const pick = (k: keyof StoreSections) => (typeof o[k] === "boolean" ? (o[k] as boolean) : DEFAULT_SECTIONS[k]);
  return {
    show_featured_products: pick("show_featured_products"),
    show_photo_row: pick("show_photo_row"),
    show_categories: pick("show_categories"),
    show_youtube: pick("show_youtube"),
    show_faq: pick("show_faq"),
    show_search_on_shop: pick("show_search_on_shop"),
  };
}
