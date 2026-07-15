"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

// Fabric tones echoing the Season End Sale artwork (sage, crimson, ivory, olive)
const panels = [
  { from: "#cfd8bd", to: "#aebd8f", label: "Sage" },
  { from: "#b5273a", to: "#7c1420", label: "Crimson" },
  { from: "#f3ede2", to: "#ddd0bb", label: "Ivory" },
  { from: "#6b7040", to: "#464a24", label: "Olive" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-ivory via-beige to-blush grain">
      {/* soft floral glows */}
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blush/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-gold-100/70 blur-3xl" />

      <div className="container-lux relative grid gap-10 py-16 md:grid-cols-2 md:items-center md:py-24 lg:py-28">
        {/* Copy */}
        <div className="relative z-10 max-w-xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="eyebrow"
          >
            New Collection · 2026
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.08, ease }}
            className="mt-5 font-display text-[2.7rem] leading-[1.05] text-ink sm:text-6xl lg:text-7xl"
          >
            Timeless Grace,
            <br />
            <span className="text-gold-foil italic">Draped in Gold</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.18, ease }}
            className="mt-5 max-w-md font-serif text-lg leading-relaxed text-ink-soft"
          >
            Luxury pret and modest wear, crafted for the woman who wears
            elegance as effortlessly as she wears grace.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.28, ease }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Button asChild variant="dark" size="lg">
              <Link href="/shop/new-arrivals">Shop New Arrivals</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/shop/festive-collection">Festive Collection</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-10 flex items-center gap-6 text-xs text-ink-soft"
          >
            <Stat value="500+" label="Signature Designs" />
            <span className="h-8 w-px bg-line" />
            <Stat value="40k+" label="Graceful Women" />
            <span className="h-8 w-px bg-line" />
            <Stat value="COD" label="Nationwide" />
          </motion.div>
        </div>

        {/* Fabric-panel artwork (swap for /brand/banner.jpg when ready) */}
        <div className="relative">
          <div className="relative mx-auto grid max-w-md grid-cols-4 gap-2 sm:gap-3">
            {panels.map((p, i) => (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 + i * 0.12, ease }}
                className="relative aspect-[2/5] overflow-hidden rounded-t-[999px] shadow-lg"
                style={{
                  background: `linear-gradient(160deg, ${p.from}, ${p.to})`,
                  marginTop: i % 2 === 0 ? "1.5rem" : 0,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/20 mix-blend-soft-light" />
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 font-serif text-[0.6rem] italic text-white/80">
                  {p.label}
                </span>
              </motion.div>
            ))}
          </div>

          {/* floating sale medallion */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: -8 }}
            transition={{ duration: 0.9, delay: 0.9, ease }}
            className="absolute -bottom-4 -left-2 flex h-28 w-28 flex-col items-center justify-center rounded-full border border-gold-300 bg-ivory/95 text-center shadow-xl backdrop-blur sm:h-32 sm:w-32"
          >
            <span className="text-[0.55rem] uppercase tracking-[0.22em] text-ink-soft">
              Up to
            </span>
            <span className="font-display text-3xl text-gold-600">40%</span>
            <span className="text-[0.55rem] uppercase tracking-[0.22em] text-ink-soft">
              Off Sale
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-xl text-ink">{value}</p>
      <p className="mt-0.5 uppercase tracking-[0.14em] text-ink-muted">{label}</p>
    </div>
  );
}
