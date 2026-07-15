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
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

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
