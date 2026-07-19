"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Search,
  Store,
  X,
  LogOut,
} from "lucide-react";
import { Monogram } from "@/components/brand/logo";
import { signOutAction } from "@/lib/auth/actions";
import { NAV, CRUMB_LABEL } from "./nav-config";
import { cn } from "@/lib/utils";

export interface AdminNotice {
  label: string;
  href: string;
  count: number;
  tone: "gold" | "red" | "neutral";
}

const ease = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------ Sidebar */

function SidebarNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("status");
  const [open, setOpen] = useState<string | null>(() => {
    const match = NAV.find((n) => n.children && pathname.startsWith(n.href));
    return match?.label ?? null;
  });

  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const childActive = (href: string) => {
    const [path, query] = href.split("?");
    if (pathname !== path) return false;
    const status = query?.split("=")[1];
    return status ? current === status : !current;
  };

  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = isActive(item);
        const expanded = open === item.label && !collapsed;

        return (
          <div key={item.label}>
            <div className="relative">
              <Link
                href={item.href}
                onClick={() => {
                  if (item.children && !collapsed) setOpen(expanded ? null : item.label);
                  onNavigate?.();
                }}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-gold-300/15 font-medium text-gold-700"
                    : "text-ink-soft hover:bg-beige/70 hover:text-ink",
                )}
              >
                {active && !collapsed && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gold-500"
                  />
                )}
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.6} />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {!collapsed && item.children && (
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 text-ink-muted transition-transform duration-300",
                      expanded && "rotate-180",
                    )}
                  />
                )}
              </Link>
            </div>

            <AnimatePresence initial={false}>
              {expanded && item.children && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease }}
                  className="overflow-hidden pl-[34px]"
                >
                  {item.children.map((c) => (
                    <li key={c.href}>
                      <Link
                        href={c.href}
                        onClick={onNavigate}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-[0.8rem] transition-colors",
                          childActive(c.href)
                            ? "font-medium text-gold-700"
                            : "text-ink-muted hover:text-ink",
                        )}
                      >
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}

/* ------------------------------------------------------------- Notifications */

function NotificationPanel({
  notices,
  onClose,
}: {
  notices: AdminNotice[];
  onClose: () => void;
}) {
  const tone = {
    gold: "bg-gold-50 text-gold-700",
    red: "bg-red-50 text-red-600",
    neutral: "bg-beige text-ink-soft",
  };
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.2, ease }}
        className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_24px_60px_-24px_rgba(47,42,36,0.35)]"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-sm font-medium text-ink">Notifications</p>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        {notices.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-ink-muted">
            You&apos;re all caught up.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {notices.map((n) => (
              <li key={n.label}>
                <Link
                  href={n.href}
                  onClick={onClose}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-beige/50"
                >
                  <span className="text-sm text-ink">{n.label}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                      tone[n.tone],
                    )}
                  >
                    {n.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </>
  );
}

/* ------------------------------------------------------------------- Topbar */

function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  return (
    <nav className="hidden items-center gap-1.5 text-xs text-ink-muted md:flex">
      {parts.map((p, i) => {
        const href = "/" + parts.slice(0, i + 1).join("/");
        const last = i === parts.length - 1;
        const label =
          CRUMB_LABEL[p] ??
          (p.length > 12 ? `${p.slice(0, 8)}…` : p.replace(/-/g, " "));
        return (
          <span key={href} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3 w-3 opacity-50" />}
            {last ? (
              <span className="font-medium capitalize text-ink">{label}</span>
            ) : (
              <Link href={href} className="capitalize hover:text-gold-700">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

function Topbar({
  collapsed,
  setCollapsed,
  setMobileOpen,
  notices,
  email,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  setMobileOpen: (v: boolean) => void;
  notices: AdminNotice[];
  email: string;
}) {
  const router = useRouter();
  const [bell, setBell] = useState(false);
  const [q, setQ] = useState("");
  const total = notices.reduce((s, n) => s + n.count, 0);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-[#FAF8F5]/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-4 px-5 sm:px-8">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden text-ink-soft transition-colors hover:text-ink lg:block"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-ink-soft lg:hidden"
          aria-label="Open menu"
        >
          <PanelLeft className="h-5 w-5" />
        </button>

        <Breadcrumbs />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) router.push(`/admin/products?q=${encodeURIComponent(q.trim())}`);
          }}
          className="ml-auto hidden max-w-xs flex-1 sm:block"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="h-10 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-gold-400"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          <Link
            href="/"
            target="_blank"
            title="View store"
            className="rounded-lg p-2 text-ink-soft transition-colors hover:bg-beige hover:text-ink"
          >
            <Store className="h-[18px] w-[18px]" strokeWidth={1.6} />
          </Link>

          <div className="relative">
            <button
              onClick={() => setBell((v) => !v)}
              className="relative rounded-lg p-2 text-ink-soft transition-colors hover:bg-beige hover:text-ink"
              aria-label="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" strokeWidth={1.6} />
              {total > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[0.58rem] font-semibold text-white">
                  {total}
                </span>
              )}
            </button>
            <AnimatePresence>
              {bell && (
                <NotificationPanel notices={notices} onClose={() => setBell(false)} />
              )}
            </AnimatePresence>
          </div>

          <div className="ml-1 hidden items-center gap-2.5 border-l border-line pl-3 sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-300/25 text-xs font-semibold uppercase text-gold-700">
              {email.charAt(0)}
            </span>
            <span className="max-w-[140px] truncate text-xs text-ink-soft">{email}</span>
            <form action={signOutAction}>
              <button
                title="Sign out"
                className="rounded-lg p-1.5 text-ink-muted transition-colors hover:text-red-500"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------- Shell */

export function AdminShell({
  email,
  notices,
  children,
}: {
  email: string;
  notices: AdminNotice[];
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Restore the collapsed preference.
  useEffect(() => {
    setCollapsed(localStorage.getItem("hg-admin-collapsed") === "1");
  }, []);
  useEffect(() => {
    localStorage.setItem("hg-admin-collapsed", collapsed ? "1" : "0");
  }, [collapsed]);
  useEffect(() => setMobileOpen(false), [pathname]);

  const brand = (
    <Link href="/admin" className="flex items-center gap-2.5 px-3">
      <Monogram className="h-8 w-8 shrink-0" />
      {!collapsed && (
        <span className="truncate font-display text-[0.95rem] tracking-[0.1em] text-gold-700">
          HANEEN GRACE
        </span>
      )}
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 76 : 256 }}
        transition={{ duration: 0.3, ease }}
        className="fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-line bg-white py-5 lg:flex"
      >
        <div className="mb-7">{brand}</div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav collapsed={collapsed} />
        </div>
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.32, ease }}
              className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white py-5 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between pr-4">
                {brand}
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X className="h-5 w-5 text-ink-soft" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarNav collapsed={false} onNavigate={() => setMobileOpen(false)} />
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main column — padding clears the fixed sidebar on desktop. */}
      <div
        className={cn(
          "transition-[padding] duration-300",
          collapsed ? "lg:pl-[76px]" : "lg:pl-64",
        )}
      >
        <Topbar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setMobileOpen={setMobileOpen}
          notices={notices}
          email={email}
        />
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease }}
          className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
