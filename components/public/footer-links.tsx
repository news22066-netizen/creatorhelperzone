import Link from "next/link";
import { getSiteBrand } from "@/lib/data/site";
import { SocialLinks } from "./social-links";

const groups = [
  {
    title: "Product",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/store", label: "Business store" },
      { href: "/tools", label: "Free tools" },
      { href: "/guides", label: "Guides" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
      { href: "/help", label: "Help" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/cookies", label: "Cookies" },
    ],
  },
];

const linkClass =
  "inline-flex min-h-11 items-center font-semibold text-brand-deep hover:underline md:min-h-9";

/** Async server component: social icons come from /admin/branding (only filled ones show). */
export async function FooterLinks() {
  const { socials } = await getSiteBrand();
  const hasSocials = Object.keys(socials).length > 0;

  return (
    <footer className="border-t border-brand-light/60 pt-6 text-sm text-gray-600">
      <div className="grid gap-6 md:grid-cols-[1.2fr_2fr]">
        <div>
          <p className="text-base font-extrabold tracking-tight text-brand-ink">
            CreatorHub<span className="text-brand"> BD</span>
          </p>
          <p className="mt-1 max-w-xs text-[13px] leading-relaxed">
            A free home on the web for Bangladeshi creators and small businesses. No subscription for your page or store.
          </p>
          {hasSocials && <SocialLinks socials={socials} className="mt-3" />}
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-4 sm:grid-cols-3">
          {groups.map((g) => (
            <div key={g.title} className="mb-2">
              <p className="pb-1 text-[11px] font-extrabold uppercase tracking-wider text-gray-500">{g.title}</p>
              <ul className="flex flex-col">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={linkClass}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <p className="mt-4 border-t border-brand-light/40 pt-4 text-center text-xs">
        © {new Date().getFullYear()} BFEED. Free for creators and businesses in Bangladesh.
      </p>
    </footer>
  );
}
