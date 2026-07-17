"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus, X } from "lucide-react";
import { saveCouponAction, type AdminFormState } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";

const input =
  "h-11 w-full rounded-md border border-line bg-ivory px-3.5 text-sm text-ink outline-none focus:border-gold-400";
const label =
  "mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink";

function Save() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center rounded-md bg-ink px-7 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-gold-700 disabled:opacity-60"
    >
      {pending ? "Saving…" : "Create Coupon"}
    </button>
  );
}

export function CouponForm() {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(saveCouponAction, {} as AdminFormState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state.success]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-5 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-gold-700"
      >
        <Plus className="h-4 w-4" /> New Coupon
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={action}
      className="w-full rounded-lg border border-line bg-ivory p-6"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-lg text-ink">New Coupon</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-ink-muted hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {state.error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={label}>Code</label>
          <input
            name="code"
            placeholder="GRACE10"
            className={cn(input, "uppercase", state.fieldErrors?.code && "border-red-400")}
          />
          {state.fieldErrors?.code && (
            <p className="mt-1 text-xs text-red-500">{state.fieldErrors.code}</p>
          )}
        </div>
        <div>
          <label className={label}>Type</label>
          <select name="discount_type" defaultValue="percent" className={input}>
            <option value="percent">Percent (%)</option>
            <option value="fixed">Fixed (PKR)</option>
          </select>
        </div>
        <div>
          <label className={label}>Amount</label>
          <input name="amount" type="number" min={0} defaultValue={10} className={input} />
        </div>
        <div>
          <label className={label}>Min Order (PKR)</label>
          <input name="min_order" type="number" min={0} defaultValue={0} className={input} />
        </div>
        <div>
          <label className={label}>Max Uses (blank = ∞)</label>
          <input name="max_uses" type="number" min={1} className={input} />
        </div>
        <div>
          <label className={label}>Expires</label>
          <input name="expires_at" type="date" className={input} />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Description</label>
          <input
            name="description"
            placeholder="Welcome offer — 10% off your first order"
            className={input}
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked
              className="h-4 w-4 accent-gold-500"
            />
            Active
          </label>
        </div>
      </div>

      <div className="mt-6 border-t border-line pt-5">
        <Save />
      </div>
    </form>
  );
}
