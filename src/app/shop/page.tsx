import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { ShopGrid } from "@/components/shop/shop-grid";
import { products } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Shop All",
  description:
    "Explore the full Haneen Grace collection — luxury pret, modest wear, festive and formal pieces crafted for the modern woman.",
};

export default function ShopPage() {
  return (
    <>
      <PageHero
        eyebrow="The Collection"
        title="Shop All"
        description="Every piece in the Haneen Grace wardrobe, in one graceful place."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Shop" }]}
      />
      <div className="container-lux py-14">
        <ShopGrid products={products} />
      </div>
    </>
  );
}
