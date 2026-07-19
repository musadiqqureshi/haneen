import { requireAdmin } from "@/lib/admin/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { csvCell } from "@/lib/admin/csv";
import type { ProductImage } from "@/lib/supabase/database.types";

const COLS = [
  "title",
  "category_slug",
  "price",
  "sale_price",
  "stock",
  "sku",
  "barcode",
  "tags",
  "images",
  "short_description",
  "description",
  "featured",
  "best_seller",
  "new_arrival",
  "is_active",
  "slug",
] as const;

export async function GET() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  const lines = [COLS.join(",")];
  for (const p of data ?? []) {
    const rec = p as Record<string, unknown>;
    lines.push(
      COLS.map((c) => {
        if (c === "tags") return csvCell(((p.tags as string[]) ?? []).join("|"));
        if (c === "images")
          return csvCell(
            ((p.images as ProductImage[]) ?? []).map((i) => i.url).join("|"),
          );
        return csvCell(rec[c]);
      }).join(","),
    );
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="haneen-products-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
