import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageTitle, StatCard, Card, CardTitle } from "@/components/admin/ui";
import { StockAdjust } from "@/components/admin/stock-adjust";
import { Package, AlertTriangle, XCircle, Boxes } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const FILTERS = [
  ["all", "All"],
  ["low", "Low stock"],
  ["out", "Out of stock"],
];

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = "all" } = await searchParams;
  const admin = createAdminClient();

  const [{ data: products }, eventsRes] = await Promise.all([
    admin
      .from("products")
      .select("id, slug, sku, title, stock, is_active")
      .order("stock", { ascending: true }),
    admin
      .from("stock_adjustments")
      .select("id, product_id, delta, reason, resulting_stock, created_at")
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  const all = products ?? [];
  const totalUnits = all.reduce((s, p) => s + p.stock, 0);
  const lowCount = all.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outCount = all.filter((p) => p.stock === 0).length;

  const shown =
    filter === "low"
      ? all.filter((p) => p.stock > 0 && p.stock <= 5)
      : filter === "out"
        ? all.filter((p) => p.stock === 0)
        : all;

  const titleById = new Map(all.map((p) => [p.id, p.title]));
  const events = eventsRes.data ?? [];

  return (
    <>
      <PageTitle
        title="Inventory"
        subtitle="Track stock levels and log restocks, damages and returns."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Products" value={String(all.length)} icon={Package} tone="neutral" />
        <StatCard label="Units in Stock" value={String(totalUnits)} icon={Boxes} tone="green" />
        <StatCard
          label="Low Stock"
          value={String(lowCount)}
          icon={AlertTriangle}
          tone="gold"
          href="/admin/inventory?filter=low"
        />
        <StatCard
          label="Out of Stock"
          value={String(outCount)}
          icon={XCircle}
          tone={outCount > 0 ? "red" : "neutral"}
          href="/admin/inventory?filter=out"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Stock table */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex gap-1.5">
            {FILTERS.map(([v, l]) => (
              <Link
                key={v}
                href={v === "all" ? "/admin/inventory" : `/admin/inventory?filter=${v}`}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  filter === v
                    ? "bg-ink text-ivory"
                    : "bg-white text-ink-soft hover:bg-beige",
                )}
              >
                {l}
              </Link>
            ))}
          </div>

          <Card className="!p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="border-b border-line bg-beige/50 text-left text-[0.64rem] uppercase tracking-[0.12em] text-ink-muted">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">Stock</th>
                    <th className="px-5 py-3 text-right font-semibold">Adjust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {shown.map((p) => (
                    <tr key={p.id} className="hover:bg-beige/30">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="font-medium text-ink hover:text-gold-700"
                        >
                          {p.title}
                        </Link>
                        <div className="text-xs text-ink-muted">{p.sku}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "tabular-nums",
                            p.stock === 0
                              ? "font-semibold text-red-600"
                              : p.stock <= 5
                                ? "font-semibold text-gold-700"
                                : "text-ink",
                          )}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="flex justify-end">
                          <StockAdjust productId={p.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {shown.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-5 py-10 text-center text-ink-muted">
                        Nothing here — stock levels look healthy.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Recent activity */}
        <Card>
          <CardTitle title="Recent Stock Activity" />
          {events.length ? (
            <ul className="space-y-3.5">
              {events.map((e) => (
                <li key={e.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-ink">
                      {titleById.get(e.product_id) ?? "Product"}
                    </p>
                    <p className="text-xs capitalize text-ink-muted">
                      {e.reason} ·{" "}
                      {new Date(e.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-sm font-semibold tabular-nums",
                      e.delta >= 0 ? "text-green-700" : "text-red-600",
                    )}
                  >
                    {e.delta >= 0 ? "+" : ""}
                    {e.delta}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-ink-muted">
              No stock changes logged yet.
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
