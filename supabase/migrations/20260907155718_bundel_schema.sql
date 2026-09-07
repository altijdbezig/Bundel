-- Bundel schema. Alle tabellen horen bij een gebruiker en zijn afgeschermd met RLS.
-- Tweetalige tekst staat in twee kolommen: _nl en _en.

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default '',
  initials text not null default '',
  course_nl text not null default '',
  course_en text not null default '',
  start_screen text not null default '/app',
  notifications_on boolean not null default true,
  notify_deadline boolean not null default true,
  notify_grade boolean not null default true,
  notify_message boolean not null default true,
  notify_schedule boolean not null default true,
  seeded_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  key text not null,
  name_nl text not null,
  name_en text not null,
  teacher text,
  unique (user_id, key)
);

create table public.user_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  key text not null,
  connected boolean not null default true,
  reachable boolean not null default true,
  last_sync text,
  synced_at timestamptz,
  unique (user_id, key)
);

create table public.weeks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  idx integer not null,
  number integer not null,
  range_nl text not null,
  range_en text not null,
  note_nl text,
  note_en text,
  unique (user_id, idx)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  week_idx integer not null,
  day_idx integer not null,
  on_date text not null,
  start_time text not null,
  end_time text not null,
  subject_key text not null,
  room text
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  key text not null,
  title_nl text not null,
  title_en text not null,
  subject_key text not null,
  source text not null,
  due_nl text,
  due_en text,
  due_date text,
  due_time text,
  urgent boolean not null default false,
  done boolean not null default false,
  unique (user_id, key)
);

create table public.grades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  key text not null,
  subject_key text not null,
  value numeric(3,1) not null,
  on_date text not null,
  weight integer not null default 1,
  what_nl text not null,
  what_en text not null,
  remark_nl text,
  remark_en text,
  unique (user_id, key)
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  key text not null,
  name_nl text not null,
  name_en text not null,
  subject_key text not null,
  unique (user_id, key)
);

create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  group_key text not null,
  name text not null,
  initials text not null,
  is_self boolean not null default false,
  position integer not null default 0
);

create table public.group_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  group_key text not null,
  key text not null,
  who text not null,
  done boolean not null default false,
  body_nl text not null,
  body_en text not null,
  position integer not null default 0,
  unique (user_id, key)
);

create table public.group_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  group_key text not null,
  name text not null,
  uploaded_by text not null,
  size_label text not null,
  added_nl text not null,
  added_en text not null,
  position integer not null default 0
);

create table public.group_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  group_key text not null,
  sender text not null,
  initials text not null,
  at_time text not null,
  day_nl text,
  day_en text,
  is_self boolean not null default false,
  body_nl text not null,
  body_en text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  on_date text not null,
  at_time text not null,
  status text not null check (status in ('present', 'late', 'excused', 'absent')),
  minutes integer,
  reason_nl text,
  reason_en text,
  unique (user_id, on_date, at_time)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  key text not null,
  kind text not null,
  source text not null,
  at_time text not null,
  title_nl text not null,
  title_en text not null,
  body_nl text,
  body_en text,
  target text not null,
  is_read boolean not null default false,
  position integer not null default 0,
  unique (user_id, key)
);

create table public.own_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  kind text not null,
  title text not null,
  week_idx integer not null,
  day_idx integer not null,
  start_time text not null,
  end_time text,
  weekly boolean not null default false,
  created_at timestamptz not null default now()
);

-- De wachtlijst hoort bij niemand. Iedereen mag zich aanmelden, niemand mag hem lezen.
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  lang text not null default 'nl',
  created_at timestamptz not null default now()
);

-- RLS: elke rij is alleen van de eigenaar. Voor alle tabellen met user_id in een keer.
do $$
declare
  t text;
  tables text[] := array[
    'subjects', 'user_sources', 'weeks', 'lessons', 'assignments', 'grades',
    'groups', 'group_members', 'group_tasks', 'group_files', 'group_messages',
    'attendance', 'notifications', 'own_items'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create index %I on public.%I (user_id)', t || '_user_id_idx', t);
    execute format('create policy "own rows are readable" on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t);
    execute format('create policy "own rows are insertable" on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "own rows are updatable" on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "own rows are deletable" on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', t);
  end loop;
end $$;

alter table public.profiles enable row level security;

create policy "own profile is readable" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

create policy "own profile is insertable" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

create policy "own profile is updatable" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

alter table public.waitlist enable row level security;

create policy "anyone can sign up" on public.waitlist
  for insert to anon, authenticated with check (true);
