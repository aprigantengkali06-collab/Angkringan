-- Hardening realtime multi-device untuk Angkringan.
-- Jalankan sekali di SQL Editor Supabase.

begin;

alter table if exists public.orders replica identity full;
alter table if exists public.expenses replica identity full;
alter table if exists public.menus replica identity full;
alter table if exists public.kasirs replica identity full;
alter table if exists public.mitras replica identity full;
alter table if exists public.settings replica identity full;
alter table if exists public.sessions replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'expenses'
  ) then
    alter publication supabase_realtime add table public.expenses;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'menus'
  ) then
    alter publication supabase_realtime add table public.menus;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'kasirs'
  ) then
    alter publication supabase_realtime add table public.kasirs;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'mitras'
  ) then
    alter publication supabase_realtime add table public.mitras;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'settings'
  ) then
    alter publication supabase_realtime add table public.settings;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'sessions'
  ) then
    alter publication supabase_realtime add table public.sessions;
  end if;
end $$;

create index if not exists idx_orders_status_updated_at on public.orders(status, updated_at desc);
create index if not exists idx_orders_session_status_updated_at on public.orders(session_date, status, updated_at desc);
create index if not exists idx_expenses_date_desc on public.expenses(date desc);
create index if not exists idx_settings_key on public.settings(key);

commit;
