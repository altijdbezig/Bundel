-- De tussenstand van een OAuth-flow.
--
-- Tussen het wegsturen naar Microsoft en het terugkomen op de redirect moeten
-- twee dingen ergens staan: de `state` en de PKCE `code_verifier`. Ze horen bij
-- elkaar en bij een gebruiker, en ze zijn maar een paar minuten geldig.
--
-- Waarom een tabel en niet een cookie of een sessie in het geheugen: een cookie
-- gaat langs de browser en de code_verifier hoort de browser nooit te zien.
-- Geheugen werkt niet zodra er meer dan een proces draait. Een tabel met een
-- korte TTL is het eenvoudigste dat werkt zonder extra infrastructuur.
--
-- `state` is de CSRF-bescherming van de flow. Zonder controle daarop kan iemand
-- anders zijn koppeling aan jouw account hangen: hij start de flow, stuurt jou
-- zijn callback-URL, en jouw browser levert zijn code in onder jouw sessie.
-- Daarom: minstens 32 bytes willekeur, eenmalig te gebruiken, en na gebruik
-- meteen weg. Ook als het misging.
--
-- De `code_verifier` staat hier in platte tekst. Dat kan, want de rij leeft tien
-- minuten en alleen de service role komt erbij. Versleutelen zou hier weinig
-- toevoegen: de sleutel staat op dezelfde server als de code die hem leest.

create table public.oauth_state (
  state text primary key,
  code_verifier text not null,
  user_id uuid not null references auth.users on delete cascade,
  source text not null check (source in ('canvas', 'microsoft')),
  redirect_to text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index oauth_state_expires_at_idx on public.oauth_state (expires_at);
create index oauth_state_user_id_idx on public.oauth_state (user_id);

alter table public.oauth_state enable row level security;

-- Geen enkele policy, dus met RLS aan komt niemand met een gewone sleutel bij
-- deze rijen. De service role gaat langs RLS heen en is de enige die hem leest
-- en schrijft. De rechten hieronder maken dat ook expliciet: Supabase geeft
-- nieuwe tabellen standaard rechten aan anon en authenticated, en die nemen we
-- hier meteen weer terug.
revoke all on public.oauth_state from anon, authenticated;

-- Verlopen rijen opruimen. De server roept dit aan bij elke start van een flow,
-- dus er is geen aparte planner voor nodig. Security definer, want de aanroeper
-- heeft zelf geen rechten op de tabel.
create or replace function public.cleanup_oauth_state()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  removed integer;
begin
  delete from public.oauth_state where expires_at < now();
  get diagnostics removed = row_count;
  return removed;
end;
$$;

-- Alleen de service role mag hem aanroepen. Zonder deze regel kan iedereen met
-- de anon key hem via de API afvuren.
revoke all on function public.cleanup_oauth_state() from public, anon, authenticated;
