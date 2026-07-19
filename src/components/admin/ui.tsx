import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Sparkline } from "@/components/admin/charts/sparkline";
import { CHART } from "@/components/admin/charts/tokens";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ Surface */

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-white p-6 shadow-[0_1px_2px_rgba(47,42,36,0.04)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="font-display text-lg tracking-tight text-ink">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-ink-muted">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

/* --------------------------------------------------------------- Stat tiles */

export function StatCard({
  label,
  value,
  hint,
  href,
  icon: Icon,
  trend,
  series,
  tone = "gold",
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  icon?: LucideIcon;
  /** % change vs the previous period */
  trend?: number;
  series?: number[];
  tone?: "gold" | "green" | "blue" | "red" | "neutral";
}) {
  const color = CHART[tone];
  const up = (trend ?? 0) >= 0;

  const inner = (
    <div className="group h-full rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(47,42,36,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(47,42,36,0.18)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          {label}
        </p>
        {Icon && (
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${color}1f`, color }}
          >
            <Icon className="h-4 w-4" strokeWidth={1.7} />
          </span>
        )}
      </div>

      <p className="mt-3 font-sans text-2xl font-semibold tabular-nums tracking-tight text-ink">
        {value}
      </p>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {trend !== undefined ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.68rem] font-medium tabular-nums",
                up ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600",
              )}
            >
              {up ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {up ? "+" : ""}
              {trend}%
            </span>
          ) : (
            hint && <span className="truncate text-xs text-ink-muted">{hint}</span>
          )}
          {trend !== undefined && hint && (
            <p className="mt-1 truncate text-xs text-ink-muted">{hint}</p>
          )}
        </div>
        {series && series.length > 1 && (
          <Sparkline data={series} color={color} width={92} height={30} />
        )}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {inner}
    </Link>
  ) : (
    inner
  );
}

/* ------------------------------------------------------------------ Badges */

/**
 * Status badges pair a tinted surface with a darker label so the text clears
 * WCAG on small type — status is never communicated by colour alone.
 */
const BADGE: Record<string, string> = {
  pending: "bg-beige text-ink-soft",
  confirmed: "bg-gold-50 text-gold-800",
  processing: "bg-gold-50 text-gold-800",
  packed: "bg-gold-50 text-gold-800",
  shipped: "bg-blue-50 text-blue-800",
  delivered: "bg-green-50 text-green-800",
  cancelled: "bg-red-50 text-red-700",
  refunded: "bg-red-50 text-red-700",
  returned: "bg-red-50 text-red-700",
  unpaid: "bg-beige text-ink-soft",
  partial: "bg-gold-50 text-gold-800",
  paid: "bg-green-50 text-green-800",
  failed: "bg-red-50 text-red-700",
  published: "bg-green-50 text-green-800",
  rejected: "bg-red-50 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wide",
        BADGE[status] ?? "bg-beige text-ink-soft",
      )}
    >
      {status}
    </span>
  );
}

/* ------------------------------------------------------------------- Header */

export function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[1.75rem] tracking-tight text-ink">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
