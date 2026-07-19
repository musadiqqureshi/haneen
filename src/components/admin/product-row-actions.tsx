"use client";

import Link from "next/link";
import { Pencil, Trash2, Eye, EyeOff, Copy } from "lucide-react";
import {
  toggleProductActiveAction,
  deleteProductAction,
  duplicateProductAction,
} from "@/lib/admin/actions";

export function ProductRowActions({
  id,
  slug,
  isActive,
  title,
}: {
  id: string;
  slug: string;
  isActive: boolean;
  title: string;
}) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link
        href={`/product/${slug}`}
        target="_blank"
        title="View on store"
        className="rounded-md p-2 text-ink-soft hover:bg-beige hover:text-ink"
      >
        <Eye className="h-4 w-4" />
      </Link>
      <Link
        href={`/admin/products/${id}`}
        title="Edit"
        className="rounded-md p-2 text-ink-soft hover:bg-beige hover:text-gold-700"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <form action={duplicateProductAction}>
        <input type="hidden" name="productId" value={id} />
        <button
          title="Duplicate"
          className="rounded-md p-2 text-ink-soft hover:bg-beige hover:text-ink"
        >
          <Copy className="h-4 w-4" />
        </button>
      </form>
      <form action={toggleProductActiveAction}>
        <input type="hidden" name="productId" value={id} />
        <input type="hidden" name="active" value={(!isActive).toString()} />
        <button
          title={isActive ? "Unpublish" : "Publish"}
          className="rounded-md p-2 text-ink-soft hover:bg-beige hover:text-ink"
        >
          {isActive ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4 text-green-600" />
          )}
        </button>
      </form>
      <form
        action={deleteProductAction}
        onSubmit={(e) => {
          if (!confirm(`Delete "${title}"? This cannot be undone.`))
            e.preventDefault();
        }}
      >
        <input type="hidden" name="productId" value={id} />
        <button
          title="Delete"
          className="rounded-md p-2 text-ink-soft hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
