import { Facebook, Globe, Instagram, Linkedin, Send, Youtube } from "lucide-react";
import { TikTokIcon, XIcon } from "@/components/shared/brand-icons";
import type { SocialKey } from "@/lib/creator/links";

/** Icon for each social field (lucide + the two brand icons lucide lacks). */
export function SocialIcon({ name, className }: { name: SocialKey; className?: string }) {
  switch (name) {
    case "instagram": return <Instagram className={className} />;
    case "facebook": return <Facebook className={className} />;
    case "youtube": return <Youtube className={className} />;
    case "linkedin": return <Linkedin className={className} />;
    case "telegram": return <Send className={className} />;
    case "tiktok": return <TikTokIcon className={className} />;
    case "x": return <XIcon className={className} />;
    default: return <Globe className={className} />;
  }
}
