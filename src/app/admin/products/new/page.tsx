import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { PageTitle } from "@/components/admin/ui";

export default function NewProductPage() {
  return (
    <>
      <Link
        href="/admin/products"
        className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink-soft hover:text-gold-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to products
      </Link>
      <PageTitle title="Add Product" subtitle="Create a new unstitched three-piece." />
      <ProductForm />
    </>
  );
}
