export interface NavLink {
  label: string;
  href: string;
}

export const mainNav: NavLink[] = [
  { label: "New Arrivals", href: "/shop/new-arrivals" },
  { label: "Luxury Pret", href: "/shop/luxury-pret" },
  { label: "Casual", href: "/shop/casual-wear" },
  { label: "Formal", href: "/shop/formal-wear" },
  { label: "Festive", href: "/shop/festive-collection" },
  { label: "Sale", href: "/shop/sale" },
];

export const shopMenu: NavLink[] = [
  { label: "All Products", href: "/shop" },
  { label: "New Arrivals", href: "/shop/new-arrivals" },
  { label: "Luxury Pret", href: "/shop/luxury-pret" },
  { label: "Casual Wear", href: "/shop/casual-wear" },
  { label: "Formal Wear", href: "/shop/formal-wear" },
  { label: "Festive Collection", href: "/shop/festive-collection" },
  { label: "Season End Sale", href: "/shop/sale" },
];

export const footerNav = {
  shop: shopMenu,
  help: [
    { label: "Track Order", href: "/track-order" },
    { label: "Shipping Policy", href: "/shipping-policy" },
    { label: "Return Policy", href: "/return-policy" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact Us", href: "/contact" },
  ],
  about: [
    { label: "Our Story", href: "/about" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Wishlist", href: "/wishlist" },
  ],
};
