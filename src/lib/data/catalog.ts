import type { Product, CategorySlug } from "@/types";
import type { ProductRow } from "@/lib/supabase/database.types";
import { readClient } from "@/lib/supabase/read";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import * as mock from "./products";

/**
 * Storefront catalogue — reads from Supabase when configured, otherwise falls
 * back to the bundled mock data so the site always renders. All functions are
 * async; server components await them directly.
 */

/** Map a DB row to the app Product shape used across the UI. */
function mapRow(r: ProductRow): Product {
  const swatch = (r.swatch ?? []) as string[];
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    shortDescription: r.short_description ?? "",
    description: r.description ?? "",
    price: Number(r.price),
    salePrice: r.sale_price != null ? Number(r.sale_price) : null,
    sku: r.sku ?? "",
    category: r.category_slug as CategorySlug,
    collections: (r.collections ?? []) as CategorySlug[],
    sizes: r.sizes ?? [],
    colors: r.colors ?? [],
    stock: r.stock ?? 0,
    featured: r.featured,
    bestSeller: r.best_seller,
    newArrival: r.new_arrival,
    rating: Number(r.rating ?? 0),
    reviewCount: r.review_count ?? 0,
    swatch: [swatch[0] ?? "#e7d4b4", swatch[1] ?? "#d4b483"],
    images: r.images ?? [],
    tags: r.tags ?? [],
  };
}

/** Base active-products query. */
function base() {
  return readClient().from("products").select("*").eq("is_active", true);
}

async function collect(
  q: PromiseLike<{ data: unknown; error: { message: string } | null }>,
): Promise<Product[]> {
  const { data, error } = await q;
  if (error) {
    console.error("catalog query failed:", error.message);
    return [];
  }
  return (data as ProductRow[]).map(mapRow);
}

// ---- Public API ------------------------------------------------------------

export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return mock.products;
  return collect(base().order("created_at", { ascending: false }));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) return mock.getProduct(slug) ?? null;
  const { data, error } = await readClient()
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data);
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  if (!isSupabaseConfigured()) return mock.getProductsByCategory(slug);
  return collect(
    base()
      .or(`category_slug.eq.${slug},collections.cs.{${slug}}`)
      .order("created_at", { ascending: false }),
  );
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  if (!isSupabaseConfigured()) return mock.newArrivals.slice(0, limit);
  return collect(
    base().eq("new_arrival", true).order("created_at", { ascending: false }).limit(limit),
  );
}

export async function getBestSellers(limit = 8): Promise<Product[]> {
  if (!isSupabaseConfigured()) return mock.bestSellers.slice(0, limit);
  return collect(base().eq("best_seller", true).limit(limit));
}

export async function getSaleProducts(limit = 8): Promise<Product[]> {
  if (!isSupabaseConfigured()) return mock.saleProducts.slice(0, limit);
  return collect(
    base()
      .not("sale_price", "is", null)
      .order("created_at", { ascending: false })
      .limit(limit),
  );
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  if (!isSupabaseConfigured()) return mock.relatedProducts(product, limit);
  const items = await collect(
    base().eq("category_slug", product.category).neq("id", product.id).limit(limit + 1),
  );
  return items.filter((p) => p.id !== product.id).slice(0, limit);
}

export async function getAllSlugs(): Promise<string[]> {
  if (!isSupabaseConfigured()) return mock.products.map((p) => p.slug);
  const { data } = await readClient()
    .from("products")
    .select("slug")
    .eq("is_active", true);
  return (data ?? []).map((r) => r.slug);
}
