"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/store/wishlist";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { products } from "@/lib/data/products";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const hydrated = useHydrated();
  const ids = useWishlist((s) => s.ids);
  const clear = useWishlist((s) => s.clear);
  const saved = hydrated ? products.filter((p) => ids.includes(p.id)) : [];

  return (
    <div className="container-lux py-14">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-4xl text-ink">Wishlist</h1>
          <p className="mt-2 text-sm text-ink-soft">
            {saved.length} {saved.length === 1 ? "piece" : "pieces"} saved for later
          </p>
        </div>
        {saved.length > 0 && (
          <button
            onClick={clear}
            className="text-xs uppercase tracking-[0.16em] text-ink-soft hover:text-gold-600"
          >
            Clear all
          </button>
        )}
      </div>

      {hydrated && saved.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-5 text-center">
          <Heart className="h-12 w-12 text-taupe" strokeWidth={1} />
          <p className="font-serif text-xl text-ink">Your wishlist is empty</p>
          <p className="max-w-sm text-ink-soft">
            Tap the heart on any piece to save your favourites here.
          </p>
          <Button asChild variant="dark">
            <Link href="/shop">Explore the Collection</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {saved.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
