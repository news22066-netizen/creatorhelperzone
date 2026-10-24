import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import { getSettings } from "@/lib/data/public";
import { ComingSoon } from "@/components/public/coming-soon";

export const revalidate = 120;

export const metadata: Metadata = { title: "Store" };

export default async function StorePage() {
  const settings = await getSettings();

  if (!settings.store_enabled) {
    return (
      <ComingSoon
        title="Store"
        description="Creator storefronts are launching soon. Check back later!"
        icon={<ShoppingBag className="h-9 w-9" />}
        features={["Your own free storefront", "Links, products and classes in one place", "Built for Bangladeshi creators"]}
      />
    );
  }

  // Enabled later: list creator storefronts.
  return (
    <ComingSoon
      title="Store"
      description="Browse creator storefronts — listing goes live shortly."
      icon={<ShoppingBag className="h-9 w-9" />}
    />
  );
}
