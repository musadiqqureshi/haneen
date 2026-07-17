"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Star,
  Store,
  Ticket,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {links.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-gold-300/15 font-medium text-gold-700"
                : "text-ink-soft hover:bg-beige hover:text-ink",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.6} />
            {label}
          </Link>
        );
      })}
      <div className="my-2 h-px bg-line" />
      <Link
        href="/"
        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-ink-soft transition-colors hover:bg-beige hover:text-ink"
      >
        <Store className="h-4 w-4" strokeWidth={1.6} /> View Store
      </Link>
    </nav>
  );
}
