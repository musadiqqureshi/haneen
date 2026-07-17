import Link from "next/link";
import Image from "next/image";
import { Scissors, Sparkles, HeartHandshake } from "lucide-react";
import { getProducts } from "@/lib/data/catalog";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Monogram } from "@/components/brand/logo";

const CRAFT = [
  {
    icon: Scissors,
    title: "Unstitched, by design",
    body: "Every three-piece arrives as fabric — tailored to your measurements, never to a size chart.",
  },
  {
    icon: Sparkles,
    title: "Hand-finished detail",
    body: "Embroidery, sheesha and tissue work finished by hand at our atelier.",
  },
  {
    icon: HeartHandshake,
    title: "Modest by intention",
    body: "Silhouettes drawn for grace first — elegance that never asks you to compromise.",
  },
];

export async function Editorial() {
  const all = await getProducts();
  const bySlug = new Map(all.map((p) => [p.slug, p.images?.[0]?.url]));
  const main =
    bySlug.get("lilac-whisper-embroidered-net") ?? all[0]?.images?.[0]?.url;
  const inset =
    bySlug.get("crimson-rose-embroidered-lawn") ?? all[1]?.images?.[0]?.url;

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      {/* moving brand wash */}
      <div className="brand-gradient pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-ivory/25" />

      <div className="container-lux relative grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
        {/* Imagery */}
        <Reveal>
          <div className="relative mx-auto max-w-md lg:mx-0">
            {/* offset gold frame */}
            <div className="absolute -bottom-4 -left-4 h-full w-full rounded-[3px] border border-gold-300/70" />
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3px] shadow-[0_30px_70px_-40px_rgba(47,42,36,0.6)]">
              {main && (
                <Image
                  src={main}
                  alt="The Haneen Grace woman"
                  fill
                  sizes="(max-width: 1024px) 90vw, 42vw"
                  className="object-cover object-top"
                />
              )}
            </div>
            {/* inset detail shot */}
            {inset && (
              <div className="absolute -bottom-8 -right-5 hidden h-44 w-36 overflow-hidden rounded-[3px] border-4 border-ivory shadow-xl sm:block">
                <Image
                  src={inset}
                  alt="Craft detail"
                  fill
                  sizes="144px"
                  className="object-cover object-top"
                />
              </div>
            )}
          </div>
        </Reveal>

        {/* Copy */}
        <Reveal delay={0.08}>
          <div className="max-w-xl">
            <Monogram className="h-10 w-10" />
            <p className="eyebrow mt-5">The Haneen Grace Woman</p>
            <h2 className="mt-4 font-display text-[2.4rem] leading-[1.08] text-ink sm:text-[3.2rem]">
              Grace is not worn.
              <br />
              <span className="text-gold-foil italic">It is carried.</span>
            </h2>
            <p className="mt-6 font-serif text-lg leading-relaxed text-ink-soft">
              Every Haneen Grace piece begins as fabric and ends as something
              entirely yours — cut to your measure, finished by hand, and made to
              be remembered long after the evening ends.
            </p>

            <ul className="mt-8 space-y-5">
              {CRAFT.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-300/70 text-gold-600">
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <div>
                    <p className="font-display text-base font-medium tracking-tight text-ink">
                      {title}
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild variant="dark" size="lg">
                <Link href="/shop">Explore the Collection</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/about">Our Story</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
