import Link from "next/link";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  viewAllHref,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  viewAllHref?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        viewAllHref && "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn(align === "center" && "mx-auto max-w-2xl")}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-3 font-display text-[2rem] leading-tight text-ink sm:text-[2.6rem]">
          {title}
        </h2>
        {align === "center" && (
          <div className="divider-diamond mt-4">✦</div>
        )}
        {description && (
          <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
            {description}
          </p>
        )}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="link-underline shrink-0 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-gold-600"
        >
          View All
        </Link>
      )}
    </div>
  );
}
