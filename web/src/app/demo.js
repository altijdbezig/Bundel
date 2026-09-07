/**
 * Demodata van Bundel.
 *
 * Dit is de dataset waarmee een nieuw account wordt gevuld. Hij wordt een
 * keer naar Supabase geschreven bij de eerste keer inloggen, daarna leest de
 * app alleen nog uit de database. Zodra Canvas, Teams en Magister echt
 * gekoppeld zijn schrijven die dezelfde tabellen en kan dit bestand weg.
 */

const t = (nl, en) => ({ nl, en })

export const STUDENT = {
  name: 'Luca Verhoeven',
  initials: 'LV',
  course: t('Mediavormgeving · lj 3', 'Media Design · yr 3'),
}


// ---------------------------------------------------------------- vakken

export const SUBJECTS = {
  theory: t('Mediatheorie', 'Media Theory'),
  ixd: t('Interaction Design', 'Interaction Design'),
  concepting: t('Concepting', 'Concepting'),
  project: t('Projecturen', 'Project hours'),
  design: t('Vormgeving', 'Design'),
  english: t('Engels', 'English'),
  career: t('Loopbaan', 'Career'),
}

/* Docent per vak. Nepdata, net als de rest. */
export const TEACHERS = {
  theory: 'M. de Groot',
  ixd: 'S. Willems',
  concepting: 'S. Willems',
  project: 'R. Aydin',
  design: 'K. Peters',
  english: 'L. Janssen',
  career: 'R. Aydin',
}

// ---------------------------------------------------------------- rooster

export const WEEKS = [
  {
    number: 35,
    range: t('24 tot 28 augustus', '24 to 28 August'),
    days: [
      {
        date: '24/08',
        lessons: [
          { time: '09:30', end: '11:00', subject: 'ixd', room: 'A2.11' },
          { time: '11:15', end: '12:45', subject: 'theory', room: 'B1.04' },
        ],
      },
      { date: '25/08', lessons: [{ time: '09:30', end: '11:00', subject: 'design', room: 'A1.02' }] },
      { date: '26/08', lessons: [{ time: '08:30', end: '12:00', subject: 'project', room: 'Studio 3' }] },
      {
        date: '27/08',
        lessons: [
          { time: '09:30', end: '11:00', subject: 'concepting', room: 'A2.11' },
          { time: '11:15', end: '12:45', subject: 'english', room: 'C0.07' },
        ],
      },
      { date: '28/08', lessons: [{ time: '10:00', end: '12:00', subject: 'design', room: 'A1.02' }] },
    ],
  },
  {
    number: 36,
    range: t('31 augustus tot 4 september', '31 August to 4 September'),
    days: [
      {
        date: '31/08',
        lessons: [
          { time: '08:30', end: '09:20', subject: 'theory', room: 'B1.04' },
          { time: '09:30', end: '11:00', subject: 'ixd', room: 'A2.11' },
          { time: '11:15', end: '12:45', subject: 'concepting', room: 'A2.11' },
        ],
      },
      {
        date: '01/09',
        lessons: [
          { time: '09:30', end: '11:00', subject: 'design', room: 'A1.02' },
          { time: '11:15', end: '12:45', subject: 'english', room: 'C0.07' },
        ],
      },
      {
        date: '02/09',
        lessons: [
          { time: '08:30', end: '12:00', subject: 'project', room: 'Studio 3' },
          { time: '13:30', end: '14:30', subject: 'career', room: 'B0.11' },
        ],
      },
      {
        date: '03/09',
        lessons: [
          { time: '09:30', end: '11:00', subject: 'ixd', room: 'A2.11' },
          { time: '11:15', end: '12:45', subject: 'theory', room: 'B1.04' },
        ],
      },
      { date: '04/09', lessons: [{ time: '10:00', end: '12:00', subject: 'design', room: 'A1.02' }] },
    ],
  },
  {
    number: 37,
    range: t('7 tot 11 september', '7 to 11 September'),
    days: [
      {
        date: '07/09',
        lessons: [
          { time: '08:30', end: '09:20', subject: 'theory', room: 'B1.04' },
          { time: '09:30', end: '11:00', subject: 'ixd', room: 'A2.11' },
          { time: '11:15', end: '12:45', subject: 'concepting', room: 'A2.11' },
          { time: '13:30', end: '15:30', subject: 'project', room: 'Studio 3' },
        ],
      },
      {
        date: '08/09',
        lessons: [
          { time: '09:30', end: '11:00', subject: 'design', room: 'A1.02' },
          { time: '11:15', end: '12:45', subject: 'english', room: 'C0.07' },
        ],
      },
      {
        date: '09/09',
        lessons: [
          { time: '08:30', end: '12:00', subject: 'project', room: 'Studio 3' },
          { time: '13:30', end: '14:30', subject: 'career', room: 'B0.11' },
        ],
      },
      {
        date: '10/09',
        lessons: [
          { time: '09:30', end: '11:00', subject: 'ixd', room: 'A2.11' },
          { time: '11:15', end: '12:45', subject: 'theory', room: 'B1.04' },
          { time: '14:00', end: '16:00', subject: 'project', room: 'Studio 3' },
        ],
      },
      { date: '11/09', lessons: [{ time: '10:00', end: '12:00', subject: 'design', room: 'A1.02' }] },
    ],
  },
  {
    number: 38,
    range: t('14 tot 18 september', '14 to 18 September'),
    note: t('Toetsweek. Minder lessen, langere blokken.', 'Test week. Fewer classes, longer blocks.'),
    days: [
      { date: '14/09', lessons: [{ time: '09:00', end: '11:00', subject: 'theory', room: 'Aula' }] },
      { date: '15/09', lessons: [{ time: '09:00', end: '11:00', subject: 'design', room: 'Aula' }] },
      { date: '16/09', lessons: [] },
      { date: '17/09', lessons: [{ time: '13:00', end: '15:00', subject: 'ixd', room: 'A2.11' }] },
      { date: '18/09', lessons: [{ time: '09:00', end: '11:00', subject: 'english', room: 'Aula' }] },
    ],
  },
  {
    number: 39,
    range: t('21 tot 25 september', '21 to 25 September'),
    note: t(
      'Projectweek. Geen ingeroosterde lessen, je werkt aan je project.',
      'Project week. No scheduled classes, you work on your project.',
    ),
    days: [
      { date: '21/09', lessons: [] },
      { date: '22/09', lessons: [] },
      { date: '23/09', lessons: [] },
      { date: '24/09', lessons: [] },
      { date: '25/09', lessons: [] },
    ],
  },
]

// ---------------------------------------------------------------- opdrachten

export const ASSIGNMENTS = [
  {
    id: 't1',
    title: t('Moodboard interactief concept inleveren', 'Hand in interactive concept moodboard'),
    subject: 'ixd',
    source: 'canvas',
    due: t('vandaag 17:00', 'today 17:00'),
    dueDate: '07/09',
    dueTime: '17:00',
    urgent: true,
  },
  {
    id: 't2',
    title: t('Assets exporteren voor Jayden', 'Export assets for Jayden'),
    subject: 'project',
    source: 'own',
    due: t('di 8 sep', 'Tue 8 Sep'),
    dueDate: '08/09',
    dueTime: '12:00',
    urgent: true,
  },
  {
    id: 't3',
    title: t('Onderzoeksverslag doelgroep', 'Audience research report'),
    subject: 'theory',
    source: 'canvas',
    due: t('wo 10 sep', 'Wed 10 Sep'),
    dueDate: '09/09',
    dueTime: '17:00',
    urgent: false,
  },
  {
    id: 't4',
    title: t('Storyboard uploaden in kanaal', 'Upload storyboard to the channel'),
    subject: 'concepting',
    source: 'teams',
    due: t('do 11 sep', 'Thu 11 Sep'),
    dueDate: '10/09',
    dueTime: '23:59',
    urgent: false,
  },
  {
    id: 't5',
    title: t('Toets kleurtheorie voorbereiden', 'Prepare colour theory test'),
    subject: 'design',
    source: 'magister',
    due: t('vr 12 sep', 'Fri 12 Sep'),
    dueDate: '11/09',
    dueTime: '08:30',
    urgent: false,
  },
  {
    id: 't7',
    title: t('Onderzoek doelgroep starten', 'Start audience research'),
    subject: 'concepting',
    source: 'canvas',
    due: t('do 27 aug', 'Thu 27 Aug'),
    dueDate: '27/08',
    dueTime: '17:00',
    urgent: false,
  },
  {
    id: 't8',
    title: t('Kleurstudie inleveren', 'Hand in colour study'),
    subject: 'ixd',
    source: 'canvas',
    due: t('do 3 sep', 'Thu 3 Sep'),
    dueDate: '03/09',
    dueTime: '17:00',
    urgent: false,
  },
  {
    id: 't9',
    title: t('Toets mediatheorie', 'Media theory test'),
    subject: 'theory',
    source: 'magister',
    due: t('ma 14 sep', 'Mon 14 Sep'),
    dueDate: '14/09',
    dueTime: '09:00',
    urgent: false,
  },
  {
    id: 't10',
    title: t('Eindconcept presenteren', 'Present the final concept'),
    subject: 'ixd',
    source: 'teams',
    due: t('do 17 sep', 'Thu 17 Sep'),
    dueDate: '17/09',
    dueTime: '13:00',
    urgent: false,
  },
  {
    id: 't11',
    title: t('Projectverslag inleveren', 'Hand in the project report'),
    subject: 'project',
    source: 'canvas',
    due: t('wo 23 sep', 'Wed 23 Sep'),
    dueDate: '23/09',
    dueTime: '17:00',
    urgent: false,
  },
  {
    id: 't6',
    title: t('Planning inleveren', 'Hand in planning'),
    subject: 'career',
    source: 'canvas',
    due: t('vr 4 sep', 'Fri 4 Sep'),
    dueDate: '04/09',
    dueTime: '17:00',
    urgent: false,
  },
]

// ---------------------------------------------------------------- cijfers

// ---------------------------------------------------------------- cijfers

/**
 * Elk cijfer is een eigen invoer, zoals in Magister: waar het voor was,
 * wanneer, hoe zwaar het meetelt, en soms een opmerking van de docent.
 * Niet elk cijfer heeft een opmerking, want die vullen docenten lang niet
 * altijd in.
 */
export const GRADES = [
  {
    subject: 'ixd',
    entries: [
      { id: 'c1', value: 7.5, date: '21/08', weight: 1, what: t('Schetsopdracht', 'Sketch assignment'), remark: null },
      {
        id: 'c2',
        value: 8.0,
        date: '28/08',
        weight: 2,
        what: t('Wireframes', 'Wireframes'),
        remark: t(
          'Goede opbouw en duidelijke keuzes. Let op de consistentie van je knoppen tussen de schermen.',
          'Well structured with clear choices. Watch the consistency of your buttons across screens.',
        ),
      },
      { id: 'c3', value: 8.0, date: '04/09', weight: 2, what: t('Prototype v1', 'Prototype v1'), remark: null },
    ],
  },
  {
    subject: 'theory',
    entries: [
      {
        id: 'c4',
        value: 4.8,
        date: '26/08',
        weight: 1,
        what: t('Deeltoets hoofdstuk 1', 'Partial test chapter 1'),
        remark: t(
          'De theorie over doelgroepen zat er nog niet in. Je mag herkansen in week 40, kom langs als je wil overleggen.',
          'The theory on target audiences was not there yet. You can resit in week 40, drop by if you want to talk it through.',
        ),
      },
      { id: 'c5', value: 7.0, date: '02/09', weight: 1, what: t('Deeltoets hoofdstuk 2', 'Partial test chapter 2'), remark: null },
    ],
  },
  {
    subject: 'concepting',
    entries: [
      {
        id: 'c6',
        value: 8.4,
        date: '22/08',
        weight: 2,
        what: t('Pitch', 'Pitch'),
        remark: t('Sterke pitch, helder verhaal en goed tempo.', 'Strong pitch, clear story and a good pace.'),
      },
      { id: 'c7', value: 8.0, date: '29/08', weight: 1, what: t('Conceptdocument', 'Concept document'), remark: null },
    ],
  },
  {
    subject: 'design',
    entries: [
      { id: 'c8', value: 7.2, date: '19/08', weight: 1, what: t('Typografie-oefening', 'Typography exercise'), remark: null },
      {
        id: 'c9',
        value: 6.8,
        date: '26/08',
        weight: 1,
        what: t('Kleurenstudie', 'Colour study'),
        remark: t(
          'Het contrast tussen je kleuren is net te laag. Kijk nog eens naar de richtlijnen voor toegankelijkheid.',
          'The contrast between your colours is just too low. Have another look at the accessibility guidelines.',
        ),
      },
      { id: 'c10', value: 7.4, date: '28/08', weight: 2, what: t('Posterontwerp', 'Poster design'), remark: null },
    ],
  },
  {
    subject: 'english',
    entries: [{ id: 'c11', value: 8.0, date: '26/08', weight: 1, what: t('Presentation', 'Presentation'), remark: null }],
  },
]

// ---------------------------------------------------------------- groepen

export const GROUPS = [
  {
    id: 'g1',
    name: t('Groep 4 · App-project', 'Group 4 · App project'),
    subject: 'ixd',
    members: [
      { name: 'Luca Verhoeven', initials: 'LV', self: true },
      { name: 'Jayden Bakker', initials: 'JB', self: false },
      { name: 'Noor Kramer', initials: 'NK', self: false },
      { name: 'Sam de Wit', initials: 'SW', self: false },
    ],
    tasks: [
      { id: 'gt1', who: 'LV', done: false, text: t('Vandaag-scherm bouwen', 'Build the Today screen') },
      { id: 'gt2', who: 'JB', done: true, text: t('Tokenrefresh afmaken', 'Finish the token refresh') },
      { id: 'gt3', who: 'NK', done: false, text: t('Moodboard samenstellen', 'Assemble the moodboard') },
      { id: 'gt4', who: 'SW', done: false, text: t('Presentatie voorbereiden', 'Prepare the presentation') },
    ],
    files: [
      { name: 'moodboard-v2.fig', by: 'NK', size: '4.2 MB', when: t('vandaag', 'today') },
      { name: 'tokens.json', by: 'JB', size: '12 kB', when: t('gisteren', 'yesterday') },
      { name: 'planning.pdf', by: 'LV', size: '180 kB', when: t('3 sep', '3 Sep') },
    ],
    messages: [
      {
        id: 1,
        from: 'Jayden',
        initials: 'JB',
        time: '09:12',
        day: t('Vandaag', 'Today'),
        self: false,
        text: t(
          'Tokenrefresh werkt. Canvas-assignments komen nu binnen als Task.',
          'Token refresh works. Canvas assignments now arrive as Task.',
        ),
      },
      {
        id: 2,
        from: 'Noor',
        initials: 'NK',
        time: '09:20',
        day: t('Vandaag', 'Today'),
        self: false,
        text: t(
          'Top. Ik zet de deadlines in het moodboard zodat we ze kunnen tonen.',
          'Good. I will put the deadlines in the moodboard so we can show them.',
        ),
      },
      {
        id: 3,
        from: 'Luca',
        initials: 'LV',
        time: '09:31',
        day: t('Vandaag', 'Today'),
        self: true,
        text: t(
          'Ik pak vandaag het Vandaag-scherm. Rooster en taken naast elkaar.',
          'I am taking the Today screen. Timetable and tasks side by side.',
        ),
      },
      {
        id: 4,
        from: 'Jayden',
        initials: 'JB',
        time: '10:02',
        day: t('Vandaag', 'Today'),
        self: false,
        text: t(
          'Denk aan de foutstatus per bron, niet de hele pagina leeg als Canvas plat gaat.',
          'Remember the per-source error state, not a blank page when Canvas goes down.',
        ),
      },
    ],
  },
  {
    id: 'g2',
    name: t('Mediatheorie duo', 'Media Theory duo'),
    subject: 'theory',
    members: [
      { name: 'Luca Verhoeven', initials: 'LV', self: true },
      { name: 'Sam de Wit', initials: 'SW', self: false },
    ],
    tasks: [{ id: 'gt5', who: 'SW', done: true, text: t('Bronnenlijst aanvullen', 'Extend the source list') }],
    files: [{ name: 'bronnen.docx', by: 'SW', size: '46 kB', when: t('gisteren', 'yesterday') }],
    messages: [
      {
        id: 1,
        from: 'Sam',
        initials: 'SW',
        time: '16:40',
        day: t('Gisteren', 'Yesterday'),
        self: false,
        text: t('Ik heb de bronnenlijst aangevuld.', 'I added to the source list.'),
      },
    ],
  },
]

// ---------------------------------------------------------------- meldingen

export const NOTIFICATIONS = [
  {
    id: 'n1',
    kind: 'deadline',
    source: 'canvas',
    time: '12:04',
    title: t('Moodboard moet vandaag om 17:00 in', 'Moodboard is due today at 17:00'),
    body: t('Interaction Design', 'Interaction Design'),
    to: '/app/opdrachten',
  },
  {
    id: 'n2',
    kind: 'grade',
    source: 'magister',
    time: '09:41',
    title: t('Nieuw cijfer: 8.0 voor Prototype v1', 'New grade: 8.0 for Prototype v1'),
    body: t('Interaction Design', 'Interaction Design'),
    to: '/app/cijfers',
  },
  {
    id: 'n3',
    kind: 'message',
    source: 'own',
    time: '10:02',
    title: t('Jayden schreef in Groep 4', 'Jayden posted in Group 4'),
    body: t('Denk aan de foutstatus per bron.', 'Remember the per-source error state.'),
    to: '/app/groepen',
  },
  {
    id: 'n4',
    kind: 'grade',
    source: 'magister',
    time: 'gisteren',
    title: t('Nieuw cijfer: 7.0 voor Deeltoets', 'New grade: 7.0 for the partial test'),
    body: t('Mediatheorie', 'Media Theory'),
    to: '/app/cijfers',
  },
  {
    id: 'n5',
    kind: 'schedule',
    source: 'magister',
    time: 'gisteren',
    title: t('Lokaalwijziging donderdag', 'Room change on Thursday'),
    body: t('Projecturen nu in Studio 3', 'Project hours now in Studio 3'),
    to: '/app/rooster',
  },
]

// ---------------------------------------------------------------- aanwezigheid

/**
 * Aanwezigheid per les. Alleen lessen die al geweest zijn hebben een status.
 * Alles wat hier niet staat was gewoon aanwezig, want dat is verreweg het
 * meeste en dan blijft deze lijst leesbaar.
 *
 * Sleutel is "datum tijd", zoals '31/08 08:30'.
 */
export const ATTENDANCE = {
  '26/08 08:30': { status: 'excused', reason: t('Ziek gemeld', 'Reported sick') },
  '28/08 10:00': { status: 'late', minutes: 8 },
  '31/08 08:30': { status: 'late', minutes: 12 },
  '01/09 11:15': { status: 'late', minutes: 5 },
  '03/09 11:15': { status: 'absent' },
}
