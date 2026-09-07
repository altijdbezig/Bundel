import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'bundel.lang'

export const nl = {
  code: 'nl',
  htmlLang: 'nl',

  nav: {
    product: 'Product',
    privacy: 'Privacy',
    over: 'Over',
    download: 'Downloaden',
    login: 'Inloggen',
    menu: 'Menu',
    langLabel: 'Taal',
    skip: 'Naar de inhoud',
  },

  home: {
    eyebrow: 'Van AltijdBezig · prototype',
    title: 'Drie apps, één overzicht',
    lead: 'Bundel zet je rooster, opdrachten, cijfers en projectgroep naast elkaar. Het vervangt Canvas, Teams en Magister niet. Het leest ze uit.',
    ctaLogin: 'Inloggen op de webversie',
    ctaDownload: 'Software downloaden',
    ctaHint: 'iOS en Android volgen later.',

    sourcesLabel: 'Leest uit',
    sourcesNote: 'Alleen-lezen. Bundel schrijft niets terug naar je schoolsystemen.',

    problemLabel: 'Het probleem',
    problemTitle: 'Vier tabbladen om te weten wat je vandaag moet doen',
    problemBody: 'Je rooster staat in Magister, je opdracht in Canvas, de bestanden in Teams en de afspraken met je groep in een appgroep. Niemand heeft dat overzicht. Je maakt het elke ochtend opnieuw in je hoofd.',
    problems: [
      { t: 'Deadlines op vier plekken', b: 'Een opdracht in Canvas, een inlevermoment in Magister, een herinnering in Teams. Eén ervan mis je.' },
      { t: 'Steeds opnieuw inloggen', b: 'Drie portalen, drie wachtwoorden, drie keer een sessie die verlopen is precies wanneer je iets nodig hebt.' },
      { t: 'Groepswerk buiten school', b: 'De afspraken staan in een chat die niemand terugleest, los van de opdracht waar ze over gaan.' },
    ],

    solutionLabel: 'De oplossing',
    solutionTitle: 'Eén scherm dat al klaarstaat',
    solutionBody: 'Bundel haalt op de achtergrond op wat er is en zet het op volgorde van vandaag. Geen dashboard om in te richten, geen widgets om te slepen. Je opent het en het staat er.',

    featuresLabel: 'Wat erin zit',
    featuresTitle: 'Zes schermen, verder niets',
    features: [
      { t: 'Vandaag', b: 'Je lessen, je deadlines en wat je groep van je verwacht. Op volgorde van tijd, niet van bron.' },
      { t: 'Opdrachten', b: 'Alles uit Canvas op één lijst, met de status die er echt is: ingeleverd, nagekeken, of nog niet begonnen.' },
      { t: 'Rooster', b: 'De week in één blik, inclusief lokaalwijzigingen en uitval zodra de school ze doorgeeft.' },
      { t: 'Cijfers', b: 'Je resultaten uit Magister met het gemiddelde erbij. Alleen-lezen, zoals het hoort.' },
      { t: 'Groepen', b: 'Per project een plek voor taken en berichten, gekoppeld aan de opdracht waar het over gaat.' },
      { t: 'Bronnen', b: 'Zie per systeem of het gekoppeld is en wanneer er voor het laatst gesynchroniseerd is.' },
    ],

    honestLabel: 'Eerlijk',
    honestTitle: 'Wat Bundel niet doet',
    honest: [
      'Het vervangt Canvas, Teams of Magister niet. Die blijf je gebruiken om in te leveren.',
      'Het verzint geen cijfers of deadlines. Staat het niet in de bron, dan staat het niet in Bundel.',
      'Het schrijft niets terug. Bundel leest, meer niet.',
      'Bij een storing zie je de laatste sync met het tijdstip erbij, in plaats van een leeg scherm.',
    ],

    privacyLabel: 'Privacy',
    privacyTitle: 'Je data blijft waar hij hoort',
    privacyBody: 'Bundel bewaart geen kopie van je schoolgegevens langer dan nodig om ze te tonen. Je groepschat is end-to-end versleuteld, dus wij kunnen niet meelezen. Dat is geen belofte maar een gevolg van hoe het gebouwd is.',
    privacyPoints: [
      { t: 'Alleen-lezen koppelingen', b: 'Bundel vraagt de minimale rechten die nodig zijn om te tonen wat je al mag zien.' },
      { t: 'Versleutelde groepschat', b: 'Berichten worden op je eigen apparaat versleuteld en ontsleuteld.' },
      { t: 'Zelf loskoppelen', b: 'Elke bron kun je met één knop verbreken. Daarna is de opgehaalde data weg.' },
    ],
    privacyCta: 'Lees het privacybeleid',

    platformsLabel: 'Zo gebruik je het',
    platformsTitle: 'Drie manieren, hetzelfde overzicht',
    platforms: [
      { t: 'Web', b: 'Werkt in elke browser, niets te installeren. Handig op een schoolcomputer.', cta: 'Inloggen', state: 'In ontwikkeling' },
      { t: 'Desktop', b: 'Windows en macOS, met meldingen en offline het laatste overzicht.', cta: 'Naar downloads', state: 'Binnenkort' },
      { t: 'Mobiel', b: 'iOS en Android, voor als je tussen twee lessen door snel wil kijken.', cta: 'Binnenkort', state: 'Binnenkort' },
    ],

    faqLabel: 'Vragen',
    faqTitle: 'Wat mensen meestal eerst vragen',
    faq: [
      { q: 'Kost Bundel geld?', a: 'Nu niet. Bundel is in ontwikkeling en gratis te gebruiken. Over betalen is nog niets besloten. Verandert dat, dan hoor je het voordat het zover is.' },
      { q: 'Werkt het met mijn school?', a: 'Dat hangt af van de systemen die je school gebruikt. Bundel koppelt aan Canvas, Microsoft Teams en Magister. Gebruikt je school die, dan werkt het zodra de beheerder de koppeling goedkeurt.' },
      { q: 'Kunnen docenten meekijken?', a: 'Nee. Bundel toont jou wat jij in de bronsystemen al mag zien. Er gaat niets terug naar school.' },
      { q: 'Wat als een bron eruit ligt?', a: 'Dan zie je de laatste succesvolle sync met het tijdstip erbij, en een melding bovenaan. De rest van de app blijft gewoon werken.' },
      { q: 'Wanneer komt de app?', a: 'Er staat geen datum. Zet je e-mail op de wachtlijst, dan hoor je het als er iets te installeren valt.' },
    ],

    ctaTitle: 'Als het klaar is, hoor je het',
    ctaBody: 'Eén mail als er iets te downloaden valt. Verder niets.',
  },

  waitlist: {
    title: 'Op de wachtlijst',
    body: 'Laat je e-mailadres achter, dan krijg je bericht zodra de desktop-app of de mobiele app te downloaden is.',
    placeholder: 'jouw@school.nl',
    label: 'E-mailadres',
    submit: 'Hou me op de hoogte',
    invalid: 'Vul een volledig e-mailadres in.',
    done: 'Genoteerd. In dit prototype wordt je adres nog niet echt bewaard.',
    note: 'Prototype: het formulier slaat nog niets op.',
  },

  login: {
    title: 'Inloggen',
    lead: 'Log in op de webversie van Bundel. Je schoolaccount is het snelst, want dan hoef je geen extra wachtwoord te onthouden.',
    school: 'Inloggen met schoolaccount',
    or: 'of met e-mail',
    email: 'E-mailadres',
    emailPlaceholder: 'jouw@school.nl',
    password: 'Wachtwoord',
    passwordPlaceholder: 'Je wachtwoord',
    forgot: 'Wachtwoord vergeten?',
    submit: 'Inloggen',
    noAccount: 'Nog geen account?',
    joinWaitlist: 'Zet je op de wachtlijst',
    prototypeNotice: 'Dit is een ontwerpprototype. Inloggen werkt nog niet, want er is nog geen account om op in te loggen.',
    invalidEmail: 'Vul een volledig e-mailadres in.',
    emptyPassword: 'Vul je wachtwoord in.',
    attempted: 'Inloggen is nog niet actief. De webversie is in ontwikkeling.',
    quote: 'Drie apps, één overzicht. En je data blijft waar hij hoort.',
    quoteBy: 'De belofte van Bundel',
    aside: [
      'Je ziet alleen wat je in Canvas, Teams en Magister al mocht zien.',
      'Bundel schrijft niets terug naar je school.',
      'Je groepschat is end-to-end versleuteld.',
    ],
  },

  download: {
    title: 'Bundel downloaden',
    lead: 'De desktop-app is nog in ontwikkeling. Er staat nog niets klaar om te installeren. Zet je op de wachtlijst en je hoort het als dat verandert.',
    availableSoon: 'Binnenkort',
    inDevelopment: 'In ontwikkeling',
    available: 'Beschikbaar',
    desktopTitle: 'Desktop',
    mobileTitle: 'Mobiel',
    webTitle: 'Web',
    webBody: 'Geen installatie nodig. De webversie werkt in elke moderne browser en is bedoeld voor schoolcomputers waar je niets mag installeren.',
    webCta: 'Naar inloggen',
    platforms: [
      { t: 'Windows', b: 'Windows 10 of nieuwer, 64-bit. Installer van ongeveer 90 MB.' },
      { t: 'macOS', b: 'macOS 12 Monterey of nieuwer. Universal build voor Apple silicon en Intel.' },
    ],
    stores: [
      { t: 'App Store', b: 'iPhone en iPad, iOS 16 of nieuwer.' },
      { t: 'Google Play', b: 'Android 10 of nieuwer.' },
    ],
    storeSoon: 'Nog niet in de store',
    reqTitle: 'Systeemeisen',
    req: [
      { k: 'Besturingssysteem', v: 'Windows 10+ · macOS 12+' },
      { k: 'Schijfruimte', v: 'Ongeveer 250 MB' },
      { k: 'Verbinding', v: 'Nodig om te synchroniseren; laatste overzicht blijft offline zichtbaar' },
      { k: 'Account', v: 'Je schoolaccount' },
    ],
  },

  privacy: {
    title: 'Privacy',
    updated: 'Laatst bijgewerkt: september 2026',
    intro: 'Bundel is in ontwikkeling. Deze pagina beschrijft wat de app met je gegevens doet zodra hij werkt. Zolang er nog niets in productie draait, wordt er ook nog niets van je verwerkt.',
    sections: [
      {
        h: 'Wat we ophalen',
        p: 'Bundel leest je rooster, opdrachten en cijfers uit de systemen die je zelf koppelt: Canvas, Microsoft Teams en Magister. We halen alleen op wat nodig is om je overzicht te tonen. Niets over andere studenten, niets uit vakken die niet van jou zijn.',
      },
      {
        h: 'Wat we bewaren',
        p: 'Opgehaalde gegevens worden bewaard om je overzicht snel te kunnen tonen en om offline het laatst bekende beeld te laten zien. Koppel je een bron los, dan wordt de opgehaalde data van die bron verwijderd.',
      },
      {
        h: 'Wat we niet doen',
        p: 'Bundel schrijft niets terug naar je schoolsystemen. We verkopen niets door, we tonen geen advertenties en we delen niets met je school of je docenten. Er zit geen tracking van derden in de app of op deze site.',
      },
      {
        h: 'Groepschat',
        p: 'Berichten in een projectgroep worden op je eigen apparaat versleuteld en pas op het apparaat van de ontvanger weer leesbaar. Wij hebben de sleutels niet en kunnen niet meelezen.',
      },
      {
        h: 'Je rechten',
        p: 'Je kunt op elk moment zien welke bronnen gekoppeld zijn, ze loskoppelen, of je account laten verwijderen. Daarmee verdwijnt alles wat we van je bewaren.',
      },
      {
        h: 'Contact',
        p: 'Vragen over privacy kunnen naar AltijdBezig, de makers van Bundel.',
      },
    ],
  },

  about: {
    title: 'Over Bundel',
    lead: 'Bundel wordt gemaakt door AltijdBezig. Het begon met een irritatie die elke student herkent: je moet vier apps openen om te weten wat je vandaag moet doen.',
    sections: [
      {
        h: 'Waarom',
        p: 'Scholen kopen systemen los van elkaar in. Canvas voor opdrachten, Magister voor cijfers, Teams voor communicatie. Elk systeem is op zichzelf prima, maar niemand is verantwoordelijk voor het geheel. En dat geheel is precies wat een student nodig heeft.',
      },
      {
        h: 'Hoe',
        p: 'We bouwen geen nieuw schoolsysteem. Bundel koppelt aan wat er al is, leest het uit en zet het op volgorde van jouw dag. Dat is een bewuste beperking: hoe minder Bundel zelf bewaart, hoe minder er mis kan gaan.',
      },
      {
        h: 'Waar het nu staat',
        p: 'Het ontwerp ligt er: merkrichtlijnen, een werkend prototype van de app en deze site. De koppelingen met de bronsystemen worden gebouwd. Er is nog geen versie die je kunt installeren.',
      },
    ],
    eyebrow: 'Een project van AltijdBezig',
    teamTitle: 'Het team',
    teamBody: 'AltijdBezig is de naam waaronder we werken. Aan Bundel zitten twee makers: één op de vormgeving en front-end, één op de back-end en de koppelingen.',
  },

  notFound: {
    title: 'Deze pagina bestaat niet',
    body: 'De link klopt niet meer, of hij heeft nooit bestaan. Ga terug naar de homepagina.',
    cta: 'Naar de homepagina',
  },

  footer: {
    tagline: 'Rooster, opdrachten en cijfers naast elkaar.',
    product: 'Product',
    company: 'Project',
    legal: 'Juridisch',
    links: {
      features: 'Functies',
      download: 'Downloaden',
      login: 'Inloggen',
      about: 'Over Bundel',
      privacy: 'Privacy',
      terms: 'Voorwaarden',
    },
    disclaimer: 'Bundel wordt gemaakt door AltijdBezig en is niet verbonden aan Instructure (Canvas), Microsoft (Teams) of Iddink (Magister). Die namen zijn van hun eigenaren.',
    rights: 'Alle rechten voorbehouden.',
  },
}

export const en = {
  code: 'en',
  htmlLang: 'en',

  nav: {
    product: 'Product',
    privacy: 'Privacy',
    over: 'About',
    download: 'Download',
    login: 'Log in',
    menu: 'Menu',
    langLabel: 'Language',
    skip: 'Skip to content',
  },

  home: {
    eyebrow: 'By AltijdBezig · prototype',
    title: 'Three apps, one overview',
    lead: 'Bundel puts your timetable, assignments, grades and project group side by side. It does not replace Canvas, Teams and Magister. It reads them.',
    ctaLogin: 'Log in to the web version',
    ctaDownload: 'Download the software',
    ctaHint: 'iOS and Android follow later.',

    sourcesLabel: 'Reads from',
    sourcesNote: 'Read-only. Bundel never writes anything back to your school systems.',

    problemLabel: 'The problem',
    problemTitle: 'Four tabs just to know what today looks like',
    problemBody: 'Your timetable lives in Magister, your assignment in Canvas, the files in Teams and the group agreements in a chat. Nobody owns that overview. You rebuild it in your head every morning.',
    problems: [
      { t: 'Deadlines in four places', b: 'An assignment in Canvas, a hand-in moment in Magister, a reminder in Teams. You will miss one of them.' },
      { t: 'Logging in again and again', b: 'Three portals, three passwords, three sessions that expire exactly when you need something.' },
      { t: 'Group work outside school', b: 'Agreements sit in a chat nobody scrolls back through, detached from the assignment they are about.' },
    ],

    solutionLabel: 'The answer',
    solutionTitle: 'One screen that is already there',
    solutionBody: 'Bundel fetches what exists in the background and orders it by your day. No dashboard to configure, no widgets to drag. You open it and it is there.',

    featuresLabel: 'What is inside',
    featuresTitle: 'Six screens, nothing more',
    features: [
      { t: 'Today', b: 'Your classes, your deadlines and what your group expects from you. Ordered by time, not by source.' },
      { t: 'Assignments', b: 'Everything from Canvas in one list, with the status that actually applies: handed in, graded, or not started.' },
      { t: 'Timetable', b: 'The week at a glance, including room changes and cancellations as soon as school publishes them.' },
      { t: 'Grades', b: 'Your results from Magister with the average alongside. Read-only, as it should be.' },
      { t: 'Groups', b: 'A place per project for tasks and messages, tied to the assignment it belongs to.' },
      { t: 'Sources', b: 'See per system whether it is connected and when it last synced.' },
    ],

    honestLabel: 'Honestly',
    honestTitle: 'What Bundel does not do',
    honest: [
      'It does not replace Canvas, Teams or Magister. You keep using those to hand work in.',
      'It does not invent grades or deadlines. If it is not in the source, it is not in Bundel.',
      'It writes nothing back. Bundel reads, that is all.',
      'During an outage you see the last sync with its timestamp, instead of an empty screen.',
    ],

    privacyLabel: 'Privacy',
    privacyTitle: 'Your data stays where it belongs',
    privacyBody: 'Bundel keeps no copy of your school data longer than it needs to show it. Your group chat is end-to-end encrypted, so we cannot read along. That is not a promise but a consequence of how it is built.',
    privacyPoints: [
      { t: 'Read-only connections', b: 'Bundel asks for the minimum permissions needed to show what you can already see.' },
      { t: 'Encrypted group chat', b: 'Messages are encrypted and decrypted on your own device.' },
      { t: 'Disconnect yourself', b: 'Every source can be disconnected with one button. The fetched data goes with it.' },
    ],
    privacyCta: 'Read the privacy policy',

    platformsLabel: 'How to use it',
    platformsTitle: 'Three ways, the same overview',
    platforms: [
      { t: 'Web', b: 'Works in any browser, nothing to install. Handy on a school computer.', cta: 'Log in', state: 'In development' },
      { t: 'Desktop', b: 'Windows and macOS, with notifications and your last overview offline.', cta: 'To downloads', state: 'Coming soon' },
      { t: 'Mobile', b: 'iOS and Android, for a quick look between two classes.', cta: 'Coming soon', state: 'Coming soon' },
    ],

    faqLabel: 'Questions',
    faqTitle: 'What people usually ask first',
    faq: [
      { q: 'Does Bundel cost money?', a: 'Not right now. Bundel is in development and free to use. Nothing has been decided about charging for it. If that changes, you will hear before it happens.' },
      { q: 'Does it work with my school?', a: 'That depends on the systems your school uses. Bundel connects to Canvas, Microsoft Teams and Magister. If your school uses those, it works once the administrator approves the connection.' },
      { q: 'Can teachers look along?', a: 'No. Bundel shows you what you are already allowed to see in the source systems. Nothing travels back to school.' },
      { q: 'What if a source is down?', a: 'You see the last successful sync with its timestamp and a notice at the top. The rest of the app keeps working.' },
      { q: 'When does the app arrive?', a: 'There is no date. Put your email on the waiting list and you will hear when there is something to install.' },
    ],

    ctaTitle: 'When it is ready, you will hear it',
    ctaBody: 'One email when there is something to download. Nothing else.',
  },

  waitlist: {
    title: 'Join the waiting list',
    body: 'Leave your email address and we will let you know as soon as the desktop or mobile app is available.',
    placeholder: 'you@school.com',
    label: 'Email address',
    submit: 'Keep me posted',
    invalid: 'Enter a complete email address.',
    done: 'Noted. In this prototype your address is not actually stored yet.',
    note: 'Prototype: the form does not store anything yet.',
  },

  login: {
    title: 'Log in',
    lead: 'Log in to the web version of Bundel. Your school account is quickest, because there is no extra password to remember.',
    school: 'Log in with school account',
    or: 'or with email',
    email: 'Email address',
    emailPlaceholder: 'you@school.com',
    password: 'Password',
    passwordPlaceholder: 'Your password',
    forgot: 'Forgot your password?',
    submit: 'Log in',
    noAccount: 'No account yet?',
    joinWaitlist: 'Join the waiting list',
    prototypeNotice: 'This is a design prototype. Logging in does not work yet, because there is no account to log in to.',
    invalidEmail: 'Enter a complete email address.',
    emptyPassword: 'Enter your password.',
    attempted: 'Logging in is not active yet. The web version is in development.',
    quote: 'Three apps, one overview. And your data stays where it belongs.',
    quoteBy: 'The promise of Bundel',
    aside: [
      'You only see what you were already allowed to see in Canvas, Teams and Magister.',
      'Bundel writes nothing back to your school.',
      'Your group chat is end-to-end encrypted.',
    ],
  },

  download: {
    title: 'Download Bundel',
    lead: 'The desktop app is still in development. There is nothing to install yet. Join the waiting list and you will hear when that changes.',
    availableSoon: 'Coming soon',
    inDevelopment: 'In development',
    available: 'Available',
    desktopTitle: 'Desktop',
    mobileTitle: 'Mobile',
    webTitle: 'Web',
    webBody: 'No installation needed. The web version runs in any modern browser and is meant for school computers where you cannot install anything.',
    webCta: 'To the login',
    platforms: [
      { t: 'Windows', b: 'Windows 10 or newer, 64-bit. Installer of roughly 90 MB.' },
      { t: 'macOS', b: 'macOS 12 Monterey or newer. Universal build for Apple silicon and Intel.' },
    ],
    stores: [
      { t: 'App Store', b: 'iPhone and iPad, iOS 16 or newer.' },
      { t: 'Google Play', b: 'Android 10 or newer.' },
    ],
    storeSoon: 'Not in the store yet',
    reqTitle: 'System requirements',
    req: [
      { k: 'Operating system', v: 'Windows 10+ · macOS 12+' },
      { k: 'Disk space', v: 'About 250 MB' },
      { k: 'Connection', v: 'Needed to sync; your last overview stays visible offline' },
      { k: 'Account', v: 'Your school account' },
    ],
  },

  privacy: {
    title: 'Privacy',
    updated: 'Last updated: September 2026',
    intro: 'Bundel is in development. This page describes what the app does with your data once it works. As long as nothing runs in production, nothing of yours is processed either.',
    sections: [
      {
        h: 'What we fetch',
        p: 'Bundel reads your timetable, assignments and grades from the systems you connect yourself: Canvas, Microsoft Teams and Magister. We only fetch what is needed to show your overview. Nothing about other students, nothing from courses that are not yours.',
      },
      {
        h: 'What we keep',
        p: 'Fetched data is kept so your overview loads quickly and so the last known state is visible offline. Disconnect a source and the data fetched from it is deleted.',
      },
      {
        h: 'What we do not do',
        p: 'Bundel writes nothing back to your school systems. We sell nothing, we show no advertising and we share nothing with your school or your teachers. There is no third-party tracking in the app or on this site.',
      },
      {
        h: 'Group chat',
        p: 'Messages in a project group are encrypted on your own device and only become readable again on the recipient device. We do not hold the keys and cannot read along.',
      },
      {
        h: 'Your rights',
        p: 'You can see which sources are connected at any time, disconnect them, or have your account deleted. That removes everything we keep about you.',
      },
      {
        h: 'Contact',
        p: 'Privacy questions go to AltijdBezig, the makers of Bundel.',
      },
    ],
  },

  about: {
    title: 'About Bundel',
    lead: 'Bundel is made by AltijdBezig. It started with an irritation every student recognises: you have to open four apps to know what today looks like.',
    sections: [
      {
        h: 'Why',
        p: 'Schools buy systems separately. Canvas for assignments, Magister for grades, Teams for communication. Each system is fine on its own, but nobody owns the whole. And the whole is exactly what a student needs.',
      },
      {
        h: 'How',
        p: 'We are not building another school system. Bundel connects to what already exists, reads it and orders it by your day. That is a deliberate limitation: the less Bundel stores itself, the less can go wrong.',
      },
      {
        h: 'Where it stands',
        p: 'The design is done: brand guidelines, a working prototype of the app and this site. The connections to the source systems are being built. There is no installable version yet.',
      },
    ],
    eyebrow: 'A project by AltijdBezig',
    teamTitle: 'The team',
    teamBody: 'AltijdBezig is the name we work under. Two makers are on Bundel: one on design and front-end, one on the back-end and the connections.',
  },

  notFound: {
    title: 'This page does not exist',
    body: 'The link is no longer valid, or it never was. Head back to the homepage.',
    cta: 'To the homepage',
  },

  footer: {
    tagline: 'Timetable, assignments and grades side by side.',
    product: 'Product',
    company: 'Project',
    legal: 'Legal',
    links: {
      features: 'Features',
      download: 'Download',
      login: 'Log in',
      about: 'About Bundel',
      privacy: 'Privacy',
      terms: 'Terms',
    },
    disclaimer: 'Bundel is made by AltijdBezig and is not affiliated with Instructure (Canvas), Microsoft (Teams) or Iddink (Magister). Those names belong to their owners.',
    rights: 'All rights reserved.',
  },
}

const dictionaries = { nl, en }

const I18nContext = createContext({ lang: 'nl', t: nl, setLang: () => {} })

function initialLang() {
  if (typeof window === 'undefined') return 'nl'
  const stored = window.localStorage?.getItem(STORAGE_KEY)
  if (stored === 'nl' || stored === 'en') return stored
  const nav = window.navigator?.language || 'nl'
  return nav.toLowerCase().startsWith('en') ? 'en' : 'nl'
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(initialLang)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* private mode: taalkeuze geldt dan alleen deze sessie */
    }
    document.documentElement.lang = dictionaries[lang].htmlLang
  }, [lang])

  const value = useMemo(
    () => ({ lang, t: dictionaries[lang], setLang, toggle: () => setLang((l) => (l === 'nl' ? 'en' : 'nl')) }),
    [lang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
