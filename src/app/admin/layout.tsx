import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminShell, type AdminNotice } from "@/components/admin/shell/admin-shell";

export const metadata: Metadata = {
  title: "Admin — Haneen Grace",
  robots: { index: false, follow: false },
};

// Admin is always request-time (auth + live data).
export const dynamic = "force-dynamic";

async function getNotices(): Promise<AdminNotice[]> {
  const admin = createAdminClient();
  const [pending, reviews, products] = await Promise.all([
    admin.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("products").select("stock"),
  ]);

  const stocks = products.data ?? [];
  const low = stocks.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const out = stocks.filter((p) => p.stock === 0).length;

  const notices: AdminNotice[] = [];
  if (pending.count) {
    notices.push({
      label: `${pending.count} order${pending.count === 1 ? "" : "s"} awaiting confirmation`,
      href: "/admin/orders?status=pending",
      count: pending.count,
      tone: "gold",
    });
  }
  if (reviews.count) {
    notices.push({
      label: `${reviews.count} review${reviews.count === 1 ? "" : "s"} to moderate`,
      href: "/admin/reviews",
      count: reviews.count,
      tone: "gold",
    });
  }
  if (out) {
    notices.push({
      label: `${out} product${out === 1 ? "" : "s"} out of stock`,
      href: "/admin/products",
      count: out,
      tone: "red",
    });
  }
  if (low) {
    notices.push({
      label: `${low} product${low === 1 ? "" : "s"} low on stock`,
      href: "/admin/products",
      count: low,
      tone: "neutral",
    });
  }
  return notices;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ profile, user }, notices] = await Promise.all([requireAdmin(), getNotices()]);

  return (
    <AdminShell
      email={profile?.email ?? user.email ?? "admin"}
      notices={notices}
    >
      {children}
    </AdminShell>
  );
}
