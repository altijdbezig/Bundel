<div align="center">

```
██████╗ ██╗   ██╗███╗   ██╗██████╗ ███████╗██╗
██╔══██╗██║   ██║████╗  ██║██╔══██╗██╔════╝██║
██████╔╝██║   ██║██╔██╗ ██║██║  ██║█████╗  ██║
██╔══██╗██║   ██║██║╚██╗██║██║  ██║██╔══╝  ██║
██████╔╝╚██████╔╝██║ ╚████║██████╔╝███████╗███████╗
╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚═════╝ ╚══════╝╚══════╝
```

### Drie apps, één overzicht. En je data blijft waar hij hoort.

[![status](https://img.shields.io/badge/status-in%20ontwikkeling-0E7C66?style=flat-square)](#waar-we-nu-staan)
[![stack](https://img.shields.io/badge/React%20%2B%20Vite-0E7C66?style=flat-square)](#hoe-het-in-elkaar-zit)
[![db](https://img.shields.io/badge/Supabase-0E7C66?style=flat-square)](#hoe-het-in-elkaar-zit)
[![gemaakt door](https://img.shields.io/badge/gemaakt%20door-AltijdBezig-17181A?style=flat-square)](#wie-dit-maakt)

</div>

---

## Het probleem

Je hebt een deadline. In welke app staat hij?

Rooster in het ene systeem. Opdrachten in het tweede. Cijfers in het derde. Groepsoverleg
in een chat die nergens bij hoort. Drie tabbladen open om te weten wat je vandaag moet doen,
en dan alsnog iets missen.

Dat is niet omdat die systemen slecht zijn. Ze zijn alleen nooit ontworpen om samen te werken.

## Wat Bundel doet

Bundel legt er één laag overheen. Je logt één keer in en ziet je dag: welke lessen, welke
deadlines, welke cijfers erbij zijn gekomen, en wat je projectgroep aan het doen is.

Wat Bundel **niet** doet, en dat is net zo belangrijk:

- Niets vervangen. Je cijfers blijven staan waar ze staan.
- Niets terugschrijven. Alleen lezen, altijd.
- Niets bewaren dat niet nodig is. Verbreek je de koppeling, dan is de data weg.
- Niet in andermans chats kijken. Die toestemming vragen we niet eens.

## Waar we nu staan

Eerlijk is eerlijk. Dit is nog niet af.

| Onderdeel | Status |
|---|---|
| Website en landingspagina | ✅ werkt |
| App met negen schermen | ✅ werkt |
| Inloggen en accounts | ✅ werkt |
| Database met RLS | ✅ werkt |
| Rooster, opdrachten, cijfers, groepen | 🟡 draait op demodata |
| OAuth-flow naar Microsoft | 🟡 gebouwd, wacht op een tenant |
| Echte koppelingen | ⏳ nog niet |

De app is dus compleet, maar de data is verzonnen. Elke echte koppeling zit achter iemand
die toestemming moet geven: een tenant-beheerder, een developer key, of een heel
accreditatietraject. Daar zijn we mee bezig. Techniek is hier niet de bottleneck.

## Hoe het in elkaar zit

```
Bundel/
├─ web/         de site en de app        React + Vite, gewone CSS, geen framework
├─ server/      de connectorlaag         Node, nul dependencies, OAuth en tokens
├─ supabase/    het schema               zeven migraties, RLS op alles
└─ CLAUDE.md    het projectgeheugen      elke beslissing sinds prompt 1
```

Vier lagen, van buiten naar binnen:

1. **De bronnen.** Schoolsystemen die we uitlezen. Elk met een eigen API en eigen regels.
2. **De connectorlaag.** OAuth, tokens, ophalen, en vertalen naar één model.
   Een connector die stukloopt trekt de rest nooit mee.
3. **De database.** Supabase. Row Level Security op elke tabel, en tokens versleuteld
   opgeslagen in kolommen waar de browser niet bij kan.
4. **De app.** Eén overzicht, op je laptop en op je telefoon.

## Zelf draaien

```bash
git clone https://github.com/altijdbezig/Bundel.git
cd Bundel/web
npm ci
cp .env.example .env.local   # vul je eigen Supabase-sleutels in
npm run dev                  # localhost:5173
```

Geen browser bij de hand? `npm run smoke` rendert elk scherm en elke pagina zonder er een
te openen. Die test heeft inmiddels meer bugs gevangen dan wij zelf.

Voor de back-end en de OAuth-flow: zie `server/README.md`.

## Een paar dingen waar we trots op zijn

**Tokens die de browser nooit ziet.** RLS gaat over rijen, dus we regelden het per kolom.
Eerst alle rechten terugnemen, daarna per kolom teruggeven. De app kan zien dát er een
koppeling is, maar niet wat erin zit. Ook niet versleuteld.

**Een test die geen browser nodig heeft.** Hij zet een nep-database neer, laat de app daar
data in schrijven en weer uitlezen, en rendert daarna alles server-side. Hij ving onder
andere dat 5.8 in Nederland gewoon een voldoende is, waardoor het uitlichten van
onvoldoendes nergens op reageerde.

**Nul dependencies in `server/`.** Drie GET-routes en wat crypto. Daar heb je geen
framework voor nodig, wel een installatiestap die kan breken.

**Een projectgeheugen dat klopt.** `CLAUDE.md` bevat elke beslissing, waarom we hem namen,
en wat we overwogen. Over een jaar weten we nog waarom iets zo is.

## Op de planning

- [ ] Eerste echte koppeling, zodra er een tenant is
- [ ] Van bron naar scherm met echte data
- [ ] Demodata eruit
- [ ] End-to-end encryptie op de groepschat
- [ ] Data-export en accountverwijdering
- [ ] Meerdere scholen naast elkaar

## Privacy

Bundel is voor studenten, en die zijn vaak minderjarig. Dus we zijn strenger dan nodig.

Geen echte leerlingdata in deze repo. Niet in seeds, niet in tests, niet in screenshots.
Geen wachtwoorden van externe systemen, alleen OAuth. Tokens versleuteld. Gespiegelde data
is een cache met een vervaldatum. En we schrijven zelf geen crypto.

## Wie dit maakt

Twee studenten, in hun vrije tijd, onder de naam **AltijdBezig**. Geen bedrijf, geen
verdienmodel, geen investeerders. Wel een repo vol commits en een `CLAUDE.md` van
een paar duizend woorden.

---

<div align="center">
<sub>Gebouwd omdat we het zelf nodig hadden.</sub>
</div>
