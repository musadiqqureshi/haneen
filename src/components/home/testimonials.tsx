import { Star } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

const testimonials = [
  {
    quote:
      "The embroidery is beyond exquisite — better than the photos. I felt like royalty at my sister's wedding.",
    name: "Ayesha K.",
    location: "Lahore",
  },
  {
    quote:
      "Impeccable stitching and the fabric drapes like a dream. Haneen Grace has become my go-to for every occasion.",
    name: "Fatima R.",
    location: "Karachi",
  },
  {
    quote:
      "Modest, elegant and so beautifully finished. Cash on delivery made it effortless. Simply timeless.",
    name: "Zara M.",
    location: "Islamabad",
  },
];

export function Testimonials() {
  return (
    <section className="bg-beige py-20 sm:py-24">
      <div className="container-lux">
        <SectionHeading
          eyebrow="Loved by Many"
          title="Words of Grace"
          description="Real stories from the women who wear Haneen Grace."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <figure className="flex h-full flex-col rounded-[2px] border border-line bg-ivory p-8">
                <div className="flex gap-0.5 text-gold-500">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-5 flex-1 font-serif text-lg italic leading-relaxed text-ink-soft">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 border-t border-line pt-4">
                  <p className="font-display text-base text-ink">{t.name}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">
                    {t.location}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
