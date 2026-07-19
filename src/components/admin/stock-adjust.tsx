"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";
import { adjustStockAction } from "@/lib/admin/actions";

const REASONS = [
  ["restock", "Restock"],
  ["damaged", "Damaged"],
  ["return", "Return"],
  ["correction", "Correction"],
];

function Apply() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      title="Apply adjustment"
      className="flex h-9 items-center gap-1.5 rounded-md bg-ink px-3 text-[0.66rem] font-medium uppercase tracking-[0.1em] text-ivory transition-colors hover:bg-gold-700 disabled:opacity-50"
    >
      {pending ? "…" : <Check className="h-3.5 w-3.5" />}
    </button>
  );
}

/** Inline stock adjustment: signed change + reason. */
export function StockAdjust({ productId }: { productId: string }) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={ref}
      action={async (fd) => {
        await adjustStockAction(fd);
        ref.current?.reset();
      }}
      className="flex items-center gap-1.5"
    >
      <input type="hidden" name="productId" value={productId} />
      <input
        name="change"
        type="number"
        required
        placeholder="±"
        title="e.g. 10 to add, -3 to remove"
        className="h-9 w-16 rounded-md border border-line bg-ivory px-2 text-sm tabular-nums text-ink outline-none focus:border-gold-400"
      />
      <select
        name="reason"
        defaultValue="restock"
        className="h-9 rounded-md border border-line bg-ivory px-2 text-xs text-ink outline-none focus:border-gold-400"
      >
        {REASONS.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <Apply />
    </form>
  );
}
