import type { ReactNode } from "react";
import { ChevronRight, Facebook, Globe, Instagram, Mail, MapPin, MessageCircle, Phone, Youtube } from "lucide-react";
import { mapsUrl, prettyUrl } from "@/lib/store/contact";
import { buildOrderUrl } from "@/lib/store/whatsapp";
import type { StoreContact } from "@/types/store";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.6 3c.3 2.3 1.7 3.9 3.9 4.1v3.1c-1.4.1-2.7-.3-3.9-1.1v6.2c0 3.4-2.4 5.7-5.5 5.7A5.4 5.4 0 0 1 5.7 15c0-3.3 2.8-5.8 6.2-5.3v3.2c-1.6-.5-3 .6-3 2.1 0 1.2.9 2.2 2.2 2.2 1.4 0 2.3-.9 2.3-2.5V3h3.2Z" />
    </svg>
  );
}

function Row({
  href,
  icon,
  label,
  value,
  external = true,
  primary = false,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  value: string;
  external?: boolean;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}
      className={
        primary
          ? "flex min-h-16 items-center gap-3 rounded-2xl bg-store-primary px-4 py-3 text-store-on-primary shadow-sm transition-opacity hover:opacity-90"
          : "flex min-h-16 items-center gap-3 rounded-2xl border border-store-text/15 bg-store-bg px-4 py-3 shadow-sm transition-colors hover:border-store-primary"
      }
    >
      <span
        className={
          primary
            ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-store-on-primary/15"
            : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-store-primary/10 text-store-primary"
        }
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold leading-tight">{label}</span>
        <span className={primary ? "block truncate text-sm opacity-90" : "block truncate text-sm text-store-text/75"}>{value}</span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 opacity-60" />
    </a>
  );
}

/**
 * Contact link rows (the "Social Links" rows of the Canva mock). Only filled fields render.
 * WhatsApp comes from the profile; everything else from the store contact fields.
 */
export function ContactRows({
  contact,
  whatsapp,
  storeName,
}: {
  contact: StoreContact;
  whatsapp: string | null;
  storeName: string;
}) {
  const icon = "h-5 w-5";
  return (
    <ul className="flex flex-col gap-2.5">
      {whatsapp && (
        <li>
          <Row
            primary
            href={buildOrderUrl({ whatsapp, storeName })}
            icon={<MessageCircle className={icon} />}
            label="WhatsApp"
            value="Chat and place your order"
          />
        </li>
      )}
      {contact.phone && (
        <li>
          <Row external={false} href={`tel:${contact.phone}`} icon={<Phone className={icon} />} label="Call" value={contact.phone} />
        </li>
      )}
      {contact.email && (
        <li>
          <Row external={false} href={`mailto:${contact.email}`} icon={<Mail className={icon} />} label="Email" value={contact.email} />
        </li>
      )}
      {contact.facebook && (
        <li>
          <Row href={contact.facebook} icon={<Facebook className={icon} />} label="Facebook" value={prettyUrl(contact.facebook)} />
        </li>
      )}
      {contact.instagram && (
        <li>
          <Row href={contact.instagram} icon={<Instagram className={icon} />} label="Instagram" value={prettyUrl(contact.instagram)} />
        </li>
      )}
      {contact.tiktok && (
        <li>
          <Row href={contact.tiktok} icon={<TikTokIcon className={icon} />} label="TikTok" value={prettyUrl(contact.tiktok)} />
        </li>
      )}
      {contact.youtube && (
        <li>
          <Row href={contact.youtube} icon={<Youtube className={icon} />} label="YouTube" value={prettyUrl(contact.youtube)} />
        </li>
      )}
      {contact.website && (
        <li>
          <Row href={contact.website} icon={<Globe className={icon} />} label="Website" value={prettyUrl(contact.website)} />
        </li>
      )}
      {contact.address && (
        <li>
          <Row href={mapsUrl(contact.address)} icon={<MapPin className={icon} />} label="Address" value={contact.address} />
        </li>
      )}
    </ul>
  );
}
