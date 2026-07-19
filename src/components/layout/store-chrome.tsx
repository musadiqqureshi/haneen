"use client";

import { usePathname } from "next/navigation";

/**
 * Renders storefront chrome (announcement bar, header, footer, particles)
 * everywhere except the admin dashboard, which has its own shell.
 */
export function StoreChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/invoice"))
    return null;
  return <>{children}</>;
}
