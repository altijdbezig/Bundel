# server

De kant van Bundel die met de bronnen praat.

Wat werkt: de OAuth-flow naar Microsoft, van inloggen tot en met het opslaan van
versleutelde tokens in `connections`, en het opnieuw gebruiken van die tokens
zonder dat de gebruiker nog een keer hoeft in te loggen. Wat nog niet werkt: er
wordt geen enkele les, opdracht of bericht opgehaald. Dat is met opzet, zodat de
inlogkant af is voordat er data overheen gaat.

## Waarom dit niet in `web/` staat

`web/` is een Vite-app. Alles wat daarin terechtkomt wordt gebouwd tot bestanden
die de browser downloadt, ook wat er niet in hoort. Drie dingen kunnen daarom
niet aan die kant staan:

1. **De client secrets van Canvas en Microsoft.** Die horen bij de server, niet
   bij de gebruiker. Zet je ze in `web/`, dan staan ze in de gedownloade code.
   Alleen `VITE_`-variabelen komen daar terecht, en dat is precies het punt:
   die zijn niet geheim.
2. **De sleutel waarmee tokens versleuteld worden.** Zelfde verhaal, maar
   ernstiger: met die sleutel is elke opgeslagen koppeling te openen.
3. **De service role key van Supabase.** Die gaat langs RLS heen. In de browser
   zou iedereen daarmee bij de rijen van iedereen kunnen.

De app in `web/` blijft dus lezen wat er in de database staat. Deze map is wat
die database vult.

## Wat er staat

```
server/
├─ README.md
├─ package.json          geen afhankelijkheden, tests draaien op node zelf
├─ tsconfig.json
├─ .env.example          welke variabelen nodig zijn, zonder waarden
├─ scripts/
│  └─ verify-connection.ts   controleert of een opgeslagen koppeling nog leeft
└─ src/
   ├─ index.ts           start de server, verder niets
   ├─ http/
   │  ├─ router.ts       de drie endpoints, los van node:http
   │  ├─ server.ts       de adapter naar node:http
   │  ├─ user.ts         welke gebruiker hoort bij dit Supabase-token
   │  └─ router.test.ts
   ├─ store/             de enige kant die de service role key gebruikt
   │  ├─ client.ts       Supabase over PostgREST, met fetch
   │  ├─ connections.ts  de tabel `connections`, en de echte `TokenStore`
   │  ├─ oauth-state.ts  state en code_verifier tussen wegsturen en terugkomen
   │  └─ connections.test.ts · oauth-state.test.ts
   ├─ connectors/
   │  ├─ types.ts        het contract: wat een connector is en teruggeeft
   │  ├─ index.ts        de registry en `runConnector()`
   │  ├─ index.test.ts
   │  └─ microsoft/      de bron die in de app Teams heet
   │     ├─ auth.ts      OAuth2 met PKCE tegen Entra: inloggen, inwisselen, verversen
   │     ├─ client.ts    Graph met automatisch verversen, 429 en Retry-After
   │     ├─ index.ts     de connector zelf, meldt zich aan bij de registry
   │     └─ auth.test.ts · client.test.ts · connector.test.ts
   └─ crypto/
      ├─ tokens.ts       versleutelen en ontsleutelen met een sleutel uit de omgeving
      └─ tokens.test.ts
```

## De endpoints

| Endpoint | Wat het doet |
|---|---|
| `GET /auth/microsoft/start` | Controleert de sessie, maakt een PKCE-paar en een state, legt die vast en stuurt door naar Microsoft. |
| `GET /auth/microsoft/callback` | Valideert de state, wisselt de code in, slaat de tokens versleuteld op en ruimt de state op. |
| `GET /health` | Zegt alleen dat de server draait. |

### Waarom `node:http` en geen framework

`server/` heeft geen afhankelijkheden. Dat is de reden dat node de TypeScript
zelf draait, dat er geen lockfile is en dat de CI-stap niets hoeft te
installeren. Voor drie GET-endpoints zonder body, zonder middleware en zonder
validatieschema levert Fastify daar niets voor terug. Komt er later een echte
API bij met veel routes en bodies, dan is Fastify een prima ruil. Nu zou het
alleen een installatiestap toevoegen.

Alle logica staat in `http/router.ts`, en die kent geen node:http. Een test
roept hem rechtstreeks aan met een methode, een URL en headers, en krijgt een
status, headers en een body terug. Er komt in de tests dus geen poort aan te
pas.

### Wie er aanklopt

Beide auth-endpoints hangen een koppeling aan een gebruiker, dus die gebruiker
moet vaststaan. Een `user_id` uit de querystring is waardeloos, want die typt
iedereen zelf. Wat telt is het access token dat Supabase bij het inloggen heeft
afgegeven. `http/user.ts` legt dat token aan Supabase voor via `/auth/v1/user`.
Dat is een netwerkaanroep per keer, maar het klopt altijd: een ingetrokken
sessie is meteen ongeldig, en er hoeft geen JWT-bibliotheek bij.

Op de callback ligt dat anders. De browser komt daar terug vanaf Microsoft en
heeft dan geen Authorization-header, want een doorverwijzing draagt geen headers
mee. De gebruiker komt daarom uit de rij die bij `start` is weggeschreven onder
een gecontroleerde sessie. Dat is precies waar `state` voor is. Staat er toch
een geldige sessie op de callback, dan moet die bij dezelfde gebruiker horen,
anders stopt het. Er wordt dus nooit een `user_id` uit de URL gelezen.

## Het contract

Een connector haalt gegevens op bij een bron en geeft een `SyncResult` terug.
De regel die alles bij elkaar houdt:

> Een connector geeft altijd een `SyncResult` terug en gooit nooit.

Een bron die eruit ligt is normaal en geen uitzondering. Daarom is mislukken
onderdeel van het antwoord: `{ ok: false, error: { code, message, retryable } }`.
De code zegt wat er daarna moet gebeuren. Bij `auth` moet de gebruiker opnieuw
koppelen, bij de rest is het genoeg om het later nog eens te proberen.

Roep een connector alleen aan via `runConnector()`. Die vangt af wat er ondanks
het contract toch omhoog komt, en maakt er een mislukt resultaat van. Zo kan
een kapotte connector nooit een hele sync-ronde meeslepen.

`microsoft` staat in de registry, `canvas` nog niet. Magister komt er niet bij:
daar is geen open aanmeldweg voor. Het importeren van `connectors/microsoft`
registreert de connector, daarna pak je hem op met `getConnector('microsoft')`.

## Tokens

Een access token of refresh token geeft toegang tot het schoolaccount van een
gebruiker. Twee regels, allebei zonder uitzondering:

- **Nooit in platte tekst opslaan.** De kolommen in `connections` heten niet
  voor niets `access_token_encrypted` en `refresh_token_encrypted`. Wat erin
  gaat komt uit `encryptToken()`, en dat is AES-256-GCM met een sleutel uit de
  omgeving. GCM controleert ook: een rij die is aangepast valt bij het
  ontsleutelen door de mand.
- **Nooit loggen.** Niet in een foutmelding, niet in een debugregel, niet in
  een stack trace. Een token in een logregel is een token dat je moet intrekken.

De browser komt niet bij die twee kolommen, ook niet versleuteld. RLS gaat over
rijen, dus dat is geregeld met de rechten op de kolom. Zie de migratie
`20260908101500_connections.sql`.

De sleutel maak je zo:

```
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Raakt die sleutel kwijt, dan zijn alle opgeslagen tokens onbruikbaar en moet
iedereen opnieuw koppelen. Er is met opzet geen tweede sleutel als reserve, want
dat is een tweede plek waar hij kan weglekken.

## Draaien

Er zijn geen afhankelijkheden. Node draait de TypeScript zelf, dus er valt
niets te installeren. Node 24 of nieuwer.

```
cd server
npm test          de tests, raken het netwerk niet aan
npm start         de server, leest server/.env
npm run verify    controleert een opgeslagen koppeling
```

De CI in `.github/workflows/ci.yml` draait deze tests mee, als eigen stap na
het bouwen van `web/`.

De tests raken het netwerk niet aan. Overal waar er iets naar buiten zou gaan
staat een nep-`fetch`, en het wachten bij 429 gebeurt met een `sleep` die niets
doet maar wel onthoudt hoelang er gewacht zou zijn.

## Microsoft

De eerste echte connector. Wat er staat is het inloggen en het tokenbeheer.
Data ophalen komt daarna: `sync()` controleert nu alleen of de koppeling nog
werkt (een aanroep van `/me`) en geeft een leeg resultaat terug.

### De flow

1. `createPkcePair()` en `createState()`. Bewaar allebei bij de sessie van de
   gebruiker. De `code_verifier` mag nergens anders heen.
2. `buildAuthorizationUrl()` en de gebruiker daarheen sturen.
3. Microsoft stuurt hem terug op de redirect met een `code`. Controleer eerst de
   `state`, dan pas verder.
4. `exchangeCode()` met de code en de bewaarde `code_verifier`.
5. De tokens versleutelen en in `connections` zetten. Nooit in platte tekst.

PKCE zit erop omdat een onderschepte code dan niets waard is zonder de
`code_verifier`. Het hoort bij een publieke client, maar het kost niets om het
er ook met een client secret bij te doen.

### De rechten die we vragen

Zo min mogelijk, en allemaal alleen lezen. Er zit geen enkele `ReadWrite` bij,
dus Bundel kan niets veranderen aan het account van de gebruiker.

| Scope | Waarvoor |
|---|---|
| `openid`, `profile` | Weten wie er inlogt, zodat de koppeling aan de juiste gebruiker hangt. |
| `offline_access` | Het refresh token. Zonder deze scope moet iemand elk uur opnieuw inloggen. |
| `User.Read` | Het eigen profiel, alleen om het account te herkennen. Niet dat van anderen. |

Deze vier hebben geen goedkeuring van een beheerder nodig. Iedereen met een
schoolaccount kan de flow dus doorlopen zonder dat er eerst iemand iets aan moet
zetten. De lijst staat op een plek: `SCOPES` in `connectors/microsoft/auth.ts`.
De flow gebruikt hem als standaardwaarde, dus een aanroep kan er tijdelijk van
afwijken zonder dat er iets in de code verandert.

### Later nodig

Deze drie zijn er bewust uit gehaald. Ze eindigen op `.All` en vragen om
goedkeuring van een tenant-beheerder. Zonder die goedkeuring loopt het inloggen
vast op `AADSTS65001` en geeft Graph 403 terug, en dan valt er niets te bouwen
of te testen. Ze komen terug zodra we echt berichten gaan ophalen en de
beheerder de app heeft goedgekeurd.

| Scope | Waarvoor, en wanneer hij terugkomt |
|---|---|
| `Team.ReadBasic.All` | De teams waar de gebruiker zelf lid van is. Nodig zodra Groepen echte teams laat zien. |
| `Channel.ReadBasic.All` | De kanalen binnen die teams. Nodig voor dezelfde stap. |
| `ChannelMessage.Read.All` | De berichten in die kanalen. Dit is wat de app als groepsberichten toont. |

Ze gelden alleen voor teams en kanalen waar de gebruiker zelf in zit, maar dat
maakt voor de goedkeuring niet uit: `.All` is `.All`. Zet ze pas terug in
`SCOPES` als de beheerder de app heeft goedgekeurd, anders breekt het inloggen
voor iedereen.

Wat we met opzet **niet** vragen:

- `Chat.Read`. Dat zijn de persoonlijke chats van de gebruiker. De app belooft
  op het scherm Bronnen letterlijk "geen chats van anderen", dus die scope hoort
  er niet bij.
- `Calendars.Read`. Het rooster komt uit Magister, niet uit Teams.
- Alles met `ReadWrite`. Bundel schrijft niets terug naar een bron.

### Hoe het misgaat, en wat er dan gebeurt

| Wat | Antwoord | Daarna |
|---|---|---|
| Token bijna verlopen | wordt vanzelf ververst, vijf minuten van tevoren | gewoon door |
| Graph zegt 401 | een keer verversen en opnieuw proberen | blijft het 401, dan `revoked` |
| Toestemming ingetrokken (`invalid_grant`) | `auth`, niet opnieuw proberen | status `revoked`, de gebruiker moet zelf opnieuw koppelen |
| Graph zegt 403 | `auth`, niet opnieuw proberen | de beheerder moet goedkeuren |
| Graph zegt 429 | wachten volgens `Retry-After` en opnieuw, tot drie keer | daarna `rate_limited`, later nog eens |
| Graph zegt 5xx of het netwerk valt weg | opnieuw proberen | daarna `unavailable`, later nog eens |

Bij `revoked` stopt de client meteen. Elke volgende aanroep komt niet eens meer
bij Microsoft aan, want opnieuw proberen levert toch niets op.

## Zelf een keer doorlopen

Dit is de volgorde om de flow een keer met een echt schoolaccount te testen.
Reken op een kwartier, waarvan het meeste in de Azure-portal zit.

### 1. De app-registratie in Entra ID

Portal: <https://portal.azure.com>, dan Microsoft Entra ID, dan App registrations,
dan New registration.

| Veld | Waarde |
|---|---|
| Name | Bundel (of iets anders, de gebruiker ziet deze naam op het toestemmingsscherm) |
| Supported account types | Accounts in this organizational directory only |
| Redirect URI | Platform **Web**, adres `http://localhost:8787/auth/microsoft/callback` |

Let op bij de redirect URI: Microsoft vergelijkt hem letterlijk. Een schuine
streep te veel of `127.0.0.1` in plaats van `localhost` is al genoeg om
`AADSTS50011` te krijgen. Kies er een en gebruik overal dezelfde, ook in
`MICROSOFT_REDIRECT_URI`.

Daarna nog twee dingen in dezelfde registratie:

- **Certificates & secrets**, New client secret. De waarde is maar een keer
  zichtbaar, dus kopieer hem meteen. Noteer ook de vervaldatum, want daarna
  stopt de koppeling.
- **API permissions**. Voor deze vier scopes hoeft er niets goedgekeurd te
  worden. `User.Read` staat er standaard al bij, de andere drie vraagt de flow
  zelf aan bij het inloggen.

Overschrijven hoef je verder niets. Zet je later de drie `.All`-scopes terug,
dan is Grant admin consent wel nodig.

### 2. De variabelen invullen

Kopieer `server/.env.example` naar `server/.env` en vul in:

| Variabele | Waar hij vandaan komt |
|---|---|
| `BUNDEL_TOKEN_KEY` | Zelf maken: `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"` |
| `PORT` | `8787`, of leeg laten |
| `APP_BASE_URL` | `http://127.0.0.1:5179` als de app lokaal draait |
| `SUPABASE_URL` | Supabase, Project Settings, API |
| `SUPABASE_SERVICE_ROLE_KEY` | Zelfde scherm, onder Project API keys. Dit is de geheime |
| `SUPABASE_ANON_KEY` | Zelfde scherm, de publieke. Dezelfde als in `web/.env.local` |
| `MICROSOFT_TENANT_ID` | De registratie, Overview, Directory (tenant) ID |
| `MICROSOFT_CLIENT_ID` | Zelfde scherm, Application (client) ID |
| `MICROSOFT_CLIENT_SECRET` | De waarde uit stap 1 |
| `MICROSOFT_REDIRECT_URI` | Letterlijk hetzelfde als bij Redirect URIs |

`server/.env` staat in `.gitignore` en hoort daar te blijven.

### 3. De migratie draaien

De tabel `oauth_state` bestaat nog niet in de database. Draai
`supabase/migrations/20260908143000_oauth_state.sql` een keer, via de Supabase
CLI of door de inhoud in de SQL Editor te plakken.

### 4. De server starten

```
cd server
npm start
```

Controleer of hij leeft: <http://localhost:8787/health> hoort `{"ok":true}` terug
te geven.

### 5. De flow doorlopen

`/auth/microsoft/start` heeft je Supabase-sessie nodig, en een gewone
browsernavigatie stuurt geen Authorization-header mee. Haal daarom eerst de
doorverwijzing op met je access token erbij:

```
curl -i -H "Authorization: Bearer <jouw-supabase-access-token>" \
  http://localhost:8787/auth/microsoft/start
```

Je access token vind je in de browser waar de app draait: DevTools, Application,
Local Storage, de sleutel die begint met `sb-`. Daarin staat `access_token`.

In het antwoord staat een `Location:`-regel. Plak die URL in je browser, log in
met je schoolaccount en geef toestemming. Microsoft stuurt je daarna terug naar
de callback, en die stuurt je door naar `APP_BASE_URL/app/bronnen` met
`?connect=microsoft&status=ok` erachter.

### 6. Kijken of het klopt

In Supabase, Table Editor, tabel `connections`, hoort nu precies een rij te
staan voor jouw gebruiker:

| Kolom | Wat je hoort te zien |
|---|---|
| `user_id` | jouw id uit `auth.users` |
| `source` | `microsoft` |
| `status` | `active` |
| `external_account_id` | een GUID van Microsoft |
| `scopes` | `openid profile offline_access User.Read` |
| `access_token_encrypted` | een lange regel die begint met `v1.` |
| `refresh_token_encrypted` | idem, ook beginnend met `v1.` |
| `token_expires_at` | ongeveer een uur na nu |
| `last_error` | leeg |

Staat er ergens een leesbaar token, dan is er iets grondig mis. Dat hoort niet
te kunnen: alles gaat door `crypto/tokens.ts` heen.

Doorloop de flow nog een keer en kijk of er nog steeds precies een rij staat.
De unieke index op `(user_id, source)` maakt van de tweede poging een bijwerking.

### 7. Bewijzen dat de tokens werken

```
cd server
npm run verify -- <jouw-user-id>
```

Dat script leest de rij, ontsleutelt de tokens en vraagt Graph wie je bent.
Verloopt het access token bijna, dan ververst hij het onderweg en schrijft het
nieuwe token versleuteld terug. Draai je hem daarna nog eens, dan zie je een
nieuwe vervaltijd, en dat is het bewijs dat je een tweede keer kunt aanroepen
zonder opnieuw in te loggen.

Er komt geen enkel token in de uitvoer, alleen de status, de scopes, het
account-id en de vervaltijd.

## Wat hier nog moet komen

- De knop in de app. `web/` weet nog niets van deze server: er is geen knop die
  `/auth/microsoft/start` aanroept en er wordt niets gedaan met
  `?connect=microsoft&status=ok` als je terugkomt. Dat is front-end werk en
  hoort op de branch `Front-end`.
- Data ophalen: teams, kanalen en berichten, en die naar de tabellen schrijven
  die de app leest. Daarvoor moeten eerst de drie `.All`-scopes terug en moet de
  beheerder de app goedkeuren.
- De connector voor Canvas. De flow hier is bijna een op een over te nemen,
  alleen de endpoints en de scopes verschillen.
- Een plek om dit te draaien. Railway was de gedachte, maar er is nog niets
  besloten. Zolang er niets draait werkt koppelen alleen lokaal.
- Verlopen koppelingen opruimen of de gebruiker erop wijzen. Nu blijft een rij
  met status `revoked` gewoon staan.
