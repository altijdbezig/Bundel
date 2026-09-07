-- Een week heeft vijf dagen, ook als er geen les is. De datums horen dus bij de week
-- en niet bij de lessen, anders verdwijnt een lege dag uit het rooster.
alter table public.weeks add column day_dates text[] not null default '{}';
