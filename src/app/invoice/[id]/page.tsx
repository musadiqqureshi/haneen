import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStoreSettings } from "@/lib/settings";
import { qrSvg } from "@/lib/qr";
import { PrintButton } from "@/components/invoice/print-button";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Invoice — Haneen Grace",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const PAYMENT_LABEL: Record<string, string> = {
  unpaid: "Unpaid",
  partial: "Partially Paid",
  paid: "Paid",
  refunded: "Refunded",
  failed: "Failed",
};

export default async function InvoicePage({
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

  const [{ data: items }, store] = await Promise.all([
    admin.from("order_items").select("*").eq("order_id", id),
    getStoreSettings(),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://haneengrace.com";
  const qr = await qrSvg(`${siteUrl}/invoice/${order.id}`);

  const shipping = order.shipping as {
    line1?: string;
    line2?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
  const paid = order.payment_status === "paid";
  const balance = Math.max(0, Number(order.total) - Number(order.advance_amount));

  return (
    <div className="min-h-screen bg-beige/40 py-8 print:bg-white print:py-0">
      {/* Actions (hidden in print) */}
      <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between px-6 print:hidden">
        <a
          href="/"
          className="font-display text-sm tracking-[0.14em] text-gold-700"
        >
          HANEEN GRACE
        </a>
        <PrintButton />
      </div>

      {/* Invoice sheet */}
      <div className="mx-auto max-w-3xl bg-white p-10 shadow-sm print:max-w-none print:p-0 print:shadow-none sm:p-12">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 border-b border-line pb-8">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-wordmark.png"
              alt="Haneen Grace"
              className="h-12 w-auto"
            />
            <p className="mt-3 text-xs leading-relaxed text-ink-soft">
              Luxury Pret • Modest Wear
              <br />
              {store.email}
              {store.phone ? ` · ${store.phone}` : ""}
            </p>
          </div>
          <div className="text-right">
            <h1 className="font-display text-2xl tracking-tight text-ink">Invoice</h1>
            <p className="mt-1 text-sm font-medium text-ink">{order.order_number}</p>
            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-wide ${
                paid ? "bg-green-50 text-green-800" : "bg-gold-50 text-gold-800"
              }`}
            >
              {PAYMENT_LABEL[order.payment_status] ?? order.payment_status}
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="grid gap-8 py-8 sm:grid-cols-3">
          <div>
            <h2 className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ink-muted">
              Billed To
            </h2>
            <p className="text-sm font-medium text-ink">{order.customer_name}</p>
            <p className="text-sm text-ink-soft">{order.email}</p>
            <p className="text-sm text-ink-soft">{order.phone}</p>
          </div>
          <div>
            <h2 className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ink-muted">
              Ship To
            </h2>
            <p className="text-sm text-ink-soft">
              {shipping?.line1}
              {shipping?.line2 ? `, ${shipping.line2}` : ""}
              <br />
              {[shipping?.city, shipping?.postal_code].filter(Boolean).join(", ")}
              <br />
              {shipping?.country}
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ink-muted">
              Details
            </h2>
            <p className="text-sm text-ink-soft">
              Date:{" "}
              {new Date(order.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="text-sm text-ink-soft">
              Payment:{" "}
              {order.payment_method === "cod" ? "Cash on Delivery" : "Advance Deposit"}
            </p>
          </div>
        </div>

        {/* Items */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-line text-left text-[0.62rem] uppercase tracking-[0.14em] text-ink-muted">
              <th className="py-3 font-semibold">Item</th>
              <th className="py-3 text-center font-semibold">Qty</th>
              <th className="py-3 text-right font-semibold">Unit Price</th>
              <th className="py-3 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(items ?? []).map((it) => (
              <tr key={it.id}>
                <td className="py-3.5">
                  <div className="font-medium text-ink">{it.title}</div>
                  <div className="text-xs text-ink-muted">
                    {[it.color, it.size].filter(Boolean).join(" · ")}
                    {it.sku ? ` · ${it.sku}` : ""}
                  </div>
                </td>
                <td className="py-3.5 text-center tabular-nums text-ink-soft">
                  {it.quantity}
                </td>
                <td className="py-3.5 text-right tabular-nums text-ink-soft">
                  {formatPrice(Number(it.price))}
                </td>
                <td className="py-3.5 text-right font-medium tabular-nums text-ink">
                  {formatPrice(Number(it.line_total))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals + QR */}
        <div className="mt-8 flex flex-wrap items-start justify-between gap-8">
          <div className="flex items-center gap-4">
            <div
              className="h-24 w-24 shrink-0"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: qr }}
            />
            <p className="max-w-[140px] text-[0.68rem] leading-relaxed text-ink-muted">
              Scan to view this invoice &amp; track your order online.
            </p>
          </div>

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
                  label="Deposit"
                  value={formatPrice(Number(order.advance_amount))}
                />
                <Row label="Balance on delivery" value={formatPrice(balance)} />
              </>
            )}
          </dl>
        </div>

        {/* Footer */}
        <div className="mt-10 border-t border-line pt-6 text-center">
          <p className="font-display text-lg text-gold-700">Thank you for your order</p>
          <p className="mt-1 text-xs text-ink-muted">
            {store.name} — Luxury Pret &amp; Modest Wear · {siteUrl.replace(/^https?:\/\//, "")}
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-ink-soft">
      <span>{label}</span>
      <span className="tabular-nums text-ink">{value}</span>
    </div>
  );
}
