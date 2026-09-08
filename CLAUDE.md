# CLAUDE.md - Bundel

Projectgeheugen voor Claude Code. Wordt na **elke** prompt bijgewerkt.

---

## 0. Werkafspraken (ALTIJD volgen)

1. **Stel bij elke prompt zoveel mogelijk vragen.** Voordat je bouwt: gebruik `AskUserQuestion`
   (max 4 vragen per call, meerdere calls achter elkaar mag) en zet aanvullende open vragen als
   genummerde lijst in het antwoord. Nooit aannames stilzwijgend invullen. Geef wel altijd een
   aanbeveling bij elke vraag, zodat de gebruiker snel kan kiezen.
2. **NOOIT em dashes gebruiken.** De lange streep (unicode U+2014, in HTML `&mdash;`) mag nergens
   voorkomen: niet in code, niet in teksten op de site, niet in dit bestand, niet in commits en
   niet in het antwoord in de chat. De halflange streep (U+2013) is ook geen vervanging.
   Herschrijf de zin in plaats daarvan:
   - twee losse zinnen met een punt
   - een komma met `want`, `dus`, `en`, `maar`
   - een dubbele punt als er een opsomming of uitleg volgt
   - haakjes bij een terzijde
   Voorbeeld: waar je een lange streep zou zetten, zet je een punt.
   Dus niet *"Het vervangt Canvas niet [streep] het leest het uit"* maar
   *"Het vervangt Canvas niet. Het leest het uit."*
   Als een gewone streep als scheidingsteken nodig is: gebruik `·` (interpunct) of een gewoon
   koppelteken `-`.
3. **Onderhoud dit bestand.** Na elke prompt: antwoorden van de gebruiker, gemaakte keuzes,
   nieuwe bestanden en openstaande vragen hier vastleggen. Nooit weggooien, alleen aanvullen.
4. **Branches.** Het project wordt met z'n tweeën gemaakt en heeft drie branches:
   - `main`: alleen samengevoegd werk, hier niet direct op committen
   - `Front-end`: website, UI, styling, componenten, teksten (van Jayden)
   - `Back-end`: API, database, koppelingen, auth (van Benjamin, **Claude werkt hier**)
   Kies de branch op basis van wat je maakt. Bij twijfel: vragen.
5. Taal richting gebruiker: **Nederlands**. Code, commits en variabelen: Engels.
6. Design volgt de merkrichtlijnen in `Claude Design/Branding/`. Niets afwijkends verzinnen.

---

## 1. Wat is Bundel

Eén overzicht dat rooster, opdrachten, cijfers en projectgroep uit bestaande schoolsystemen
naast elkaar zet. Vervangt Canvas, Teams en Magister niet. Het leest ze uit, alleen-lezen.

Belofte: *"Drie apps, één overzicht. En je data blijft waar hij hoort."*

**Wie maakt het:** AltijdBezig, de merknaam waaronder twee makers werken. Nog niet formeel
ingeschreven, dus geen bedrijfsclaims op de site (geen KvK, geen adres, geen "B.V.").
Schrijf: *"gemaakt door AltijdBezig"* of *"een project van AltijdBezig"*.

**Dit is géén schoolproject.** SintLucas wordt nergens genoemd. Die verwijzingen zijn in
prompt 2 overal verwijderd, ook uit de branding kit en het prototype. Niet opnieuw invoeren.

**Doelgroep:** elke student wiens school Canvas, Microsoft Teams of Magister gebruikt.
Geen enkele school bij naam noemen.

## 2. Repo

```
Bundel/
├─ CLAUDE.md                                  <- dit bestand
├─ .nvmrc                                     welke node CI gebruikt (prompt 19)
├─ .github/workflows/ci.yml                   bouwen en de rendertest bij elke PR (prompt 19)
├─ Claude Design/
│  ├─ Branding/Bundel Branding Kit.dc.html    merkrichtlijnen, 8 tabs
│  └─ Prototype/Bundel.dc.html                app-prototype, desktop + mobiel
├─ supabase/migrations/                       het databaseschema, zes migraties (prompt 16, 19)
├─ server/                                    de kant die met de bronnen praat (prompt 19)
│  ├─ README.md                               waarom dit niet in web/ staat, het contract, de scopes
│  ├─ package.json · tsconfig.json · .env.example
│  └─ src/
│     ├─ connectors/  types.ts (contract) · index.ts (registry) · index.test.ts
│     │  └─ microsoft/  auth.ts (OAuth2 met PKCE) · client.ts (Graph) ·
│     │                 index.ts (de connector) · drie testbestanden (prompt 20)
│     └─ crypto/      tokens.ts (versleutelen) · tokens.test.ts
└─ web/                                       de website (prompt 1)
   ├─ README.md                               draaien, structuur, wat nog niet werkt
   ├─ index.html · vite.config.js · package.json · vercel.json
   ├─ .env.example                            welke omgevingsvariabelen nodig zijn
   ├─ public/  favicon.svg · _redirects
   └─ src/
      ├─ main.jsx · App.jsx · i18n.jsx · supabase.js · __smoke.jsx (rendertest)
      ├─ styles/   tokens.css · global.css · layout.css · app.css
      ├─ components/ Logo · Icons · Header · Footer · Reveal · AppPreview · WaitlistForm ·
      │              ContactCard
      ├─ auth.jsx    Supabase Auth + RequireAuth
      ├─ app/        data.js (getters) · demo.js (demodata) · store.js (database) ·
      │              state.jsx · AppLayout.jsx · StartScreen.jsx ·
      │              Dialog.jsx · ScreenHeader.jsx · EmptyState.jsx · LessonDialog.jsx ·
      │              AssignmentDialog.jsx · GradeDialog.jsx · OwnItemDialog.jsx ·
      │              signal.js · SearchDialog.jsx ·
      │              NotificationsPanel.jsx ·
      │              screens/ (9 schermen, incl. Attendance)
      └─ pages/      Home · Login · Download · Privacy · Terms · About · NotFound
```

`.dc.html` = Claude Design canvas-bestanden (React via `support.js`, `x-dc` templates).

## 3. Designsysteem (uit de branding kit)

**Kleur** staat als CSS-variabelen in `web/src/styles/tokens.css`. Wijzig kleuren alleen daar.

| Token | Hex | Gebruik |
|---|---|---|
| `--brand-600` | `#0E7C66` | primaire knop, actieve nav, focusrand, links |
| `--brand-700` | `#0A5C4B` | hover primair, groene vlakken (privacyblok, inlogpaneel) |
| `--brand-100` | `#E6F2EE` | actieve rij, badge, avatar |
| `--surface-page` | `#F7F6F2` | paginabodem |
| `--surface-card` | `#FFFFFF` | kaarten |
| `--surface-sunken` | `#FCFBF8` | invoer, zijbalk, footer |
| `--border-card` / `--border-strong` | `#E6E3DC` / `#E0DDD5` | kaartrand, invoerrand |
| `--ink-900 / 800 / 600` | `#17181A` / `#43474D` / `#63676E` | koppen / broodtekst / meta |

Bronkleuren (alleen als 8px-stip of 2px-lijn, nooit vlak):
Canvas `#E4572E` · Teams `#5B4BE8` · Magister `#2F5BEA` · Eigen `#0E7C66`.
Status: gelukt `#0A5C4B`/`#E6F2EE` · aandacht `#7A4A0B`/`#FDF7EE` · fout `#B4300E`/`#FDF0EC`.
Warm grijs, geen blauwgrijs. Groen is het enige accentsignaal.

**Typografie**
- Instrument Serif (400, nooit bold): koppen, één uitspraak per scherm
- Instrument Sans: alle UI en broodtekst; 400 tekst, 500 labels/knoppen, 600 kaartkoppen; geen 700
- JetBrains Mono: tijden, cijfers, tokens, labels (caps, `0.09em`); nooit voor zinnen
- Schaal: display 68 · title-1 40 · title-2 30 · heading 20 · card-title 15 · body 14.5 ·
  meta 12.5 · data mono 12.5 · label mono 10 caps

**Vorm**
- Radius: knop 10px, kaart 13px, paneel 14px, pill 999px
- Rand 1px, **geen schaduw op kaarten** (schaduw alleen voor zwevende elementen)
- Knop 40px hoog, padding 0 20px · invoer 40px, `#FCFBF8`, focusrand 1px groen, geen gloed
- Iconen: 24px grid, 1.75px streek, ronde uiteinden, geen vulling
- Logo: gestapelde lagen (3 balken, opacity 1 / .62 / .3) primair; drie cirkels secundair (alleen groot)

**Toon:** rustig, feitelijk, jij/jullie, korte zinnen, geen emoji, geen overclaims, geen em dashes.

## 4. Beslissingen

**Prompt 1: homepagina (12 vragen gesteld, 12 beantwoord)**

| Onderwerp | Keuze |
|---|---|
| Stack | Vite + React |
| Routing | React Router (echte URL's) |
| Styling | CSS-variabelen + gewone CSS, geen framework |
| Omvang | Volledige landingspagina **plus** losse pagina's |
| Inloggen | Alleen visueel, geen echte auth |
| Downloads | Nog geen bestanden; wachtlijst |
| Wachtlijst | Valideert en bevestigt, slaat niets op |
| App Store | iOS + Android badges, uitgeschakeld, "binnenkort" |
| Beeld | App-scherm ("Vandaag") nagebouwd in React, geen screenshots |
| Taal | Nederlands + Engels, schakelaar in de header |
| Donkere modus | Nee, de kit beschrijft alleen een licht palet |
| Animatie | Subtiel: fade-in bij scroll, respecteert `prefers-reduced-motion` |

**Prompt 2: identiteit gecorrigeerd (4 vragen gesteld, 4 beantwoord)**

| Onderwerp | Keuze |
|---|---|
| Maker | AltijdBezig, merknaam zonder inschrijving. Geen bedrijfsclaims. |
| Schoolproject | Nee. SintLucas overal verwijderd, ook uit de designbestanden. |
| Prijs | Nu gratis omdat het in ontwikkeling is; over betalen is nog niets besloten |
| Doelgroep | Elke student wiens school Canvas, Teams of Magister gebruikt |
| Em dashes | Overal weg, ook uit branding kit en prototype. Zie regel 2 hierboven. |

**Prompt 3: hosting, voorwaarden en placeholders (4 vragen gesteld, 4 beantwoord)**

| Onderwerp | Keuze |
|---|---|
| Domeinnaam | Nog geen. De nep-URL `bundel.app` is uit de app-preview gehaald; daar staat nu alleen "Bundel". |
| Hosting | Vercel. Root Directory in het Vercel-project op `web` zetten, de rest staat in `vercel.json`. Railway blijft over voor de back-end. |
| Voorwaarden | Nieuwe pagina `/voorwaarden`, kort en eerlijk, zes kopjes. Link staat in de footer. |
| Contactgegevens | Zichtbaar gemarkeerde placeholder `[contactadres volgt]` in een gestippeld kader, op `/privacy` en `/voorwaarden`. |
| Desktop-app | Electron, omdat het deze React-code hergebruikt. De systeemeisen op `/download` kloppen daarmee. Tauri was het alternatief (installer ~10 MB, maar Rust nodig). |
| EN-teksten | Akkoord, geen herziening nodig. |
| AltijdBezig | Geen logo en geen eigen site, dus alleen de naam als tekst. |

**Prompt 4: afronding vragenronde (6 vragen gesteld, 6 beantwoord)**

| Onderwerp | Keuze |
|---|---|
| Contactadres | Blijft voorlopig een placeholder. Niet aandringen. |
| Vercel-project | Jayde zet het zelf op. Root Directory `web`. |
| Voorwaarden nakijken | Niet nodig. |
| Wachtwoord vergeten | Echte auth komt eraan, dus de link blijft staan. Hij toont nu een melding in plaats van een dood anker. |
| Cookiemelding | Niet nodig zolang er geen tracking is. |
| Merge naar main | Ja. Projectpartner is nog niet begonnen, dus `Front-end` is samengevoegd met `main`. |

**Prompt 5: app-schermen en hero (6 vragen gesteld, 6 beantwoord)**

| Onderwerp | Keuze |
|---|---|
| App-data | Nepdata achter een datalaag: `src/app/data.js`. Schermen roepen alleen `getToday()`, `getAssignments()` en zo verder aan. Bij het aansluiten van de API alleen de bodies van die functies vervangen. |
| Routes in de app | Eigen URL per scherm onder `/app`. |
| Omvang | Alle zes de schermen, plus zijbalk en mobiele onderbalk. |
| Toegang | Nep-sessie als poort. Inloggen zet een vlag in `localStorage`, `RequireAuth` stuurt terug naar `/login`. |
| Hero | Inloggen is de enige grote knop, downloaden staat als tekstlink eronder. |
| Taalkeuze in de app | Data komt tweetalig uit de datalaag, UI-labels staan onder `app` in `i18n.jsx`. |

**Prompt 6: app afmaken (6 vragen gesteld, 6 beantwoord)**

| Onderwerp | Keuze |
|---|---|
| Onderdelen | Instellingen, meldingen, zoeken en lege staten, alle vier gebouwd. |
| Geen bron gekoppeld | Onboarding-scherm neemt de app over. Instellingen blijft wel bereikbaar. |
| Meldingen | Paneel dat openklapt onder het belletje in de topbalk, met stip bij ongelezen. |
| Taalkeuze in de app | Onder Instellingen, niet in de zijbalk. |
| Zoeken | Eén venster over de app heen, opent met Ctrl+K, zoekt door opdrachten, rooster, cijfers, groepen en berichten. |
| Visuele controle | Jayde kijkt zelf. De Chrome-extensie blijft localhost blokkeren. |

**Prompt 7: zoeken duidelijker (4 vragen gesteld, 4 beantwoord)**

| Onderwerp | Keuze |
|---|---|
| Klachten | Resultaten waren kaal, het venster stond er raar bij, en het lege venster was saai. |
| Ordening | Gegroepeerd per type met kopjes en een aantal per groep. |
| Vorm | Blijft een venster dat opent met Ctrl+K, geen vast veld in de topbalk. |
| Leeg venster | Snelkoppelingen naar de zes schermen plus de eerstvolgende deadline. |

Wat daarvoor is aangepast: vaste vensterhoogte zodat het niet springt, icoon per resultaattype,
bronnaam rechts, het gezochte stuk vet in de titel, pijltjestoetsen en Enter, en een voettekst
met de toetsen. Op smalle schermen vallen de bronnaam en de voettekst weg.

**Prompt 8: rooster herzien (8 vragen gesteld, 8 beantwoord)**

| Onderwerp | Keuze |
|---|---|
| Opzet | Tijdraster: uren verticaal, dagen horizontaal, blokhoogte volgt de lesduur. Vier voorstellen voorgelegd met ASCII-schetsen. |
| Eindtijden | Toegevoegd aan de nepdata voor de hele week, zodat de blokhoogtes kloppen. |
| Per les | Vak, lokaal, docent, bronstip en een markering als er die dag een deadline bij dat vak hoort. |
| Weken | Een vaste week. Bladeren zou lege weken tonen. |
| Uren | Passend bij de data: een half uur voor de eerste les tot een half uur na de laatste. |
| Nu-streep | Groene lijn met een stip op de kolom van vandaag, op een vaste demo-tijd van 10:15. |
| Kleur | Blokken wit met een grijs streepje links, alleen de huidige les groen. |
| Mobiel | Onder 700px een agenda-lijst met een tijdbalk links, geen zijwaarts schuiven. |

Na de eerste versie drie visuele fouten gemeld en gefixt: blokken van 50 minuten waren te laag
waardoor de vaknaam over het lokaal heen liep (schaal van 1.1 naar 1.3 px per minuut, en korte
lessen laten de docent weg), het uurlabel 10:00 botste met de nu-tijd 10:15 (uurlabels binnen
20 minuten van nu vallen weg), en de nu-streep sneed door blokken van andere dagen (loopt nu
alleen over de kolom van vandaag).

**Prompt 10: weken bladeren en een lespop-up (8 vragen gesteld, 8 beantwoord)**

| Onderwerp | Keuze |
|---|---|
| Weekdata | Vijf weken nepdata: twee terug, deze week, twee vooruit. Week 38 is een toetsweek, week 39 een projectweek zonder lessen. |
| Bladeren | Pijlknoppen plus een knop deze week, en de pijltjestoetsen links en rechts. |
| Pop-up | Gecentreerd venster met de les zelf, de opdrachten voor dat vak, de cijfers en de projectgroep. |
| Verleden | Voorbije weken doffer, zonder nu-streep, met een badge voorbij. |
| Deadlines | Verspreid over vier van de vijf weken, zodat de markering overal iets doet. |
| Vandaag | Lessen daar zijn ook klikbaar en openen dezelfde pop-up. |
| Lege week | Raster verdwijnt, lege staat met de reden erbij. |

De gekozen week staat in de URL als `?week=N`. Zoekresultaten voor een les linken daarnaartoe,
anders opent het rooster op de verkeerde week.

**Prompt 11: zes schermen herzien (12 vragen gesteld, 12 beantwoord)**

| Scherm | Keuze |
|---|---|
| Ambitie | Stevig herzien: nieuwe indeling per scherm, binnen dezelfde tokens en merkstijl. |
| Vandaag | Tijdlijn van de dag: lessen en deadlines door elkaar op volgorde van tijd, met de huidige les uitgelicht. Cijfers en groep als tweede rij. |
| Opdrachten | Gegroepeerd per termijn (verlopen, vandaag, deze week, later, afgerond), balk met tellers die naar een groep springt, sorteren op datum of vak, afgerond apart, pop-up per opdracht. |
| Cijfers | Kaart per vak met het gemiddelde groot, trendpijl en staafjes per cijfer. Verdeling van alle cijfers onderaan, onvoldoendes uitgelicht, pop-up per vak. |
| Groepen | Projectruimte: leden, gedeelde deadline uit het vak, wie doet wat, bestanden, en een chat met datumscheiding. |
| Bronnen | Per bron wat hij oplevert in aantallen, welke rechten Bundel vraagt, de laatste syncs en een knop nu synchroniseren. |
| Instellingen | Secties Weergave, Meldingen, Account en Demo. Meldingen per soort, plus een keuze voor het startscherm. |
| Consistentie | Overal dezelfde schermkop (`ScreenHeader`), dezelfde vensterschil (`Dialog`), de bronstip links van de titel, en lege staten in dezelfde vorm. |

**Prompt 12: cijfers met opmerkingen (4 vragen gesteld, 4 beantwoord)**

| Onderwerp | Keuze |
|---|---|
| Lijst | Eigen sectie "Laatste cijfers" boven de kaarten per vak, nieuwste bovenaan. |
| Opmerking | Venster per cijfer, in dezelfde stijl als de les en de opdracht. |
| Per cijfer | Waarvoor, datum, weging en docent. |
| Hoeveel opmerkingen | Alleen sommige, zoals in het echt. Vier van de elf cijfers hebben er een. |

Elk cijfer is nu een eigen invoer in plaats van een los getal:
`{ id, value, date, weight, what, remark }`. Het gemiddelde is daarmee gewogen, zoals Magister
het rekent. Cijfers met een opmerking krijgen een klein teken in de lijst, en zoeken vindt
cijfers op hun naam en op de tekst van de opmerking.

**Prompt 13: aanwezigheid en een signaal per vak (8 vragen gesteld, 8 beantwoord)**

| Onderwerp | Keuze |
|---|---|
| Scherm | Totaal bovenaan, kaart per vak met een balk, daaronder alleen de momenten die afweken. |
| Statussen | Aanwezig, te laat (met minuten), afgemeld (met reden), afwezig zonder melding. |
| Rekenregel | Te laat telt als aanwezig. Afgemeld valt uit de noemer, want dat telt niet tegen je. |
| Grens | Onder 80% bij een vak krijgt dat vak een markering. |
| Signaal | Blok bovenaan in de lespop-up, feitelijk, met de redenen op een rij. |
| Redenen | Gemiddelde onder 5.5, laatste cijfer 0.5 of meer lager dan het vorige, aanwezigheid onder 80%, verlopen opdrachten. |
| Elders | Alleen in de lespop-up, niet in het rooster zelf en niet op Vandaag. |
| Navigatie | Zeven items in de zijbalk, Aanwezigheid naast Cijfers. De mobiele onderbalk blijft op zes. |

De demo staat zo dat Mediatheorie het probleemvak is: een 4.8 als cijfer en 75% aanwezigheid.
Alleen lessen die al geweest zijn hebben een status, dus de toekomst blijft leeg.

**Prompt 14: eigen roosteritems en het signaal op Vandaag (4 vragen gesteld, 4 beantwoord)**

| Onderwerp | Keuze |
|---|---|
| Soorten | Afspraak, werk, studietijd en herinnering. Een herinnering heeft geen eindtijd en krijgt in het raster 30 minuten hoogte. |
| Toevoegen | Knop bij de weeknavigatie, plus klikken op een lege plek in het raster. Die klik vult dag en tijd alvast in, afgerond op een kwartier. |
| Uiterlijk | Zelfde blokvorm als een les, met het groen van de bron Eigen als streepje links. |
| Herhalen | Optioneel wekelijks. Zo'n item verschijnt in alle weken op dezelfde dag en tijd. |
| Signaal op Vandaag | Ja, een regel bovenaan met maximaal twee vakken en de belangrijkste reden. Staat er niet als er niets is. |
| Ziekmelden | Nee, aanwezigheid blijft alleen-lezen uit Magister. |
| Rekenregel aanwezigheid | Geen vaste schoolregel bekend, dus de gekozen regel staat nu zichtbaar op het scherm in plaats van verstopt. |

Eigen items leven in `state.jsx` en verdwijnen bij het herstarten van de demo, net als de rest.
Bij een echte back-end worden dit de enige gegevens die Bundel zelf bewaart.

**Prompt 15: onderkant van de zijbalk (3 vragen gesteld, 2 beantwoord)**

| Onderwerp | Keuze |
|---|---|
| Vorm | Accountknop onderaan met avatar, naam en opleiding. Klikken klapt een menu open met Instellingen, Naar de website en Uitloggen. |
| Account bovenaan | Vervallen, want dat stond dan dubbel. De zijbalk begint nu met het logo en de navigatie. |
| Uitloggen | Onderin het menu, met een scheidingslijn erboven zodat je hem niet per ongeluk raakt. Gewone kleur, want uitloggen is niet gevaarlijk. |
| Extra's | Vraag niet beantwoord, dus bij de drie acties gehouden. Geen taalwissel of sneltoetsen in het menu. |

Op mobiel blijft alleen de avatar staan en klapt het menu naar beneden open in plaats van omhoog.

**Prompt 16: Supabase gekoppeld (8 vragen gesteld, 8 beantwoord)**

| Onderwerp | Keuze |
|---|---|
| Branch | Nieuwe branch `Supabase` vanaf `main`. `Back-end` blijft van de projectpartner. |
| Omvang | Alles in een keer: echte auth, volledig schema met RLS, en de app leest uit de database. |
| Schooldata | Per gebruiker een eigen kopie van de demodata, klaargezet bij de eerste keer inloggen. |
| Inloggen | E-mail en wachtwoord via Supabase Auth. Microsoft OAuth kan er later naast. |
| Bevestigingsmail | Uit, zodat aanmelden je meteen inlogt. Zet dit aan in Supabase zodra de site echt live gaat. |
| Registreren | Op `/login`, met een schakelaar tussen inloggen en account aanmaken. |
| Tweetalig | Twee kolommen per tekst: `name_nl` en `name_en`. |
| Wachtlijst | Gaat naar de tabel `waitlist`. Iedereen mag erin schrijven, niemand mag hem lezen. |

Het project heet **Bundel** (`fefmhfykrbpknaywgyqn`, eu-central-1). Zeventien tabellen, allemaal
met RLS aan. Elke rij heeft een `user_id` en vier policies: je ziet en wijzigt alleen je eigen
rijen. `waitlist` is de uitzondering: alleen invoegen, door iedereen, en niemand mag lezen.
Een trigger op `auth.users` maakt bij het aanmelden meteen een profiel aan.

Waar wat staat:
- `src/app/demo.js` is de demodata, en verder niets. Alleen `store.js` leest hem.
- `src/app/store.js` praat als enige met de database: laden, vullen, schrijven.
- `src/app/data.js` rekent en groepeert, maar bezit niets meer. `setDataset()` vult hem.
- `src/app/state.jsx` doet het scherm meteen bij en stuurt de wijziging naar `store.js`.

Wat nu echt bewaard blijft: afgevinkte opdrachten, groepstaken, gelezen meldingen, verstuurde
berichten, gekoppelde bronnen, eigen roosteritems, taal- en meldingsvoorkeuren en het
startscherm. "Opnieuw beginnen" onder Instellingen wist alles en zet de demodata terug.

**Prompt 17: wachtwoord vergeten (3 vragen gesteld, 3 beantwoord)**

| Onderwerp | Keuze |
|---|---|
| Vorm | Derde stand in hetzelfde paneel op `/login`. Geen aparte pagina voor het aanvragen. |
| Route | `/wachtwoord`, waar de link uit de mail op uitkomt. Past bij de andere Nederlandse routes. |
| Daarna | Terug naar `/login` met een melding, dus je logt zelf nog een keer in met het nieuwe wachtwoord. |
| Eigen SMTP | Nog niet. De standaardafzender van Supabase is voorlopig genoeg. |
| Microsoft-account | Nog niet. |

De herstellink brengt een token mee in de URL, dus `detectSessionInUrl` staat nu aan in
`src/supabase.js`. Zonder sessie op `/wachtwoord` toont de pagina dat de link verlopen is.
Na het opslaan logt de app je uit, want anders zou je met de oude sessie doorlopen.

**Prompt 18: instellingen gecontroleerd (geen vragen, wel een controle)**

| Onderwerp | Uitkomst |
|---|---|
| Vercel-variabelen | Moeten type **Config** zijn, niet Secret. Alles met `VITE_` wordt tijdens het bouwen in de browsercode gezet, dus er valt niets geheim te houden. Vercel waarschuwt daar zelf voor. |
| Omgevingen | Production, Preview en Development. Zonder Preview werkt inloggen niet op de proefversies van een branch. |
| Opnieuw uitrollen | Nodig na het toevoegen. De waarden worden ingebakken tijdens het bouwen, dus alleen opslaan verandert niets. |
| Confirm email | Staat uit. Gecontroleerd via `/auth/v1/settings`, daar staat `mailer_autoconfirm: true`. |
| Werkverdeling | Benjamin doet Supabase, Jayden doet Vercel. |

Live getest met een echt account tegen de echte database: aanmelden logt meteen in, de trigger
maakt het profiel, de demodata wordt klaargezet (4 lessen op maandag, 11 opdrachten, 5 vakken
met cijfers, 2 groepen, 18 aanwezigheidsregels), uitloggen en weer inloggen houdt een afgevinkte
opdracht vast, er wordt niet dubbel gevuld, en een herstelmail wordt geaccepteerd. Die
testgebruiker is daarna verwijderd, dus de database is weer leeg.

Wat nog niet gecontroleerd is: het adres van de site op Vercel is hier niet bekend, dus of de
gepubliceerde build de variabelen echt bevat is niet vastgesteld. `bundel.vercel.app` is de
site van iemand anders. De Redirect URLs in Supabase zijn van buitenaf niet te lezen.

**Prompt 19: de back-end op gang (geen vragenronde, opdracht lag vast)**

Deze prompt raakt met opzet niets aan de voorkant. Alleen `store.js` is veranderd, en dan nog
alleen aan de kant die schrijft. Wat de schermen te zien krijgen is regel voor regel hetzelfde.

| Onderwerp | Keuze |
|---|---|
| Eigenaarschap | Jayden werkt op `Front-end`, Benjamin op `Back-end`. Regel 4 hierboven klopte niet meer en is aangepast. |
| `is_demo` | Boolean op elke tabel die `store.js` vult, dertien stuks. Standaard false, bestaande rijen op true, want alles wat er nu staat is demo. |
| Wat geen `is_demo` krijgt | `waitlist` en `profiles` staan het niet, en `own_items` ook niet: dat maakt de gebruiker zelf, dus dat is nooit demo. |
| Waarom | Zodra de eerste connector echte rijen schrijft staan demo en echt in dezelfde tabel. Zonder vlag is de demo er niet meer uit te halen. |
| `connections` | Een rij per gebruiker per bron. Tokens versleuteld in `access_token_encrypted` en `refresh_token_encrypted`, RLS aan, vier policies, uniek op (user_id, source). |
| Welke bronnen | `canvas` en `microsoft`. Microsoft levert de bron Teams. Magister heeft nog geen koppeling, want daar is geen open aanmeldweg voor. |
| Tokens en de browser | RLS gaat over rijen, dus de tokens zijn met de rechten op de kolom afgeschermd. Eerst `revoke all` voor `anon` en `authenticated`, daarna per kolom teruggeven, want een recht op de hele tabel dekt alle kolommen en een revoke op een losse kolom haalt dat niet weg. De app ziet dus wel dat er een koppeling is, maar komt niet bij het token, ook niet versleuteld. |
| Versleutelen | AES-256-GCM, sleutel van 32 bytes uit `BUNDEL_TOKEN_KEY`. GCM controleert ook, dus een aangepaste rij valt bij het ontsleutelen door de mand. |
| Nooit loggen | Geen token in een foutmelding, een logregel of een stack trace. Ontsleutelen dat mislukt geeft geen oorzaak terug, want een verkeerde sleutel en een aangepaste rij horen er van buiten hetzelfde uit te zien. |
| Waar de server staat | Nieuwe map `server/` in de root, buiten `web/`. Alles in `web/` wordt gebouwd tot bestanden die de browser downloadt, dus client secrets, de tokensleutel en de service role key kunnen daar niet staan. |
| Het contract | Een connector geeft altijd een `SyncResult` terug en gooit nooit. Een bron die eruit ligt is normaal, dus mislukken is onderdeel van het antwoord. `runConnector()` vangt af wat er ondanks het contract toch omhoog komt. |
| Registry | Nu leeg. `register()`, `getConnector()` en `listConnectors()` staan klaar, er is nog niets om in te vullen. |
| Geen afhankelijkheden | `server/` heeft geen `node_modules`. Node draait de TypeScript zelf en `node --test` draait de negentien tests. Dat scheelt een tweede lock file om bij te houden. |
| CI | `.github/workflows/ci.yml` bij elke PR naar `main` en bij elke push naar `main`: node uit `.nvmrc` (24), `npm ci`, `npm run build`, `npm run smoke`, alleen in `web/`. De tests van `server/` draaien daar bewust nog niet in. |
| Nepsleutels in CI | De rendertest heeft `VITE_SUPABASE_URL` en `VITE_SUPABASE_ANON_KEY` nodig, anders maakt de client niets aan en crasht hij. Er gaat niets over het netwerk, want de test zet zelf een nep-PostgREST neer. De waarden zijn dus nep en staan gewoon in het workflowbestand. |

**Prompt 20: de eerste echte connector (geen vragenronde, opdracht lag vast)**

Weer niets aan de voorkant. Alleen `web/README.md` is aangeraakt, en dat is documentatie.

| Onderwerp | Keuze |
|---|---|
| `origin/Back-end` | Bevat niets dat niet al in `main` zit, dus die branch mag vervangen worden. Nog niet gepusht, dat gebeurt pas na akkoord. |
| `select *` op `connections` | Verboden, en dat staat nu als afspraak in sectie 4. De rechten op kolomniveau maken er anders `permission denied for table connections` van, en die melding wijst je de verkeerde kant op. |
| CI | De tests van `server/` draaien mee als eigen stap. De job heet nu `checks` in plaats van `web`, want hij doet allebei. |
| Node op Vercel | Niet te controleren van hieruit, en de root `.nvmrc` telt daar niet mee: Root Directory staat op `web` en Vercel kijkt alleen in die map. Wat er verwacht wordt staat nu in `web/README.md`. `.nvmrc` is niet aangeraakt. |
| Flow | Authorization code met PKCE. Ook met een client secret erbij, want een onderschepte code is dan nog steeds niets waard. |
| Tenant | Een vaste tenant uit `MICROSOFT_TENANT_ID`, niet `common`. Met `common` kan iedereen met een Microsoft-account inloggen, ook wie niets met de school te maken heeft. |
| Scopes | `openid`, `profile`, `offline_access`, `User.Read`, `Team.ReadBasic.All`, `Channel.ReadBasic.All`, `ChannelMessage.Read.All`. Allemaal alleen lezen, uitleg per stuk in `server/README.md`. |
| Bewust niet gevraagd | `Chat.Read`, want de app belooft op het scherm Bronnen "geen chats van anderen". `Calendars.Read` ook niet, want het rooster komt uit Magister. En niets met `ReadWrite`. |
| Verversen | Vijf minuten voor het verlopen automatisch, en nog een keer als Graph alsnog 401 zegt. Stuurt Microsoft geen nieuw refresh token mee, dan blijft het oude staan. |
| 429 | Wachten volgens `Retry-After`, dat zowel een aantal seconden als een datum kan zijn. Nooit langer dan een minuut, en hoogstens drie pogingen. |
| Ingetrokken toestemming | Status `revoked` en klaar. De client probeert daarna niets meer, want opnieuw proberen levert toch niets op. |
| `SyncFailure.status` | Nieuw veld, zodat een connector zelf kan zeggen dat het `revoked` moet worden. Zonder dat veld maakte `statusAfter()` er `expired` van, en dat is iets anders. |
| `TokenStore` | Staat in `types.ts` en zit in `SyncContext`. De connector geeft alleen door wat er is veranderd, versleuteld. Wie het naar `connections` schrijft bestaat nog niet. |
| Wat `sync()` nu doet | Alleen `/me` aanroepen om te zien of de koppeling nog werkt, en een leeg resultaat teruggeven. Nog geen kanaal en geen bericht opgehaald, dat was ook de opdracht. |
| Tests | Zestig stuks, allemaal met een nep-`fetch` en een `sleep` die niet wacht. Er gaat geen enkel verzoek het netwerk op. |
| Type-controle | Eenmalig met `tsc` gedraaid tegen `server/src`, streng en met `erasableSyntaxOnly`. Schoon. `typescript` staat niet in de repo, want `server/` blijft zonder afhankelijkheden. |

**Routes site:** `/` · `/login` · `/wachtwoord` · `/download` · `/privacy` · `/voorwaarden` · `/over` · 404-fallback.
**Routes app:** `/app` · `/app/opdrachten` · `/app/rooster` · `/app/cijfers` · `/app/groepen` ·
`/app/aanwezigheid` · `/app/bronnen` · `/app/instellingen`, alle achter `RequireAuth`.
**Home-secties:** hero + app-preview, bronnenstrip, probleem, oplossing/functies (`#functies`),
"wat Bundel niet doet", privacyblok, platforms, FAQ, wachtlijst (`#wachtlijst`).

**Afspraken die hieruit volgen**
- Alle zichtbare tekst staat in `src/i18n.jsx`, in `nl` én `en`. Nergens losse strings in componenten.
- Alle kleuren via `var(--…)`. Geen losse hexwaarden in `layout.css`.
- Wat nog niet echt werkt is per onderdeel gemarkeerd in `web/README.md` (tabel).
- Demodata hoort in `src/app/demo.js` en nergens anders. Schermen bevatten geen lijstjes.
- De app-demo heeft een eigen layout zonder site-header en site-footer. `SiteLayout` in
  `App.jsx` geldt alleen voor de publieke pagina's.
- Rendertest zonder browser: `npm run smoke` in `web/`. Die zet een nep-PostgREST neer, laat
  `store.js` daar de demodata in schrijven en weer uitlezen, controleert de uitkomsten en
  rendert daarna elk scherm en elke pagina met `react-dom/server`. De Chrome-extensie
  blokkeert localhost, dus dit is de manier om te controleren dat er niets crasht.
- Sleutels staan nooit in de code. Lokaal in `web/.env.local` (staat in `.gitignore`), op
  Vercel bij Environment Variables. `web/.env.example` zegt welke er nodig zijn.
- Schemawijzigingen gaan als migratie, en het bestand komt in `supabase/migrations/`.
- **Op `connections` nooit `select *`.** Noem daar altijd de kolommen die je nodig hebt. De
  twee tokenkolommen zijn met rechten op kolomniveau afgeschermd, en een `select *` vraagt ze
  dus mee. Postgres geeft dan `permission denied for table connections` in plaats van lege
  kolommen, en die melding wijst je de verkeerde kant op. Leesbaar voor `authenticated` zijn:
  `id`, `user_id`, `source`, `external_account_id`, `status`, `scopes`, `connected_at`,
  `last_synced_at`, `last_error` en `token_expires_at`. Niet leesbaar, voor niemand behalve de
  server: `access_token_encrypted` en `refresh_token_encrypted`.
- Controle voor je klaar bent: `grep -rnP "\x{2014}" .` moet leeg zijn buiten `node_modules`,
  `dist` en `support.js` (dat is gegenereerde Claude Design runtime, gemarkeerd als do not edit).

## 5. Openstaande vragen

1. Welk contactadres komt er? Zolang dat er niet is blijft `[contactadres volgt]` zichtbaar op
   `/privacy` en `/voorwaarden`. Invullen in `contact.emailPlaceholder` in `src/i18n.jsx`,
   daarna de `.placeholder`-opmaak en de `note` weghalen.
2. Zodra er een domein is: instellen in Vercel en eventueel de titel in `index.html` bijwerken.
3. Wil je een cookiemelding? Nu niet nodig, er is geen tracking en geen analytics.
4. Moeten de voorwaarden door iemand nagekeken worden voordat de site echt live gaat?
5. Wie zet het Vercel-project op, jij of je projectpartner? Vergeet Root Directory `web` niet.
6. Staan de herstel-adressen in Supabase? Onder Authentication, URL Configuration moeten
   `http://localhost:5173/**` en het adres van de gepubliceerde site bij Redirect URLs staan,
   anders komt de link uit een herstelmail op de verkeerde plek uit.
7. Staat "Confirm email" uit in Supabase? Voor de demo hoort dat uit te staan, anders kan een
   nieuw account niet meteen inloggen. Voor de site echt live gaat zet je hem juist aan.
   Authentication, Sign In / Providers, Email.
8. Wie zet de omgevingsvariabelen in Vercel? `VITE_SUPABASE_URL` en `VITE_SUPABASE_ANON_KEY`
   moeten daar staan, anders werkt inloggen op de gepubliceerde site niet.
9. Blijft de standaard mailafzender van Supabase goed genoeg? Die is beperkt tot een paar
   berichten per uur. Zodra er echte gebruikers zijn is een eigen SMTP nodig.
10. Wanneer gaat `demo.js` weg? Dat kan zodra de eerste echte koppeling de tabellen vult.
    Sinds prompt 19 kan dat ook per rij: alles wat `store.js` klaarzet heeft `is_demo = true`,
    dus `delete from ... where user_id = ... and is_demo` ruimt de demo op zonder de echte
    rijen te raken. De vraag blijft open tot die eerste koppeling er is.
11. Wat is het adres van de site op Vercel? Zonder dat adres is niet te controleren of de
    gepubliceerde build de omgevingsvariabelen bevat, en kan het ook niet bij de Redirect URLs
    in Supabase gezet worden.
12. Waar gaat `server/` draaien? Railway was de gedachte, maar er is nog niets besloten en er
    is nog niets om te draaien.
13. Wie vraagt de developer key voor Canvas aan? Dat kan alleen de beheerder van de instantie,
    dus daar is een school voor nodig die meewerkt. Zonder die sleutel komt de connector voor
    Canvas niet verder dan het contract.
14. Waar komt `BUNDEL_TOKEN_KEY` te staan zodra er echt gekoppeld wordt? Bij de hosting van de
    server, nooit in git en nooit in `web/`. Raakt die sleutel kwijt, dan moet iedereen opnieuw
    koppelen.
15. Moeten de tests van `server/` mee in CI? Nu draait daar alleen `web/`, zoals afgesproken.
    Zodra er meer in `server/` staat dan het contract hoort er een stap bij.
16. Krijgt Magister een koppeling? De tabel `connections` laat nu alleen `canvas` en
    `microsoft` toe. Er is geen open aanmeldweg voor Magister bekend.
17. De twee nieuwe migraties zijn nog niet toegepast op het echte project. Dat gebeurt pas als
    ze nagekeken zijn, want `revoke` op een kolom is niet iets om blind uit te voeren.
18. Er moet een app-registratie komen in de Microsoft-tenant van een school, en **een beheerder
    van die tenant moet hem goedkeuren**. Zonder die goedkeuring werkt de flow niet: het
    inloggen loopt vast op `AADSTS65001` en Graph geeft 403. Dat komt door de drie scopes met
    `.All` erachter, die nodig zijn om teams, kanalen en berichten te lezen. Zolang die
    goedkeuring er niet is valt de connector alleen met nep-antwoorden te testen.
19. Welke tenant wordt dat? Nu staat er een vaste tenant uit `MICROSOFT_TENANT_ID`. Met
    `common` kan iedereen met een Microsoft-account inloggen, en dat willen we niet.
20. Het client secret van Entra verloopt. Wie houdt de vervaldatum bij? Daarna stopt de
    koppeling zonder waarschuwing.
21. Waar worden `state` en de `code_verifier` bewaard tussen het wegsturen en het terugkomen?
    Dat hangt aan het endpoint voor de redirect, en dat bestaat nog niet.
22. Welke Node-versie staat er in het Vercel-project? De root `.nvmrc` telt daar niet mee, want
    Root Directory staat op `web`. Nakijken onder Project Settings, Build & Development
    Settings, Node.js Version. Zie ook `web/README.md`.

## 6. Changelog

- **prompt 1**: repo verkend, branding en prototype gelezen, `CLAUDE.md` aangemaakt,
  drie vragenrondes (12 vragen), website gebouwd in `web/`: 6 pagina's, 7 componenten,
  3 CSS-bestanden, NL/EN. Build slaagt. Werk staat op branch `Front-end`.
- **prompt 2**: identiteit gecorrigeerd. SintLucas en "schoolproject" overal vervangen door
  AltijdBezig (site, README, branding kit, prototype). Alle 65 em dashes verwijderd en die
  zinnen herschreven: 20 in `i18n.jsx`, 22 in de branding kit, 3 in het prototype, 18 in
  `CLAUDE.md`, 2 in `App.jsx`, 1 in `index.html`, 1 in `README.md`. Nieuwe permanente regel:
  nooit em dashes (regel 2). FAQ over prijs en over school herschreven voor de bredere
  doelgroep. `about.eyebrow` toegevoegd aan de vertalingen.
- **prompt 3**: `/voorwaarden` toegevoegd (nieuwe pagina `Terms.jsx`, zes kopjes, NL en EN,
  link in de footer). `ContactCard.jsx` met zichtbaar gemarkeerde placeholder op `/privacy` en
  `/voorwaarden`. `vercel.json` toegevoegd met SPA-rewrite; hostinguitleg in `web/README.md`.
  Nep-domein uit de app-preview gehaald. Electron vastgelegd als richting voor de desktop-app.
  Werk gecommit op `Front-end` en gepusht naar GitHub.
- **prompt 4**: "wachtwoord vergeten" is geen dood anker meer maar een knop met een melding
  (`login.forgotNotice`), klaar om te vervangen door een echte route zodra auth er is.
  `Front-end` samengevoegd met `main` en beide gepusht. Rest van de antwoorden vroeg geen
  codewijziging: contactadres blijft een placeholder, geen cookiemelding, voorwaarden
  worden niet nagekeken.
- **prompt 5**: app-demo gebouwd achter `/app`. Zes schermen (Vandaag, Opdrachten, Rooster,
  Cijfers, Groepen, Bronnen), zijbalk op desktop en onderbalk op mobiel, storingsbalk als een
  bron onbereikbaar is. Datalaag `src/app/data.js` met alle nepdata uit het prototype,
  tweetalig. Nep-sessie in `src/auth.jsx`: inloggen accepteert elk geldig adres en opent de
  demo, `RequireAuth` schermt `/app` af. Hero aangepast: inloggen is de enige grote knop,
  downloaden staat als tekstlink eronder. Header wijst naar `/app` zodra je bent ingelogd.
  Alle routes en schermen server-side gerenderd als test, alles rendert.
- **prompt 6**: app afgemaakt. Topbalk met zoeken (Ctrl+K) en meldingenpaneel. Scherm
  `/app/instellingen` met taal, meldingen aan of uit, account, demo opnieuw beginnen en
  uitloggen. Onboarding-scherm zodra alle bronnen verbroken zijn. Lege staten via
  `EmptyState.jsx` in Vandaag, Opdrachten, Rooster en Cijfers. Meldingen en zoekresultaten
  komen ook uit `data.js`, dus ook die kant is klaar voor de echte API. Rendertest uitgebreid
  met de nieuwe schermen en met controles op de zoekresultaten.
- **prompt 7**: zoekvenster herzien. Resultaten gegroepeerd per type met kopjes en tellers,
  icoon per type, bron rechts, treffer vet gemarkeerd. Vaste hoogte zodat het venster niet
  springt. Toetsenbordnavigatie met pijltjes en Enter. Leeg venster toont snelkoppelingen naar
  de zes schermen en de eerstvolgende deadline. Rendertest controleert nu ook de inhoud van het
  lege venster en de groepering.
- **prompt 8**: rooster vervangen door een tijdraster. Nepdata uitgebreid met eindtijden,
  docenten en `dueDate` per opdracht, zodat `getWeek()` per les kan zeggen of er die dag een
  deadline bij hoort. Nieuwe helpers in `data.js`: `toMinutes()`, `getWeekBounds()` en
  `DEMO_NOW_MINUTES` (de demo-tijd staat vast op 10:15, midden in Interaction Design).
  Onder 700px een agenda-lijst in plaats van het raster. Rendertest controleert nu ook de
  roosterdata: eindtijden na begintijden, docent per les, rastergrenzen, gekoppelde deadlines
  en of de nu-streep in de juiste les valt.
- **prompt 9**: drie visuele fouten in het rooster gefixt na een screenshot: te lage blokken,
  botsende tijdlabels en een nu-streep die door andere dagen sneed. Dagkop compacter: datum en
  de badge vandaag staan nu op een regel.
- **prompt 10**: rooster uitgebreid met vijf weken en een lespop-up. `WEEK` werd `WEEKS` met
  vijf weken; `getWeek(lang, index)`, `getWeeks(lang)` en `CURRENT_WEEK_INDEX` erbij.
  `getWeekBounds()` kijkt nu over alle weken, zodat de rasterhoogte niet verspringt bij
  bladeren. Nieuwe `getSubjectDetail()` levert de inhoud van de pop-up. Vijf opdrachten
  toegevoegd met deadlines in andere weken, en `getAssignments()` sorteert nu op datum.
  Nieuw bestand `LessonDialog.jsx`, gedeeld door Rooster en Vandaag.
  Drie fouten die de rendertest ving en die zonder test onopgemerkt waren gebleven:
  `getAssignments()` gaf de vaksleutel niet terug waardoor de pop-up nooit opdrachten toonde,
  `Number(params.get('week'))` werd 0 zonder parameter waardoor het rooster op week 35 opende,
  en twee deadlines vielen niet op een lesdag.
- **prompt 11**: zes schermen herzien. Nieuwe gedeelde componenten `ScreenHeader.jsx`,
  `Dialog.jsx` (met `DialogFacts` en `DialogSection`), `AssignmentDialog.jsx` en
  `StartScreen.jsx`. `LessonDialog` gebruikt nu dezelfde schil. Datalaag uitgebreid met
  `getTimeline()`, `assignmentTerm()`, `getSourceStats()`, `getGradeStats()`, `TODAY_DATE`,
  een tijdstip per deadline, groepstaken, bestanden en een dag per bericht. `state.jsx` kreeg
  meldingen per soort, groepstaken, het startscherm en een nep-sync per bron.
  De rendertest ving dat 5.8 in Nederland een voldoende is, waardoor het uitlichten van
  onvoldoendes nergens op reageerde. Eén cijfer aangepast naar 4.8 zodat die functie zichtbaar is.
- **prompt 12**: cijfers omgebouwd van losse getallen naar invoeren met `what`, `date`,
  `weight` en `remark`. Nieuwe sectie met de laatste cijfers op `/app/cijfers`, nieuw bestand
  `GradeDialog.jsx` voor de opmerking, en gewogen gemiddelden via een `weighted()`-helper.
  `getRecentGrades()` leidt de lijst nu af uit de invoeren, dus de losse `RECENT_GRADES` is weg.
  De rendertest ving dat `getSourceStats()` nog `g.marks.length` telde, een veld dat na de
  omzetting niet meer bestond; daardoor crashte het scherm Bronnen volledig.
- **prompt 13**: nieuw scherm `/app/aanwezigheid` en een signaalblok in de lespop-up.
  Datalaag kreeg `ATTENDANCE` (afwijkingen per les, de rest is aanwezig), `getAttendance()`,
  `getAttendanceSummary()`, `getSubjectAttendance()`, `getSubjectSignal()` en
  `ATTENDANCE_LIMIT`. `getSubjectSignal()` neemt de afgevinkte opdrachten mee, dus het signaal
  verdwijnt zodra je een verlopen opdracht afvinkt. `AppLayout` splitst nu `NAV` (zijbalk, zeven)
  en `TABS` (onderbalk, zes). Nieuw icoon `IconPresence`.
- **prompt 14**: eigen items in het rooster en een signaalregel op Vandaag. Nieuw bestand
  `OwnItemDialog.jsx` (toevoegen, aanpassen, verwijderen) en `signal.js` met `signalLine()`,
  gedeeld door de lespop-up en Vandaag. `state.jsx` kreeg `ownItems` met toevoegen, wijzigen en
  verwijderen. `data.js` kreeg `ownItemsFor()` en `getSignals()`, en `getTimeline()` neemt nu
  eigen items mee. De rendertest ving twee fouten: `toMinutes('08:00')` is 480 en dus waar,
  waardoor een herinnering zonder eindtijd duur 0 kreeg in plaats van 30 minuten, en het
  bewerkformulier vulde zich pas in een effect waardoor het venster eerst leeg opende.
- **prompt 15**: de drie kale links onderaan de zijbalk vervangen door een accountknop met een
  menu. Het accountblok bovenaan is weg, want dat stond dubbel. Nieuw icoon `IconLogout`.
  Menu sluit met Escape, met een klik ernaast en bij het wisselen van scherm.
- **prompt 16**: Supabase gekoppeld. Nieuw project `Bundel`, vier migraties in
  `supabase/migrations/`: zeventien tabellen met RLS, een trigger die bij het aanmelden een
  profiel aanmaakt, en het recht om die functie via de API aan te roepen weer ingetrokken.
  De nepdata is uit `data.js` gehaald en staat nu in `demo.js`; `data.js` werkt op een dataset
  die `store.js` uit de database laadt en met `setDataset()` klaarzet. `auth.jsx` is echte auth
  geworden, `/login` kreeg een schakelaar tussen inloggen en aanmelden, en het
  wachtlijstformulier schrijft nu echt weg. Nieuwe bestanden: `src/supabase.js`,
  `src/app/demo.js`, `src/app/store.js`, `src/__smoke.jsx` en `.env.example`.
  De rendertest is meegegroeid: hij zet een nep-PostgREST neer, zodat het vullen en het lezen
  tegen elkaar gecontroleerd worden. Die ving drie dingen: er zijn elf opdrachten en geen
  twaalf, geen enkel vak staat gemiddeld onvoldoende (alleen losse cijfers), en een lege dag
  in het rooster verdween omdat de datums bij de lessen hingen. Daarvoor is `day_dates` aan de
  tabel `weeks` toegevoegd. Daarna live gecontroleerd met een echte gebruiker: de trigger, de
  policies, het vullen en het bewaren van een vinkje werken, en je ziet alleen je eigen rijen.
  Die testgebruiker is daarna weer verwijderd, dus de database is leeg.
- **prompt 17**: wachtwoord vergeten afgemaakt. `/login` kreeg een derde stand die een
  herstelmail stuurt, en de nieuwe pagina `/wachtwoord` (`src/pages/NewPassword.jsx`) vangt de
  link uit die mail op. `auth.jsx` kreeg `requestReset()` en `updatePassword()`, en
  `detectSessionInUrl` staat aan zodat supabase-js het token uit de URL leest. Na het opslaan
  logt de app uit en stuurt terug naar `/login` met een melding. De rendertest rendert de
  nieuwe pagina en controleert dat de knop wachtwoord vergeten op `/login` staat. Verder is de
  branch `Supabase` gepusht en samengevoegd met `main`. Eigen SMTP en inloggen met een
  Microsoft-account zijn bewust nog niet gedaan.
- **prompt 18**: geen code veranderd, wel gecontroleerd. Uitgelegd wie wat instelt: Supabase
  bij Benjamin, Vercel bij Jayden. De waarschuwing van Vercel over Secret tegenover Config
  uitgezocht: `VITE_`-variabelen horen op Config, want ze komen sowieso in de browser terecht.
  Daarna live geverifieerd dat aanmelden, de trigger, het vullen, opnieuw inloggen en het
  bewaren werken, en dat Confirm email uit staat. Testgebruiker weer verwijderd.
- **prompt 19**: de back-end op gang gebracht, zonder iets aan de voorkant te raken. Regel 4
  rechtgezet: Jayden op `Front-end`, Benjamin op `Back-end`. Twee migraties erbij:
  `20260908100000_demo_flag.sql` zet `is_demo` op de dertien tabellen die `store.js` vult en
  markeert bestaande rijen als demo, en `20260908101500_connections.sql` maakt de tabel
  `connections` met RLS, vier policies, een unieke index op (user_id, source) en tokens die
  alleen versleuteld worden opgeslagen. De browser komt niet bij de twee tokenkolommen: dat is
  geregeld met de rechten op de kolom, met eerst een `revoke all` en daarna per kolom
  teruggeven, want anders dekt het recht op de tabel nog steeds alles. In `store.js` is alleen de
  `rows()`-helper in `seed()` veranderd: elke gevulde rij krijgt `is_demo: true`. Wat de
  schermen te zien krijgen blijft gelijk. Nieuwe map `server/` met het contract voor een
  connector (`types.ts`), de registry en `runConnector()` (`index.ts`), de tokenhulp
  (`crypto/tokens.ts`) en negentien tests die op node zelf draaien, zonder afhankelijkheden.
  Nog geen OAuth-flow en geen enkele echte API-call. Verder `.nvmrc` (node 24) en
  `.github/workflows/ci.yml`, die bij elke PR naar `main` `npm ci`, `npm run build` en
  `npm run smoke` draait in `web/`. Daarbij bleek dat de rendertest omvalt zonder
  `VITE_`-sleutels, dus die staan als nepwaarden bij de smoke-stap.
- **prompt 20**: de OAuth-kant van de eerste echte connector, opnieuw zonder de voorkant aan te
  raken. Uitgezocht dat `origin/Back-end` niets bevat dat niet al in `main` zit, dus die mag
  vervangen worden; nog niet gepusht. Nieuwe vaste afspraak in sectie 4: op `connections` altijd
  de kolommen benoemen, nooit `select *`, met de lijst van wat `authenticated` mag lezen. CI
  draait nu ook `cd server && npm test`, en de job heet `checks`. De Node-versie van Vercel is
  van hieruit niet te zien en de root `.nvmrc` telt daar niet mee, dus dat staat nu uitgelegd in
  `web/README.md`; `.nvmrc` zelf is niet aangeraakt. Nieuw: `server/src/connectors/microsoft/`
  met `auth.ts` (authorization code met PKCE, de URL bouwen, de code inwisselen, verversen),
  `client.ts` (Graph met automatisch verversen, 401 een keer opnieuw, `Retry-After` bij 429, en
  stoppen bij een ingetrokken toestemming) en `index.ts` (de connector, die zich bij de registry
  meldt). `types.ts` kreeg er `TokenStore`, `TokenUpdate` en een `status` op `SyncFailure` bij,
  zodat een connector zelf `revoked` kan zeggen in plaats van `expired`. Zestig tests, allemaal
  met een nep-`fetch` en zonder ooit het netwerk aan te raken. De gekozen scopes en wat er
  bewust niet gevraagd wordt staan met uitleg in `server/README.md`, en `server/.env.example`
  legt per variabele uit waar hij vandaan komt.
