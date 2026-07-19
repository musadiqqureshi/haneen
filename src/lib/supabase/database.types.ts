/**
 * Hand-written Supabase schema types.
 * Mirrors supabase/migrations/0001_initial_schema.sql.
 *
 * NOTE: Row shapes are `type` aliases (not `interface`) on purpose — supabase-js
 * requires each table's Row to satisfy `Record<string, unknown>`, which
 * interfaces do not, so using interfaces makes query results infer as `never`.
 *
 * Once the project is live you can regenerate the authoritative version with:
 *   npx supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts
 */

export type UserRole = "customer" | "admin";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "delivered"
  | "returned"
  | "cancelled"
  | "refunded";
export type PaymentMethod = "cod" | "advance";
export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded" | "failed";
export type ReviewStatus = "published" | "pending" | "rejected";

export type ProductColor = {
  name: string;
  hex: string;
};
export type ProductImage = {
  url: string;
  alt?: string;
  is_primary?: boolean;
};

type Timestamps = {
  created_at: string;
  updated_at: string;
};

export type ProfileRow = Timestamps & {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  marketing_opt_in: boolean;
};

export type AddressRow = Timestamps & {
  id: string;
  user_id: string;
  label: string | null;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  province: string | null;
  postal_code: string | null;
  country: string;
  is_default: boolean;
};

export type CategoryRow = Timestamps & {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  accent: string | null;
  parent_id: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type ProductRow = Timestamps & {
  id: string;
  slug: string;
  sku: string | null;
  barcode: string | null;
  title: string;
  short_description: string | null;
  description: string | null;
  price: number;
  sale_price: number | null;
  category_slug: string;
  collections: string[];
  sizes: string[];
  colors: ProductColor[];
  swatch: string[];
  images: ProductImage[];
  video_url: string | null;
  stock: number;
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
  rating: number;
  review_count: number;
  tags: string[];
  seo: Record<string, unknown>;
  is_active: boolean;
};

export type ReviewRow = Timestamps & {
  id: string;
  product_id: string;
  user_id: string | null;
  author_name: string;
  location: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  size: string | null;
  verified: boolean;
  status: ReviewStatus;
};

export type WishlistRow = {
  user_id: string;
  product_id: string;
  created_at: string;
};

export type CouponRow = Timestamps & {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  amount: number;
  min_order: number;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
};

export type OrderShipping = {
  line1: string;
  line2?: string | null;
  city: string;
  province?: string | null;
  postal_code?: string | null;
  country: string;
};

export type OrderRow = Timestamps & {
  id: string;
  order_number: string;
  user_id: string | null;
  status: OrderStatus;
  email: string;
  phone: string;
  customer_name: string;
  shipping: OrderShipping;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total: number;
  coupon_code: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  advance_amount: number;
  notes: string | null;
  courier: string | null;
  tracking_number: string | null;
  internal_notes: string | null;
};

export type OrderEventRow = {
  id: string;
  order_id: string;
  status: OrderStatus | null;
  note: string | null;
  created_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  title: string;
  slug: string | null;
  sku: string | null;
  price: number;
  size: string | null;
  color: string | null;
  quantity: number;
  line_total: number;
  created_at: string;
};

export type PaymentRow = Timestamps & {
  id: string;
  order_id: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  reference: string | null;
  proof_url: string | null;
  paid_at: string | null;
};

export type BannerRow = Timestamps & {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  placement: string;
  sort_order: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
};

export type NewsletterRow = {
  id: string;
  email: string;
  is_subscribed: boolean;
  source: string | null;
  created_at: string;
};

export type SettingRow = {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
};

export type ActivityLogRow = {
  id: string;
  actor_id: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  meta: Record<string, unknown>;
  created_at: string;
};

/** Generic table helper. `Relationships: []` and `type`-alias Rows are both
 * required for supabase-js to accept this as a valid schema. */
type TableCfg<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableCfg<ProfileRow>;
      addresses: TableCfg<AddressRow>;
      categories: TableCfg<CategoryRow>;
      products: TableCfg<ProductRow>;
      reviews: TableCfg<ReviewRow>;
      wishlists: TableCfg<WishlistRow>;
      coupons: TableCfg<CouponRow>;
      orders: TableCfg<OrderRow>;
      order_items: TableCfg<OrderItemRow>;
      order_events: TableCfg<OrderEventRow>;
      payments: TableCfg<PaymentRow>;
      banners: TableCfg<BannerRow>;
      newsletter_subscribers: TableCfg<NewsletterRow>;
      settings: TableCfg<SettingRow>;
      activity_logs: TableCfg<ActivityLogRow>;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      user_role: UserRole;
      order_status: OrderStatus;
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
      review_status: ReviewStatus;
    };
  };
};
