export type CategorySlug =
  | "new-arrivals"
  | "luxury-pret"
  | "casual-wear"
  | "formal-wear"
  | "festive-collection"
  | "sale";

export interface Category {
  slug: CategorySlug;
  name: string;
  tagline: string;
  description: string;
  /** Accent color used on category cards / gradients. */
  accent: string;
}

export interface ProductColor {
  name: string;
  /** hex used for the swatch */
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  price: number;
  salePrice?: number | null;
  sku: string;
  category: CategorySlug;
  /** additional collections this item appears in */
  collections: CategorySlug[];
  sizes: string[];
  colors: ProductColor[];
  /** stock count; 0 => out of stock */
  stock: number;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  rating: number;
  reviewCount: number;
  /** image placeholder color pairs used as a fallback before/without photos */
  swatch: [string, string];
  /** real product photos (Supabase Storage); first is primary */
  images?: ProductImage[];
  tags: string[];
}

export interface ProductImage {
  url: string;
  alt?: string;
  is_primary?: boolean;
}

export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  price: number;
  size: string;
  color: string;
  swatch: [string, string];
  quantity: number;
}

export type PaymentMethod = "cod" | "advance";
