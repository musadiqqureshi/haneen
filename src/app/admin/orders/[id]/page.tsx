import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusBadge } from "@/components/admin/ui";
import {
  OrderStatusControl,
  PaymentStatusControl,
} from "@/components/admin/order-controls";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!order) notFound();

  const { data: items } = await admin
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  const shipping = order.shipping as {
    line1?: string;
    line2?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };

  return (
    <>
      <Link
        href="/admin/orders"
        className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink-soft hover:text-gold-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to orders
      </Link>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">{order.order_number}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {new Date(order.created_at).toLocaleString("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Items + totals */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-lg border border-line bg-ivory">
            <table className="w-full text-sm">
              <thead className="bg-beige text-left text-[0.66rem] uppercase tracking-[0.12em] text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-semibold">Item</th>
                  <th className="px-4 py-3 font-semibold">Qty</th>
                  <th className="px-4 py-3 text-right font-semibold">Price</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {(items ?? []).map((it) => (
                  <tr key={it.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink">{it.title}</div>
                      <div className="text-xs text-ink-muted">
                        {[it.color, it.size].filter(Boolean).join(" · ")}
                        {it.sku ? ` · ${it.sku}` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{it.quantity}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-soft">
                      {formatPrice(Number(it.price))}
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-ink">
                      {formatPrice(Number(it.line_total))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ml-auto max-w-xs space-y-2 text-sm">
            <Row label="Subtotal" value={formatPrice(Number(order.subtotal))} />
            {Number(order.discount) > 0 && (
              <Row label="Discount" value={`− ${formatPrice(Number(order.discount))}`} />
            )}
            <Row
              label="Shipping"
              value={
                Number(order.shipping_fee) === 0
                  ? "Free"
                  : formatPrice(Number(order.shipping_fee))
              }
            />
            <div className="flex justify-between border-t border-line pt-2 text-base font-semibold text-ink">
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(Number(order.total))}</span>
            </div>
          </div>
        </div>

        {/* Sidebar: controls + customer */}
        <div className="space-y-6">
          <div className="space-y-4 rounded-lg border border-line bg-ivory p-5">
            <OrderStatusControl orderId={order.id} status={order.status} />
            <PaymentStatusControl orderId={order.id} status={order.payment_status} />
            <div className="space-y-1 border-t border-line pt-4 text-xs text-ink-muted">
              <p>
                Method:{" "}
                <span className="font-medium uppercase text-ink-soft">
                  {order.payment_method}
                </span>
              </p>
              {Number(order.advance_amount) > 0 && (
                <>
                  <p>
                    Deposit due:{" "}
                    <span className="font-medium tabular-nums text-gold-700">
                      {formatPrice(Number(order.advance_amount))}
                    </span>
                  </p>
                  <p>
                    Balance on delivery:{" "}
                    <span className="font-medium tabular-nums text-ink-soft">
                      {formatPrice(
                        Math.max(0, Number(order.total) - Number(order.advance_amount)),
                      )}
                    </span>
                  </p>
                </>
              )}
              {order.coupon_code && (
                <p>
                  Coupon:{" "}
                  <span className="font-medium uppercase text-ink-soft">
                    {order.coupon_code}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-line bg-ivory p-5 text-sm">
            <h3 className="mb-3 font-semibold text-ink">Customer</h3>
            <p className="text-ink">{order.customer_name}</p>
            <p className="text-ink-soft">{order.email}</p>
            <p className="text-ink-soft">{order.phone}</p>
            <h3 className="mb-2 mt-4 font-semibold text-ink">Shipping</h3>
            <p className="text-ink-soft">
              {shipping?.line1}
              {shipping?.line2 ? `, ${shipping.line2}` : ""}
              <br />
              {[shipping?.city, shipping?.postal_code].filter(Boolean).join(", ")}
              <br />
              {shipping?.country}
            </p>
            {order.notes && (
              <>
                <h3 className="mb-1 mt-4 font-semibold text-ink">Notes</h3>
                <p className="text-ink-soft">{order.notes}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-ink-soft">
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
