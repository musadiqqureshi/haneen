"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Lock, CheckCircle2 } from "lucide-react";
import { useCart, cartSubtotal } from "@/lib/store/cart";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { paymentOptions } from "@/lib/payment-methods";
import { FabricSwatch } from "@/components/product/fabric-swatch";
import { Button } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types";

const FREE_SHIP = 15000;
const SHIP_FEE = 250;

export default function CheckoutPage() {
  const hydrated = useHydrated();
  const { items, clear } = useCart();
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [placed, setPlaced] = useState<string | null>(null);

  const subtotal = hydrated ? cartSubtotal(items) : 0;
  const shipping = subtotal >= FREE_SHIP || subtotal === 0 ? 0 : SHIP_FEE;
  const total = subtotal + shipping;

  const option = paymentOptions.find((p) => p.id === payment)!;
  const dueNow = Math.round(total * option.advanceFraction);

  function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    // Phase 2: POST to /api/orders -> Supabase (orders + order_items), decrement stock
    const orderId = "HG-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    setPlaced(orderId);
    clear();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (placed) {
    return (
      <div className="container-lux flex min-h-[60vh] flex-col items-center justify-center gap-4 py-20 text-center">
        <CheckCircle2 className="h-14 w-14 text-gold-500" strokeWidth={1.2} />
        <h1 className="font-display text-4xl text-ink">Thank you for your order</h1>
        <p className="text-ink-soft">
          Your order{" "}
          <span className="font-medium text-gold-600">#{placed}</span> has been
          placed. We&apos;ll confirm it by phone shortly.
        </p>
        <p className="max-w-md text-sm text-ink-muted">
          Payment method: {option.label}. You can track your order status anytime.
        </p>
        <div className="mt-4 flex gap-3">
          <Button asChild variant="dark">
            <Link href="/track-order">Track Order</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (hydrated && items.length === 0) {
    return (
      <div className="container-lux flex min-h-[60vh] flex-col items-center justify-center gap-5 py-20 text-center">
        <h1 className="font-display text-3xl text-ink">Your bag is empty</h1>
        <Button asChild variant="dark">
          <Link href="/shop">Shop the Collection</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-lux py-14">
      <h1 className="font-display text-4xl text-ink">Checkout</h1>
      <form
        onSubmit={placeOrder}
        className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]"
      >
        {/* Left: details */}
        <div className="space-y-10">
          <Fieldset legend="Contact Information">
            <Field label="Full Name" name="name" required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" name="email" type="email" required />
              <Field label="Phone" name="phone" type="tel" required />
            </div>
          </Fieldset>

          <Fieldset legend="Shipping Address">
            <Field label="Street Address" name="address" required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City" name="city" required />
              <Field label="Postal Code" name="postal" />
            </div>
            <Field label="Order Notes (optional)" name="notes" />
          </Fieldset>

          <Fieldset legend="Payment Method">
            <div className="space-y-3">
              {paymentOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-4 rounded-[2px] border p-5 transition-colors",
                    !opt.enabled && "cursor-not-allowed opacity-55",
                    payment === opt.id
                      ? "border-gold-400 bg-gold-50"
                      : "border-line hover:border-gold-300",
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.id}
                    checked={payment === opt.id}
                    disabled={!opt.enabled}
                    onChange={() => opt.enabled && setPayment(opt.id)}
                    className="mt-1 h-4 w-4 accent-gold-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-ink">{opt.label}</span>
                      {opt.badge && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.12em]",
                            opt.enabled
                              ? "bg-gold-300 text-white"
                              : "bg-taupe/40 text-ink-soft",
                          )}
                        >
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-ink-soft">{opt.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </Fieldset>
        </div>

        {/* Right: summary */}
        <aside className="h-fit rounded-[2px] border border-line bg-beige p-7">
          <h2 className="font-display text-2xl text-ink">Your Order</h2>
          <div className="mt-5 space-y-4">
            {hydrated &&
              items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex gap-3"
                >
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-[2px]">
                    <FabricSwatch swatch={item.swatch} />
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[0.6rem] text-ivory">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="font-serif text-sm leading-tight text-ink">
                      {item.title}
                    </span>
                    <span className="text-xs text-ink-muted">
                      {item.size} · {item.color}
                    </span>
                  </div>
                  <span className="text-sm text-ink">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
          </div>

          <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
            <div className="flex justify-between text-ink-soft">
              <dt>Subtotal</dt>
              <dd className="text-ink">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-ink-soft">
              <dt>Shipping</dt>
              <dd className="text-ink">
                {shipping === 0 ? "Free" : formatPrice(shipping)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base">
              <dt className="font-medium text-ink">Total</dt>
              <dd className="font-display text-xl text-ink">{formatPrice(total)}</dd>
            </div>
            {option.advanceFraction < 1 && (
              <div className="flex justify-between text-gold-600">
                <dt>Due now (advance)</dt>
                <dd className="font-medium">{formatPrice(dueNow)}</dd>
              </div>
            )}
          </dl>

          <Button type="submit" variant="dark" size="lg" className="mt-6 w-full">
            <Lock className="h-4 w-4" /> Place Order
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-muted">
            <Check className="h-3.5 w-3.5 text-gold-500" /> Secure & encrypted checkout
          </p>
        </aside>
      </form>
    </div>
  );
}

function Fieldset({
  legend,
  children,
}: {
  legend: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="mb-1 font-display text-xl text-ink">{legend}</legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.72rem] uppercase tracking-[0.14em] text-ink-soft">
        {label} {required && <span className="text-gold-500">*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        className="h-12 w-full border border-line bg-ivory px-4 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-gold-400"
      />
    </label>
  );
}
