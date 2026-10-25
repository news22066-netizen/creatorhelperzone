import { MessageCircle } from "lucide-react";
import { buildOrderUrl } from "@/lib/store/whatsapp";

/** Big WhatsApp contact button (Home intro / Contact page). WhatsApp only: no payments. */
export function WhatsAppCta({
  whatsapp,
  storeName,
  label = "Chat on WhatsApp",
}: {
  whatsapp: string;
  storeName: string;
  label?: string;
}) {
  return (
    <a
      href={buildOrderUrl({ whatsapp, storeName })}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-store-primary text-[15px] font-bold text-store-on-primary shadow-sm transition-opacity hover:opacity-90"
    >
      <MessageCircle className="h-5 w-5" />
      {label}
    </a>
  );
}
