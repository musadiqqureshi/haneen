import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductDetail } from "@/components/product/product-detail";
import { ProductReviews } from "@/components/product/product-reviews";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { products, getProduct, relatedProducts } from "@/lib/data/products";
import { getReviews } from "@/lib/data/reviews";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.title,
    description: product.shortDescription,
    openGraph: { title: product.title, description: product.shortDescription },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = relatedProducts(product);

  // Schema.org product markup
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.shortDescription,
    sku: product.sku,
    brand: { "@type": "Brand", name: "Haneen Grace" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    review: getReviews(product, 5).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
      },
      name: r.title,
      reviewBody: r.body,
    })),
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: product.salePrice ?? product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-lux py-10 sm:py-14">
        <nav className="mb-8 flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.14em] text-ink-muted">
          <Link href="/" className="hover:text-gold-600">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-gold-600">
            Shop
          </Link>
          <span>/</span>
          <span className="text-gold-600">{product.title}</span>
        </nav>

        <ProductDetail product={product} />
      </div>

      <ProductReviews product={product} />

      {related.length > 0 && (
        <section className="border-t border-line bg-beige py-20">
          <div className="container-lux">
            <SectionHeading
              eyebrow="You May Also Love"
              title="Complete the Look"
              align="left"
              viewAllHref="/shop"
            />
            <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
