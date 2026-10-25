import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "default" | "secondary" | "destructive" | "outline" | "green";

const variants: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  destructive: "bg-red-100 text-red-700",
  outline: "border border-border text-foreground",
  green: "bg-brand-light/50 text-brand-ink",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
