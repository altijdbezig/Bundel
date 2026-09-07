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
   │  └─ WaitlistForm.jsx     wachtlijst (valideert, bewaart nog niets)
   └─ pages/
      ├─ Home.jsx             /
      ├─ Login.jsx            /login
      ├─ Download.jsx         /download
      ├─ Privacy.jsx          /privacy
      ├─ About.jsx            /over
      └─ NotFound.jsx         alles daarbuiten
```

## Wat nog niet echt werkt

Bewust, dit is de front-end van een prototype:

| Onderdeel | Nu | Later aansluiten in |
| --- | --- | --- |
| Inloggen (e-mail) | valideert, toont melding | `pages/Login.jsx` → `handleSubmit` |
| Inloggen (schoolaccount) | knop toont melding | `pages/Login.jsx` → `auth__sso` |
| Wachtlijst | valideert, bewaart niets | `components/WaitlistForm.jsx` → `handleSubmit` |
| Downloads | knoppen uitgeschakeld | `pages/Download.jsx` → `aria-disabled` vervangen door `href` |
| App Store / Play | badges uitgeschakeld | idem, zodra de store-URL bestaat |

## Teksten wijzigen

Alle zichtbare tekst staat in `src/i18n.jsx`, gesplitst in `nl` en `en`. Nergens anders
staan losse strings. Voeg je een tekst toe, doe dat in beide objecten.

## Kleuren wijzigen

Alleen in `src/styles/tokens.css`. De rest van de CSS gebruikt uitsluitend `var(--…)`.
