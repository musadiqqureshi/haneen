"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Do you offer Cash on Delivery?",
    a: "Yes — Cash on Delivery is available nationwide across Pakistan. Simply keep the exact amount ready when your order arrives.",
  },
  {
    q: "How long does delivery take?",
    a: "Orders are dispatched within 1–2 business days and typically arrive within 3–5 business days depending on your city.",
  },
  {
    q: "Can I exchange an item?",
    a: "Absolutely. We offer a 7-day exchange on unworn items with original tags. Just email or WhatsApp us with your order number.",
  },
  {
    q: "How do I choose the right size?",
    a: "Each product page includes a size guide. If you're between sizes or unsure, message us and we'll happily advise.",
  },
  {
    q: "Are the colours accurate to the photos?",
    a: "We photograph our pieces in natural light for accuracy, though slight variation may occur due to screens and the handcrafted nature of our work.",
  },
  {
    q: "Will you offer advance/online payment?",
    a: "We're currently Cash on Delivery only. An advance payment (deposit) option is coming soon — stay tuned.",
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <PageHero
        eyebrow="Helpful Answers"
        title="Frequently Asked Questions"
        description="Everything you need to know about shopping with Haneen Grace."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "FAQ" }]}
      />
      <div className="container-lux max-w-3xl py-16">
        <div className="divide-y divide-line border-y border-line">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-6 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-lg text-ink">{item.q}</span>
                  <span className="text-gold-500">
                    {isOpen ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  </span>
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    isOpen ? "grid-rows-[1fr] pb-6 opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <p className="overflow-hidden leading-relaxed text-ink-soft">{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
