import type { Metadata } from "next";
import Link from "next/link";
import { User, Sparkles } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "My Account" };

export default function AccountPage() {
  return (
    <>
      <PageHero
        eyebrow="Your Space"
        title="My Account"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Account" }]}
      />
      <div className="container-lux flex min-h-[40vh] max-w-md flex-col items-center justify-center gap-5 py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold-200 text-gold-500">
          <User className="h-7 w-7" strokeWidth={1.3} />
        </span>
        <h2 className="font-display text-2xl text-ink">Accounts are on the way</h2>
        <p className="text-ink-soft">
          Sign in, order history, saved addresses and more arrive with our next
          update. For now, checkout is quick and guest-friendly.
        </p>
        <div className="flex items-center gap-2 rounded-full bg-beige px-4 py-2 text-xs text-gold-600">
          <Sparkles className="h-4 w-4" /> Coming in the next release
        </div>
        <Button asChild variant="dark" className="mt-2">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    </>
  );
}
