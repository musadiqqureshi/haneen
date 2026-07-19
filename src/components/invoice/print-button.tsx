"use client";

import { Printer } from "lucide-react";

/**
 * Print / Save-as-PDF. Uses the browser's native print dialog, which every
 * browser can render to PDF — no server-side PDF dependency needed.
 */
export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex h-11 items-center gap-2 rounded-md bg-ink px-6 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-gold-700 print:hidden"
    >
      <Printer className="h-4 w-4" /> Print / Save PDF
    </button>
  );
}
