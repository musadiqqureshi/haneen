import { Hero } from "@/components/home/hero";
import { PromiseStrip } from "@/components/home/promise-strip";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { ProductRail } from "@/components/home/product-rail";
import { SaleBanner } from "@/components/home/sale-banner";
import { Testimonials } from "@/components/home/testimonials";
import { InstagramFeed } from "@/components/home/instagram-feed";
import { getNewArrivals, getBestSellers } from "@/lib/data/catalog";

export default async function HomePage() {
  const [newArrivals, bestSellers] = await Promise.all([
    getNewArrivals(8),
    getBestSellers(8),
  ]);
  return (
    <>
      <Hero />
      <PromiseStrip />
      <FeaturedCategories />
      <ProductRail
        eyebrow="Just Landed"
        title="New Arrivals"
        description="The latest additions to the Haneen Grace wardrobe."
        products={newArrivals}
        viewAllHref="/shop/new-arrivals"
      />
      <SaleBanner />
      <ProductRail
        eyebrow="Most Coveted"
        title="Best Sellers"
        description="The pieces our community can't stop wearing."
        products={bestSellers}
        viewAllHref="/shop"
        tone="beige"
      />
      <Testimonials />
      <InstagramFeed />
    </>
  );
}
