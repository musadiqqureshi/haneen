import { cn } from "@/lib/utils";

/**
 * Elegant gradient placeholder that stands in for product photography until
 * real images land in /public/products. Renders a fabric-like gradient with a
 * subtle draped-silhouette motif so cards look intentional, never broken.
 */
export function FabricSwatch({
  swatch,
  label,
  className,
}: {
  swatch: [string, string];
  label?: string;
  className?: string;
}) {
  const [from, to] = swatch;
  return (
    <div
      className={cn("relative h-full w-full overflow-hidden", className)}
      style={{
        background: `linear-gradient(150deg, ${from} 0%, ${to} 100%)`,
      }}
    >
      {/* soft sheen */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/25 mix-blend-soft-light" />
      {/* draped silhouette */}
      <svg
        viewBox="0 0 200 280"
        className="absolute inset-0 h-full w-full opacity-[0.16]"
        preserveAspectRatio="xMidYMax meet"
        aria-hidden
      >
        <path
          d="M100 20c-10 0-18 6-22 14-8 4-30 14-30 34l14 10-10 60 8 6-14 96h108l-14-96 8-6-10-60 14-10c0-20-22-30-30-34-4-8-12-14-22-14z"
          fill="#ffffff"
        />
      </svg>
      {label && (
        <span className="absolute bottom-3 left-3 font-serif text-xs italic text-white/70">
          {label}
        </span>
      )}
    </div>
  );
}
