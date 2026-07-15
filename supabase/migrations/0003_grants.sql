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
