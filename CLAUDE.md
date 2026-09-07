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
   ├─ index.html · vite.config.js · package.json
   ├─ public/  favicon.svg · _redirects
   └─ src/
      ├─ main.jsx · App.jsx · i18n.jsx
      ├─ styles/   tokens.css · global.css · layout.css
      ├─ components/ Logo · Icons · Header · Footer · Reveal · AppPreview · WaitlistForm
      └─ pages/    Home · Login · Download · Privacy · About · NotFound
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

**Routes:** `/` · `/login` · `/download` · `/privacy` · `/over` · 404-fallback.
**Home-secties:** hero + app-preview, bronnenstrip, probleem, oplossing/functies (`#functies`),
"wat Bundel niet doet", privacyblok, platforms, FAQ, wachtlijst (`#wachtlijst`).

**Afspraken die hieruit volgen**
- Alle zichtbare tekst staat in `src/i18n.jsx`, in `nl` én `en`. Nergens losse strings in componenten.
- Alle kleuren via `var(--…)`. Geen losse hexwaarden in `layout.css`.
- Wat nog niet echt werkt is per onderdeel gemarkeerd in `web/README.md` (tabel).
- Controle voor je klaar bent: `grep -rnP "\x{2014}" .` moet leeg zijn buiten `node_modules`,
  `dist` en `support.js` (dat is gegenereerde Claude Design runtime, gemarkeerd als do not edit).

## 5. Openstaande vragen

1. Komt er een echte domeinnaam (`bundel.app`, `bundel.nl`, iets anders)? Nu staat `bundel.app`
   als voorbeeld in de app-preview.
2. Waar wordt de site gehost: GitHub Pages, Netlify, Vercel, eigen server? Dat bepaalt of de
   `_redirects` klopt of dat er een andere SPA-fallback nodig is.
3. Moet er een voorwaardenpagina komen? De footer verwijst er nu niet naar.
4. Komt er een contactadres voor privacyvragen? Nu staat er alleen "AltijdBezig, de makers van Bundel".
5. Wil je een cookiemelding? Nu niet nodig, er is geen tracking en geen analytics.
6. Moeten de EN-teksten door jou nagelezen worden, of is de vertaling akkoord?
7. Wordt de desktop-app Electron of iets anders? Dat bepaalt de systeemeisen op `/download`
   (nu ingevuld met aannames: Windows 10+, macOS 12+, ~250 MB).
8. Heeft AltijdBezig een eigen logo of site waar Bundel naar mag linken?

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
