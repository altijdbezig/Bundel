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
   │  ├─ index.ts        de registry en `runConnector()`, nu nog zonder connectors
   │  └─ index.test.ts
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

De registry is nu leeg. `register()` zet er straks een connector in, `microsoft`
voor de bron Teams en `canvas` voor Canvas. Magister staat er niet bij: daar is
geen open aanmeldweg voor.

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

De CI in `.github/workflows/ci.yml` draait deze tests nog niet. Die bouwt
alleen `web/`. Zet dat erbij zodra hier meer staat dan het contract.

## Wat hier nog moet komen

- De OAuth-flow per bron: aanmelden, terugkomen op de redirect, tokens opslaan.
- Vernieuwen van een token voordat het verloopt.
- De connectors zelf, en het schrijven naar de tabellen die de app leest.
- Een plek om dit te draaien. Railway was de gedachte, maar er is nog niets
  besloten.
