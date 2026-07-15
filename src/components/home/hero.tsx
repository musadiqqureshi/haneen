"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Hero — the real Haneen Grace "Season End Sale" campaign banner, shown
 * full-width, with an elegant CTA row beneath. The banner artwork already
 * carries the headline, discount and logo, so we keep the surrounding chrome
 * minimal and let the campaign image lead.
 */
export function Hero() {
  return (
    <section className="relative bg-ivory">
      <motion.div
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease }}
        className="relative w-full overflow-hidden"
      >
        <Link href="/shop/sale" aria-label="Shop the Season End Sale — up to 40% off">
          <Image
            src="/brand/hero-banner.png"
            alt="Haneen Grace Season End Sale — up to 40% off luxury pret and modest wear"
            width={1693}
            height={929}
            priority
            sizes="100vw"
            className="h-auto w-full object-cover"
          />
        </Link>
        {/* faint gold hairline framing the campaign */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gold-300/50" />
      </motion.div>

      {/* CTA row */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease }}
        className="container-lux flex flex-col items-center gap-5 py-9 text-center sm:py-11"
      >
        <p className="eyebrow">Timeless elegance, now at irresistible prices</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button asChild variant="dark" size="lg">
            <Link href="/shop/sale">Shop the Sale</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/shop">Explore Full Collection</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
