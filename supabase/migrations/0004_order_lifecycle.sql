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
