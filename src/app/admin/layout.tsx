import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/guard";
import { AdminNav } from "@/components/admin/admin-nav";
import { Monogram } from "@/components/brand/logo";
import { signOutAction } from "@/lib/auth/actions";

export const metadata: Metadata = {
  title: "Admin — Haneen Grace",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAdmin();

  return (
    <div className="min-h-screen bg-beige/40">
      <div className="mx-auto flex max-w-[1400px]">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-ivory px-5 py-6 lg:flex">
          <Link href="/admin" className="mb-8 flex items-center gap-2.5">
            <Monogram className="h-9 w-9" />
            <span className="font-display text-lg tracking-[0.12em] text-gold-700">
              HANEEN GRACE
            </span>
          </Link>
          <AdminNav />
          <div className="mt-auto border-t border-line pt-4">
            <p className="truncate text-xs text-ink-muted">
              {profile?.full_name || profile?.email}
            </p>
            <form action={signOutAction}>
              <button className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-ink-soft hover:text-red-500">
                Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1">
          {/* Mobile top bar */}
          <div className="flex items-center justify-between border-b border-line bg-ivory px-5 py-4 lg:hidden">
            <Link href="/admin" className="flex items-center gap-2">
              <Monogram className="h-7 w-7" />
              <span className="font-display tracking-[0.1em] text-gold-700">
                Admin
              </span>
            </Link>
            <form action={signOutAction}>
              <button className="text-xs uppercase tracking-[0.14em] text-ink-soft">
                Sign out
              </button>
            </form>
          </div>
          <div className="lg:hidden">
            <div className="border-b border-line bg-ivory px-3 py-2">
              <AdminNav />
            </div>
          </div>
          <main className="px-5 py-8 sm:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
