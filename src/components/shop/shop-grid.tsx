"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { Product } from "@/types";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { cn, discountPercent } from "@/lib/utils";

type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

const sortLabels: Record<SortKey, string> = {
  featured: "Featured",
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  rating: "Top Rated",
};

export function ShopGrid({ products }: { products: Product[] }) {
  const [sort, setSort] = useState<SortKey>("featured");
  const [sizes, setSizes] = useState<string[]>([]);
  const [onSale, setOnSale] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const allSizes = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.sizes))),
    [products],
  );
  const priceCeiling = useMemo(
    () => Math.max(...products.map((p) => p.salePrice ?? p.price), 0),
    [products],
  );

  const filtered = useMemo(() => {
    let list = [...products];
    if (sizes.length) list = list.filter((p) => p.sizes.some((s) => sizes.includes(s)));
    if (onSale) list = list.filter((p) => p.salePrice);
    if (maxPrice > 0) list = list.filter((p) => (p.salePrice ?? p.price) <= maxPrice);

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        break;
      case "price-desc":
        list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        list.sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
        break;
      default:
        list.sort(
          (a, b) =>
            Number(b.featured) - Number(a.featured) ||
            discountPercent(b.price, b.salePrice) - discountPercent(a.price, a.salePrice),
        );
    }
    return list;
  }, [products, sizes, onSale, maxPrice, sort]);

  function toggleSize(s: string) {
    setSizes((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  }

  const filters = (
    <div className="space-y-8">
      <FilterBlock title="Availability">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={onSale}
            onChange={(e) => setOnSale(e.target.checked)}
            className="h-4 w-4 accent-gold-500"
          />
          On Sale Only
        </label>
      </FilterBlock>

      <FilterBlock title="Size">
        <div className="flex flex-wrap gap-2">
          {allSizes.map((s) => (
            <button
              key={s}
              onClick={() => toggleSize(s)}
              className={cn(
                "min-w-10 border px-3 py-1.5 text-xs uppercase tracking-wide transition-colors",
                sizes.includes(s)
                  ? "border-gold-400 bg-gold-300 text-white"
                  : "border-line text-ink-soft hover:border-gold-300",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterBlock>

      <FilterBlock title="Max Price">
        <input
          type="range"
          min={0}
          max={priceCeiling}
          step={1000}
          value={maxPrice || priceCeiling}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-gold-500"
        />
        <p className="mt-2 text-xs text-ink-soft">
          Up to PKR {(maxPrice || priceCeiling).toLocaleString()}
        </p>
      </FilterBlock>

      {(sizes.length > 0 || onSale || maxPrice > 0) && (
        <button
          onClick={() => {
            setSizes([]);
            setOnSale(false);
            setMaxPrice(0);
          }}
          className="text-xs uppercase tracking-[0.16em] text-gold-600 hover:text-gold-700"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
      {/* Desktop filters */}
      <aside className="hidden lg:block">
        <h3 className="mb-6 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-ink">
          Filters
        </h3>
        {filters}
      </aside>

      <div>
        {/* Toolbar */}
        <div className="mb-8 flex items-center justify-between gap-4 border-b border-line pb-4">
          <p className="text-sm text-ink-soft">
            {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFiltersOpen(true)}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filter
            </button>
            <label className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-ink-soft">
              Sort
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="border border-line bg-ivory px-3 py-2 text-xs text-ink outline-none focus:border-gold-400"
              >
                {Object.entries(sortLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {filtered.length ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="font-serif text-xl text-ink">No pieces match your filters</p>
            <p className="mt-2 text-sm text-ink-soft">Try adjusting your selection.</p>
          </div>
        )}
      </div>

      {/* Mobile filter drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[65] lg:hidden transition-opacity duration-300",
          filtersOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="absolute inset-0 bg-ink/40" onClick={() => setFiltersOpen(false)} />
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-ivory p-6 transition-transform duration-400",
            filtersOpen ? "translate-y-0" : "translate-y-full",
          )}
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-display text-xl text-ink">Filters</h3>
            <button onClick={() => setFiltersOpen(false)} aria-label="Close filters">
              <X className="h-5 w-5 text-ink" />
            </button>
          </div>
          {filters}
          <Button
            variant="dark"
            className="mt-8 w-full"
            onClick={() => setFiltersOpen(false)}
          >
            Show {filtered.length} results
          </Button>
        </div>
      </div>
    </div>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ink">
        {title}
      </h4>
      {children}
    </div>
  );
}
