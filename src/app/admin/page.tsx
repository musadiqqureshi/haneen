import Link from "next/link";
import {
  Banknote,
  ShoppingBag,
  Users,
  Package,
  Clock,
  TrendingUp,
  AlertTriangle,
  Receipt,
} from "lucide-react";
import { getAdminStats } from "@/lib/admin/stats";
import { StatCard, StatusBadge, PageTitle, Card, CardTitle } from "@/components/admin/ui";
import { AreaChart } from "@/components/admin/charts/area-chart";
import { BarList } from "@/components/admin/charts/bar-list";
import { statusColor, CHART } from "@/components/admin/charts/tokens";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const s = await getAdminStats(30);
  const revenueSpark = s.revenueSeries.map((p) => p.value);
  const ordersSpark = s.ordersSeries.map((p) => p.value);

  return (
    <>
      <PageTitle
        title="Dashboard"
        subtitle="Your store at a glance — last 30 days."
      />

      {/* Row 1 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Today's Sales"
          value={formatPrice(s.todaySales)}
          icon={Banknote}
          tone="gold"
          hint="Orders placed today"
        />
        <StatCard
          label="Monthly Revenue"
          value={formatPrice(s.monthSales)}
          icon={TrendingUp}
          tone="green"
          trend={s.trends.revenue}
          series={revenueSpark}
        />
        <StatCard
          label="Orders"
          value={String(s.ordersTotal)}
          icon={ShoppingBag}
          tone="blue"
          trend={s.trends.orders}
          series={ordersSpark}
          href="/admin/orders"
        />
        <StatCard
          label="Customers"
          value={String(s.customersTotal)}
          icon={Users}
          tone="gold"
          trend={s.trends.customers}
          hint={`${s.newCustomersToday} new today`}
          href="/admin/customers"
        />
      </div>

      {/* Row 2 */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Products"
          value={String(s.productsTotal)}
          icon={Package}
          tone="neutral"
          href="/admin/products"
        />
        <StatCard
          label="Pending Orders"
          value={String(s.pendingOrders)}
          icon={Clock}
          tone="gold"
          hint="Awaiting confirmation"
          href="/admin/orders?status=pending"
        />
        <StatCard
          label="Low / Out of Stock"
          value={`${s.lowStock} / ${s.outOfStock}`}
          icon={AlertTriangle}
          tone={s.outOfStock > 0 ? "red" : "neutral"}
          hint="Needs restocking"
          href="/admin/products"
        />
        <StatCard
          label="Avg Order Value"
          value={formatPrice(s.avgOrderValue)}
          icon={Receipt}
          tone="green"
          hint="Across all paid orders"
        />
      </div>

      {/* Revenue chart */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle
            title="Revenue"
            hint="Daily revenue over the last 30 days"
            action={
              <span className="font-sans text-lg font-semibold tabular-nums text-ink">
                {formatPrice(s.revenueSeries.reduce((a, b) => a + b.value, 0))}
              </span>
            }
          />
          <AreaChart data={s.revenueSeries} format="currency" label="Revenue" />
        </Card>

        <Card>
          <CardTitle title="Orders by Status" hint="All time" />
          <BarList
            items={s.ordersByStatus.map((o) => ({
              label: o.status,
              value: o.count,
              color: statusColor(o.status),
            }))}
            emptyLabel="No orders yet"
          />
        </Card>
      </div>

      {/* Top products + recent orders */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardTitle title="Best Sellers" hint="By units sold" />
          <BarList
            items={s.topProducts.map((p) => ({
              label: p.title,
              value: p.qty,
              hint: formatPrice(p.revenue),
              color: CHART.gold,
            }))}
            formatValue={(n) => `${n}`}
            emptyLabel="No sales yet"
          />
        </Card>

        <Card className="lg:col-span-2 !p-0">
          <div className="flex items-center justify-between px-6 pt-6">
            <CardTitle title="Recent Orders" />
            <Link
              href="/admin/orders"
              className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-700 hover:text-gold-800"
            >
              View all
            </Link>
          </div>

          {s.recent.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="border-y border-line bg-beige/50 text-left text-[0.64rem] uppercase tracking-[0.12em] text-ink-muted">
                  <tr>
                    <th className="px-6 py-2.5 font-semibold">Order</th>
                    <th className="px-4 py-2.5 font-semibold">Customer</th>
                    <th className="px-4 py-2.5 font-semibold">Status</th>
                    <th className="px-6 py-2.5 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {s.recent.map((o) => (
                    <tr key={o.id} className="transition-colors hover:bg-beige/40">
                      <td className="px-6 py-3">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-medium text-ink hover:text-gold-700"
                        >
                          {o.order_number}
                        </Link>
                        <div className="text-xs text-ink-muted">
                          {new Date(o.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{o.customer_name}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-6 py-3 text-right font-medium tabular-nums text-ink">
                        {formatPrice(o.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-6 pb-10 pt-2 text-center text-sm text-ink-muted">
              No orders yet — they&apos;ll appear here the moment one lands.
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
