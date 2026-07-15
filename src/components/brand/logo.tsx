import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * LogoImage — the real Haneen Grace horizontal logo (champagne gold on ivory).
 * Used in the header/drawer where the brand sits on an ivory surface. The
 * `mix-blend-multiply` lets the logo's warm paper background melt into the
 * page ivory so no rectangle is visible, while the gold mark stays crisp.
 */
export function LogoImage({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/logo.png"
      alt="Haneen Grace — Luxury Pret • Modest Wear"
      width={640}
      height={229}
      priority
      className={cn("h-auto w-auto mix-blend-multiply", className)}
    />
  );
}

/**
 * HANEEN GRACE brand logo — reproduced as inline SVG so it renders crisply at
 * any size without a raster asset. The HG monogram pairs a serif "H" and "G"
 * with a delicate leaf sprig, echoing the champagne-gold brand mark.
 *
 * Drop the real files into /public/brand/ (logo.png, logo-icon.png, banner.jpg)
 * and swap <Monogram/> for <Image/> when you want the exact raster mark.
 */

const GOLD_ID = "hg-gold";

function GoldDef() {
  return (
    <defs>
      <linearGradient id={GOLD_ID} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#c9a56d" />
        <stop offset="45%" stopColor="#e7d4b4" />
        <stop offset="100%" stopColor="#b8925a" />
      </linearGradient>
    </defs>
  );
}

/** Leaf sprig — a curved stem with three tapered leaves. */
function LeafSprig({ className }: { className?: string }) {
  return (
    <g className={className} fill="url(#hg-gold)" stroke="none">
      {/* stem */}
      <path
        d="M2 34 C 12 30, 24 20, 40 8"
        fill="none"
        stroke="url(#hg-gold)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* leaves */}
      <path d="M14 25 C 20 20, 27 20, 31 16 C 26 24, 20 27, 14 25 Z" />
      <path d="M23 18 C 29 13, 36 13, 40 9 C 35 17, 29 20, 23 18 Z" />
      <path d="M9 30 C 14 27, 20 28, 24 25 C 19 31, 13 32, 9 30 Z" />
    </g>
  );
}

export function Monogram({
  className,
  title = "Haneen Grace",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={title}
      className={cn("block", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <GoldDef />
      <g
        fontFamily="var(--font-playfair), Georgia, serif"
        fill="url(#hg-gold)"
        fontWeight={500}
      >
        <text x="20" y="72" fontSize="66" textAnchor="middle">
          H
        </text>
        <text x="66" y="80" fontSize="72" textAnchor="middle">
          G
        </text>
      </g>
      {/* sprig tucked into the top-right of the monogram */}
      <g transform="translate(46 6) scale(1.05)">
        <LeafSprig />
      </g>
    </svg>
  );
}

export function Wordmark({
  className,
  tagline = true,
}: {
  className?: string;
  tagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex flex-col items-center", className)}>
      <span className="font-display tracking-[0.18em] text-gold-600 leading-none">
        HANEEN GRACE
      </span>
      {tagline && (
        <span className="mt-1 text-[0.55rem] tracking-[0.32em] uppercase text-ink-muted">
          Luxury Pret • Modest Wear
        </span>
      )}
    </span>
  );
}

/** Combined lockup for the header. */
export function Logo({
  className,
  showTagline = false,
}: {
  className?: string;
  showTagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Monogram className="h-9 w-9 shrink-0" />
      <span className="inline-flex flex-col leading-none">
        <span className="font-display text-xl tracking-[0.16em] text-gold-600">
          HANEEN GRACE
        </span>
        {showTagline && (
          <span className="mt-0.5 text-[0.5rem] tracking-[0.3em] uppercase text-ink-muted">
            Luxury Pret • Modest Wear
          </span>
        )}
      </span>
    </span>
  );
}
