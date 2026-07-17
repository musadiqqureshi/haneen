"use client";

import { Trash2, Eye, EyeOff } from "lucide-react";
import { toggleCouponAction, deleteCouponAction } from "@/lib/admin/actions";

export function CouponRowActions({
  id,
  isActive,
  code,
}: {
  id: string;
  isActive: boolean;
  code: string;
}) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <form action={toggleCouponAction}>
        <input type="hidden" name="couponId" value={id} />
        <input type="hidden" name="active" value={(!isActive).toString()} />
        <button
          title={isActive ? "Deactivate" : "Activate"}
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
        action={deleteCouponAction}
        onSubmit={(e) => {
          if (!confirm(`Delete coupon ${code}?`)) e.preventDefault();
        }}
      >
        <input type="hidden" name="couponId" value={id} />
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
