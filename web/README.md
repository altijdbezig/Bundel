# Bundel website

Homepagina, losse pagina's en de app van Bundel, gemaakt door AltijdBezig. Vite + React +
React Router, gewone CSS met designtokens uit de branding kit. Inloggen en de data lopen via
Supabase.

## Draaien

```bash
cd web
npm install
cp .env.example .env.local   # vul je Supabase-sleutels in
npm run dev      # http://localhost:5173
npm run build    # productiebuild in dist/
npm run preview  # bekijk de productiebuild
npm run smoke    # rendertest zonder browser
```

## Supabase

De app praat met een Supabase-project: inloggen, en alle data van de ingelogde gebruiker.
Twee omgevingsvariabelen zijn nodig, lokaal in `.env.local` en op Vercel bij Project
Settings, Environment Variables:

```
VITE_SUPABASE_URL=https://jouw-project.supabase.co
VITE_SUPABASE_ANON_KEY=jouw-publieke-sleutel
```

De publieke sleutel mag in de browser staan. Wat iemand mag zien wordt niet door de sleutel
bepaald maar door RLS in de database: elke rij heeft een `user_id` en je ziet alleen je eigen
rijen. Het schema staat in `supabase/migrations/` in de hoofdmap van de repo.

Bij de eerste keer inloggen krijgt een account een eigen kopie van de demodata uit
`src/app/demo.js`. Vanaf dat moment leest de app alleen nog uit de database, en blijft
afvinken, instellingen en wat je zelf toevoegt bewaard. Zodra Canvas, Teams en Magister echt
gekoppeld zijn schrijven die dezelfde tabellen en kan `demo.js` weg.

## Structuur

```
web/
├─ index.html                 meta, fonts, favicon
├─ public/
│  ├─ favicon.svg             beeldmerk, 2 lagen (16px-variant)
│  └─ _redirects              SPA-fallback voor Netlify
├─ vercel.json               build- en rewrite-config voor Vercel
└─ src/
   ├─ main.jsx                entry: router + taalprovider
   ├─ App.jsx                 routes, paginatitels, scrollgedrag
   ├─ i18n.jsx                alle teksten, NL + EN
   ├─ styles/
   │  ├─ tokens.css           kleuren, typografie, ruimte, radius
   │  ├─ global.css           basis + herbruikbare klassen (.btn, .card, .input)
   │  └─ layout.css           secties en pagina-specifieke layout
   ├─ components/
   │  ├─ Logo.jsx             beeldmerk (gestapelde lagen) + secundaire cirkels
   │  ├─ Icons.jsx            lijniconen, 24px grid, 1.75px streek
   │  ├─ Header.jsx           sticky nav + taalwissel + mobiel menu
   │  ├─ Footer.jsx
   │  ├─ Reveal.jsx           fade-in bij scrollen, uit bij reduced motion
   │  ├─ AppPreview.jsx       nagebouwd "Vandaag"-scherm voor de hero
   │  ├─ WaitlistForm.jsx     wachtlijst, schrijft naar de tabel `waitlist`
   │  └─ ContactCard.jsx      contactblok met zichtbare placeholder
   ├─ supabase.js            de verbinding, uit de omgevingsvariabelen
   ├─ app/                    de app achter /app
   │  ├─ data.js             de getters die de schermen gebruiken, boven op de geladen dataset
   │  ├─ demo.js             de demodata waarmee een nieuw account wordt gevuld
   │  ├─ store.js            alles wat met de database praat: laden, vullen, schrijven
   │  ├─ state.jsx           taken, bronstatus, gelezen meldingen, voorkeuren
   │  ├─ AppLayout.jsx       zijbalk, topbalk, mobiele onderbalk, storingsbalk
   │  ├─ SearchDialog.jsx    zoekvenster, opent met Ctrl+K
   │  ├─ NotificationsPanel.jsx  paneel onder het belletje
   │  ├─ EmptyState.jsx      lege staat binnen een kaart
   │  └─ screens/            Today · Assignments · Schedule · Grades · Groups · Sources ·
   │                         Settings · Onboarding
   ├─ auth.jsx               Supabase Auth plus RequireAuth
   └─ pages/
      ├─ Home.jsx             /
      ├─ Login.jsx            /login
      ├─ Download.jsx         /download
      ├─ Privacy.jsx          /privacy
      ├─ Terms.jsx            /voorwaarden
      ├─ About.jsx            /over
      └─ NotFound.jsx         alles daarbuiten
```

## Hosten

De site is een statische SPA. Vercel is hiervoor het handigst: gratis, geen server nodig en
het bouwt zelf bij elke push.

**Vercel**
1. Nieuw project, koppel deze repo.
2. Zet **Root Directory** op `web`. Zonder dit vindt Vercel de package.json niet.
3. Framework staat op Vite, build command `npm run build`, output `dist`. Dat staat al in
   `vercel.json`, dus je hoeft niets in te vullen.
4. Deploy. Je krijgt een adres op `*.vercel.app` tot er een eigen domein is.

De rewrite in `vercel.json` zorgt dat `/download` en `/privacy` ook werken als iemand die
URL direct opent of ververst. Zonder die regel krijg je daar een 404.

**Railway** kan ook, maar is bedoeld voor servers en databases. Voor deze statische site
betaal je dan voor een draaiend proces dat alleen bestanden uitserveert. Handiger is: front-end
op Vercel, en Railway voor de back-end van je projectpartner.

`public/_redirects` doet hetzelfde als `vercel.json`, maar dan voor Netlify. Kost niets om
te laten staan voor als je toch wisselt.

## Wat nog niet echt werkt

Bewust, dit is de front-end van een prototype:

| Onderdeel | Nu | Later aansluiten in |
| --- | --- | --- |
| Inloggen (e-mail) | werkt echt, via Supabase Auth | klaar |
| Account aanmaken | werkt echt, op /login | klaar |
| Wachtwoord vergeten | knop toont melding | `pages/Login.jsx` → `forgotNotice` |
| Inloggen (schoolaccount) | knop toont melding | OAuth-provider in Supabase plus `auth__sso` |
| Wachtlijst | schrijft naar Supabase | klaar |
| Downloads | knoppen uitgeschakeld | `pages/Download.jsx` → `aria-disabled` vervangen door `href` |
| App Store / Play | badges uitgeschakeld | idem, zodra de store-URL bestaat |
| Contactadres | `[contactadres volgt]` op /privacy en /voorwaarden | `contact.emailPlaceholder` in `src/i18n.jsx` |
| App-data | echte tabellen, gevuld met demodata | `src/app/demo.js` vervangen door een sync |
| Synchroniseren | de knop doet alsof, en zet alleen de tijd | `syncNow` in `src/app/state.jsx` |
| Aanwezigheid | alleen-lezen, komt uit de demodata | de koppeling met Magister |

## De app-demo

`/app` zit achter een echte sessie van Supabase Auth. Zonder sessie word je teruggestuurd
naar `/login`. Uitloggen kan linksonder in de app.

De schermen halen hun data uit `src/app/data.js`. Dat bestand rekent en groepeert, maar
bezit niets: `store.js` laadt de rijen van de ingelogde gebruiker en zet ze met `setDataset()`
klaar. De schermen roepen alleen `getToday()`, `getAssignments()` en zo verder aan en weten
niet waar het vandaan komt. Komt er een echte koppeling, dan vult die de tabellen en hoeft er
aan de schermen niets te veranderen.

Wat je in de app doet gaat meteen naar de database: afvinken, groepstaken, gelezen meldingen,
instellingen, bronnen koppelen en je eigen roosteritems. Het scherm reageert direct en de rij
volgt. Onder Instellingen zet "opnieuw beginnen" alles terug naar de demodata.

Op `/app/bronnen` kun je bronnen koppelen, verbreken en een storing simuleren. Dat laatste
zet de gele balk bovenaan aan, zodat je ziet hoe de app zich houdt als Canvas plat gaat.
Verbreek je alle vier de bronnen, dan neemt het onboarding-scherm de app over.

Zoeken opent met Ctrl+K of met de knop in de topbalk en zoekt door opdrachten, rooster,
cijfers, groepen en berichten. Meldingen zitten achter het belletje ernaast. Beide halen hun
inhoud uit `data.js`, dus ook die zijn klaar voor de echte API.

## Testen zonder browser

De Chrome-extensie blokkeert localhost, dus visueel controleren gaat via je eigen browser.
Voor de rest is er `npm run smoke`. Die zet een nep-database neer waar `store.js` naartoe
schrijft en uit leest, controleert of de data aan de andere kant klopt, en rendert daarna elk
scherm en elke pagina server-side. Er komt geen browser en geen echte Supabase aan te pas.
De test staat in `src/__smoke.jsx`.

## Teksten wijzigen

Alle zichtbare tekst staat in `src/i18n.jsx`, gesplitst in `nl` en `en`. Nergens anders
staan losse strings. Voeg je een tekst toe, doe dat in beide objecten.

## Kleuren wijzigen

Alleen in `src/styles/tokens.css`. De rest van de CSS gebruikt uitsluitend `var(--…)`.
