import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Gem, Leaf, HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "The story of Haneen Grace — luxury pret and modest wear crafted with intention, elegance and grace.",
};

const values = [
  {
    icon: Gem,
    title: "Crafted with Intention",
    text: "Every piece is finished by hand at our atelier, where detail is never an afterthought.",
  },
  {
    icon: Leaf,
    title: "Modest by Design",
    text: "Elegance and modesty woven together — fashion that honours the woman who wears it.",
  },
  {
    icon: HeartHandshake,
    title: "Made to Be Treasured",
    text: "We create heirlooms, not trends. Pieces meant to be loved for seasons to come.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Est. 2023"
        title="The Haneen Grace Story"
        description="Where timeless craftsmanship meets modern modest luxury."
        accent="#f7e7e6"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Our Story" }]}
      />

      <section className="container-lux grid gap-12 py-20 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <div className="aspect-[4/5] overflow-hidden rounded-[3px] bg-gradient-to-br from-gold-100 via-blush to-beige">
            <div className="grain relative h-full w-full" />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="eyebrow">Our Beginning</p>
          <h2 className="mt-3 font-display text-4xl leading-tight text-ink">
            Grace, threaded into every seam
          </h2>
          <div className="mt-5 space-y-4 leading-relaxed text-ink-soft">
            <p>
              Haneen Grace was born from a simple belief — that a woman should
              never have to choose between modesty and magnificence. We set out
              to create clothing that lets her have both, effortlessly.
            </p>
            <p>
              From the quiet luxury of everyday pret to the grandeur of festive
              couture, each collection is designed in-house and brought to life
              by skilled artisans who treat every thread as though it were their
              own.
            </p>
            <p>
              Today, Haneen Grace dresses thousands of women across Pakistan and
              beyond — each one carrying a little more grace into the world.
            </p>
          </div>
          <Button asChild variant="dark" className="mt-8">
            <Link href="/shop">Explore the Collection</Link>
          </Button>
        </Reveal>
      </section>

      <section className="bg-beige py-20">
        <div className="container-lux">
          <div className="grid gap-6 md:grid-cols-3">
            {values.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <div className="flex h-full flex-col items-center rounded-[2px] border border-line bg-ivory p-8 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold-200 text-gold-500">
                    <Icon className="h-6 w-6" strokeWidth={1.3} />
                  </span>
                  <h3 className="mt-5 font-display text-xl text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
