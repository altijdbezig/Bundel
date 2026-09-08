-- Koppelingen met een bron, en de tokens die daarbij horen.
--
-- Een rij per gebruiker per bron. `source` is de aanbieder waar je inlogt,
-- niet het tabblad in de app: `microsoft` levert de bron Teams, en Magister
-- heeft nog geen koppeling omdat er geen open aanmeldweg voor is.
--
-- Tokens staan versleuteld in de kolommen met het achtervoegsel `_encrypted`.
-- Versleutelen en ontsleutelen gebeurt in `server/src/crypto/tokens.ts`, met
-- een sleutel die alleen de server kent. Er komt nooit een token in platte
-- tekst in deze tabel, en nooit een token in een log.

create table public.connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  source text not null check (source in ('canvas', 'microsoft')),
  external_account_id text,
  status text not null default 'active' check (status in ('active', 'expired', 'revoked', 'error')),
  scopes text[] not null default '{}',
  connected_at timestamptz not null default now(),
  last_synced_at timestamptz,
  last_error text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz
);

create index connections_user_id_idx on public.connections (user_id);
create unique index connections_user_id_source_idx on public.connections (user_id, source);

alter table public.connections enable row level security;

create policy "own rows are readable" on public.connections
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "own rows are insertable" on public.connections
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "own rows are updatable" on public.connections
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "own rows are deletable" on public.connections
  for delete to authenticated using ((select auth.uid()) = user_id);

-- De app mag zien dat er een koppeling is, welke status hij heeft en wanneer
-- hij voor het laatst liep. Bij de twee tokenkolommen komt de browser niet,
-- ook niet versleuteld. Alleen de server leest en schrijft die.
--
-- RLS gaat over rijen, dus dit gaat over kolommen. Let op de volgorde: een
-- recht op de hele tabel dekt alle kolommen, en een revoke op een losse kolom
-- haalt dat niet weg. Daarom eerst alles terugnemen, daarna per kolom
-- teruggeven. Supabase geeft nieuwe tabellen standaard rechten op de hele
-- tabel, dus zonder deze eerste regel doet de rest niets.
revoke all on public.connections from anon, authenticated;

grant select (id, user_id, source, external_account_id, status, scopes, connected_at,
              last_synced_at, last_error, token_expires_at)
  on public.connections to authenticated;

grant insert (id, user_id, source, external_account_id, status, scopes, connected_at,
              last_synced_at, last_error, token_expires_at)
  on public.connections to authenticated;

grant update (external_account_id, status, scopes, last_synced_at, last_error, token_expires_at)
  on public.connections to authenticated;

grant delete on public.connections to authenticated;
