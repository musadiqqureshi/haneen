import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusBadge, PageTitle } from "@/components/admin/ui";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: raw } = await searchParams;
  // Only accept a real lifecycle status — ignore anything else in the URL.
  const status = (STATUSES as readonly string[]).includes(raw ?? "")
    ? (raw as (typeof STATUSES)[number])
    : undefined;

  const admin = createAdminClient();
  let query = admin
    .from("orders")
    .select(
      "id, order_number, customer_name, email, total, status, payment_method, payment_status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) query = query.eq("status", status);

  const { data: orders } = await query;

  return (
    <>
      <PageTitle
        title={status ? `${status[0].toUpperCase()}${status.slice(1)} Orders` : "Orders"}
        subtitle={`${orders?.length ?? 0} order${orders?.length === 1 ? "" : "s"}${
          status ? " in this status" : ""
        }`}
      />

      {orders && orders.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-line bg-ivory">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-beige text-left text-[0.66rem] uppercase tracking-[0.12em] text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-beige/40">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-medium text-ink hover:text-gold-700"
                    >
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-ink">{o.customer_name}</div>
                    <div className="text-xs text-ink-muted">{o.email}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {new Date(o.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-ink-soft">
                      {o.payment_method}
                    </div>
                    <StatusBadge status={o.payment_status} />
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
    </>
  );
}
