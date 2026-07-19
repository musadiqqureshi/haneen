"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { useCart, cartSubtotal } from "@/lib/store/cart";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { paymentOptions } from "@/lib/payment-methods";
import {
  placeOrderAction,
  validateCouponAction,
  getPaymentInstructionsAction,
  getCheckoutConfigAction,
} from "@/lib/orders/actions";
import type { PaymentSettings } from "@/lib/settings";
import { FabricSwatch } from "@/components/product/fabric-swatch";
import { Button } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types";

/** Defaults used until the live store settings load. */
const DEFAULT_CONFIG = {
  shipping_fee: 250,
  free_shipping_threshold: 15000,
  advance_percent: 30,
  cod_enabled: true,
  advance_payment_enabled: true,
};

export default function CheckoutPage() {
  const hydrated = useHydrated();
  const { items, clear } = useCart();
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [placed, setPlaced] = useState<string | null>(null);
  const [placedInfo, setPlacedInfo] = useState<{
    orderId: string;
    advanceAmount: number;
    method: PaymentMethod;
  } | null>(null);
  const [bank, setBank] = useState<PaymentSettings | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Coupon
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(
    null,
  );
  const [couponError, setCouponError] = useState<string | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  // Live store config (shipping, deposit %) — server stays authoritative.
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  useEffect(() => {
    getCheckoutConfigAction()
      .then(setConfig)
      .catch(() => {});
  }, []);

  const subtotal = hydrated ? cartSubtotal(items) : 0;
  const discount = coupon?.discount ?? 0;
  const shipping =
    subtotal >= config.free_shipping_threshold || subtotal === 0
      ? 0
      : config.shipping_fee;
  const total = Math.max(0, subtotal - discount + shipping);

  const methods = paymentOptions.filter((p) =>
    p.id === "cod" ? config.cod_enabled : config.advance_payment_enabled,
  );
  const option = paymentOptions.find((p) => p.id === payment)!;
  const dueNow =
    payment === "advance"
      ? Math.round((total * config.advance_percent) / 100)
      : total;

  async function applyCoupon() {
    const code = couponInput.trim();
    if (!code || checkingCoupon) return;
    setCheckingCoupon(true);
    setCouponError(null);
    const res = await validateCouponAction(code, subtotal);
    if (res.error || !res.code) {
      setCoupon(null);
      setCouponError(res.error ?? "That code isn't valid.");
    } else {
      setCoupon({ code: res.code, discount: res.discount });
    }
    setCheckingCoupon(false);
  }

  async function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    setError(null);

    const res = await placeOrderAction({
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      address: String(fd.get("address") ?? ""),
      city: String(fd.get("city") ?? ""),
      postal: String(fd.get("postal") ?? ""),
      notes: String(fd.get("notes") ?? ""),
      payment,
      couponCode: coupon?.code,
      items: items.map((i) => ({
        productId: i.productId,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
      })),
    });

    if (res.orderNumber) {
      setPlaced(res.orderNumber);
      setPlacedInfo({
        orderId: res.orderId ?? "",
        advanceAmount: res.advanceAmount ?? 0,
        method: payment,
      });
      if (payment === "advance") {
        getPaymentInstructionsAction()
          .then(setBank)
          .catch(() => setBank(null));
      }
      clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setError(res.error ?? "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (placed) {
    const isAdvance = placedInfo?.method === "advance" && placedInfo.advanceAmount > 0;
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

        {isAdvance && (
          <div className="mt-2 w-full max-w-md rounded-[3px] border border-gold-300 bg-gold-50/60 p-6 text-left">
            <h2 className="font-display text-lg text-ink">
              Complete your {formatPrice(placedInfo.advanceAmount)} deposit
            </h2>
            <p className="mt-1.5 text-sm text-ink-soft">
              Your order is reserved. Transfer the deposit and the balance is paid
              on delivery.
            </p>

            {bank ? (
              <dl className="mt-4 space-y-1.5 text-sm">
                {bank.bank_name && <BankRow label="Bank" value={bank.bank_name} />}
                {bank.account_title && (
                  <BankRow label="Account Title" value={bank.account_title} />
                )}
                {bank.account_number && (
                  <BankRow label="Account #" value={bank.account_number} />
                )}
                {bank.iban && <BankRow label="IBAN" value={bank.iban} />}
              </dl>
            ) : (
              <p className="mt-4 rounded-[2px] bg-ivory/80 px-3 py-2.5 text-sm text-ink-soft">
                Our team will share the bank transfer details with you on WhatsApp
                shortly.
              </p>
            )}

            <p className="mt-4 text-xs text-ink-muted">
              Please quote order{" "}
              <span className="font-medium text-gold-700">#{placed}</span> as the
              transfer reference, then send us the receipt.
              {bank?.instructions ? ` ${bank.instructions}` : ""}
            </p>
          </div>
        )}
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {placedInfo?.orderId && (
            <Button asChild variant="dark">
              <a href={`/invoice/${placedInfo.orderId}`} target="_blank" rel="noreferrer">
                View Invoice
              </a>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/track-order">Track Order</Link>
          </Button>
          <Button asChild variant="ghost">
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
              {methods.map((opt) => (
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

          {/* Coupon */}
          <div className="mt-6 border-t border-line pt-5">
            {coupon ? (
              <div className="flex items-center justify-between rounded-[2px] border border-gold-300 bg-gold-50/70 px-3 py-2.5 text-sm">
                <span className="flex items-center gap-2 text-ink">
                  <Check className="h-4 w-4 text-gold-600" />
                  <span className="font-medium uppercase tracking-wide">
                    {coupon.code}
                  </span>
                  applied
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCoupon(null);
                    setCouponInput("");
                  }}
                  className="text-xs text-ink-muted underline hover:text-ink"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Discount code"
                    aria-label="Discount code"
                    className="h-11 flex-1 border border-line bg-ivory px-3 text-sm uppercase tracking-wide text-ink outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-ink-muted focus:border-gold-400"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={checkingCoupon || !couponInput.trim()}
                    className="h-11 border border-ink px-5 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-ivory disabled:opacity-40"
                  >
                    {checkingCoupon ? "…" : "Apply"}
                  </button>
                </div>
                {couponError && (
                  <p className="mt-2 text-xs text-red-500">{couponError}</p>
                )}
              </>
            )}
          </div>

          <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
            <div className="flex justify-between text-ink-soft">
              <dt>Subtotal</dt>
              <dd className="text-ink">{formatPrice(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-gold-700">
                <dt>Discount ({coupon?.code})</dt>
                <dd>− {formatPrice(discount)}</dd>
              </div>
            )}
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
            {payment === "advance" && (
              <>
                <div className="flex justify-between text-gold-700">
                  <dt>Due now ({config.advance_percent}% deposit)</dt>
                  <dd className="font-medium">{formatPrice(dueNow)}</dd>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <dt>On delivery</dt>
                  <dd>{formatPrice(Math.max(0, total - dueNow))}</dd>
                </div>
              </>
            )}
          </dl>

          {error && (
            <div className="mt-5 flex items-start gap-2.5 rounded-[2px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="dark"
            size="lg"
            className="mt-6 w-full"
            disabled={submitting || (hydrated && items.length === 0)}
          >
            <Lock className="h-4 w-4" /> {submitting ? "Placing Order…" : "Place Order"}
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

function BankRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-medium tabular-nums text-ink">{value}</dd>
    </div>
  );
}
