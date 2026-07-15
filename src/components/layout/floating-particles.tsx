"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * FloatingParticles — a fixed, non-interactive layer of drifting champagne-gold
 * "dust" that floats gently up the page. Kept subtle (small, low-opacity dots)
 * so it reads as luxury shimmer rather than noise. Respects reduced-motion via
 * the .particle CSS rules in globals.css.
 */
const COUNT = 18;

export function FloatingParticles() {
  // Render only on the client: the randomized positions differ between server
  // and client, which would otherwise trigger a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const particles = useMemo(
    () =>
      Array.from({ length: COUNT }).map((_, i) => {
        const size = 2 + Math.random() * 5; // 2–7px
        return {
          id: i,
          left: Math.random() * 100, // vw %
          size,
          duration: 14 + Math.random() * 16, // 14–30s
          delay: -Math.random() * 24, // negative → staggered mid-flight
          opacity: 0.28 + Math.random() * 0.35,
        };
      }),
    [],
  );

  if (!mounted) return null;

  return (
    <div className="particle-field" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
