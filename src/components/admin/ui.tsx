import Link from "next/link";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-lg border border-line bg-ivory p-5 transition-shadow hover:shadow-sm">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-muted">
        {label}
      </p>
      <p className="mt-2 font-sans text-2xl font-semibold tabular-nums text-ink">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

const ORDER_TONE: Record<string, string> = {
  pending: "bg-beige text-ink-soft",
  confirmed: "bg-gold-50 text-gold-700",
  processing: "bg-gold-50 text-gold-700",
  shipped: "bg-gold-100 text-gold-800",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-600",
  refunded: "bg-red-50 text-red-600",
  // payment
  unpaid: "bg-beige text-ink-soft",
  partial: "bg-gold-50 text-gold-700",
  paid: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-600",
  // reviews
  published: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-600",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wide",
        ORDER_TONE[status] ?? "bg-beige text-ink-soft",
      )}
    >
      {status}
    </span>
  );
}

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
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
