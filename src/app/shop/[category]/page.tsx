import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/page-hero";
import { ShopGrid } from "@/components/shop/shop-grid";
import { categories, getCategory } from "@/lib/data/categories";
import { getProductsByCategory } from "@/lib/data/catalog";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) return { title: "Collection" };
  return {
    title: cat.name,
    description: cat.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();

  const items = await getProductsByCategory(cat.slug);

  return (
    <>
      <PageHero
        eyebrow={cat.tagline}
        title={cat.name}
        description={cat.description}
        accent={cat.accent}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: cat.name },
        ]}
      />
      <div className="container-lux py-14">
        {items.length ? (
          <ShopGrid products={items} />
        ) : (
          <div className="py-24 text-center">
            <p className="font-serif text-xl text-ink">
              This collection is being curated
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              New pieces are arriving soon — check back shortly.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
