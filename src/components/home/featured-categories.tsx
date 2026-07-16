import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/catalog";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

// showcase five collections in an editorial mosaic
const featured = categories.filter((c) => c.slug !== "sale");

// Hand-picked cover pieces per collection (falls back to any in-category item).
const COVER: Record<string, string> = {
  "new-arrivals": "sage-mist-embroidered-lawn",
  "luxury-pret": "crimson-rose-embroidered-lawn",
  "casual-wear": "peony-blush-printed-silk",
  "formal-wear": "olive-empress-embroidered-chiffon",
  "festive-collection": "lilac-whisper-embroidered-net",
};

export async function FeaturedCategories() {
  const all = await getProducts();
  const imageBySlug = new Map(all.map((p) => [p.slug, p.images?.[0]?.url]));
  const firstInCategory = (slug: string) =>
    all.find(
      (p) => p.category === slug || p.collections.includes(slug as never),
    )?.images?.[0]?.url;

  const coverFor = (slug: string) =>
    imageBySlug.get(COVER[slug] ?? "") ?? firstInCategory(slug);

  return (
    <section className="container-lux py-20 sm:py-24">
      <SectionHeading
        eyebrow="Explore"
        title="Shop by Collection"
        description="From everyday ease to festive grandeur — find the pieces made for every chapter of your story."
      />

      <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:grid-rows-2">
        {featured.map((cat, i) => {
          const cover = coverFor(cat.slug);
          const large = i === 0;
          return (
            <Reveal
              key={cat.slug}
              delay={i * 0.06}
              className={large ? "col-span-2 row-span-2" : ""}
            >
              <Link
                href={`/shop/${cat.slug}`}
                className="group relative flex h-full min-h-52 flex-col justify-end overflow-hidden rounded-[2px] p-6"
                style={
                  cover
                    ? undefined
                    : {
                        background: `linear-gradient(150deg, ${cat.accent}, #ffffff00 130%), linear-gradient(320deg, ${cat.accent}55, #faf8f5)`,
                      }
                }
              >
                {cover && (
                  <Image
                    src={cover}
                    alt={cat.name}
                    fill
                    sizes={
                      large
                        ? "(max-width: 1024px) 100vw, 50vw"
                        : "(max-width: 1024px) 50vw, 25vw"
                    }
                    className="object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/15 to-transparent transition-opacity duration-500 group-hover:from-ink/80" />
                <div className="relative z-10">
                  <p className="text-[0.62rem] uppercase tracking-[0.22em] text-white/90">
                    {cat.tagline}
                  </p>
                  <h3 className="mt-1 font-display text-2xl text-white sm:text-3xl">
                    {cat.name}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-1 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-white opacity-0 transition-all duration-500 group-hover:opacity-100">
                    Discover <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
