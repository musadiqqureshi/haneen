import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, MapPin, Sparkles, User } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/account/profile-form";
import { signOutAction } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "My Account" };

const STATUS_TONE: Record<string, string> = {
  pending: "bg-beige text-ink-soft",
  confirmed: "bg-gold-50 text-gold-700",
  processing: "bg-gold-50 text-gold-700",
  shipped: "bg-gold-100 text-gold-800",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-600",
  refunded: "bg-red-50 text-red-600",
};

export default async function AccountPage() {
  // Before the store is connected to Supabase, show a friendly placeholder.
  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHero
          eyebrow="Your Space"
          title="My Account"
          breadcrumb={[{ label: "Home", href: "/" }, { label: "Account" }]}
        />
        <div className="container-lux flex min-h-[40vh] max-w-md flex-col items-center justify-center gap-5 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold-200 text-gold-500">
            <User className="h-7 w-7" strokeWidth={1.3} />
          </span>
          <h2 className="font-display text-2xl text-ink">Accounts are almost live</h2>
          <p className="text-ink-soft">
            Sign in, order history and saved addresses activate as soon as the
            store is connected. For now, checkout is quick and guest-friendly.
          </p>
          <div className="flex items-center gap-2 rounded-full bg-beige px-4 py-2 text-xs text-gold-600">
            <Sparkles className="h-4 w-4" /> Connecting soon
          </div>
          <Button asChild variant="dark" className="mt-2">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/account/login?redirect=/account");

  const [{ data: profile }, { data: orders }, { count: addressCount }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("orders")
        .select("id, order_number, status, total, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("addresses")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

  const firstName =
    profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "there";

  return (
    <>
      <PageHero
        eyebrow="Your Space"
        title={`Hello, ${firstName}`}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Account" }]}
      />

      <div className="container-lux grid gap-10 py-14 lg:grid-cols-[280px_1fr] lg:gap-16">
        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-[3px] border border-line bg-beige/60 p-6">
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-ink-muted">
              Signed in as
            </p>
            <p className="mt-1 truncate font-medium text-ink">{user.email}</p>
            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-gold-600 hover:text-gold-700"
              >
                <Sparkles className="h-3.5 w-3.5" /> Admin Dashboard
              </Link>
            )}
          </div>

          <nav className="flex flex-col text-sm">
            {[
              { icon: User, label: "Profile", href: "#profile" },
              { icon: Package, label: "Orders", href: "#orders" },
              { icon: MapPin, label: "Addresses", href: "/account/addresses" },
            ].map(({ icon: Icon, label, href }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 border-b border-line/60 py-3 text-ink-soft transition-colors hover:text-gold-600"
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} /> {label}
              </Link>
            ))}
          </nav>

          <form action={signOutAction}>
            <button
              type="submit"
              className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-red-500"
            >
              Sign Out
            </button>
          </form>
        </aside>

        {/* Main */}
        <div className="space-y-14">
          {/* Profile */}
          <section id="profile">
            <h2 className="mb-5 font-display text-2xl text-ink">Profile Details</h2>
            <div className="max-w-lg rounded-[3px] border border-line bg-ivory p-6 sm:p-8">
              <ProfileForm
                fullName={profile?.full_name ?? ""}
                phone={profile?.phone ?? ""}
                email={user.email ?? ""}
              />
            </div>
          </section>

          {/* Orders */}
          <section id="orders">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl text-ink">Order History</h2>
              <span className="text-sm text-ink-muted">
                {addressCount ?? 0} saved address{(addressCount ?? 0) === 1 ? "" : "es"}
              </span>
            </div>

            {orders && orders.length > 0 ? (
              <div className="overflow-hidden rounded-[3px] border border-line">
                <table className="w-full text-sm">
                  <thead className="bg-beige text-left text-[0.68rem] uppercase tracking-[0.12em] text-ink-soft">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Order</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-beige/40">
                        <td className="px-4 py-3">
                          <Link
                            href={`/track-order?order=${o.order_number}`}
                            className="font-medium text-ink hover:text-gold-600"
                          >
                            {o.order_number}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-ink-soft">
                          {new Date(o.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wide ${
                              STATUS_TONE[o.status] ?? "bg-beige text-ink-soft"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-ink">
                          {formatPrice(o.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-[3px] border border-dashed border-line bg-beige/40 px-6 py-12 text-center">
                <Package className="mx-auto h-8 w-8 text-gold-400" strokeWidth={1.3} />
                <p className="mt-3 text-ink-soft">You have no orders yet.</p>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link href="/shop">Start Shopping</Link>
                </Button>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
