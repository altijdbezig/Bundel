# server

De kant van Bundel die met de bronnen praat. Nog niet af: hier staat op dit
moment alleen het contract, de types en de tokenhulp. Er is nog geen enkele
echte koppeling, geen OAuth-flow en geen API-call.

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
└─ src/
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
niets te installeren.

```
cd server
npm test
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
| `Team.ReadBasic.All` | De teams waar de gebruiker zelf lid van is. |
| `Channel.ReadBasic.All` | De kanalen binnen die teams. |
| `ChannelMessage.Read.All` | De berichten in die kanalen. Dit is wat de app als groepsberichten laat zien. |

Wat we met opzet **niet** vragen:

- `Chat.Read`. Dat zijn de persoonlijke chats van de gebruiker. De app belooft
  op het scherm Bronnen letterlijk "geen chats van anderen", dus die scope hoort
  er niet bij.
- `Calendars.Read`. Het rooster komt uit Magister, niet uit Teams.
- Alles met `ReadWrite`. Bundel schrijft niets terug naar een bron.

De drie scopes met `.All` erachter gelden alleen voor teams en kanalen waar de
gebruiker zelf in zit, maar ze hebben wel goedkeuring van een beheerder nodig.
Zonder die goedkeuring loopt het inloggen vast met `AADSTS65001` en geeft Graph
403 terug. Dat is precies wat de app op het scherm Bronnen al zegt: de
schoolbeheerder moet de app eerst goedkeuren.

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

## Wat hier nog moet komen

- De kant die met Supabase praat, zodat `TokenStore` echt naar `connections`
  schrijft. Nu geeft de connector alleen door wat er is veranderd.
- Het endpoint voor de redirect, en het bewaren van `state` en `code_verifier`
  bij de sessie.
- De connector voor Canvas.
- Data ophalen: kanalen, berichten en de rest, en die naar de tabellen schrijven
  die de app leest.
- Een plek om dit te draaien. Railway was de gedachte, maar er is nog niets
  besloten.
