import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function SaleBanner() {
  return (
    <section className="container-lux py-16 sm:py-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-[3px] bg-ink px-6 py-16 text-center sm:px-16 sm:py-24">
          {/* gold glows */}
          <div className="pointer-events-none absolute -left-10 top-0 h-56 w-56 rounded-full bg-gold-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-blush/10 blur-3xl" />
          {/* corner frame */}
          <div className="pointer-events-none absolute inset-4 rounded-[2px] border border-gold-500/30" />

          <div className="relative z-10">
            <p className="text-[0.7rem] uppercase tracking-[0.3em] text-gold-200">
              Limited Time
            </p>
            <h2 className="mt-4 font-display text-4xl text-ivory sm:text-6xl">
              Season End <span className="text-gold-foil italic">Sale</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg font-serif text-lg text-ivory/70">
              Timeless elegance, now at irresistible prices. Enjoy up to 40% off
              on selected luxury pret and festive pieces.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button asChild variant="primary" size="lg">
                <Link href="/shop/sale">Shop the Sale</Link>
              </Button>
              <span className="text-xs uppercase tracking-[0.2em] text-ivory/50">
                Ends this month
              </span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
