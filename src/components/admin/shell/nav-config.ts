import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Star,
  Ticket,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavChild {
  label: string;
  href: string;
}
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  children?: NavChild[];
}

/** Only routes that actually exist are linked. */
export const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
    children: [
      { label: "All Orders", href: "/admin/orders" },
      { label: "Pending", href: "/admin/orders?status=pending" },
      { label: "Processing", href: "/admin/orders?status=processing" },
      { label: "Shipped", href: "/admin/orders?status=shipped" },
      { label: "Delivered", href: "/admin/orders?status=delivered" },
    ],
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
    children: [
      { label: "All Products", href: "/admin/products" },
      { label: "Add Product", href: "/admin/products/new" },
    ],
  },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

/** Human labels for breadcrumb segments. */
export const CRUMB_LABEL: Record<string, string> = {
  admin: "Admin",
  orders: "Orders",
  products: "Products",
  customers: "Customers",
  coupons: "Coupons",
  reviews: "Reviews",
  settings: "Settings",
  new: "Add Product",
};
