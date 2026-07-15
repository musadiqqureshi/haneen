"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { mainNav, shopMenu } from "@/lib/nav";
import { useCart, cartCount } from "@/lib/store/cart";
import { useWishlist } from "@/lib/store/wishlist";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { MiniCart } from "@/components/cart/mini-cart";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const wishIds = useWishlist((s) => s.ids);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const count = hydrated ? cartCount(items) : 0;
  const wishCount = hydrated ? wishIds.length : 0;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          scrolled
            ? "bg-ivory/90 backdrop-blur-md shadow-[0_1px_20px_rgba(47,42,36,0.06)]"
            : "bg-ivory",
        )}
      >
        <div className="container-lux">
          <div className="flex h-18 items-center justify-between gap-4 py-3">
            {/* Left: mobile menu + desktop nav */}
            <div className="flex flex-1 items-center gap-6">
              <button
                aria-label="Open menu"
                className="lg:hidden text-ink hover:text-gold-600 transition-colors"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <nav className="hidden lg:flex items-center gap-7">
                {mainNav.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "link-underline text-[0.72rem] font-medium uppercase tracking-[0.16em] transition-colors",
                      link.label === "Sale"
                        ? "text-gold-600"
                        : "text-ink hover:text-gold-600",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Center: logo */}
            <Link
              href="/"
              aria-label="Haneen Grace home"
              className="shrink-0"
            >
              <Logo className="scale-90 sm:scale-100" />
            </Link>

            {/* Right: icons */}
            <div className="flex flex-1 items-center justify-end gap-4 sm:gap-5">
              <button
                aria-label="Search"
                className="hidden sm:inline-flex text-ink hover:text-gold-600 transition-colors"
              >
                <Search className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <Link
                href="/account"
                aria-label="Account"
                className="hidden sm:inline-flex text-ink hover:text-gold-600 transition-colors"
              >
                <User className="h-5 w-5" strokeWidth={1.5} />
              </Link>
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="relative text-ink hover:text-gold-600 transition-colors"
              >
                <Heart className="h-5 w-5" strokeWidth={1.5} />
                {wishCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[0.6rem] font-semibold text-white">
                    {wishCount}
                  </span>
                )}
              </Link>
              <button
                aria-label="Cart"
                onClick={openCart}
                className="relative text-ink hover:text-gold-600 transition-colors cursor-pointer"
              >
                <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                {count > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[0.6rem] font-semibold text-white">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[60] lg:hidden transition-opacity duration-300",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div
          className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-[82%] max-w-sm bg-ivory shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <Logo className="scale-90" />
            <button aria-label="Close menu" onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5 text-ink" strokeWidth={1.5} />
            </button>
          </div>
          <nav className="flex flex-col px-6 py-4">
            {shopMenu.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="border-b border-line/60 py-4 font-serif text-lg text-ink hover:text-gold-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/about"
              onClick={() => setMobileOpen(false)}
              className="border-b border-line/60 py-4 font-serif text-lg text-ink hover:text-gold-600"
            >
              Our Story
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="py-4 font-serif text-lg text-ink hover:text-gold-600"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>

      <MiniCart />
    </>
  );
}
