-- Level-2 migration: pisahkan session_date dari created_at,
-- tambah session_id + metadata multi-device, dan siapkan tabel sessions.

begin;

alter table public.orders
  add column if not exists session_date date,
  add column if not exists session_id text,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists last_device_id text;

create table if not exists public.sessions (
  id text primary key,
  business_date date not null,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  opened_by text,
  closed_by text,
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_session_date on public.orders(session_date);
create index if not exists idx_orders_session_date_status on public.orders(session_date, status);
create index if not exists idx_orders_session_id on public.orders(session_id);
create index if not exists idx_orders_updated_at on public.orders(updated_at desc);
create index if not exists idx_sessions_business_date on public.sessions(business_date desc);
create index if not exists idx_sessions_status on public.sessions(status);

-- Satu sesi open global pada satu waktu.
create unique index if not exists uq_sessions_single_open
  on public.sessions ((status))
  where status = 'open';

-- Backfill session_date dari struktur lama.
update public.orders
set session_date = coalesce(
  session_date,
  case
    when created_at is null then null
    else nullif(left(created_at::text, 10), '')::date
  end,
  case
    when paid_at is null then null
    else nullif(left(paid_at::text, 10), '')::date
  end
)
where session_date is null;

create or replace function public.tg_orders_fill_session_date()
returns trigger
language plpgsql
as $$
begin
  if new.session_date is null then
    new.session_date := coalesce(
      case when new.created_at is null then null else nullif(left(new.created_at::text, 10), '')::date end,
      case when new.paid_at is null then null else nullif(left(new.paid_at::text, 10), '')::date end
    );
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_orders_fill_session_date on public.orders;
create trigger trg_orders_fill_session_date
before insert or update on public.orders
for each row
execute function public.tg_orders_fill_session_date();

create or replace function public.tg_sessions_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_sessions_touch_updated_at on public.sessions;
create trigger trg_sessions_touch_updated_at
before update on public.sessions
for each row
execute function public.tg_sessions_touch_updated_at();

-- Sinkronkan tabel sessions bila order baru membawa session_id + session_date.
create or replace function public.tg_orders_sync_session_row()
returns trigger
language plpgsql
as $$
begin
  if new.session_id is not null and new.session_date is not null then
    insert into public.sessions (id, business_date, opened_at, status)
    values (
      new.session_id,
      new.session_date,
      now(),
      case when new.status = 'open' then 'open' else 'closed' end
    )
    on conflict (id) do update
      set business_date = excluded.business_date,
          updated_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists trg_orders_sync_session_row on public.orders;
create trigger trg_orders_sync_session_row
after insert or update of session_id, session_date, status on public.orders
for each row
execute function public.tg_orders_sync_session_row();

-- Backfill sessions dari data order yang sudah punya session_id.
insert into public.sessions (id, business_date, opened_at, status)
select distinct
  o.session_id,
  o.session_date,
  now() as opened_at,
  case when exists (
    select 1 from public.orders ox
    where ox.session_id = o.session_id
      and ox.status = 'open'
  ) then 'open' else 'closed' end as status
from public.orders o
where o.session_id is not null
  and o.session_date is not null
on conflict (id) do update
  set business_date = excluded.business_date,
      status = excluded.status,
      updated_at = now();

commit;
