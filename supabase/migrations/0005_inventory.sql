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
