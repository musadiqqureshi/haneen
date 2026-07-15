import { Truck, ShieldCheck, RefreshCw, HandCoins } from "lucide-react";

const promises = [
  { icon: Truck, title: "Nationwide Delivery", text: "Free over PKR 15,000" },
  { icon: HandCoins, title: "Cash on Delivery", text: "Pay when it arrives" },
  { icon: ShieldCheck, title: "Assured Quality", text: "Atelier-finished" },
  { icon: RefreshCw, title: "Easy Exchanges", text: "7-day hassle-free" },
];

export function PromiseStrip() {
  return (
    <section className="border-y border-line bg-ivory">
      <div className="container-lux grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
        {promises.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold-200 text-gold-500">
              <Icon className="h-5 w-5" strokeWidth={1.4} />
            </span>
            <div>
              <p className="text-sm font-medium text-ink">{title}</p>
              <p className="text-xs text-ink-muted">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
