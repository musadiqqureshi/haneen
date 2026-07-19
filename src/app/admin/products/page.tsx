import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageTitle } from "@/components/admin/ui";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { formatPrice, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const admin = createAdminClient();

  let query = admin
    .from("products")
    .select(
      "id, slug, sku, title, category_slug, price, sale_price, stock, is_active, images",
    )
    .order("created_at", { ascending: false });
  if (q) query = query.ilike("title", `%${q}%`);

  const { data: products } = await query;

  return (
    <>
      <PageTitle
        title="Products"
        subtitle={
          q
            ? `${products?.length ?? 0} matching “${q}”`
            : `${products?.length ?? 0} products`
        }
        action={
          <Link
            href="/admin/products/new"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-5 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-gold-700"
          >
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        }
      />

      <div className="overflow-x-auto rounded-lg border border-line bg-ivory">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-beige text-left text-[0.66rem] uppercase tracking-[0.12em] text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(products ?? []).map((p) => {
              const img = (p.images as { url: string }[])?.[0]?.url;
              return (
                <tr key={p.id} className="hover:bg-beige/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-beige">
                        {img && (
                          <Image
                            src={img}
                            alt={p.title}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-ink">{p.title}</div>
                        <div className="text-xs text-ink-muted">{p.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-ink-soft">
                    {p.category_slug.replace(/-/g, " ")}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-ink">
                    {p.sale_price ? (
                      <>
                        <span className="font-medium">
                          {formatPrice(Number(p.sale_price))}
                        </span>
                        <span className="ml-1 text-xs text-ink-muted line-through">
                          {formatPrice(Number(p.price))}
                        </span>
                      </>
                    ) : (
                      formatPrice(Number(p.price))
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "tabular-nums",
                        p.stock === 0
                          ? "text-red-600"
                          : p.stock <= 5
                            ? "text-gold-700"
                            : "text-ink-soft",
                      )}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-block rounded-full px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wide",
                        p.is_active
                          ? "bg-green-50 text-green-700"
                          : "bg-beige text-ink-soft",
                      )}
                    >
                      {p.is_active ? "Live" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ProductRowActions
                      id={p.id}
                      slug={p.slug}
                      isActive={p.is_active}
                      title={p.title}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
