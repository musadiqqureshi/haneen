"use server";

import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  getStoreSettings,
  getPaymentSettings,
  hasBankDetails,
  type PaymentSettings,
} from "@/lib/settings";
import type { Database } from "@/lib/supabase/database.types";

type Admin = SupabaseClient<Database>;

/** Shipping + deposit config for the checkout UI (server is authoritative). */
export async function getCheckoutConfigAction(): Promise<{
  shipping_fee: number;
  free_shipping_threshold: number;
  advance_percent: number;
  cod_enabled: boolean;
  advance_payment_enabled: boolean;
}> {
  const s = await getStoreSettings();
  return {
    shipping_fee: s.shipping_fee,
    free_shipping_threshold: s.free_shipping_threshold,
    advance_percent: s.advance_percent,
    cod_enabled: s.cod_enabled,
    advance_payment_enabled: s.advance_payment_enabled,
  };
}

interface CouponResult {
  id?: string;
  code?: string;
  usedCount?: number;
  discount: number;
  error?: string;
}

/**
 * Server-side coupon validation. Never trust a client-supplied discount —
 * this recomputes it from the DB every time.
 */
async function resolveCoupon(
  admin: Admin,
  rawCode: string | undefined,
  subtotal: number,
): Promise<CouponResult> {
  const code = rawCode?.trim();
  if (!code) return { discount: 0 };

  const { data: c } = await admin
    .from("coupons")
    .select("*")
    .ilike("code", code)
    .maybeSingle();

  if (!c || !c.is_active) return { discount: 0, error: "That code isn't valid." };

  const now = Date.now();
  if (c.starts_at && new Date(c.starts_at).getTime() > now)
    return { discount: 0, error: "That code isn't active yet." };
  if (c.expires_at && new Date(c.expires_at).getTime() < now)
    return { discount: 0, error: "That code has expired." };
  if (c.max_uses != null && c.used_count >= c.max_uses)
    return { discount: 0, error: "That code has reached its limit." };
  if (subtotal < Number(c.min_order))
    return {
      discount: 0,
      error: `Spend ${new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        maximumFractionDigits: 0,
      }).format(Number(c.min_order))} to use this code.`,
    };

  const raw =
    c.discount_type === "percent"
      ? (subtotal * Number(c.amount)) / 100
      : Number(c.amount);
  const discount = Math.min(Math.round(raw), subtotal);
  return { id: c.id, code: c.code, usedCount: c.used_count, discount };
}

/**
 * Bank-transfer details shown after an advance-payment order.
 * Returns null until the store owner fills them in under Admin → Settings,
 * so we never show placeholder account numbers.
 */
export async function getPaymentInstructionsAction(): Promise<PaymentSettings | null> {
  const p = await getPaymentSettings();
  return hasBankDetails(p) ? p : null;
}

/** Live coupon check for the checkout UI. */
export async function validateCouponAction(
  code: string,
  subtotal: number,
): Promise<{ discount: number; code?: string; error?: string }> {
  if (!code?.trim()) return { discount: 0 };
  const admin = createAdminClient();
  return resolveCoupon(admin, code, subtotal);
}

const itemSchema = z.object({
  productId: z.string().min(1),
  size: z.string().default("Unstitched"),
  color: z.string().default("Default"),
  quantity: z.coerce.number().int().min(1).max(20),
});

const orderSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  email: z.email("Enter a valid email"),
  phone: z.string().trim().min(7, "Enter a valid phone number"),
  address: z.string().trim().min(5, "Enter your address"),
  city: z.string().trim().min(2, "Enter your city"),
  postal: z.string().trim().optional(),
  notes: z.string().trim().max(500).optional(),
  payment: z.enum(["cod", "advance"]).default("cod"),
  couponCode: z.string().trim().max(40).optional(),
  items: z.array(itemSchema).min(1, "Your bag is empty"),
});

export type PlaceOrderInput = z.input<typeof orderSchema>;

export interface PlaceOrderResult {
  orderId?: string;
  orderNumber?: string;
  total?: number;
  discount?: number;
  advanceAmount?: number;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function placeOrderAction(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "form");
      if (!fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { fieldErrors, error: "Please check the highlighted fields." };
  }
  const data = parsed.data;

  const admin = createAdminClient();

  // Fetch authoritative product data (never trust client prices).
  const ids = [...new Set(data.items.map((i) => i.productId))];
  const { data: products, error: pErr } = await admin
    .from("products")
    .select("id, slug, sku, title, price, sale_price, stock")
    .in("id", ids);
  if (pErr || !products?.length) {
    return { error: "We couldn't verify these items. Please try again." };
  }
  const byId = new Map(products.map((p) => [p.id, p]));

  // Build order items + subtotal from server-side prices.
  const orderItems = [];
  let subtotal = 0;
  for (const item of data.items) {
    const p = byId.get(item.productId);
    if (!p) return { error: "One of the items is no longer available." };
    const price = Number(p.sale_price ?? p.price);
    const lineTotal = price * item.quantity;
    subtotal += lineTotal;
    orderItems.push({
      product: p,
      title: p.title,
      slug: p.slug,
      sku: p.sku,
      price,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      line_total: lineTotal,
    });
  }

  // Coupon (re-validated server side) and totals — shipping comes from the
  // store settings so Admin → Settings is authoritative.
  const settings = await getStoreSettings();
  const coupon = await resolveCoupon(admin, data.couponCode, subtotal);
  const discount = coupon.discount;
  const shippingFee =
    subtotal >= settings.free_shipping_threshold ? 0 : settings.shipping_fee;
  const total = Math.max(0, subtotal - discount + shippingFee);

  // Advance deposit (percentage of total) when paying in advance.
  const advanceAmount =
    data.payment === "advance"
      ? Math.round((total * settings.advance_percent) / 100)
      : 0;

  // Link the order to a signed-in customer if there is one.
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    userId = null;
  }

  // Create the order (order_number auto-generated by trigger).
  const { data: order, error: oErr } = await admin
    .from("orders")
    .insert({
      user_id: userId,
      status: "pending",
      email: data.email,
      phone: data.phone,
      customer_name: data.name,
      shipping: {
        line1: data.address,
        city: data.city,
        postal_code: data.postal ?? null,
        country: "Pakistan",
      },
      subtotal,
      discount,
      shipping_fee: shippingFee,
      total,
      coupon_code: coupon.code ?? null,
      payment_method: data.payment,
      payment_status: "unpaid",
      advance_amount: advanceAmount,
      notes: data.notes ?? null,
    })
    .select("id, order_number")
    .single();

  if (oErr || !order) {
    return { error: "Something went wrong placing your order. Please try again." };
  }

  // Insert order items.
  const { error: iErr } = await admin.from("order_items").insert(
    orderItems.map((it) => ({
      order_id: order.id,
      product_id: it.product.id,
      title: it.title,
      slug: it.slug,
      sku: it.sku,
      price: it.price,
      size: it.size,
      color: it.color,
      quantity: it.quantity,
      line_total: it.line_total,
    })),
  );
  if (iErr) {
    // Roll back the order so we don't leave an empty one behind.
    await admin.from("orders").delete().eq("id", order.id);
    return { error: "Something went wrong placing your order. Please try again." };
  }

  // Decrement stock (clamped at 0).
  await Promise.all(
    orderItems.map((it) =>
      admin
        .from("products")
        .update({ stock: Math.max(0, (it.product.stock ?? 0) - it.quantity) })
        .eq("id", it.product.id),
    ),
  );

  // Record the advance deposit as a pending payment, and bump coupon usage.
  const followUps: PromiseLike<unknown>[] = [];
  if (advanceAmount > 0) {
    followUps.push(
      admin.from("payments").insert({
        order_id: order.id,
        method: "advance",
        amount: advanceAmount,
        status: "unpaid",
      }),
    );
  }
  if (coupon.id) {
    followUps.push(
      admin
        .from("coupons")
        .update({ used_count: (coupon.usedCount ?? 0) + 1 })
        .eq("id", coupon.id),
    );
  }
  if (followUps.length) await Promise.all(followUps);

  return {
    orderId: order.id,
    orderNumber: order.order_number,
    total,
    discount,
    advanceAmount,
  };
}

// ---------- Track order ----------------------------------------------------
const trackSchema = z.object({
  orderNumber: z.string().trim().min(4),
  email: z.email("Enter the email used on the order"),
});

export interface TrackedOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
  courier: string | null;
  trackingNumber: string | null;
  items: { title: string; quantity: number }[];
}

export async function trackOrderAction(
  _prev: { order?: TrackedOrder; error?: string },
  formData: FormData,
): Promise<{ order?: TrackedOrder; error?: string }> {
  const parsed = trackSchema.safeParse({
    orderNumber: formData.get("orderNumber"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: "Enter your order number and the email used on the order." };
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select(
      "id, order_number, status, total, payment_method, created_at, email, courier, tracking_number",
    )
    .ilike("order_number", parsed.data.orderNumber.trim())
    .ilike("email", parsed.data.email.trim())
    .maybeSingle();

  if (!order) {
    return { error: "No order found with that number and email. Please check and try again." };
  }

  const { data: items } = await admin
    .from("order_items")
    .select("title, quantity")
    .eq("order_id", order.id)
    .limit(50);

  return {
    order: {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      total: Number(order.total),
      paymentMethod: order.payment_method,
      createdAt: order.created_at,
      courier: order.courier ?? null,
      trackingNumber: order.tracking_number ?? null,
      items: items ?? [],
    },
  };
}
