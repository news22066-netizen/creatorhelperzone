import { SITE_SOCIALS } from "@/lib/site/socials";
import { SiteSocialIcon } from "@/components/shared/site-social-icon";
import type { SiteSocialKey } from "@/types/database";
import { cn } from "@/lib/utils/cn";

/** Row of round icon links. Renders nothing when no social link is set. Server/client safe (no hooks). */
export function SocialLinks({
  socials,
  className,
}: {
  socials: Partial<Record<SiteSocialKey, string>>;
  className?: string;
}) {
  const items = SITE_SOCIALS.filter((s) => socials[s.key]);
  if (items.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)} aria-label="Social links">
      {items.map((s) => (
        <li key={s.key}>
          <a
            href={socials[s.key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`BFEED on ${s.label}`}
            title={s.label}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-light/70 bg-brand-light/20 text-brand-deep transition-colors duration-150 hover:bg-brand hover:text-white motion-reduce:transition-none"
          >
            <SiteSocialIcon name={s.key} className="h-[18px] w-[18px]" />
          </a>
        </li>
      ))}
    </ul>
  );
}
