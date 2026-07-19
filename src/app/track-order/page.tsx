"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Package, Truck, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Button } from "@/components/ui/button";
import { trackOrderAction, type TrackedOrder } from "@/lib/orders/actions";
import { formatPrice, cn } from "@/lib/utils";

const STEPS = [
  { icon: CheckCircle2, label: "Order Confirmed" },
  { icon: Package, label: "Preparing" },
  { icon: Truck, label: "Out for Delivery" },
  { icon: CheckCircle2, label: "Delivered" },
];

const STATUS_STEP: Record<string, number> = {
  pending: 0,
  confirmed: 0,
  processing: 1,
  packed: 1,
  shipped: 2,
  delivered: 3,
};

function TrackButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="dark" size="md" disabled={pending}>
      {pending ? "Tracking…" : "Track"}
    </Button>
  );
}

export default function TrackOrderPage() {
  const [state, action] = useActionState(trackOrderAction, {} as {
    order?: TrackedOrder;
    error?: string;
  });
  const order = state.order;
  const cancelled =
    order && ["cancelled", "refunded", "returned"].includes(order.status);
  const currentStep = order ? STATUS_STEP[order.status] ?? 0 : 0;

  return (
    <>
      <PageHero
        eyebrow="Order Status"
        title="Track Your Order"
        description="Enter your order number and email to see where your grace is on its way."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Track Order" }]}
      />
      <div className="container-lux max-w-2xl py-14">
        <form action={action} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <input
            name="orderNumber"
            required
            placeholder="Order no. (e.g. HG-260716-A1B2)"
            className="h-12 border border-line bg-ivory px-4 text-sm text-ink outline-none focus:border-gold-400"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="Email on the order"
            className="h-12 border border-line bg-ivory px-4 text-sm text-ink outline-none focus:border-gold-400"
          />
          <TrackButton />
        </form>

        {state.error && (
          <div className="mt-6 flex items-start gap-2.5 rounded-[2px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        {order && (
          <div className="mt-12 rounded-[2px] border border-line bg-beige p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[0.7rem] uppercase tracking-[0.16em] text-ink-muted">
                  Order {order.orderNumber}
                </p>
                <p className="mt-1 font-display text-2xl text-ink">
                  {formatPrice(order.total)}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {order.paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : "Advance Payment"}{" "}
                  ·{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium capitalize",
                  cancelled
                    ? "bg-red-100 text-red-600"
                    : order.status === "delivered"
                      ? "bg-green-100 text-green-700"
                      : "bg-gold-300 text-white",
                )}
              >
                {cancelled ? (
                  <XCircle className="h-3.5 w-3.5" />
                ) : (
                  <Clock className="h-3.5 w-3.5" />
                )}
                {order.status}
              </span>
            </div>

            {!cancelled && (
              <div className="mt-10 flex justify-between">
                {STEPS.map((s, i) => {
                  const done = i <= currentStep;
                  return (
                    <div
                      key={s.label}
                      className="flex flex-1 flex-col items-center text-center"
                    >
                      <div className="relative flex w-full items-center justify-center">
                        {i > 0 && (
                          <span
                            className={cn(
                              "absolute right-1/2 top-1/2 h-0.5 w-full -translate-y-1/2",
                              done ? "bg-gold-400" : "bg-taupe/50",
                            )}
                          />
                        )}
                        <span
                          className={cn(
                            "relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-2",
                            done
                              ? "border-gold-400 bg-gold-300 text-white"
                              : "border-taupe bg-ivory text-ink-muted",
                          )}
                        >
                          <s.icon className="h-5 w-5" strokeWidth={1.5} />
                        </span>
                      </div>
                      <span className="mt-2 text-[0.65rem] uppercase tracking-[0.08em] text-ink-soft">
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {order.trackingNumber && (
              <div className="mt-8 flex items-center gap-2.5 rounded-[2px] border border-gold-300 bg-gold-50/60 px-4 py-3 text-sm text-ink">
                <Truck className="h-4 w-4 shrink-0 text-gold-600" />
                <span>
                  {order.courier ? `${order.courier} — ` : ""}Tracking:{" "}
                  <span className="font-medium">{order.trackingNumber}</span>
                </span>
              </div>
            )}

            {order.items.length > 0 && (
              <div className="mt-8 border-t border-line pt-5">
                <p className="text-[0.7rem] uppercase tracking-[0.16em] text-ink-muted">
                  Items
                </p>
                <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                  {order.items.map((it, i) => (
                    <li key={i}>
                      {it.title} × {it.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 border-t border-line pt-5">
              <Button asChild variant="outline" size="sm">
                <a href={`/invoice/${order.id}`} target="_blank" rel="noreferrer">
                  View / Download Invoice
                </a>
              </Button>
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-ink-muted">
          Need help?{" "}
          <a href="/contact" className="text-gold-600 underline">
            Contact us
          </a>{" "}
          and we&apos;ll track it for you.
        </p>
      </div>
    </>
  );
}
