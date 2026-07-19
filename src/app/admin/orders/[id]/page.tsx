import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Truck } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusBadge, Card, CardTitle } from "@/components/admin/ui";
import {
  OrderStatusControl,
  PaymentStatusControl,
  LogisticsForm,
  InternalNotesForm,
} from "@/components/admin/order-controls";
import { OrderTimeline, type TimelineEvent } from "@/components/admin/order-timeline";
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

  const [{ data: items }, eventsRes] = await Promise.all([
    admin.from("order_items").select("*").eq("order_id", id),
    admin
      .from("order_events")
      .select("id, status, note, created_at")
      .eq("order_id", id)
      .order("created_at", { ascending: false }),
  ]);
  const events = (eventsRes.data ?? []) as TimelineEvent[];

  const shipping = order.shipping as {
    line1?: string;
    line2?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink-soft hover:text-gold-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to orders
        </Link>
        <Link
          href={`/invoice/${order.id}`}
          target="_blank"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-5 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-gold-700"
        >
          <FileText className="h-4 w-4" /> Invoice
        </Link>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[1.75rem] tracking-tight text-ink">
            {order.order_number}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {new Date(order.created_at).toLocaleString("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left: items + timeline */}
        <div className="space-y-6">
          <Card className="!p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-line bg-beige/50 text-left text-[0.64rem] uppercase tracking-[0.12em] text-ink-muted">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Item</th>
                    <th className="px-4 py-3 font-semibold">Qty</th>
                    <th className="px-4 py-3 text-right font-semibold">Price</th>
                    <th className="px-6 py-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {(items ?? []).map((it) => (
                    <tr key={it.id}>
                      <td className="px-6 py-3">
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
                      <td className="px-6 py-3 text-right font-medium tabular-nums text-ink">
                        {formatPrice(Number(it.line_total))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end px-6 py-5">
              <dl className="w-full max-w-xs space-y-2 text-sm">
                <Row label="Subtotal" value={formatPrice(Number(order.subtotal))} />
                {Number(order.discount) > 0 && (
                  <Row
                    label={`Discount${order.coupon_code ? ` (${order.coupon_code})` : ""}`}
                    value={`− ${formatPrice(Number(order.discount))}`}
                  />
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
                {Number(order.advance_amount) > 0 && (
                  <>
                    <Row
                      label="Deposit due"
                      value={formatPrice(Number(order.advance_amount))}
                    />
                    <Row
                      label="Balance on delivery"
                      value={formatPrice(
                        Math.max(0, Number(order.total) - Number(order.advance_amount)),
                      )}
                    />
                  </>
                )}
              </dl>
            </div>
          </Card>

          <Card>
            <CardTitle title="Timeline" />
            <OrderTimeline events={events} />
          </Card>
        </div>

        {/* Right: controls */}
        <div className="space-y-6">
          <Card>
            <div className="space-y-4">
              <OrderStatusControl orderId={order.id} status={order.status} />
              <PaymentStatusControl orderId={order.id} status={order.payment_status} />
              <p className="text-xs text-ink-muted">
                Method:{" "}
                <span className="font-medium uppercase text-ink-soft">
                  {order.payment_method}
                </span>
              </p>
            </div>
          </Card>

          <Card>
            <CardTitle title="Shipment" />
            <LogisticsForm
              orderId={order.id}
              courier={order.courier ?? null}
              tracking={order.tracking_number ?? null}
            />
            {order.tracking_number && (
              <p className="mt-3 flex items-center gap-2 text-xs text-ink-soft">
                <Truck className="h-3.5 w-3.5 text-gold-600" />
                {order.courier ? `${order.courier} · ` : ""}
                {order.tracking_number}
              </p>
            )}
          </Card>

          <Card>
            <CardTitle title="Customer" />
            <div className="text-sm">
              <p className="text-ink">{order.customer_name}</p>
              <p className="text-ink-soft">{order.email}</p>
              <p className="text-ink-soft">{order.phone}</p>
              <h3 className="mb-1 mt-4 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Shipping address
              </h3>
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
                  <h3 className="mb-1 mt-4 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                    Customer note
                  </h3>
                  <p className="text-ink-soft">{order.notes}</p>
                </>
              )}
            </div>
          </Card>

          <Card>
            <CardTitle title="Internal Notes" hint="Only visible to your team" />
            <InternalNotesForm orderId={order.id} notes={order.internal_notes ?? null} />
          </Card>
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
