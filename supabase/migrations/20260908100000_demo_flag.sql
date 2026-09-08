-- Demodata herkenbaar maken.
--
-- Zolang er geen echte koppeling is vult `store.js` de tabellen met demodata.
-- Zodra de eerste connector echte rijen schrijft moet de demo eruit kunnen,
-- en dat kan alleen als je aan een rij ziet waar hij vandaan komt.
--
-- Alles wat er nu staat is demo, dus bestaande rijen krijgen true.
-- `waitlist` en `profiles` blijven zoals ze zijn: die worden niet gevuld met
-- demodata. `own_items` ook niet, want dat maakt de gebruiker zelf.

do $$
declare
  t text;
  tables text[] := array[
    'subjects', 'user_sources', 'weeks', 'lessons', 'assignments', 'grades',
    'groups', 'group_members', 'group_tasks', 'group_files', 'group_messages',
    'attendance', 'notifications'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I add column is_demo boolean not null default false', t);
    execute format('update public.%I set is_demo = true', t);
    execute format('create index %I on public.%I (user_id, is_demo)', t || '_is_demo_idx', t);
  end loop;
end $$;
