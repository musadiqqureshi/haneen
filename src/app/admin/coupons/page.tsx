import { createAdminClient } from "@/lib/supabase/admin";
import { PageTitle } from "@/components/admin/ui";
import { CouponForm } from "@/components/admin/coupon-form";
import { CouponRowActions } from "@/components/admin/coupon-row-actions";
import { formatPrice, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const admin = createAdminClient();
  const { data: coupons } = await admin
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <PageTitle
        title="Coupons"
        subtitle={`${coupons?.length ?? 0} codes`}
        action={<CouponForm />}
      />

      {coupons && coupons.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-line bg-ivory">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-beige text-left text-[0.66rem] uppercase tracking-[0.12em] text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Discount</th>
                <th className="px-4 py-3 font-semibold">Min Order</th>
                <th className="px-4 py-3 font-semibold">Used</th>
                <th className="px-4 py-3 font-semibold">Expires</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-beige/40">
                  <td className="px-4 py-3">
                    <div className="font-medium uppercase tracking-wide text-ink">
                      {c.code}
                    </div>
                    {c.description && (
                      <div className="text-xs text-ink-muted">{c.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-ink">
                    {c.discount_type === "percent"
                      ? `${Number(c.amount)}%`
                      : formatPrice(Number(c.amount))}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-ink-soft">
                    {Number(c.min_order) > 0 ? formatPrice(Number(c.min_order)) : "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-ink-soft">
                    {c.used_count}
                    {c.max_uses ? ` / ${c.max_uses}` : ""}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {c.expires_at
                      ? new Date(c.expires_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-block rounded-full px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wide",
                        c.is_active
                          ? "bg-green-50 text-green-700"
                          : "bg-beige text-ink-soft",
                      )}
                    >
                      {c.is_active ? "Active" : "Off"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <CouponRowActions
                      id={c.id}
                      isActive={c.is_active}
                      code={c.code}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-line bg-ivory px-6 py-12 text-center text-ink-soft">
          No coupons yet — create your first code above.
        </p>
      )}
    </>
  );
}
