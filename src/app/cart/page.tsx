"use client";

import Link from "next/link";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useCart, cartSubtotal } from "@/lib/store/cart";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { FabricSwatch } from "@/components/product/fabric-swatch";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

const FREE_SHIP = 15000;
const SHIP_FEE = 250;

export default function CartPage() {
  const hydrated = useHydrated();
  const { items, updateQty, remove } = useCart();
  const subtotal = hydrated ? cartSubtotal(items) : 0;
  const shipping = subtotal >= FREE_SHIP || subtotal === 0 ? 0 : SHIP_FEE;
  const total = subtotal + shipping;

  if (hydrated && items.length === 0) {
    return (
      <div className="container-lux flex min-h-[60vh] flex-col items-center justify-center gap-5 py-20 text-center">
        <ShoppingBag className="h-12 w-12 text-taupe" strokeWidth={1} />
        <h1 className="font-display text-3xl text-ink">Your bag is empty</h1>
        <p className="max-w-sm text-ink-soft">
          Discover timeless pieces crafted to be treasured.
        </p>
        <Button asChild variant="dark" size="lg">
          <Link href="/shop">Shop the Collection</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-lux py-14">
      <h1 className="font-display text-4xl text-ink">Shopping Bag</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}-${item.color}`}
              className="flex gap-5 py-6"
            >
              <Link
                href={`/product/${item.slug}`}
                className="h-32 w-24 shrink-0 overflow-hidden rounded-[2px]"
              >
                <FabricSwatch swatch={item.swatch} />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-serif text-xl text-ink hover:text-gold-600"
                  >
                    {item.title}
                  </Link>
                  <button
                    aria-label="Remove"
                    onClick={() => remove(item.productId, item.size, item.color)}
                    className="text-ink-muted hover:text-gold-600"
                  >
                    <X className="h-5 w-5" strokeWidth={1.5} />
                  </button>
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  {item.size} · {item.color}
                </p>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex items-center border border-line">
                    <button
                      aria-label="Decrease"
                      onClick={() =>
                        updateQty(item.productId, item.size, item.color, item.quantity - 1)
                      }
                      className="px-3 py-2 text-ink-soft hover:text-gold-600"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      aria-label="Increase"
                      onClick={() =>
                        updateQty(item.productId, item.size, item.color, item.quantity + 1)
                      }
                      className="px-3 py-2 text-ink-soft hover:text-gold-600"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-medium text-ink">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-[2px] border border-line bg-beige p-7">
          <h2 className="font-display text-2xl text-ink">Order Summary</h2>
          <dl className="mt-6 space-y-3 text-sm">
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
            <div className="mt-4 flex justify-between border-t border-line pt-4 text-base">
              <dt className="font-medium text-ink">Total</dt>
              <dd className="font-display text-xl text-ink">{formatPrice(total)}</dd>
            </div>
          </dl>
          <Button asChild variant="dark" size="lg" className="mt-6 w-full">
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>
          <Link
            href="/shop"
            className="mt-4 block text-center text-xs uppercase tracking-[0.16em] text-ink-soft hover:text-gold-600"
          >
            Continue Shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
