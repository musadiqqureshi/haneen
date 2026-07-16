"use client";

import { useRef } from "react";
import {
  updateOrderStatusAction,
  updatePaymentStatusAction,
} from "@/lib/admin/actions";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
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
