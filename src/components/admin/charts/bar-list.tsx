import { CHART } from "./tokens";

export interface BarItem {
  label: string;
  value: number;
  color?: string;
  hint?: string;
}

/**
 * Horizontal bar list for magnitude-by-category.
 * Every bar is directly labelled, so identity never depends on colour alone.
 * Bars are anchored to the baseline with rounded data-ends.
 */
export function BarList({
  items,
  formatValue = (n) => String(n),
  emptyLabel = "No data yet",
}: {
  items: BarItem[];
  formatValue?: (n: number) => string;
  emptyLabel?: string;
}) {
  if (!items.length) {
    return <p className="py-8 text-center text-sm text-ink-muted">{emptyLabel}</p>;
  }
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <ul className="space-y-3.5">
      {items.map((it) => {
        const pct = Math.max(2, Math.round((it.value / max) * 100));
        return (
          <li key={it.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="truncate text-sm capitalize text-ink">
                {it.label}
              </span>
              <span className="shrink-0 text-sm font-medium tabular-nums text-ink">
                {formatValue(it.value)}
                {it.hint && (
                  <span className="ml-1.5 text-xs font-normal text-ink-muted">
                    {it.hint}
                  </span>
                )}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-beige">
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out"
                style={{
                  width: `${pct}%`,
                  backgroundColor: it.color ?? CHART.gold,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
