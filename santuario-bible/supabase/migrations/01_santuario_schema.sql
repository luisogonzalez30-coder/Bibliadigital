-- Santuario · esquema inicial
-- Regla de Oro: el texto bíblico es inmutable y verificable por hash SHA-256.

-- ───────────── verses: catálogo canónico (lectura pública) ─────────────
create table public.verses (
  id                  text primary key,
  book_osis           text not null,
  book_name_es        text not null,
  book_name_en        text not null,
  chapter             integer not null check (chapter > 0),
  verse_number        text not null check (verse_number ~ '^[0-9]+(-[0-9]+)?$'),
  testament_category  text not null
    check (testament_category in ('TORAH', 'OT_PROPHETS_WRITINGS', 'DEUTEROCANONICAL', 'NT')),
  text_es             text not null check (length(text_es) > 0),
  text_en             text not null check (length(text_en) > 0),
  version_es          text not null,
  version_en          text not null,
  allowed_traditions  text[] not null
    check (allowed_traditions <@ array['catholic', 'protestant', 'torah', 'universal']::text[]
           and cardinality(allowed_traditions) > 0),
  emotion_tags        text[] not null default '{}'
    check (emotion_tags <@ array['ansiedad', 'gratitud', 'duelo', 'cansancio', 'sabiduria']::text[]),
  -- sha256(text_es || '|' || text_en) en hex, idéntico al calculado por el seed.
  sha256_hash         text not null check (sha256_hash ~ '^[0-9a-f]{64}$'),
  created_at          timestamptz not null default now(),
  constraint verses_hash_matches_text check (
    sha256_hash = encode(sha256(convert_to(text_es || '|' || text_en, 'UTF8')), 'hex')
  )
);

create index verses_book_chapter_idx on public.verses (book_osis, chapter);
create index verses_traditions_idx on public.verses using gin (allowed_traditions);
create index verses_emotions_idx on public.verses using gin (emotion_tags);

-- Inmutabilidad: el texto, la versión y el hash nunca se modifican después de insertados.
create function public.verses_block_text_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.text_es is distinct from old.text_es
     or new.text_en is distinct from old.text_en
     or new.version_es is distinct from old.version_es
     or new.version_en is distinct from old.version_en
     or new.sha256_hash is distinct from old.sha256_hash then
    raise exception 'El texto bíblico es inmutable (verse id: %)', old.id;
  end if;
  return new;
end;
$$;

create trigger verses_immutable_text
  before update on public.verses
  for each row execute function public.verses_block_text_update();

alter table public.verses enable row level security;

-- Lectura pública; sin políticas de escritura: sólo service_role (bypass de RLS) puede cargar el catálogo.
create policy "verses_public_read"
  on public.verses for select
  to anon, authenticated
  using (true);

-- ───────────── user_profiles: preferencias y Racha de Luz ─────────────
create table public.user_profiles (
  user_id               uuid primary key references auth.users (id) on delete cascade,
  tradition             text not null default 'universal'
    check (tradition in ('catholic', 'protestant', 'torah', 'universal')),
  show_parallel_english boolean not null default false,
  dark_mode             boolean not null default false,
  current_streak        integer not null default 0 check (current_streak >= 0),
  longest_streak        integer not null default 0 check (longest_streak >= current_streak),
  last_read_date        date,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create function public.user_profiles_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_profiles_touch
  before update on public.user_profiles
  for each row execute function public.user_profiles_touch_updated_at();

alter table public.user_profiles enable row level security;

create policy "profiles_select_own"
  on public.user_profiles for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "profiles_insert_own"
  on public.user_profiles for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "profiles_update_own"
  on public.user_profiles for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ───────────── user_bookmarks: favoritos por usuario ─────────────
create table public.user_bookmarks (
  user_id    uuid not null references auth.users (id) on delete cascade,
  verse_id   text not null references public.verses (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, verse_id)
);

create index user_bookmarks_verse_idx on public.user_bookmarks (verse_id);

alter table public.user_bookmarks enable row level security;

create policy "bookmarks_select_own"
  on public.user_bookmarks for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "bookmarks_insert_own"
  on public.user_bookmarks for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "bookmarks_delete_own"
  on public.user_bookmarks for delete
  to authenticated
  using ((select auth.uid()) = user_id);
