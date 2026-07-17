import type { PaymentMethod } from "@/types";

export interface PaymentOption {
  id: PaymentMethod;
  label: string;
  description: string;
  /** enabled now, or reserved for a future phase */
  enabled: boolean;
  /** fraction of the order collected up front (1 = full, 0.3 = 30% deposit) */
  advanceFraction: number;
  badge?: string;
}

/**
 * Payment is intentionally data-driven so new methods drop in without touching
 * checkout logic. COD is live today; "Advance Payment" (a partial deposit) is
 * pre-wired and can be enabled once a payment gateway is connected.
 */
export const paymentOptions: PaymentOption[] = [
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay in cash when your order arrives at your doorstep.",
    enabled: true,
    advanceFraction: 1,
    badge: "Popular",
  },
  {
    id: "advance",
    label: "Advance Payment (Deposit)",
    description:
      "Reserve your order with a 30% bank-transfer deposit and pay the balance on delivery. We'll share transfer details right after checkout.",
    enabled: true,
    advanceFraction: 0.3,
  },
];
