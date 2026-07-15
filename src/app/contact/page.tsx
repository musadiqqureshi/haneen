import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Haneen Grace — we'd love to help with orders, styling advice and anything in between.",
};

const details = [
  { icon: Phone, label: "Call & WhatsApp", value: "+92 300 0000000" },
  { icon: Mail, label: "Email", value: "hello@haneengrace.com" },
  { icon: MapPin, label: "Studio", value: "Lahore, Pakistan" },
  { icon: Clock, label: "Hours", value: "Mon–Sat, 10am–7pm" },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="We're Here for You"
        title="Get in Touch"
        description="Questions about an order, sizing or styling? Our team would love to help."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />
      <section className="container-lux grid gap-12 py-16 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="font-display text-2xl text-ink">Reach Us</h2>
          <div className="mt-6 space-y-5">
            {details.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold-200 text-gold-500">
                  <Icon className="h-5 w-5" strokeWidth={1.4} />
                </span>
                <div>
                  <p className="text-[0.7rem] uppercase tracking-[0.16em] text-ink-muted">
                    {label}
                  </p>
                  <p className="mt-0.5 text-ink">{value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-[2px] border border-line bg-beige p-6">
            <p className="font-serif text-lg italic text-ink-soft">
              “We treat every customer as a guest in our home — with warmth,
              care and a little grace.”
            </p>
          </div>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
