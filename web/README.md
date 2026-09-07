# Bundel website

Homepagina en losse pagina's voor Bundel, gemaakt door AltijdBezig. Vite + React +
React Router, gewone CSS met designtokens uit de branding kit.

## Draaien

```bash
cd web
npm install
npm run dev      # http://localhost:5173
npm run build    # productiebuild in dist/
npm run preview  # bekijk de productiebuild
```

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
   │  ├─ WaitlistForm.jsx     wachtlijst (valideert, bewaart nog niets)
   │  └─ ContactCard.jsx      contactblok met zichtbare placeholder
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
| Inloggen (e-mail) | valideert, toont melding | `pages/Login.jsx` → `handleSubmit` |
| Inloggen (schoolaccount) | knop toont melding | `pages/Login.jsx` → `auth__sso` |
| Wachtlijst | valideert, bewaart niets | `components/WaitlistForm.jsx` → `handleSubmit` |
| Downloads | knoppen uitgeschakeld | `pages/Download.jsx` → `aria-disabled` vervangen door `href` |
| App Store / Play | badges uitgeschakeld | idem, zodra de store-URL bestaat |
| Contactadres | `[contactadres volgt]` op /privacy en /voorwaarden | `contact.emailPlaceholder` in `src/i18n.jsx` |

## Teksten wijzigen

Alle zichtbare tekst staat in `src/i18n.jsx`, gesplitst in `nl` en `en`. Nergens anders
staan losse strings. Voeg je een tekst toe, doe dat in beide objecten.

## Kleuren wijzigen

Alleen in `src/styles/tokens.css`. De rest van de CSS gebruikt uitsluitend `var(--…)`.
