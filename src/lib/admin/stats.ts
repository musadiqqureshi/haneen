import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface Point {
  date: string; // ISO yyyy-mm-dd
  value: number;
}

export interface AdminStats {
  revenueTotal: number;
  todaySales: number;
  weekSales: number;
  monthSales: number;
  avgOrderValue: number;

  ordersTotal: number;
  ordersByStatus: { status: string; count: number }[];
  pendingOrders: number;

  customersTotal: number;
  newCustomersToday: number;

  productsTotal: number;
  lowStock: number;
  outOfStock: number;

  revenueSeries: Point[];
  ordersSeries: Point[];
  topProducts: { title: string; qty: number; revenue: number }[];

  trends: { revenue: number; orders: number; customers: number };

  recent: {
    id: string;
    order_number: string;
    customer_name: string;
    total: number;
    status: string;
    payment_method: string;
    created_at: string;
  }[];
}

/** Orders that never counted as revenue. */
const VOID = new Set(["cancelled", "refunded"]);

const dayKey = (d: Date | string) =>
  new Date(d).toISOString().slice(0, 10);

/** % change vs the preceding window; 0 when there's no baseline. */
function pctChange(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export async function getAdminStats(days = 30): Promise<AdminStats> {
  const admin = createAdminClient();

  const [ordersRes, productsRes, profilesRes, itemsRes] = await Promise.all([
    admin
      .from("orders")
      .select("id, order_number, customer_name, total, status, payment_method, created_at")
      .order("created_at", { ascending: false }),
    admin.from("products").select("id, stock, is_active"),
    admin.from("profiles").select("id, created_at"),
    admin.from("order_items").select("title, quantity, line_total, order_id"),
  ]);

  const orders = ordersRes.data ?? [];
  const products = productsRes.data ?? [];
  const profiles = profilesRes.data ?? [];
  const items = itemsRes.data ?? [];

  const now = new Date();
  const today = dayKey(now);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 6);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const earning = orders.filter((o) => !VOID.has(o.status));

  const revenueTotal = earning.reduce((s, o) => s + Number(o.total), 0);
  const todaySales = earning
    .filter((o) => dayKey(o.created_at) === today)
    .reduce((s, o) => s + Number(o.total), 0);
  const weekSales = earning
    .filter((o) => new Date(o.created_at) >= startOfWeek)
    .reduce((s, o) => s + Number(o.total), 0);
  const monthSales = earning
    .filter((o) => new Date(o.created_at) >= startOfMonth)
    .reduce((s, o) => s + Number(o.total), 0);

  // Status breakdown (all statuses, including zero counts, in lifecycle order).
  const ORDER = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ];
  const counts = new Map<string, number>();
  for (const o of orders) counts.set(o.status, (counts.get(o.status) ?? 0) + 1);
  const ordersByStatus = ORDER.map((status) => ({
    status,
    count: counts.get(status) ?? 0,
  })).filter((s) => s.count > 0);

  // Daily series for the last `days` days (zero-filled so the axis is honest).
  const revenueByDay = new Map<string, number>();
  const ordersByDay = new Map<string, number>();
  for (const o of earning) {
    const k = dayKey(o.created_at);
    revenueByDay.set(k, (revenueByDay.get(k) ?? 0) + Number(o.total));
    ordersByDay.set(k, (ordersByDay.get(k) ?? 0) + 1);
  }
  const revenueSeries: Point[] = [];
  const ordersSeries: Point[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const k = dayKey(d);
    revenueSeries.push({ date: k, value: revenueByDay.get(k) ?? 0 });
    ordersSeries.push({ date: k, value: ordersByDay.get(k) ?? 0 });
  }

  // Trends: this window vs the one before it.
  const windowStart = new Date(now);
  windowStart.setDate(now.getDate() - (days - 1));
  const prevStart = new Date(now);
  prevStart.setDate(now.getDate() - days * 2 + 1);

  const inWindow = (d: string) => new Date(d) >= windowStart;
  const inPrev = (d: string) =>
    new Date(d) >= prevStart && new Date(d) < windowStart;

  const curRevenue = earning.filter((o) => inWindow(o.created_at)).reduce((s, o) => s + Number(o.total), 0);
  const prevRevenue = earning.filter((o) => inPrev(o.created_at)).reduce((s, o) => s + Number(o.total), 0);
  const curOrders = orders.filter((o) => inWindow(o.created_at)).length;
  const prevOrders = orders.filter((o) => inPrev(o.created_at)).length;
  const curCustomers = profiles.filter((p) => inWindow(p.created_at)).length;
  const prevCustomers = profiles.filter((p) => inPrev(p.created_at)).length;

  // Best sellers by units sold (excluding voided orders).
  const voidIds = new Set(orders.filter((o) => VOID.has(o.status)).map((o) => o.id));
  const byTitle = new Map<string, { qty: number; revenue: number }>();
  for (const it of items) {
    if (voidIds.has(it.order_id)) continue;
    const prev = byTitle.get(it.title) ?? { qty: 0, revenue: 0 };
    byTitle.set(it.title, {
      qty: prev.qty + it.quantity,
      revenue: prev.revenue + Number(it.line_total),
    });
  }
  const topProducts = [...byTitle.entries()]
    .map(([title, v]) => ({ title, ...v }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return {
    revenueTotal,
    todaySales,
    weekSales,
    monthSales,
    avgOrderValue: earning.length ? Math.round(revenueTotal / earning.length) : 0,

    ordersTotal: orders.length,
    ordersByStatus,
    pendingOrders: counts.get("pending") ?? 0,

    customersTotal: profiles.length,
    newCustomersToday: profiles.filter((p) => dayKey(p.created_at) === today).length,

    productsTotal: products.length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
    outOfStock: products.filter((p) => p.stock === 0).length,

    revenueSeries,
    ordersSeries,
    topProducts,

    trends: {
      revenue: pctChange(curRevenue, prevRevenue),
      orders: pctChange(curOrders, prevOrders),
      customers: pctChange(curCustomers, prevCustomers),
    },

    recent: orders.slice(0, 8).map((o) => ({
      id: o.id,
      order_number: o.order_number,
      customer_name: o.customer_name,
      total: Number(o.total),
      status: o.status,
      payment_method: o.payment_method,
      created_at: o.created_at,
    })),
  };
}
