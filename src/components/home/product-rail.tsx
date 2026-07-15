import type { Product } from "@/types";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

export function ProductRail({
  eyebrow,
  title,
  description,
  products,
  viewAllHref,
  tone = "ivory",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  products: Product[];
  viewAllHref?: string;
  tone?: "ivory" | "beige";
}) {
  return (
    <section className={tone === "beige" ? "bg-beige py-20 sm:py-24" : "py-20 sm:py-24"}>
      <div className="container-lux">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          align="left"
          viewAllHref={viewAllHref}
        />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.slice(0, 4).map((product, i) => (
            <Reveal key={product.id} delay={i * 0.06}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
