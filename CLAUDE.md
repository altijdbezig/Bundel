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
   - `Front-end`: website, UI, styling, componenten, teksten (**Claude werkt hier**)
   - `Back-end`: API, database, koppelingen, auth (van de projectpartner, afblijven)
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
├─ Claude Design/
│  ├─ Branding/Bundel Branding Kit.dc.html    merkrichtlijnen, 8 tabs
│  └─ Prototype/Bundel.dc.html                app-prototype, desktop + mobiel
└─ web/                                       de website (prompt 1)
   ├─ README.md                               draaien, structuur, wat nog niet werkt
   ├─ index.html · vite.config.js · package.json · vercel.json
   ├─ public/  favicon.svg · _redirects
   └─ src/
      ├─ main.jsx · App.jsx · i18n.jsx
      ├─ styles/   tokens.css · global.css · layout.css · app.css
      ├─ components/ Logo · Icons · Header · Footer · Reveal · AppPreview · WaitlistForm ·
      │              ContactCard
      ├─ auth.jsx    nep-sessie + RequireAuth
      ├─ app/        data.js (nepdata) · state.jsx · AppLayout.jsx · EmptyState.jsx ·
      │              SearchDialog.jsx · NotificationsPanel.jsx · screens/ (8 schermen)
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

**Routes site:** `/` · `/login` · `/download` · `/privacy` · `/voorwaarden` · `/over` · 404-fallback.
**Routes app:** `/app` · `/app/opdrachten` · `/app/rooster` · `/app/cijfers` · `/app/groepen` ·
`/app/bronnen` · `/app/instellingen`, alle achter `RequireAuth`.
**Home-secties:** hero + app-preview, bronnenstrip, probleem, oplossing/functies (`#functies`),
"wat Bundel niet doet", privacyblok, platforms, FAQ, wachtlijst (`#wachtlijst`).

**Afspraken die hieruit volgen**
- Alle zichtbare tekst staat in `src/i18n.jsx`, in `nl` én `en`. Nergens losse strings in componenten.
- Alle kleuren via `var(--…)`. Geen losse hexwaarden in `layout.css`.
- Wat nog niet echt werkt is per onderdeel gemarkeerd in `web/README.md` (tabel).
- Nepdata hoort in `src/app/data.js` en nergens anders. Schermen bevatten geen lijstjes.
- De app-demo heeft een eigen layout zonder site-header en site-footer. `SiteLayout` in
  `App.jsx` geldt alleen voor de publieke pagina's.
- Rendertest zonder browser: bouw met `npx vite build --ssr` en render de routes en schermen
  met `react-dom/server`. De Chrome-extensie blokkeert localhost, dus dit is de manier om te
  controleren dat er niets crasht.
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
6. Komt er een wachtwoord-vergeten-stroom? De link op `/login` wijst nu naar `#wachtwoord` en
   doet nog niets.

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
