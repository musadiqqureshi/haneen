"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { saveProductAction, type AdminFormState } from "@/lib/admin/actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import { cn } from "@/lib/utils";

export interface ProductInitial {
  id?: string;
  title?: string;
  category_slug?: string;
  price?: number;
  sale_price?: number | null;
  stock?: number;
  short_description?: string | null;
  description?: string | null;
  color_name?: string;
  color_hex?: string;
  tags?: string[];
  images?: { url: string }[];
  barcode?: string | null;
  video_url?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  featured?: boolean;
  best_seller?: boolean;
  new_arrival?: boolean;
  is_active?: boolean;
}

const CATEGORIES = [
  ["luxury-pret", "Luxury Pret"],
  ["casual-wear", "Casual Wear"],
  ["formal-wear", "Formal Wear"],
  ["festive-collection", "Festive Collection"],
  ["new-arrivals", "New Arrivals"],
  ["sale", "Sale"],
];

const input =
  "h-11 w-full rounded-md border border-line bg-ivory px-3.5 text-sm text-ink outline-none focus:border-gold-400";
const label =
  "mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink";

function Save() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center rounded-md bg-ink px-8 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-gold-700 disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save Product"}
    </button>
  );
}

export function ProductForm({ initial = {} }: { initial?: ProductInitial }) {
  const router = useRouter();
  const [state, action] = useActionState(saveProductAction, {} as AdminFormState);

  useEffect(() => {
    if (state.success) router.push("/admin/products");
  }, [state.success, router]);

  const err = (k: string) => state.fieldErrors?.[k];

  return (
    <form action={action} className="max-w-3xl space-y-6">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      {state.error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <label className={label}>Title</label>
        <input
          name="title"
          defaultValue={initial.title}
          className={cn(input, err("title") && "border-red-400")}
          placeholder="Crimson Rose Embroidered Lawn"
        />
        {err("title") && <p className="mt-1 text-xs text-red-500">{err("title")}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label}>Category</label>
          <select
            name="category_slug"
            defaultValue={initial.category_slug ?? "luxury-pret"}
            className={input}
          >
            {CATEGORIES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Stock</label>
          <input
            name="stock"
            type="number"
            min={0}
            defaultValue={initial.stock ?? 0}
            className={input}
          />
        </div>
        <div>
          <label className={label}>Price (PKR)</label>
          <input
            name="price"
            type="number"
            min={0}
            step="1"
            defaultValue={initial.price}
            className={cn(input, err("price") && "border-red-400")}
          />
          {err("price") && <p className="mt-1 text-xs text-red-500">{err("price")}</p>}
        </div>
        <div>
          <label className={label}>Sale Price (optional)</label>
          <input
            name="sale_price"
            type="number"
            min={0}
            step="1"
            defaultValue={initial.sale_price ?? ""}
            className={input}
          />
        </div>
        <div>
          <label className={label}>Colour Name</label>
          <input
            name="color_name"
            defaultValue={initial.color_name}
            className={input}
            placeholder="Crimson"
          />
        </div>
        <div>
          <label className={label}>Colour Hex</label>
          <input
            name="color_hex"
            defaultValue={initial.color_hex}
            className={input}
            placeholder="#b81d34"
          />
        </div>
      </div>

      <div>
        <label className={label}>Short Description</label>
        <input
          name="short_description"
          defaultValue={initial.short_description ?? ""}
          className={input}
          placeholder="Richly embroidered crimson lawn three-piece…"
        />
      </div>

      <div>
        <label className={label}>Full Description</label>
        <textarea
          name="description"
          defaultValue={initial.description ?? ""}
          rows={4}
          className={cn(input, "h-auto py-2.5")}
        />
      </div>

      <div>
        <label className={label}>Tags (comma-separated)</label>
        <input
          name="tags"
          defaultValue={initial.tags?.join(", ")}
          className={input}
          placeholder="embroidered, lawn, 3-piece, unstitched"
        />
      </div>

      <div>
        <label className={label}>Product Images</label>
        <ImageUploader initial={initial.images?.map((i) => i.url) ?? []} />
      </div>

      {/* Media & identifiers */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label}>Barcode (optional)</label>
          <input
            name="barcode"
            defaultValue={initial.barcode ?? ""}
            className={input}
            placeholder="e.g. 8964000123456"
          />
        </div>
        <div>
          <label className={label}>Video URL (optional)</label>
          <input
            name="video_url"
            defaultValue={initial.video_url ?? ""}
            className={input}
            placeholder="https://…/reel.mp4"
          />
        </div>
      </div>

      {/* SEO */}
      <div className="rounded-lg border border-line bg-beige/30 p-5">
        <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink">
          SEO
        </p>
        <div className="space-y-4">
          <div>
            <label className={label}>Meta Title</label>
            <input
              name="seo_title"
              defaultValue={initial.seo_title ?? ""}
              className={input}
              placeholder="Defaults to the product title"
            />
          </div>
          <div>
            <label className={label}>Meta Description</label>
            <textarea
              name="seo_description"
              defaultValue={initial.seo_description ?? ""}
              rows={2}
              className={cn(input, "h-auto py-2.5")}
              placeholder="Defaults to the short description"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-5">
        {[
          ["featured", "Featured", initial.featured],
          ["best_seller", "Best Seller", initial.best_seller],
          ["new_arrival", "New Arrival", initial.new_arrival ?? true],
          ["is_active", "Published", initial.is_active ?? true],
        ].map(([name, lbl, checked]) => (
          <label key={name as string} className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              name={name as string}
              defaultChecked={Boolean(checked)}
              className="h-4 w-4 accent-gold-500"
            />
            {lbl as string}
          </label>
        ))}
      </div>

      <div className="flex items-center gap-4 border-t border-line pt-6">
        <Save />
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="text-sm text-ink-soft hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
