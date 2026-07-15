"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Monogram } from "@/components/brand/logo";

/**
 * PageLoader — a fast, modern intro overlay shown once per browser session.
 * An ivory veil with the HG monogram, a spinning champagne ring and a shimmer
 * sweep, then it lifts away. Session-scoped so it doesn't replay on every
 * client navigation.
 */
export function PageLoader() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("hg-loaded")) {
      setShow(false);
      return;
    }
    const t = setTimeout(() => {
      sessionStorage.setItem("hg-loaded", "1");
      setShow(false);
    }, 1100);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ivory"
        >
          {/* soft moving gradient wash behind the mark */}
          <div className="brand-gradient pointer-events-none absolute inset-0 opacity-70" />

          <div className="relative flex flex-col items-center">
            {/* spinning champagne ring + monogram */}
            <div className="relative flex h-28 w-28 items-center justify-center">
              <span
                className="absolute inset-0 rounded-full border border-gold-200"
                style={{
                  borderTopColor: "#c9a56d",
                  borderRightColor: "#e7d4b4",
                  animation: "ringSpin 0.9s linear infinite",
                }}
              />
              <span style={{ animation: "softPulse 1.2s ease-in-out infinite" }}>
                <Monogram className="h-14 w-14" />
              </span>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mt-6 font-display text-lg tracking-[0.32em] text-gold-600"
            >
              HANEEN GRACE
            </motion.p>

            {/* shimmer bar */}
            <div className="mt-4 h-px w-40 overflow-hidden bg-gold-200/60">
              <span
                className="block h-full w-1/2 bg-gradient-to-r from-transparent via-gold-500 to-transparent"
                style={{ animation: "shimmerSweep 1s ease-in-out infinite" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
