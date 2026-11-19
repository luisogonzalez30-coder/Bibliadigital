-- Santuario · origen de las visitas (utm) en la analítica anónima
-- Ejecutar DESPUÉS de 02_analitica.sql. Las etiquetas son sólo [a-z0-9_-] (sin texto libre ni datos personales).

alter table public.app_events
  add column utm_source   text check (utm_source   is null or utm_source   ~ '^[a-z0-9_-]{1,40}$'),
  add column utm_medium   text check (utm_medium   is null or utm_medium   ~ '^[a-z0-9_-]{1,40}$'),
  add column utm_campaign text check (utm_campaign is null or utm_campaign ~ '^[a-z0-9_-]{1,60}$'),
  add column utm_content  text check (utm_content  is null or utm_content  ~ '^[a-z0-9_-]{1,60}$');

create index app_events_utm_idx on public.app_events (utm_campaign, utm_content)
  where utm_campaign is not null or utm_content is not null;

-- admin_overview ahora incluye 'sources': dispositivos, instalaciones y lecturas por origen.
create or replace function public.admin_overview(p_days integer default 30)
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
           utm_source, utm_medium, utm_campaign, utm_content,
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
  sources as (
    select coalesce(utm_source, '(sin origen)')   as source,
           coalesce(utm_campaign, '-')            as campaign,
           coalesce(utm_content, '-')             as content,
           count(distinct device_id)                                  as devices,
           count(distinct device_id) filter (where event = 'install') as installs,
           count(*) filter (where event = 'read')                     as reads
    from ev
    where day > v_today - v_days
      and (utm_source is not null or utm_campaign is not null or utm_content is not null)
    group by 1, 2, 3
    order by devices desc, installs desc
    limit 30
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
    'sources',   coalesce((select jsonb_agg(to_jsonb(sources)) from sources), '[]'::jsonb),
    'users',     coalesce((select jsonb_agg(to_jsonb(users)) from users), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_overview(integer) from public, anon;
grant execute on function public.admin_overview(integer) to authenticated;
