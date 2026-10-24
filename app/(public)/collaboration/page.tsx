import type { Metadata } from "next";
import { Handshake } from "lucide-react";
import { getSettings } from "@/lib/data/public";
import { ComingSoon } from "@/components/public/coming-soon";

export const revalidate = 120;

export const metadata: Metadata = { title: "Collaboration Board" };

export default async function CollaborationPage() {
  const settings = await getSettings();

  if (!settings.collaboration_enabled) {
    return (
      <ComingSoon
        title="Collaboration Board"
        description="Creators will list their collaboration rates here and businesses can contact them via WhatsApp."
        icon={<Handshake className="h-9 w-9" />}
        features={["Creators list their rates", "Businesses contact via WhatsApp", "Verified creator profiles"]}
      />
    );
  }

  return (
    <ComingSoon
      title="Collaboration Board"
      description="Creator profiles are being reviewed — the board opens shortly."
      icon={<Handshake className="h-9 w-9" />}
    />
  );
}
