import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { Monogram } from "@/components/brand/logo";
import { InstagramIcon, WhatsappIcon } from "@/components/brand/social-icons";
import { footerNav } from "@/lib/nav";
import { NewsletterForm } from "@/components/home/newsletter-form";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-beige">
      {/* Newsletter strip */}
      <div className="border-b border-line/70">
        <div className="container-lux grid gap-8 py-14 md:grid-cols-2 md:items-center">
          <div>
            <p className="eyebrow">Join the Grace List</p>
            <h3 className="mt-3 font-display text-3xl text-ink">
              Be the first to know
            </h3>
            <p className="mt-2 max-w-md text-sm text-ink-soft">
              Subscribe for early access to new collections, private sales and
              styling notes — a little luxury in your inbox.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Link columns */}
      <div className="container-lux grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Monogram className="h-10 w-10" />
            <span className="font-display text-lg tracking-[0.14em] text-gold-600">
              HANEEN GRACE
            </span>
          </div>
          <p className="mt-4 max-w-xs font-serif text-[0.95rem] italic leading-relaxed text-ink-soft">
            Luxury Pret • Modest Wear. Timeless elegance crafted for the modern
            woman.
          </p>
          <div className="mt-5 flex gap-3">
            {[
              { icon: InstagramIcon, label: "Instagram", href: "#" },
              { icon: WhatsappIcon, label: "WhatsApp", href: "#" },
              { icon: Mail, label: "Email", href: "mailto:hello@haneengrace.com" },
            ].map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-taupe text-ink-soft transition-colors hover:border-gold-400 hover:text-gold-600"
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        <FooterCol title="Shop" links={footerNav.shop} />
        <FooterCol title="Help" links={footerNav.help} />
        <FooterCol title="Company" links={footerNav.about} />
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line/70">
        <div className="container-lux flex flex-col items-center justify-between gap-3 py-6 text-center text-xs text-ink-muted sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} Haneen Grace. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> +92 300 0000000
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> hello@haneengrace.com
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-ink">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-ink-soft transition-colors hover:text-gold-600"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
