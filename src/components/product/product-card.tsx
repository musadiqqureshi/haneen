"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/types";
import { FabricSwatch } from "@/components/product/fabric-swatch";
import { useWishlist } from "@/lib/store/wishlist";
import { useCart } from "@/lib/store/cart";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { cn, formatPrice, discountPercent } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const hydrated = useHydrated();
  const wished = useWishlist((s) => s.ids.includes(product.id));
  const toggleWish = useWishlist((s) => s.toggle);
  const add = useCart((s) => s.add);

  const off = discountPercent(product.price, product.salePrice);
  const soldOut = product.stock <= 0;

  function quickAdd() {
    if (soldOut) return;
    add({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      price: product.salePrice ?? product.price,
      size: product.sizes[0],
      color: product.colors[0]?.name ?? "Default",
      swatch: product.swatch,
      quantity: 1,
    });
  }

  return (
    <div className="group relative flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[2px] bg-beige">
        <Link href={`/product/${product.slug}`} aria-label={product.title}>
          <div className="h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105">
            <FabricSwatch swatch={product.swatch} label={product.colors[0]?.name} />
          </div>
        </Link>

        {/* badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.newArrival && (
            <span className="bg-ink/85 px-2.5 py-1 text-[0.58rem] font-medium uppercase tracking-[0.18em] text-ivory">
              New
            </span>
          )}
          {off > 0 && (
            <span className="bg-gold-500 px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-white">
              −{off}%
            </span>
          )}
          {soldOut && (
            <span className="bg-ink-soft px-2.5 py-1 text-[0.58rem] font-medium uppercase tracking-[0.14em] text-ivory">
              Sold Out
            </span>
          )}
        </div>

        {/* wishlist */}
        <button
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => toggleWish(product.id)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-ivory/85 backdrop-blur-sm transition-all hover:bg-ivory"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              hydrated && wished
                ? "fill-gold-500 text-gold-500"
                : "text-ink hover:text-gold-600",
            )}
            strokeWidth={1.5}
          />
        </button>

        {/* quick add */}
        {!soldOut && (
          <button
            onClick={quickAdd}
            className="absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-center gap-2 bg-ivory/95 py-3 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-ink opacity-0 backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-ink hover:text-ivory group-hover:translate-y-0 group-hover:opacity-100"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
            Quick Add
          </button>
        )}
      </div>

      {/* details */}
      <div className="mt-4 flex flex-col">
        <div className="flex items-center gap-1 text-gold-500">
          <Star className="h-3 w-3 fill-current" />
          <span className="text-xs text-ink-soft">
            {product.rating.toFixed(1)}
            <span className="text-ink-muted"> ({product.reviewCount})</span>
          </span>
        </div>
        <Link
          href={`/product/${product.slug}`}
          className="mt-1.5 font-serif text-lg leading-snug text-ink transition-colors hover:text-gold-600"
        >
          {product.title}
        </Link>
        <div className="mt-1.5 flex items-center gap-2">
          {product.salePrice ? (
            <>
              <span className="font-medium text-ink">
                {formatPrice(product.salePrice)}
              </span>
              <span className="text-sm text-ink-muted line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="font-medium text-ink">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        {/* colour swatches */}
        <div className="mt-2.5 flex items-center gap-1.5">
          {product.colors.map((c) => (
            <span
              key={c.name}
              title={c.name}
              className="h-3.5 w-3.5 rounded-full border border-line"
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
