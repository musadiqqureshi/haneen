"use client";

import { useState } from "react";
import { Package, Truck, CheckCircle2, Clock } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const steps = [
  { icon: CheckCircle2, label: "Order Confirmed", done: true },
  { icon: Package, label: "Preparing", done: true },
  { icon: Truck, label: "Out for Delivery", done: false },
  { icon: CheckCircle2, label: "Delivered", done: false },
];

export default function TrackOrderPage() {
  const [tracked, setTracked] = useState(false);

  return (
    <>
      <PageHero
        eyebrow="Order Status"
        title="Track Your Order"
        description="Enter your order number to see where your grace is on its way."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Track Order" }]}
      />
      <div className="container-lux max-w-2xl py-14">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setTracked(true);
          }}
          className="flex flex-col gap-4 sm:flex-row"
        >
          <input
            required
            placeholder="Order number (e.g. HG-A1B2C3)"
            className="h-12 flex-1 border border-line bg-ivory px-4 text-sm text-ink outline-none focus:border-gold-400"
          />
          <Button type="submit" variant="dark" size="md">
            Track
          </Button>
        </form>

        {tracked && (
          <div className="mt-12 rounded-[2px] border border-line bg-beige p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.7rem] uppercase tracking-[0.16em] text-ink-muted">
                  Estimated Delivery
                </p>
                <p className="mt-1 font-display text-2xl text-ink">3–5 business days</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-300 px-3 py-1 text-xs font-medium text-white">
                <Clock className="h-3.5 w-3.5" /> In Transit
              </span>
            </div>

            <div className="mt-10 flex justify-between">
              {steps.map((s, i) => (
                <div key={s.label} className="flex flex-1 flex-col items-center text-center">
                  <div className="relative flex w-full items-center justify-center">
                    {i > 0 && (
                      <span
                        className={cn(
                          "absolute right-1/2 top-1/2 h-0.5 w-full -translate-y-1/2",
                          s.done ? "bg-gold-400" : "bg-taupe/50",
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        "relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-2",
                        s.done
                          ? "border-gold-400 bg-gold-300 text-white"
                          : "border-taupe bg-ivory text-ink-muted",
                      )}
                    >
                      <s.icon className="h-5 w-5" strokeWidth={1.5} />
                    </span>
                  </div>
                  <span className="mt-2 text-[0.65rem] uppercase tracking-[0.08em] text-ink-soft">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-ink-muted">
          Need help? <a href="/contact" className="text-gold-600 underline">Contact us</a> and
          we&apos;ll track it for you.
        </p>
      </div>
    </>
  );
}
