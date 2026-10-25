import { Facebook, Instagram, Linkedin, MessageCircle, Send, Youtube } from "lucide-react";
import { TikTokIcon, XIcon } from "@/components/shared/brand-icons";
import type { SiteSocialKey } from "@/types/database";

/** Icon per site-wide social network (lucide + the TikTok / X brand icons). */
export function SiteSocialIcon({ name, className }: { name: SiteSocialKey; className?: string }) {
  switch (name) {
    case "facebook": return <Facebook className={className} />;
    case "instagram": return <Instagram className={className} />;
    case "youtube": return <Youtube className={className} />;
    case "tiktok": return <TikTokIcon className={className} />;
    case "whatsapp": return <MessageCircle className={className} />;
    case "x": return <XIcon className={className} />;
    case "linkedin": return <Linkedin className={className} />;
    case "telegram": return <Send className={className} />;
  }
}
