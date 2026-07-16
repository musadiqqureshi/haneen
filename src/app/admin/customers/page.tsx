import { createAdminClient } from "@/lib/supabase/admin";
import { PageTitle } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const admin = createAdminClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name, email, phone, role, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  // Order counts per customer.
  const { data: orders } = await admin.from("orders").select("user_id");
  const orderCount = new Map<string, number>();
  for (const o of orders ?? []) {
    if (o.user_id) orderCount.set(o.user_id, (orderCount.get(o.user_id) ?? 0) + 1);
  }

  return (
    <>
      <PageTitle
        title="Customers"
        subtitle={`${profiles?.length ?? 0} registered`}
      />

      <div className="overflow-x-auto rounded-lg border border-line bg-ivory">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-beige text-left text-[0.66rem] uppercase tracking-[0.12em] text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Orders</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 font-semibold">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(profiles ?? []).map((c) => (
              <tr key={c.id} className="hover:bg-beige/40">
                <td className="px-4 py-3 font-medium text-ink">
                  {c.full_name || "—"}
                </td>
                <td className="px-4 py-3 text-ink-soft">{c.email}</td>
                <td className="px-4 py-3 text-ink-soft">{c.phone || "—"}</td>
                <td className="px-4 py-3 tabular-nums text-ink-soft">
                  {orderCount.get(c.id) ?? 0}
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {new Date(c.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-block rounded-full px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wide",
                      c.role === "admin"
                        ? "bg-gold-100 text-gold-800"
                        : "bg-beige text-ink-soft",
                    )}
                  >
                    {c.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
