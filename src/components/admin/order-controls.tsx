"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  updateOrderStatusAction,
  updatePaymentStatusAction,
  updateOrderLogisticsAction,
  saveInternalNoteAction,
} from "@/lib/admin/actions";
import { cn } from "@/lib/utils";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "delivered",
  "returned",
  "cancelled",
  "refunded",
];
const PAYMENT_STATUSES = ["unpaid", "partial", "paid", "refunded", "failed"];

const selectCls =
  "h-10 w-full rounded-md border border-line bg-ivory px-3 text-sm text-ink outline-none focus:border-gold-400";

export function OrderStatusControl({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={updateOrderStatusAction}>
      <input type="hidden" name="orderId" value={orderId} />
      <label className="mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
        Order Status
      </label>
      <select
        name="status"
        defaultValue={status}
        onChange={() => formRef.current?.requestSubmit()}
        className={selectCls}
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s[0].toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>
    </form>
  );
}

export function PaymentStatusControl({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={updatePaymentStatusAction}>
      <input type="hidden" name="orderId" value={orderId} />
      <label className="mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
        Payment Status
      </label>
      <select
        name="paymentStatus"
        defaultValue={status}
        onChange={() => formRef.current?.requestSubmit()}
        className={selectCls}
      >
        {PAYMENT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s[0].toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>
    </form>
  );
}

const inputCls =
  "h-10 w-full rounded-md border border-line bg-ivory px-3 text-sm text-ink outline-none focus:border-gold-400";

export function LogisticsForm({
  orderId,
  courier,
  tracking,
}: {
  orderId: string;
  courier: string | null;
  tracking: string | null;
}) {
  return (
    <form action={updateOrderLogisticsAction} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      <div>
        <label className="mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Courier
        </label>
        <input
          name="courier"
          defaultValue={courier ?? ""}
          placeholder="TCS, Leopards, M&P…"
          className={inputCls}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Tracking Number
        </label>
        <input
          name="tracking_number"
          defaultValue={tracking ?? ""}
          placeholder="e.g. 784512396"
          className={inputCls}
        />
      </div>
      <SaveButton>Save Tracking</SaveButton>
    </form>
  );
}

export function InternalNotesForm({
  orderId,
  notes,
}: {
  orderId: string;
  notes: string | null;
}) {
  return (
    <form action={saveInternalNoteAction} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      <textarea
        name="internal_notes"
        defaultValue={notes ?? ""}
        rows={3}
        placeholder="Notes only your team can see…"
        className={cn(inputCls, "h-auto py-2.5")}
      />
      <SaveButton>Save Note</SaveButton>
    </form>
  );
}

function SaveButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-9 rounded-md bg-ink px-4 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-gold-700 disabled:opacity-60"
    >
      {pending ? "Saving…" : children}
    </button>
  );
}
