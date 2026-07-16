import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatCard, StatusBadge, PageTitle } from "@/components/admin/ui";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const admin = createAdminClient();

  const [recent, ordersCount, productsCount, customersCount, pendingCount, revenueRows] =
    await Promise.all([
      admin
        .from("orders")
        .select("id, order_number, customer_name, total, status, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
      admin.from("orders").select("id", { count: "exact", head: true }),
      admin.from("products").select("id", { count: "exact", head: true }),
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      admin.from("orders").select("total, status"),
    ]);

  const revenue = (revenueRows.data ?? [])
    .filter((o) => !["cancelled", "refunded"].includes(o.status))
    .reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <>
      <PageTitle
        title="Dashboard"
        subtitle="A snapshot of your store's performance."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Revenue"
          value={formatPrice(revenue)}
          hint="Excludes cancelled / refunded"
        />
        <StatCard
          label="Orders"
          value={String(ordersCount.count ?? 0)}
          hint={`${pendingCount.count ?? 0} pending`}
          href="/admin/orders"
        />
        <StatCard
          label="Products"
          value={String(productsCount.count ?? 0)}
          href="/admin/products"
        />
        <StatCard
          label="Customers"
          value={String(customersCount.count ?? 0)}
          href="/admin/customers"
        />
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-ink">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-700 hover:text-gold-800"
          >
            View all
          </Link>
        </div>

        {recent.data && recent.data.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-line bg-ivory">
            <table className="w-full text-sm">
              <thead className="bg-beige text-left text-[0.66rem] uppercase tracking-[0.12em] text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recent.data.map((o) => (
                  <tr key={o.id} className="hover:bg-beige/40">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-medium text-ink hover:text-gold-700"
                      >
                        {o.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{o.customer_name}</td>
                    <td className="px-4 py-3 text-ink-soft">
                      {new Date(o.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-ink">
                      {formatPrice(Number(o.total))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-line bg-ivory px-6 py-12 text-center text-ink-soft">
            No orders yet.
          </p>
        )}
      </div>
    </>
  );
}
