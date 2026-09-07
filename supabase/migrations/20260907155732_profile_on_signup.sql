-- Elk nieuw account krijgt meteen een profiel. De naam komt uit het aanmeldformulier,
-- en anders uit het deel van het adres voor de apenstaart.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  full_name text;
  parts text[];
begin
  full_name := coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1));
  parts := regexp_split_to_array(trim(full_name), '\s+');

  insert into public.profiles (id, name, initials, course_nl, course_en)
  values (
    new.id,
    full_name,
    upper(
      left(parts[1], 1) ||
      case when array_length(parts, 1) > 1 then left(parts[array_length(parts, 1)], 1) else '' end
    ),
    '',
    ''
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
