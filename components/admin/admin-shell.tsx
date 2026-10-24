"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen, HelpCircle, LayoutDashboard, LogOut,
  Menu as MenuIcon, Settings, TrendingUp, Users, Wrench, X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/admin/tools", icon: Wrench, label: "Tools" },
  { href: "/admin/trending", icon: TrendingUp, label: "Trending" },
  { href: "/admin/guides", icon: BookOpen, label: "Guides" },
  { href: "/admin/faqs", icon: HelpCircle, label: "FAQs" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/settings", icon: Settings, label: "Settings & Announcements" },
];

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // On admin.* hosts the browser path can be "/tools" while the route is
  // /admin/tools; normalise so the active highlight is right on both.
  const current = pathname.startsWith("/admin")
    ? pathname
    : `/admin${pathname === "/" ? "" : pathname}`;

  const NavLinks = (
    <nav className="flex flex-col gap-1">
      {nav.map(({ href, icon: Icon, label, exact }) => {
        const active = exact ? current === href : current.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
              active ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r bg-white p-4 md:flex">
        <div className="mb-6 px-3">
          <p className="font-bold text-blue-600">CreatorHub BD</p>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
        <div className="flex-1">{NavLinks}</div>
        <div className="border-t pt-3">
          <p className="truncate px-3 text-xs text-muted-foreground">{email}</p>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b bg-white px-3 md:hidden">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
            <MenuIcon className="h-5 w-5" />
          </Button>
          <span className="font-bold text-blue-600">Admin</span>
        </div>
        <form action="/auth/signout" method="post">
          <Button type="submit" variant="ghost" size="icon" aria-label="Sign out">
            <LogOut className="h-5 w-5" />
          </Button>
        </form>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={() => setOpen(false)}>
          <div className="h-full w-64 bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <span className="font-bold text-blue-600">CreatorHub BD</span>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            {NavLinks}
          </div>
        </div>
      )}

      <main className="p-4 md:ml-60 md:p-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
