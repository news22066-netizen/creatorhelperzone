import Link from "next/link";

const links = [
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/help", label: "Help" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
];

export function FooterLinks() {
  return (
    <footer className="border-t border-brand-light/60 pt-4 text-center text-xs text-gray-600">
      <nav aria-label="Footer" className="mb-3 flex flex-wrap items-center justify-center gap-x-1 gap-y-0">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="inline-flex min-h-11 items-center px-2 font-semibold text-brand-deep hover:underline"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      © {new Date().getFullYear()} CreatorHub BD. Free for creators in Bangladesh.
    </footer>
  );
}
