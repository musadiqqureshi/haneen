"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseCsv } from "./csv";
import { slugify } from "@/lib/utils";

export interface ImportResult {
  created?: number;
  updated?: number;
  skipped?: number;
  errors?: string[];
  error?: string;
}

const VALID_CATEGORIES = [
  "luxury-pret",
  "casual-wear",
  "formal-wear",
  "festive-collection",
  "new-arrivals",
  "sale",
];

const num = (v: string | undefined) => {
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) ? n : 0;
};
const bool = (v: string | undefined) =>
  ["true", "1", "yes", "y"].includes(String(v ?? "").trim().toLowerCase());
const list = (v: string | undefined) =>
  String(v ?? "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Bulk create/update products from a CSV (matching the export format).
 * Matches on `slug` (or slugified title) — existing products are updated,
 * new ones inserted. Never trusts arbitrary columns; only known fields import.
 */
export async function importProductsCsvAction(
  formData: FormData,
): Promise<ImportResult> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a CSV file." };
  }
  if (file.size > 4 * 1024 * 1024) return { error: "CSV is too large (max 4MB)." };

  const rows = parseCsv(await file.text());
  if (rows.length < 2) return { error: "That CSV has no data rows." };

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);
  if (idx("title") === -1 || idx("price") === -1) {
    return { error: "CSV must include at least 'title' and 'price' columns." };
  }

  const admin = createAdminClient();
  const errors: string[] = [];
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    const get = (name: string) => {
      const i = idx(name);
      return i === -1 ? "" : (cells[i] ?? "").trim();
    };

    const title = get("title");
    if (!title) {
      skipped++;
      continue;
    }
    const category = get("category_slug") || "luxury-pret";
    if (!VALID_CATEGORIES.includes(category)) {
      errors.push(`Row ${r + 1}: unknown category "${category}"`);
      skipped++;
      continue;
    }

    const slug = get("slug") || slugify(title);
    const sale = get("sale_price");
    const row = {
      title,
      slug,
      category_slug: category,
      price: num(get("price")),
      sale_price: sale === "" ? null : num(sale),
      stock: Math.trunc(num(get("stock"))),
      sku: get("sku") || null,
      barcode: get("barcode") || null,
      tags: list(get("tags")),
      images: list(get("images")).map((url, i) => ({ url, is_primary: i === 0 })),
      short_description: get("short_description") || null,
      description: get("description") || null,
      sizes: [] as string[],
      collections: ["new-arrivals", ...(sale ? ["sale"] : [])],
      featured: bool(get("featured")),
      best_seller: bool(get("best_seller")),
      new_arrival: get("new_arrival") ? bool(get("new_arrival")) : true,
      is_active: get("is_active") ? bool(get("is_active")) : true,
    };

    const { data: existing } = await admin
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      const { error } = await admin.from("products").update(row).eq("id", existing.id);
      if (error) errors.push(`Row ${r + 1}: ${error.message}`);
      else updated++;
    } else {
      const { error } = await admin.from("products").insert(row);
      if (error) errors.push(`Row ${r + 1}: ${error.message}`);
      else created++;
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { created, updated, skipped, errors: errors.slice(0, 8) };
}
