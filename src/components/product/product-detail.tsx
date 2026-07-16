"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  Minus,
  Plus,
  Star,
  Truck,
  RefreshCw,
  ShieldCheck,
  Check,
  Scissors,
} from "lucide-react";
import type { Product } from "@/types";
import { ProductImage } from "@/components/product/product-image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/store/cart";
import { useWishlist } from "@/lib/store/wishlist";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { cn, formatPrice, discountPercent } from "@/lib/utils";

export function ProductDetail({ product }: { product: Product }) {
  const hydrated = useHydrated();
  const [color, setColor] = useState(product.colors[0]?.name ?? "Default");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const add = useCart((s) => s.add);
  const wished = useWishlist((s) => s.ids.includes(product.id));
  const toggleWish = useWishlist((s) => s.toggle);

  const off = discountPercent(product.price, product.salePrice);
  const soldOut = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 5;
  const activePrice = product.salePrice ?? product.price;

  const images = product.images ?? [];
  const [activeImg, setActiveImg] = useState(0);

  function handleAdd() {
    if (soldOut) return;
    add({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      price: activePrice,
      size: "Unstitched",
      color,
      swatch: product.swatch,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      {/* Gallery */}
      <div className="flex flex-col-reverse gap-4 sm:flex-row">
        {images.length > 1 && (
          <div className="flex gap-3 sm:flex-col">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                aria-label={`View image ${i + 1}`}
                className={cn(
                  "relative h-20 w-16 shrink-0 overflow-hidden rounded-[2px] border transition-colors",
                  activeImg === i ? "border-gold-400" : "border-line",
                )}
              >
                <ProductImage
                  images={images}
                  index={i}
                  swatch={product.swatch}
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
        <div className="relative aspect-[3/4] flex-1 overflow-hidden rounded-[2px] bg-beige">
          <ProductImage
            images={images}
            index={activeImg}
            swatch={product.swatch}
            alt={product.title}
            label={product.colors[0]?.name}
            sizes="(max-width: 1024px) 100vw, 45vw"
            priority
          />
          {off > 0 && (
            <span className="absolute left-4 top-4 bg-gold-500 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white">
              −{off}% Off
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col">
        <p className="eyebrow">{product.sku}</p>
        <h1 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">
          {product.title}
        </h1>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center gap-1 text-gold-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < Math.round(product.rating) ? "fill-current" : "text-taupe",
                )}
              />
            ))}
          </div>
          <span className="text-sm text-ink-soft">
            {product.rating.toFixed(1)} · {product.reviewCount} reviews
          </span>
        </div>

        <div className="mt-5 flex items-end gap-3">
          <span className="font-sans text-3xl font-semibold tracking-tight text-ink tabular-nums">
            {formatPrice(activePrice)}
          </span>
          {product.salePrice && (
            <span className="mb-1 text-lg text-ink-muted line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        <p className="mt-5 font-serif text-lg leading-relaxed text-ink-soft">
          {product.shortDescription}
        </p>

        {/* colour */}
        <div className="mt-7">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink">
            Colour — <span className="text-ink-soft">{color}</span>
          </p>
          <div className="mt-3 flex gap-2.5">
            {product.colors.map((c) => (
              <button
                key={c.name}
                onClick={() => setColor(c.name)}
                title={c.name}
                className={cn(
                  "h-9 w-9 rounded-full border-2 p-0.5 transition-all",
                  color === c.name ? "border-gold-400" : "border-line",
                )}
              >
                <span
                  className="block h-full w-full rounded-full"
                  style={{ backgroundColor: c.hex }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* unstitched note (all pieces are unstitched fabric) */}
        <div className="mt-6 flex items-start gap-3 rounded-[2px] border border-gold-200 bg-gold-50/60 px-4 py-3.5">
          <Scissors className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" strokeWidth={1.5} />
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink">
              Unstitched · Three-Piece
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              This is an unstitched fabric suit — shirt, trousers and dupatta —
              ready to be tailored to your measurements.
            </p>
          </div>
        </div>

        {lowStock && (
          <p className="mt-5 text-sm font-medium text-gold-600">
            ✦ Only {product.stock} left — almost gone
          </p>
        )}

        {/* qty + actions */}
        <div className="mt-7 flex items-center gap-3">
          <div className="flex items-center border border-line">
            <button
              aria-label="Decrease quantity"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-3.5 py-3 text-ink-soft hover:text-gold-600"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-8 text-center text-sm">{qty}</span>
            <button
              aria-label="Increase quantity"
              onClick={() => setQty((q) => q + 1)}
              className="px-3.5 py-3 text-ink-soft hover:text-gold-600"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <Button
            variant="dark"
            size="lg"
            className="flex-1"
            onClick={handleAdd}
            disabled={soldOut}
          >
            {soldOut ? (
              "Sold Out"
            ) : added ? (
              <>
                <Check className="h-4 w-4" /> Added to Bag
              </>
            ) : (
              "Add to Bag"
            )}
          </Button>
          <button
            aria-label="Add to wishlist"
            onClick={() => toggleWish(product.id)}
            className="flex h-13 w-13 items-center justify-center border border-line transition-colors hover:border-gold-300"
          >
            <Heart
              className={cn(
                "h-5 w-5",
                hydrated && wished ? "fill-gold-500 text-gold-500" : "text-ink",
              )}
              strokeWidth={1.5}
            />
          </button>
        </div>

        {/* trust */}
        <div className="mt-8 grid grid-cols-3 gap-3 border-y border-line py-6">
          {[
            { icon: Truck, text: "Nationwide COD" },
            { icon: RefreshCw, text: "7-Day Exchange" },
            { icon: ShieldCheck, text: "Atelier Quality" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex flex-col items-center gap-2 text-center">
              <Icon className="h-5 w-5 text-gold-500" strokeWidth={1.4} />
              <span className="text-[0.68rem] uppercase tracking-[0.1em] text-ink-soft">
                {text}
              </span>
            </div>
          ))}
        </div>

        {/* description */}
        <div className="mt-8">
          <h2 className="font-display text-xl text-ink">The Details</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">{product.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {product.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-line px-3 py-1 text-xs text-ink-soft"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <Link
          href="/shop"
          className="mt-8 text-xs uppercase tracking-[0.16em] text-gold-600 hover:text-gold-700"
        >
          ← Back to Shop
        </Link>
      </div>
    </div>
  );
}
