"use server";

import { requireAdmin } from "./guard";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "product-images";
const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const OK_EXT = ["jpg", "jpeg", "png", "webp", "avif"];

/**
 * Upload one or more product images to Supabase Storage (admin only, via the
 * service role) and return their public URLs. The browser uploader calls this,
 * then stores the URLs on the product.
 */
export async function uploadImagesAction(
  formData: FormData,
): Promise<{ urls?: string[]; error?: string }> {
  await requireAdmin();

  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return { urls: [] };

  const admin = createAdminClient();
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const urls: string[] = [];

  for (const file of files) {
    if (file.size > MAX_BYTES) {
      return { error: `${file.name} is larger than 8MB.` };
    }
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    if (!OK_EXT.includes(ext)) {
      return { error: `${file.name}: only JPG, PNG, WebP or AVIF are allowed.` };
    }
    const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await admin.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type || `image/${ext === "jpg" ? "jpeg" : ext}`,
        upsert: false,
      });
    if (error) return { error: error.message };

    urls.push(`${base}/storage/v1/object/public/${BUCKET}/${path}`);
  }

  return { urls };
}
