"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "./guard";
import { slugify } from "@/lib/utils";

export interface AdminFormState {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string>;
  savedSlug?: string;
}

function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const k = String(issue.path[0] ?? "form");
    if (!out[k]) out[k] = issue.message;
  }
  return out;
}

// ---------- Orders ----------------------------------------------------------
const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;
const PAYMENT_STATUSES = ["unpaid", "partial", "paid", "refunded", "failed"] as const;

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("orderId"));
  const status = String(formData.get("status"));
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) return;
  const admin = createAdminClient();
  await admin.from("orders").update({ status: status as never }).eq("id", id);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export async function updatePaymentStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("orderId"));
  const status = String(formData.get("paymentStatus"));
  if (!PAYMENT_STATUSES.includes(status as (typeof PAYMENT_STATUSES)[number])) return;
  const admin = createAdminClient();
  await admin.from("orders").update({ payment_status: status as never }).eq("id", id);
  revalidatePath(`/admin/orders/${id}`);
}

// ---------- Reviews ---------------------------------------------------------
export async function moderateReviewAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("reviewId"));
  const action = String(formData.get("action")); // publish | reject | delete
  const admin = createAdminClient();
  if (action === "delete") {
    await admin.from("reviews").delete().eq("id", id);
  } else {
    const status = action === "publish" ? "published" : "rejected";
    await admin.from("reviews").update({ status: status as never }).eq("id", id);
  }
  revalidatePath("/admin/reviews");
}

// ---------- Products --------------------------------------------------------
export async function toggleProductActiveAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("productId"));
  const active = formData.get("active") === "true";
  const admin = createAdminClient();
  await admin.from("products").update({ is_active: active }).eq("id", id);
  revalidatePath("/admin/products");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("productId"));
  const admin = createAdminClient();
  await admin.from("products").delete().eq("id", id);
  revalidatePath("/admin/products");
}

const productSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2, "Title is required"),
  category_slug: z.enum([
    "luxury-pret",
    "casual-wear",
    "formal-wear",
    "festive-collection",
    "new-arrivals",
    "sale",
  ]),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  sale_price: z.union([z.coerce.number().min(0), z.literal("")]).optional(),
  stock: z.coerce.number().int().min(0),
  short_description: z.string().trim().max(300).optional(),
  description: z.string().trim().max(4000).optional(),
  color_name: z.string().trim().optional(),
  color_hex: z.string().trim().optional(),
  tags: z.string().trim().optional(),
  images: z.string().trim().optional(), // one URL per line
  featured: z.boolean().optional(),
  best_seller: z.boolean().optional(),
  new_arrival: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export async function saveProductAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const raw = {
    id: (formData.get("id") as string) || undefined,
    title: formData.get("title"),
    category_slug: formData.get("category_slug"),
    price: formData.get("price"),
    sale_price: formData.get("sale_price") ?? "",
    stock: formData.get("stock") ?? 0,
    short_description: formData.get("short_description") ?? "",
    description: formData.get("description") ?? "",
    color_name: formData.get("color_name") ?? "",
    color_hex: formData.get("color_hex") ?? "",
    tags: formData.get("tags") ?? "",
    images: formData.get("images") ?? "",
    featured: formData.get("featured") === "on",
    best_seller: formData.get("best_seller") === "on",
    new_arrival: formData.get("new_arrival") === "on",
    is_active: formData.get("is_active") === "on",
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  const d = parsed.data;

  const images = (d.images ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((url, i) => ({ url, is_primary: i === 0 }));

  const tags = (d.tags ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const colors = d.color_name
    ? [{ name: d.color_name, hex: d.color_hex || "#c3a04f" }]
    : [];

  const row = {
    title: d.title,
    slug: slugify(d.title),
    category_slug: d.category_slug,
    price: d.price,
    sale_price: d.sale_price === "" || d.sale_price == null ? null : Number(d.sale_price),
    stock: d.stock,
    short_description: d.short_description || null,
    description: d.description || null,
    colors,
    swatch: [d.color_hex || "#e7d4b4", "#c3a04f"],
    images,
    tags,
    collections: ["new-arrivals", ...(d.sale_price ? ["sale"] : [])],
    sizes: [] as string[],
    featured: !!d.featured,
    best_seller: !!d.best_seller,
    new_arrival: !!d.new_arrival,
    is_active: d.is_active ?? true,
  };

  const admin = createAdminClient();
  let error;
  if (d.id) {
    ({ error } = await admin.from("products").update(row).eq("id", d.id));
  } else {
    ({ error } = await admin.from("products").insert(row));
  }
  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true, savedSlug: row.slug };
}

// ---------- Settings --------------------------------------------------------
const settingsSchema = z.object({
  free_shipping_threshold: z.coerce.number().min(0),
  shipping_fee: z.coerce.number().min(0),
  advance_percent: z.coerce.number().min(1).max(100),
  phone: z.string().trim().max(40).optional(),
  email: z.string().trim().max(120).optional(),
  whatsapp: z.string().trim().max(40).optional(),
  instagram: z.string().trim().max(200).optional(),
  bank_name: z.string().trim().max(120).optional(),
  account_title: z.string().trim().max(120).optional(),
  account_number: z.string().trim().max(60).optional(),
  iban: z.string().trim().max(60).optional(),
  instructions: z.string().trim().max(400).optional(),
});

export async function saveSettingsAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const parsed = settingsSchema.safeParse({
    free_shipping_threshold: formData.get("free_shipping_threshold"),
    shipping_fee: formData.get("shipping_fee"),
    advance_percent: formData.get("advance_percent"),
    phone: formData.get("phone") ?? "",
    email: formData.get("email") ?? "",
    whatsapp: formData.get("whatsapp") ?? "",
    instagram: formData.get("instagram") ?? "",
    bank_name: formData.get("bank_name") ?? "",
    account_title: formData.get("account_title") ?? "",
    account_number: formData.get("account_number") ?? "",
    iban: formData.get("iban") ?? "",
    instructions: formData.get("instructions") ?? "",
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  const d = parsed.data;

  const admin = createAdminClient();

  // Merge into the existing jsonb so unrelated keys survive.
  const { data: existing } = await admin
    .from("settings")
    .select("key, value")
    .in("key", ["store", "payment"]);
  const prevOf = (k: string) =>
    (existing?.find((r) => r.key === k)?.value ?? {}) as Record<string, unknown>;

  const store = {
    ...prevOf("store"),
    free_shipping_threshold: d.free_shipping_threshold,
    shipping_fee: d.shipping_fee,
    advance_percent: d.advance_percent,
    cod_enabled: formData.get("cod_enabled") === "on",
    advance_payment_enabled: formData.get("advance_payment_enabled") === "on",
    phone: d.phone ?? "",
    email: d.email ?? "",
    whatsapp: d.whatsapp ?? "",
    instagram: d.instagram ?? "",
  };
  const payment = {
    ...prevOf("payment"),
    bank_name: d.bank_name ?? "",
    account_title: d.account_title ?? "",
    account_number: d.account_number ?? "",
    iban: d.iban ?? "",
    instructions: d.instructions ?? "",
  };

  const { error } = await admin
    .from("settings")
    .upsert([
      { key: "store", value: store },
      { key: "payment", value: payment },
    ]);
  if (error) return { error: error.message };

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  return { success: true };
}

// ---------- Coupons ---------------------------------------------------------
const couponSchema = z.object({
  id: z.string().optional(),
  code: z.string().trim().min(2, "Code is required").max(40),
  description: z.string().trim().max(200).optional(),
  discount_type: z.enum(["percent", "fixed"]),
  amount: z.coerce.number().min(0, "Amount must be 0 or more"),
  min_order: z.coerce.number().min(0),
  max_uses: z.union([z.coerce.number().int().min(1), z.literal("")]).optional(),
  expires_at: z.string().trim().optional(),
});

export async function saveCouponAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = couponSchema.safeParse({
    id: (formData.get("id") as string) || undefined,
    code: formData.get("code"),
    description: formData.get("description") ?? "",
    discount_type: formData.get("discount_type"),
    amount: formData.get("amount"),
    min_order: formData.get("min_order") ?? 0,
    max_uses: formData.get("max_uses") ?? "",
    expires_at: formData.get("expires_at") ?? "",
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  const d = parsed.data;

  const row = {
    code: d.code.toUpperCase(),
    description: d.description || null,
    discount_type: d.discount_type,
    amount: d.amount,
    min_order: d.min_order,
    max_uses: d.max_uses === "" || d.max_uses == null ? null : Number(d.max_uses),
    expires_at: d.expires_at ? new Date(d.expires_at).toISOString() : null,
    is_active: formData.get("is_active") === "on",
  };

  const admin = createAdminClient();
  const { error } = d.id
    ? await admin.from("coupons").update(row).eq("id", d.id)
    : await admin.from("coupons").insert(row);
  if (error) {
    return {
      error: error.message.includes("duplicate")
        ? "A coupon with that code already exists."
        : error.message,
    };
  }

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function deleteCouponAction(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("coupons").delete().eq("id", String(formData.get("couponId")));
  revalidatePath("/admin/coupons");
}

export async function toggleCouponAction(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin
    .from("coupons")
    .update({ is_active: formData.get("active") === "true" })
    .eq("id", String(formData.get("couponId")));
  revalidatePath("/admin/coupons");
}
