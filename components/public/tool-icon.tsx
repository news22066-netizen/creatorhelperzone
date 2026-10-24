import { cn } from "@/lib/utils/cn";

/** Brand-green icon tile. Ignores the legacy per-tool gradient on purpose. */
export function ToolIcon({
  icon,
  className,
  imgClassName = "h-7 w-7",
}: {
  icon: string;
  /** Tile size/shape classes, e.g. "h-12 w-12 rounded-2xl text-2xl" */
  className?: string;
  imgClassName?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center border border-brand-light/70 bg-brand-light/30 text-xl",
        className ?? "h-12 w-12 rounded-2xl"
      )}
    >
      {icon.startsWith("http") ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={icon} alt="" className={cn("rounded object-contain", imgClassName)} />
      ) : (
        <span aria-hidden>{icon}</span>
      )}
    </span>
  );
}
