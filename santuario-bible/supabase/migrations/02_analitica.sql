-- Santuario · analítica propia, anónima y opcional
-- Eventos sin datos personales (ID aleatorio por dispositivo) + panel de administración protegido.
-- Ejecutar DESPUÉS de 01_santuario_schema.sql.

-- ───────────── app_events: sólo inserción desde el navegador ─────────────
create table public.app_events (
  id          bigint generated always as identity primary key,
  device_id   uuid not null,
  event       text not null check (event in ('open', 'install', 'read')),
  path        text check (path is null or char_length(path) <= 120),
  standalone  boolean not null default false,
  created_at  timestamptz not null default now()
);

create index app_events_created_idx on public.app_events (created_at);
create index app_events_device_idx  on public.app_events (device_id, created_at);
create index app_events_event_idx   on public.app_events (event, created_at);

alter table public.app_events enable row level security;

-- Cualquiera puede insertar un evento válido; nadie puede leer, editar ni borrar desde el navegador.
create policy "events_insert_only"
  on public.app_events for insert
  to anon, authenticated
  with check (event in ('open', 'install', 'read'));

revoke all on public.app_events from anon, authenticated;
grant insert on public.app_events to anon, authenticated;

-- ───────────── admins: quién puede ver el panel ─────────────
create table public.admins (
  email text primary key check (email = lower(email))
);
alter table public.admins enable row level security; -- sin políticas: sólo service_role / SQL Editor
revoke all on public.admins from anon, authenticated;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a
    where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ───────────── admin_overview: todas las métricas en una llamada ─────────────
create function public.admin_overview(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_days   integer := greatest(1, least(coalesce(p_days, 30), 365));
  v_tz     constant text := 'America/Santiago';
  v_today  date := (now() at time zone v_tz)::date;
  result   jsonb;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  with ev as (
    select device_id, event, path, standalone,
           (created_at at time zone v_tz)::date as day
    from public.app_events
  ),
  first_seen as (
    select device_id, min(day) as first_day from ev group by device_id
  ),
  days as (
    select generate_series(v_today - (v_days - 1), v_today, interval '1 day')::date as day
  ),
  dau as (
    select d.day, count(distinct e.device_id) filter (where e.event = 'open') as devices
    from days d left join ev e on e.day = d.day
    group by d.day order by d.day
  ),
  inst as (
    select d.day, count(distinct e.device_id) filter (where e.event = 'install') as installs
    from days d left join ev e on e.day = d.day
    group by d.day order by d.day
  ),
  ret as (
    select n,
           count(*) filter (where f.first_day <= v_today - n)                         as base,
           count(*) filter (where f.first_day <= v_today - n and exists (
             select 1 from ev e where e.device_id = f.device_id
               and e.event = 'open' and e.day = f.first_day + n))                      as returned
    from first_seen f, unnest(array[1, 7, 30]) as n
    group by n order by n
  ),
  top_paths as (
    select path, count(*) as views
    from ev
    where event = 'read' and path is not null and day > v_today - v_days
    group by path order by views desc, path limit 15
  ),
  users as (
    select u.email::text as email, u.created_at, p.current_streak, p.longest_streak,
           p.last_read_date, p.tradition
    from auth.users u
    left join public.user_profiles p on p.user_id = u.id
    order by p.last_read_date desc nulls last, u.created_at desc
    limit 200
  )
  select jsonb_build_object(
    'generated_at', now(),
    'days', v_days,
    'totals', jsonb_build_object(
      'devices',    (select count(*) from first_seen),
      'installs',   (select count(distinct device_id) from ev where event = 'install'),
      'standalone_devices', (select count(distinct device_id) from ev where standalone),
      'registered', (select count(*) from auth.users),
      'dau_today',  (select count(distinct device_id) from ev where event = 'open' and day = v_today),
      'wau',        (select count(distinct device_id) from ev where event = 'open' and day > v_today - 7),
      'mau',        (select count(distinct device_id) from ev where event = 'open' and day > v_today - 30)
    ),
    'dau',       coalesce((select jsonb_agg(jsonb_build_object('day', day, 'devices', devices) order by day) from dau), '[]'::jsonb),
    'installs_by_day', coalesce((select jsonb_agg(jsonb_build_object('day', day, 'installs', installs) order by day) from inst), '[]'::jsonb),
    'retention', coalesce((select jsonb_agg(jsonb_build_object('day', n, 'base', base, 'returned', returned) order by n) from ret), '[]'::jsonb),
    'top_paths', coalesce((select jsonb_agg(jsonb_build_object('path', path, 'views', views) order by views desc, path) from top_paths), '[]'::jsonb),
    'users',     coalesce((select jsonb_agg(to_jsonb(users)) from users), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_overview(integer) from public, anon;
grant execute on function public.admin_overview(integer) to authenticated;

-- Para dar acceso al panel (ejecutar a mano, con tu correo en minúsculas):
--   insert into public.admins (email) values ('tu@correo.com');
