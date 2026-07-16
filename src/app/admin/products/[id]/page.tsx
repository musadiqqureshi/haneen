import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProductForm } from "@/components/admin/product-form";
import { PageTitle } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data: p } = await admin
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!p) notFound();

  const color = (p.colors as { name: string; hex: string }[])?.[0];

  return (
    <>
      <Link
        href="/admin/products"
        className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink-soft hover:text-gold-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to products
      </Link>
      <PageTitle title="Edit Product" subtitle={p.title} />
      <ProductForm
        initial={{
          id: p.id,
          title: p.title,
          category_slug: p.category_slug,
          price: Number(p.price),
          sale_price: p.sale_price != null ? Number(p.sale_price) : null,
          stock: p.stock,
          short_description: p.short_description,
          description: p.description,
          color_name: color?.name,
          color_hex: color?.hex,
          tags: p.tags,
          images: p.images as { url: string }[],
          featured: p.featured,
          best_seller: p.best_seller,
          new_arrival: p.new_arrival,
          is_active: p.is_active,
        }}
      />
    </>
  );
}
