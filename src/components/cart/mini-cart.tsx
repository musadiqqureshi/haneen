"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart, cartSubtotal } from "@/lib/store/cart";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { formatPrice, cn } from "@/lib/utils";
import { FabricSwatch } from "@/components/product/fabric-swatch";
import { Button } from "@/components/ui/button";

const FREE_SHIP = 15000;

export function MiniCart() {
  const hydrated = useHydrated();
  const { items, isOpen, close, remove, updateQty } = useCart();
  const subtotal = hydrated ? cartSubtotal(items) : 0;
  const remaining = Math.max(0, FREE_SHIP - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIP) * 100);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70] transition-opacity duration-300",
        isOpen ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={close} />
      <aside
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-ivory shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        aria-label="Shopping bag"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-lg tracking-wide text-ink">
            Your Bag{" "}
            <span className="text-ink-muted">
              ({hydrated ? items.reduce((n, i) => n + i.quantity, 0) : 0})
            </span>
          </h2>
          <button aria-label="Close bag" onClick={close}>
            <X className="h-5 w-5 text-ink hover:text-gold-600 transition-colors" strokeWidth={1.5} />
          </button>
        </div>

        {hydrated && items.length > 0 ? (
          <>
            {/* free-ship progress */}
            <div className="border-b border-line px-6 py-4">
              <p className="text-xs text-ink-soft">
                {remaining > 0 ? (
                  <>
                    You&apos;re{" "}
                    <span className="font-medium text-gold-600">
                      {formatPrice(remaining)}
                    </span>{" "}
                    away from free shipping
                  </>
                ) : (
                  <span className="font-medium text-gold-600">
                    ✦ You&apos;ve unlocked free shipping
                  </span>
                )}
              </p>
              <div className="mt-2 h-1 w-full rounded-full bg-beige">
                <div
                  className="h-full rounded-full bg-gold-300 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex gap-4 border-b border-line/60 py-4"
                >
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={close}
                    className="h-24 w-20 shrink-0 overflow-hidden rounded-[2px]"
                  >
                    <FabricSwatch swatch={item.swatch} />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={close}
                      className="font-serif text-base leading-tight text-ink hover:text-gold-600"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 text-xs text-ink-muted">
                      {item.size} · {item.color}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-line">
                        <button
                          aria-label="Decrease"
                          className="px-2 py-1 text-ink-soft hover:text-gold-600"
                          onClick={() =>
                            updateQty(item.productId, item.size, item.color, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-6 text-center text-xs">{item.quantity}</span>
                        <button
                          aria-label="Increase"
                          className="px-2 py-1 text-ink-soft hover:text-gold-600"
                          onClick={() =>
                            updateQty(item.productId, item.size, item.color, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-medium text-sm text-ink">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    aria-label="Remove"
                    className="self-start text-ink-muted hover:text-gold-600"
                    onClick={() => remove(item.productId, item.size, item.color)}
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-line px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="text-sm uppercase tracking-widest text-ink-soft">
                  Subtotal
                </span>
                <span className="font-display text-xl text-ink">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-muted">
                Shipping & taxes calculated at checkout.
              </p>
              <Button asChild variant="dark" size="lg" className="mt-4 w-full">
                <Link href="/checkout" onClick={close}>
                  Checkout
                </Link>
              </Button>
              <button
                onClick={close}
                className="mt-3 w-full text-center text-xs uppercase tracking-widest text-ink-soft hover:text-gold-600"
              >
                Continue Shopping
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-taupe" strokeWidth={1} />
            <p className="font-serif text-lg text-ink">Your bag is empty</p>
            <p className="text-sm text-ink-muted">
              Discover timeless pieces waiting to be yours.
            </p>
            <Button asChild variant="outline" className="mt-2">
              <Link href="/shop" onClick={close}>
                Shop the Collection
              </Link>
            </Button>
          </div>
        )}
      </aside>
    </div>
  );
}
