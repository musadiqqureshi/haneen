-- ============================================================
-- Haneen Grace — FULL SETUP (schema + RLS + grants + lifecycle + inventory + seed)
-- Paste into Supabase → SQL Editor → Run. Safe to re-run.
-- ============================================================

-- ============================================================================
-- Haneen Grace — Initial Schema (Phase 2)
-- Luxury Pret • Modest Wear
--
-- Run in the Supabase SQL editor (or via `supabase db push`).
-- Idempotent-ish: safe enums via DO blocks; tables use IF NOT EXISTS.
-- ============================================================================

-- ---------- Extensions ------------------------------------------------------
create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "citext";         -- case-insensitive email

-- ---------- Enums -----------------------------------------------------------
do $$ begin
  create type user_role as enum ('customer', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum
    ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('cod', 'advance');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('unpaid', 'partial', 'paid', 'refunded', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type review_status as enum ('published', 'pending', 'rejected');
exception when duplicate_object then null; end $$;

-- ---------- Shared trigger: keep updated_at fresh ---------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- Helper: is the current user an admin? ---------------------------
-- SECURITY DEFINER so policies can call it without recursive RLS on profiles.
-- plpgsql (not sql) so the profiles reference is resolved at run time — this
-- function is created before the profiles table below.
create or replace function public.is_admin()
returns boolean
language plpgsql stable security definer set search_path = public as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end $$;

-- ============================================================================
-- profiles  (1:1 with auth.users)
-- ============================================================================
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  email        citext,
  phone        text,
  avatar_url   text,
  role         user_role not null default 'customer',
  marketing_opt_in boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile whenever an auth user is created.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- addresses
-- ============================================================================
create table if not exists public.addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  label       text,                    -- e.g. "Home", "Office"
  full_name   text not null,
  phone       text not null,
  line1       text not null,
  line2       text,
  city        text not null,
  province    text,
  postal_code text,
  country     text not null default 'Pakistan',
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_addresses_user on public.addresses(user_id);

create trigger trg_addresses_updated
  before update on public.addresses
  for each row execute function public.set_updated_at();

-- ============================================================================
-- categories  (self-referencing for subcategories)
-- ============================================================================
create table if not exists public.categories (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  tagline      text,
  description  text,
  accent       text,                    -- hex accent used on cards
  parent_id    uuid references public.categories(id) on delete set null,
  image_url    text,
  sort_order   int not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger trg_categories_updated
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ============================================================================
-- products
-- ============================================================================
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  sku               text unique,
  barcode           text,
  title             text not null,
  short_description text,
  description       text,
  price             numeric(12,2) not null check (price >= 0),
  sale_price        numeric(12,2) check (sale_price >= 0),
  category_slug     text not null references public.categories(slug) on update cascade,
  collections       text[] not null default '{}',   -- extra category slugs
  sizes             text[] not null default '{}',
  colors            jsonb  not null default '[]',    -- [{name,hex}]
  swatch            text[] not null default '{}',    -- [from,to] placeholder gradient
  images            jsonb  not null default '[]',    -- [{url,alt,is_primary}]
  video_url         text,
  stock             int not null default 0 check (stock >= 0),
  featured          boolean not null default false,
  best_seller       boolean not null default false,
  new_arrival       boolean not null default false,
  rating            numeric(2,1) not null default 0,
  review_count      int not null default 0,
  tags              text[] not null default '{}',
  seo               jsonb not null default '{}',      -- {title,description,keywords}
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists idx_products_category on public.products(category_slug);
create index if not exists idx_products_active   on public.products(is_active);
create index if not exists idx_products_flags     on public.products(featured, best_seller, new_arrival);
create index if not exists idx_products_collections on public.products using gin (collections);
create index if not exists idx_products_tags        on public.products using gin (tags);

create trigger trg_products_updated
  before update on public.products
  for each row execute function public.set_updated_at();

-- ============================================================================
-- reviews
-- ============================================================================
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete set null,
  author_name text not null,
  location    text,
  rating      int not null check (rating between 1 and 5),
  title       text,
  body        text,
  size        text,
  verified    boolean not null default false,
  status      review_status not null default 'published',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_reviews_product on public.reviews(product_id);

create trigger trg_reviews_updated
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- Recompute product.rating / review_count on review changes.
create or replace function public.refresh_product_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  pid uuid := coalesce(new.product_id, old.product_id);
begin
  update public.products p set
    rating = coalesce((
      select round(avg(r.rating)::numeric, 1)
      from public.reviews r
      where r.product_id = pid and r.status = 'published'
    ), 0),
    review_count = (
      select count(*) from public.reviews r
      where r.product_id = pid and r.status = 'published'
    )
  where p.id = pid;
  return null;
end $$;

drop trigger if exists trg_reviews_aggregate on public.reviews;
create trigger trg_reviews_aggregate
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_product_rating();

-- ============================================================================
-- wishlists
-- ============================================================================
create table if not exists public.wishlists (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ============================================================================
-- coupons
-- ============================================================================
create table if not exists public.coupons (
  id            uuid primary key default gen_random_uuid(),
  code          citext not null unique,
  description   text,
  discount_type text not null default 'percent' check (discount_type in ('percent','fixed')),
  amount        numeric(12,2) not null check (amount >= 0),
  min_order     numeric(12,2) not null default 0,
  max_uses      int,
  used_count    int not null default 0,
  starts_at     timestamptz,
  expires_at    timestamptz,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger trg_coupons_updated
  before update on public.coupons
  for each row execute function public.set_updated_at();

-- ============================================================================
-- orders
-- ============================================================================
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text not null unique,
  user_id         uuid references public.profiles(id) on delete set null,
  status          order_status not null default 'pending',

  -- guest / contact snapshot
  email           citext not null,
  phone           text not null,
  customer_name   text not null,

  -- shipping snapshot (kept even if the address is later deleted)
  shipping        jsonb not null,       -- {line1,line2,city,province,postal_code,country}

  -- money
  subtotal        numeric(12,2) not null default 0,
  discount        numeric(12,2) not null default 0,
  shipping_fee    numeric(12,2) not null default 0,
  total           numeric(12,2) not null default 0,
  coupon_code     citext,

  -- payment
  payment_method  payment_method not null default 'cod',
  payment_status  payment_status not null default 'unpaid',
  advance_amount  numeric(12,2) not null default 0,   -- required upfront for 'advance'

  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_orders_user   on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_number on public.orders(order_number);

create trigger trg_orders_updated
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Human-friendly order number: HG-YYMMDD-XXXX
create or replace function public.set_order_number()
returns trigger language plpgsql as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'HG-' || to_char(now(), 'YYMMDD') || '-' ||
      upper(substr(encode(gen_random_bytes(3), 'hex'), 1, 4));
  end if;
  return new;
end $$;

drop trigger if exists trg_orders_number on public.orders;
create trigger trg_orders_number
  before insert on public.orders
  for each row execute function public.set_order_number();

-- ============================================================================
-- order_items
-- ============================================================================
create table if not exists public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid references public.products(id) on delete set null,
  -- snapshot of what was bought (survives product edits/deletes)
  title       text not null,
  slug        text,
  sku         text,
  price       numeric(12,2) not null,
  size        text,
  color       text,
  quantity    int not null check (quantity > 0),
  line_total  numeric(12,2) not null,
  created_at  timestamptz not null default now()
);
create index if not exists idx_order_items_order on public.order_items(order_id);

-- ============================================================================
-- payments  (records COD-on-delivery + advance bank transfers)
-- ============================================================================
create table if not exists public.payments (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  method      payment_method not null,
  amount      numeric(12,2) not null,
  status      payment_status not null default 'unpaid',
  reference   text,              -- bank transfer reference / TID
  proof_url   text,              -- uploaded receipt (Supabase Storage)
  paid_at     timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_payments_order on public.payments(order_id);

create trigger trg_payments_updated
  before update on public.payments
  for each row execute function public.set_updated_at();

-- ============================================================================
-- banners
-- ============================================================================
create table if not exists public.banners (
  id          uuid primary key default gen_random_uuid(),
  title       text,
  subtitle    text,
  image_url   text,
  link_url    text,
  placement   text not null default 'home_hero',  -- home_hero | strip | category
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  starts_at   timestamptz,
  ends_at     timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_banners_updated
  before update on public.banners
  for each row execute function public.set_updated_at();

-- ============================================================================
-- newsletter_subscribers
-- ============================================================================
create table if not exists public.newsletter_subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         citext not null unique,
  is_subscribed boolean not null default true,
  source        text,
  created_at    timestamptz not null default now()
);

-- ============================================================================
-- settings  (single-row-ish key/value store for site config)
-- ============================================================================
create table if not exists public.settings (
  key         text primary key,
  value       jsonb not null default '{}',
  updated_at  timestamptz not null default now()
);

create trigger trg_settings_updated
  before update on public.settings
  for each row execute function public.set_updated_at();

-- ============================================================================
-- activity_logs  (admin audit trail)
-- ============================================================================
create table if not exists public.activity_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  entity      text,
  entity_id   text,
  meta        jsonb not null default '{}',
  created_at  timestamptz not null default now()
);
create index if not exists idx_activity_created on public.activity_logs(created_at desc);


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


-- ============================================================================
-- Haneen Grace — Role grants
--
-- Postgres checks BOTH table GRANTs and RLS policies. RLS decides which *rows*
-- a role can touch; GRANTs decide whether the role can touch the table at all.
-- Supabase normally auto-grants these to anon/authenticated, but running the
-- schema via the SQL editor can skip it — so we grant explicitly. RLS (enabled
-- on every table) remains the real security boundary.
-- ============================================================================

grant usage on schema public to anon, authenticated;

-- Read: storefront is public; RLS still limits rows (active/published/own).
grant select on all tables in schema public to anon, authenticated;

-- Write: signed-in users; RLS limits them to their own rows.
grant insert, update, delete on all tables in schema public to authenticated;

-- Anonymous visitors may subscribe to the newsletter (RLS allows insert only).
grant insert on public.newsletter_subscribers to anon;

-- Server-side / admin role: full access (it also bypasses RLS).
grant all on all tables in schema public to service_role;

-- Any sequences (none today — all PKs are uuid — but future-proof).
grant usage, select on all sequences in schema public to anon, authenticated;
grant all on all sequences in schema public to service_role;

-- Keep future tables covered too.
alter default privileges in schema public
  grant select on tables to anon, authenticated;
alter default privileges in schema public
  grant insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant all on tables to service_role;
alter default privileges in schema public
  grant all on sequences to service_role;


-- ============================================================================
-- Haneen Grace — Phase 5: order lifecycle, logistics & timeline
-- Run in the Supabase SQL editor. Safe to re-run.
-- ============================================================================

-- 1) New lifecycle statuses (positioned within the enum ordering).
alter type order_status add value if not exists 'packed' after 'processing';
alter type order_status add value if not exists 'returned' after 'delivered';

-- 2) Fulfilment fields on orders.
alter table public.orders add column if not exists courier text;
alter table public.orders add column if not exists tracking_number text;
alter table public.orders add column if not exists internal_notes text;

-- 3) Order timeline events.
create table if not exists public.order_events (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  status     order_status,
  note       text,
  created_at timestamptz not null default now()
);
create index if not exists idx_order_events_order on public.order_events(order_id);

-- 4) Log status changes automatically.
create or replace function public.log_order_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.order_events(order_id, status, note)
    values (new.id, new.status, 'Order placed');
  elsif (tg_op = 'UPDATE' and new.status is distinct from old.status) then
    insert into public.order_events(order_id, status) values (new.id, new.status);
  end if;
  return null;
end $$;

drop trigger if exists trg_log_order_status on public.orders;
create trigger trg_log_order_status
  after insert or update on public.orders
  for each row execute function public.log_order_status();

-- 5) Backfill a timeline entry for orders that predate the trigger.
insert into public.order_events (order_id, status, note, created_at)
select o.id, o.status, 'Order placed', o.created_at
from public.orders o
where not exists (
  select 1 from public.order_events e where e.order_id = o.id
);

-- 6) RLS + grants (admin reads via service_role; customers see their own).
alter table public.order_events enable row level security;

drop policy if exists order_events_select_own on public.order_events;
create policy order_events_select_own on public.order_events
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_events.order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );

grant select on public.order_events to authenticated;
grant all on public.order_events to service_role;


-- ============================================================================
-- Haneen Grace — Phase 6: inventory adjustments & stock history
-- Run in the Supabase SQL editor. Safe to re-run.
-- ============================================================================

create table if not exists public.stock_adjustments (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products(id) on delete cascade,
  delta           int not null,               -- +restock / −damage etc.
  reason          text not null default 'manual',
  note            text,
  resulting_stock int not null,
  created_at      timestamptz not null default now()
);
create index if not exists idx_stock_adjustments_product
  on public.stock_adjustments(product_id, created_at desc);

alter table public.stock_adjustments enable row level security;

drop policy if exists stock_adjustments_admin on public.stock_adjustments;
create policy stock_adjustments_admin on public.stock_adjustments
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert on public.stock_adjustments to authenticated;
grant all on public.stock_adjustments to service_role;


-- ============================================================================
-- Haneen Grace — Seed data
-- Run AFTER 0001_initial_schema.sql and 0002_rls_policies.sql.
-- Safe to re-run: uses ON CONFLICT ... DO NOTHING / DO UPDATE.
-- ============================================================================

-- ---------- Categories ------------------------------------------------------
insert into public.categories (slug, name, tagline, description, accent, sort_order) values
  ('new-arrivals',       'New Arrivals',      'Fresh from the atelier',       'The latest expressions of modern modest luxury — freshly landed, ready to be yours.', '#e7d4b4', 1),
  ('luxury-pret',        'Luxury Pret',       'Ready to wear, ready to shine', 'Elevated ready-to-wear pieces in the finest fabrics, finished with couture-level detail.', '#d4b483', 2),
  ('casual-wear',        'Casual Wear',       'Everyday elegance',            'Effortless silhouettes for the everyday — comfort woven into quiet luxury.', '#d8cfc4', 3),
  ('formal-wear',        'Formal Wear',       'For moments that matter',      'Statement formals for weddings, soirées and celebrations that deserve to be remembered.', '#c9a56d', 4),
  ('festive-collection', 'Festive Collection','Celebrate in grace',           'Richly embellished festive wear crafted to make every occasion unforgettable.', '#b8925a', 5),
  ('sale',               'Season End Sale',   'Up to 40% off',                'Timeless elegance, now at irresistible prices. Limited pieces, limited time.', '#f7e7e6', 6)
on conflict (slug) do nothing;

-- ---------- Products --------------------------------------------------------
insert into public.products
  (slug, sku, title, short_description, description, price, sale_price, category_slug,
   collections, sizes, colors, swatch, stock, featured, best_seller, new_arrival,
   rating, review_count, tags)
values
  ('sage-serenity-embroidered-3-piece','HG-SS-1001','Sage Serenity Embroidered 3-Piece',
   'Hand-embroidered sage lawn with scalloped organza dupatta.',
   'A whisper of spring in every thread. This sage-green ensemble pairs intricately embroidered lawn with a scalloped organza dupatta and delicate lace finishing. Fully stitched, lined and finished by hand at our atelier.',
   18500, 13900, 'luxury-pret', '{new-arrivals,sale}', '{XS,S,M,L,XL}',
   '[{"name":"Sage","hex":"#c7d2b0"},{"name":"Ivory","hex":"#f2ece1"}]', '{"#dfe7cf","#b9c79f"}',
   12, true, true, true, 4.9, 128, '{embroidered,lawn,organza,3-piece}'),

  ('crimson-noor-festive-anarkali','HG-CN-1002','Crimson Noor Festive Anarkali',
   'Deep crimson anarkali with gold zardozi and pearl work.',
   'Command the room in Crimson Noor. A flowing anarkali silhouette layered with gold zardozi, pearl detailing and a chiffon dupatta — crafted for the moments that deserve to be remembered.',
   42000, null, 'festive-collection', '{formal-wear,new-arrivals}', '{XS,S,M,L,XL}',
   '[{"name":"Crimson","hex":"#9c1f2e"},{"name":"Wine","hex":"#6d1622"}]', '{"#b5273a","#7c1420"}',
   6, true, true, true, 5.0, 87, '{anarkali,zardozi,festive,wedding}'),

  ('ivory-grace-silk-kurta-set','HG-IG-1003','Ivory Grace Silk Kurta Set',
   'Pure ivory raw-silk kurta with printed silk trousers.',
   'Understated and endlessly elegant. Ivory Grace is a pure raw-silk kurta paired with printed silk straight trousers — modest luxury for the everyday and beyond.',
   22500, 16900, 'luxury-pret', '{casual-wear,sale}', '{XS,S,M,L,XL}',
   '[{"name":"Ivory","hex":"#f4efe6"},{"name":"Champagne","hex":"#e7d4b4"}]', '{"#f6f1e8","#e4d8c4"}',
   18, true, false, false, 4.8, 64, '{silk,kurta,minimal}'),

  ('olive-mirage-embellished-formal','HG-OM-1004','Olive Mirage Embellished Formal',
   'Olive net formal with sequin cascade and velvet border.',
   'Olive Mirage drapes you in depth. A sequin-cascaded net formal with a plush velvet border and gold accents — a modern heirloom for celebrations.',
   38900, null, 'formal-wear', '{festive-collection}', '{XS,S,M,L,XL}',
   '[{"name":"Olive","hex":"#5a5f34"},{"name":"Moss","hex":"#42461f"}]', '{"#6b7040","#464a24"}',
   4, false, true, true, 4.9, 51, '{net,sequin,formal,velvet}'),

  ('blush-petal-everyday-lawn','HG-BP-1005','Blush Petal Everyday Lawn',
   'Soft blush printed lawn 2-piece for daily grace.',
   'Blush Petal brings quiet joy to ordinary days. A soft floral-printed lawn two-piece, breathable and beautifully finished — the everyday essential you''ll reach for again and again.',
   9800, 6900, 'casual-wear', '{sale,new-arrivals}', '{XS,S,M,L,XL}',
   '[{"name":"Blush","hex":"#f2d5d2"},{"name":"Rose","hex":"#e6b8b4"}]', '{"#f7e2df","#ecc7c3"}',
   30, false, true, true, 4.7, 203, '{lawn,printed,casual,everyday}'),

  ('champagne-dream-bridal-lehenga','HG-CD-1006','Champagne Dream Bridal Lehenga',
   'Champagne-gold bridal lehenga with dabka & resham work.',
   'For the bride who is grace personified. Champagne Dream is a fully hand-worked bridal lehenga in dabka, resham and crystal — a once-in-a-lifetime piece from the Haneen Grace couture line.',
   165000, null, 'festive-collection', '{formal-wear}', '{XS,S,M,L,XL}',
   '[{"name":"Champagne","hex":"#e2cfa6"},{"name":"Antique Gold","hex":"#c9a56d"}]', '{"#ead9b6","#cbae7c"}',
   2, true, false, true, 5.0, 19, '{bridal,lehenga,couture,hand-work}'),

  ('midnight-jasmine-chiffon-saree','HG-MJ-1007','Midnight Jasmine Chiffon Saree',
   'Navy chiffon saree with silver thread jasmine motifs.',
   'Midnight Jasmine is poetry in motion — a fluid navy chiffon saree scattered with silver-thread jasmine motifs and a hand-finished blouse piece.',
   28500, 21900, 'formal-wear', '{sale}', '{Free}',
   '[{"name":"Midnight","hex":"#232a3d"},{"name":"Ink","hex":"#161b2a"}]', '{"#2c3450","#1a2032"}',
   9, false, false, false, 4.8, 42, '{saree,chiffon,formal}'),

  ('rosewater-luxe-organza-3-piece','HG-RL-1008','Rosewater Luxe Organza 3-Piece',
   'Powder-pink organza with thread embroidery & sheesha.',
   'Rosewater Luxe is delicate strength. Powder-pink organza layered over cotton silk, alive with thread embroidery and mirror sheesha — luxury pret at its most feminine.',
   32000, null, 'luxury-pret', '{festive-collection,new-arrivals}', '{XS,S,M,L,XL}',
   '[{"name":"Rosewater","hex":"#f0d7d9"},{"name":"Petal","hex":"#e3bcc0"}]', '{"#f4dee0","#e1bcc0"}',
   7, true, true, true, 4.9, 76, '{organza,embroidered,sheesha,luxury}'),

  ('sandstone-comfort-cotton-set','HG-SC-1009','Sandstone Comfort Cotton Set',
   'Warm sandstone cotton co-ord with wooden buttons.',
   'Sandstone Comfort is the ease you deserve. A warm-toned cotton co-ord with wooden button detailing and relaxed tailoring — modest, breathable, effortless.',
   8500, null, 'casual-wear', '{new-arrivals}', '{XS,S,M,L,XL}',
   '[{"name":"Sandstone","hex":"#d8c3a5"},{"name":"Camel","hex":"#c2a680"}]', '{"#e0ccae","#c8ab84"}',
   24, false, false, true, 4.6, 58, '{cotton,co-ord,casual}'),

  ('emerald-empress-velvet-shawl-set','HG-EE-1010','Emerald Empress Velvet Shawl Set',
   'Emerald velvet suit with tilla-worked pashmina shawl.',
   'Emerald Empress is winter royalty. A rich emerald velvet suit finished with a tilla-embroidered pashmina shawl — warmth and grandeur in equal measure.',
   54000, 43200, 'festive-collection', '{formal-wear,sale}', '{XS,S,M,L,XL}',
   '[{"name":"Emerald","hex":"#1f5c46"},{"name":"Forest","hex":"#123f30"}]', '{"#256b52","#123f30"}',
   5, true, false, false, 4.9, 33, '{velvet,shawl,tilla,winter}'),

  ('pearl-whisper-formal-gown','HG-PW-1011','Pearl Whisper Formal Gown',
   'Ivory pearl-embellished flared gown with cape sleeves.',
   'Pearl Whisper is a modern fairytale. An ivory flared gown with cascading pearl embellishment and graceful cape sleeves — modest glamour for the evening.',
   46500, null, 'formal-wear', '{luxury-pret,new-arrivals}', '{XS,S,M,L,XL}',
   '[{"name":"Pearl","hex":"#efe9dd"},{"name":"Champagne","hex":"#e2cfa6"}]', '{"#f1ebe0","#e2cfa6"}',
   8, false, true, true, 4.8, 61, '{gown,pearl,formal,evening}'),

  ('terracotta-sunset-printed-lawn','HG-TS-1012','Terracotta Sunset Printed Lawn',
   'Terracotta digital-print lawn 3-piece with chiffon dupatta.',
   'Terracotta Sunset captures golden hour. A warm digital-print lawn three-piece with a soft chiffon dupatta — vibrant, breezy and effortlessly graceful.',
   11200, 7900, 'casual-wear', '{sale,new-arrivals}', '{XS,S,M,L,XL}',
   '[{"name":"Terracotta","hex":"#c1704b"},{"name":"Clay","hex":"#a85a38"}]', '{"#cf7f59","#a85a38"}',
   21, false, true, true, 4.7, 142, '{lawn,digital-print,casual,3-piece}')
on conflict (slug) do nothing;

-- ---------- Coupons ---------------------------------------------------------
insert into public.coupons (code, description, discount_type, amount, min_order, is_active) values
  ('GRACE10',  'Welcome offer — 10% off your first order',       'percent', 10, 0,     true),
  ('FESTIVE15','Festive season — 15% off orders over PKR 25,000', 'percent', 15, 25000, true),
  ('FREESHIP', 'Free shipping on any order',                      'fixed',   350, 0,   true)
on conflict (code) do nothing;

-- ---------- Banners ---------------------------------------------------------
insert into public.banners (title, subtitle, image_url, link_url, placement, sort_order, is_active) values
  ('Season End Sale', 'Up to 40% off — timeless elegance, irresistible prices', '/brand/hero-banner.png', '/shop/sale', 'home_hero', 1, true)
on conflict do nothing;

-- ---------- Settings --------------------------------------------------------
insert into public.settings (key, value) values
  ('store', '{
    "name": "Haneen Grace",
    "tagline": "Luxury Pret • Modest Wear",
    "currency": "PKR",
    "free_shipping_threshold": 15000,
    "shipping_fee": 350,
    "cod_enabled": true,
    "advance_payment_enabled": true,
    "advance_percent": 30,
    "phone": "+92 300 0000000",
    "email": "hello@haneengrace.com",
    "whatsapp": "+92 300 0000000",
    "instagram": "https://instagram.com/haneengrace"
  }'::jsonb)
on conflict (key) do update set value = excluded.value;

-- ---------- Bootstrap an admin ---------------------------------------------
-- After you sign up in the app, promote your account to admin by email:
--   update public.profiles set role = 'admin'
--   where email = 'you@example.com';
