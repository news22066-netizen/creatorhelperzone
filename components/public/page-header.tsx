import { Fragment, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

// Hand-picked tilts so the word drop looks organic but is identical on server and client.
const TILTS = [-26, 20, -14, 28, -22, 12, -30, 18, -10, 24];

/**
 * Words fall in from above with a tilt and a small overshoot (CSS port of the SplitText demo).
 * The full text stays in the DOM for screen readers; the last word gets the brand gradient.
 */
export function AnimatedTitle({
  text,
  className,
  accentLast = true,
  baseDelay = 60,
}: {
  text: string;
  className?: string;
  accentLast?: boolean;
  baseDelay?: number;
}) {
  const words = text.trim().split(/\s+/);
  return (
    <h1 className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <Fragment key={`${w}-${i}`}>
            <span
              className={cn("word-drop inline-block", accentLast && i === words.length - 1 && "text-gradient-brand")}
              style={{ "--tilt": `${TILTS[i % TILTS.length]}deg`, animationDelay: `${baseDelay + i * 70}ms` } as CSSProperties}
            >
              {w}
            </span>{" "}
          </Fragment>
        ))}
      </span>
    </h1>
  );
}

/** Light page header for list pages: plain title + subtitle on the page background, thin green accent. */
export function PageHeader({
  badge,
  title,
  subtitle,
  meta,
}: {
  badge?: ReactNode;
  title: string;
  subtitle?: string;
  meta?: ReactNode;
}) {
  return (
    <header className="relative pb-1 pt-1">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-8 -top-8 h-40 w-64 rounded-full bg-brand-light/30 blur-3xl"
      />
      <div className="relative">
        {badge && (
          <span
            className="rise-stagger inline-flex items-center gap-1.5 rounded-full border border-brand-light/80 bg-surface px-3 py-1 text-xs font-bold text-brand-ink"
            style={{ "--i": 0 } as CSSProperties}
          >
            {badge}
          </span>
        )}
        <AnimatedTitle
          text={title}
          className="mt-3 text-[30px] font-extrabold leading-[1.3] tracking-tight md:text-5xl md:leading-[1.25]"
        />
        <span
          aria-hidden="true"
          className="line-grow mt-3 block h-1 w-16 origin-left rounded-full bg-gradient-to-r from-brand to-brand-secondary"
        />
        {subtitle && (
          <p
            className="rise-stagger mt-3 max-w-xl text-[15px] font-medium leading-relaxed text-gray-700 md:text-lg"
            style={{ "--i": 6 } as CSSProperties}
          >
            {subtitle}
          </p>
        )}
        {meta && (
          <div className="rise-stagger mt-4" style={{ "--i": 8 } as CSSProperties}>
            {meta}
          </div>
        )}
      </div>
    </header>
  );
}
