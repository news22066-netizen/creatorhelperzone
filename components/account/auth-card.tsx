import Link from "next/link";
import type { ReactNode } from "react";
import { Zap } from "lucide-react";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-10">
      <Link href="/" className="mb-6 flex items-center gap-2" aria-label="CreatorHub BD home">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
          <Zap className="h-5 w-5 fill-white" />
        </span>
        <span className="text-lg font-extrabold tracking-tight">
          CreatorHub<span className="text-brand"> BD</span>
        </span>
      </Link>
      <div className="w-full max-w-md rounded-3xl border border-brand-light/70 bg-white p-6 shadow-card">
        <h1 className="text-2xl font-extrabold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        <div className="mt-5">{children}</div>
      </div>
      {footer && <div className="mt-4 text-sm text-gray-600">{footer}</div>}
    </div>
  );
}
