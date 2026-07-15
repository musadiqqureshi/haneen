-- ============================================================================
-- Haneen Grace — Row Level Security policies
--
-- Model:
--   * Public (anon) can read the storefront: active categories, products,
--     banners, published reviews, site settings.
--   * Customers can read/write only their own rows (profiles, addresses,
--     wishlists, orders, reviews they wrote).
--   * Admins (profiles.role = 'admin') can do everything.
--   * Sensitive writes (creating orders, decrementing stock, taking payments)
--     run server-side with the service_role key, which bypasses RLS entirely.
-- ============================================================================

-- Enable RLS everywhere ------------------------------------------------------
alter table public.profiles                enable row level security;
alter table public.addresses               enable row level security;
alter table public.categories              enable row level security;
alter table public.products                enable row level security;
alter table public.reviews                 enable row level security;
alter table public.wishlists               enable row level security;
alter table public.coupons                 enable row level security;
alter table public.orders                  enable row level security;
alter table public.order_items             enable row level security;
alter table public.payments                enable row level security;
alter table public.banners                 enable row level security;
alter table public.newsletter_subscribers  enable row level security;
alter table public.settings                enable row level security;
alter table public.activity_logs           enable row level security;

-- ---------- profiles --------------------------------------------------------
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- ---------- addresses -------------------------------------------------------
drop policy if exists addresses_all_own on public.addresses;
create policy addresses_all_own on public.addresses
  for all to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- ---------- categories (public read, admin write) ---------------------------
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select to anon, authenticated
  using (is_active or public.is_admin());

drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write on public.categories
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- products (public read, admin write) -----------------------------
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select to anon, authenticated
  using (is_active or public.is_admin());

drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- reviews ---------------------------------------------------------
drop policy if exists reviews_public_read on public.reviews;
create policy reviews_public_read on public.reviews
  for select to anon, authenticated
  using (status = 'published' or user_id = auth.uid() or public.is_admin());

drop policy if exists reviews_insert_own on public.reviews;
create policy reviews_insert_own on public.reviews
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists reviews_update_own on public.reviews;
create policy reviews_update_own on public.reviews
  for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists reviews_delete_own on public.reviews;
create policy reviews_delete_own on public.reviews
  for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ---------- wishlists -------------------------------------------------------
drop policy if exists wishlists_all_own on public.wishlists;
create policy wishlists_all_own on public.wishlists
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------- coupons (read active to validate; admin write) ------------------
drop policy if exists coupons_public_read on public.coupons;
create policy coupons_public_read on public.coupons
  for select to anon, authenticated
  using (is_active or public.is_admin());

drop policy if exists coupons_admin_write on public.coupons;
create policy coupons_admin_write on public.coupons
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- orders ----------------------------------------------------------
-- Guest orders are created server-side (service_role). Logged-in customers may
-- read their own orders and admins read all.
drop policy if exists orders_select_own on public.orders;
create policy orders_select_own on public.orders
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists orders_insert_own on public.orders;
create policy orders_insert_own on public.orders
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists orders_admin_update on public.orders;
create policy orders_admin_update on public.orders
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- order_items -----------------------------------------------------
drop policy if exists order_items_select_own on public.order_items;
create policy order_items_select_own on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );

-- ---------- payments --------------------------------------------------------
drop policy if exists payments_select_own on public.payments;
create policy payments_select_own on public.payments
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = payments.order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists payments_admin_write on public.payments;
create policy payments_admin_write on public.payments
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- banners (public read active, admin write) -----------------------
drop policy if exists banners_public_read on public.banners;
create policy banners_public_read on public.banners
  for select to anon, authenticated
  using (is_active or public.is_admin());

drop policy if exists banners_admin_write on public.banners;
create policy banners_admin_write on public.banners
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- newsletter_subscribers (anyone subscribes, admin reads) ---------
drop policy if exists newsletter_insert_any on public.newsletter_subscribers;
create policy newsletter_insert_any on public.newsletter_subscribers
  for insert to anon, authenticated
  with check (true);

drop policy if exists newsletter_admin_read on public.newsletter_subscribers;
create policy newsletter_admin_read on public.newsletter_subscribers
  for select to authenticated
  using (public.is_admin());

-- ---------- settings (public read, admin write) -----------------------------
drop policy if exists settings_public_read on public.settings;
create policy settings_public_read on public.settings
  for select to anon, authenticated
  using (true);

drop policy if exists settings_admin_write on public.settings;
create policy settings_admin_write on public.settings
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- activity_logs (admin only) --------------------------------------
drop policy if exists activity_admin_read on public.activity_logs;
create policy activity_admin_read on public.activity_logs
  for select to authenticated
  using (public.is_admin());
