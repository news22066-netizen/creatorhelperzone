import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "default" | "secondary" | "outline" | "ghost" | "destructive" | "red";
type Size = "default" | "sm" | "lg" | "icon";

const variants: Record<Variant, string> = {
  default: "bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-brand-deep",
  secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
  outline: "border border-input bg-card shadow-sm hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
  red: "bg-red-600 text-white shadow hover:bg-red-700",
};

const sizes: Record<Size, string> = {
  default: "h-9 px-4 py-2",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-10 rounded-md px-8",
  icon: "h-9 w-9",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
