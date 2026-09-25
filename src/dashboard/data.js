// Mock data for the Tournament Command Centre prototype

export const dashTournaments = [
  { id: 't1', name: 'Porto International Cup', city: 'Porto', country: 'Portugal', img: 'img/porto.jpg', dates: 'Jul 1 to Jul 5', sport: 'Football', status: 'confirmed', enrolled: 48, capacity: 60 },
  { id: 't2', name: 'Copenhagen Cup', city: 'Copenhagen', country: 'Denmark', img: 'img/copenhagen.jpg', dates: 'Jul 10 to Jul 16', sport: 'Football', status: 'recruiting', enrolled: 31, capacity: 50 },
  { id: 't3', name: 'IberCup Cascais', city: 'Cascais', country: 'Portugal', img: 'img/ibercup.jpg', dates: 'Jun 2 to Jun 8', sport: 'Football', status: 'recruiting', enrolled: 33, capacity: 40 },
  { id: 't4', name: 'Costa Brava Cup', city: 'Girona', country: 'Spain', img: 'img/costabrava.jpg', dates: 'Aug 12 to Aug 16', sport: 'Football', status: 'confirmed', enrolled: 48, capacity: 60 },
  { id: 't5', name: 'Malta Youth Festival', city: 'Valletta', country: 'Malta', img: 'img/malta.jpg', dates: 'Oct 3 to Oct 7', sport: 'Football', status: 'planned', enrolled: 12, capacity: 50 },
  { id: 't6', name: 'Alpine Hockey Trophy', city: 'Innsbruck', country: 'Austria', img: 'img/alpine.jpg', dates: 'Nov 21 to Nov 24', sport: 'Hockey', status: 'recruiting', enrolled: 12, capacity: 40 },
]

// 12 referees in the pool, richer profiles.
export const dashReferees = [
  { id: 'r1', name: 'Daniel Klein', country: 'Netherlands', flag: '🇳🇱', level: 'talent', email: 'daniel.klein@mail.com', phone: '+31 6 21 44 55 66', languages: ['NL', 'EN', 'DE'], apps: 14, reports: 12, rating: 4.6 },
  { id: 'r2', name: 'Lucas Bianchi', country: 'Italy', flag: '🇮🇹', level: 'medior', email: 'lucas.bianchi@mail.com', phone: '+39 340 118 22 33', languages: ['IT', 'EN'], apps: 9, reports: 7, rating: 4.3 },
  { id: 'r3', name: 'Ana Nogueira', country: 'Portugal', flag: '🇵🇹', level: 'talent', email: 'ana.nogueira@mail.com', phone: '+351 912 334 556', languages: ['PT', 'EN', 'ES'], apps: 18, reports: 16, rating: 4.8 },
  { id: 'r4', name: 'Marco Silva', country: 'Portugal', flag: '🇵🇹', level: 'medior', email: 'marco.silva@mail.com', phone: '+351 913 221 447', languages: ['PT', 'EN'], apps: 11, reports: 8, rating: 4.2 },
  { id: 'r5', name: 'Sophie Dubois', country: 'France', flag: '🇫🇷', level: 'beginner', email: 'sophie.dubois@mail.com', phone: '+33 6 44 12 88 90', languages: ['FR', 'EN'], apps: 3, reports: 2, rating: 4.0 },
  { id: 'r6', name: 'Jonas Berg', country: 'Sweden', flag: '🇸🇪', level: 'medior', email: 'jonas.berg@mail.com', phone: '+46 70 555 12 34', languages: ['SV', 'EN'], apps: 8, reports: 6, rating: 4.1 },
  { id: 'r7', name: 'Emma Novak', country: 'Czechia', flag: '🇨🇿', level: 'beginner', email: 'emma.novak@mail.com', phone: '+420 601 223 445', languages: ['CS', 'EN'], apps: 2, reports: 1, rating: 3.9 },
  { id: 'r8', name: 'Tomás Ruiz', country: 'Spain', flag: '🇪🇸', level: 'talent', email: 'tomas.ruiz@mail.com', phone: '+34 611 224 337', languages: ['ES', 'EN', 'PT'], apps: 16, reports: 14, rating: 4.7 },
  { id: 'r9', name: 'Lena Fischer', country: 'Germany', flag: '🇩🇪', level: 'medior', email: 'lena.fischer@mail.com', phone: '+49 151 2233 4455', languages: ['DE', 'EN'], apps: 10, reports: 9, rating: 4.4 },
  { id: 'r10', name: 'Oliver Hansen', country: 'Denmark', flag: '🇩🇰', level: 'beginner', email: 'oliver.hansen@mail.com', phone: '+45 21 33 55 77', languages: ['DA', 'EN'], apps: 4, reports: 2, rating: 4.0 },
  { id: 'r11', name: 'Marta Kowalski', country: 'Poland', flag: '🇵🇱', level: 'talent', email: 'marta.kowalski@mail.com', phone: '+48 511 224 668', languages: ['PL', 'EN', 'DE'], apps: 13, reports: 11, rating: 4.5 },
  { id: 'r12', name: 'Chiara Rossi', country: 'Italy', flag: '🇮🇹', level: 'medior', email: 'chiara.rossi@mail.com', phone: '+39 345 668 11 22', languages: ['IT', 'EN', 'FR'], apps: 7, reports: 5, rating: 4.2 },
]

export const refById = Object.fromEntries(dashReferees.map((r) => [r.id, r]))

// Enrolments per tournament: applied → paid → confirmed, plus a waitlist.
export const dashEnrolments = {
  t1: [
    { refId: 'r3', status: 'confirmed', date: '2026-04-12' }, { refId: 'r4', status: 'confirmed', date: '2026-04-15' }, { refId: 'r8', status: 'confirmed', date: '2026-04-18' },
    { refId: 'r1', status: 'confirmed', date: '2026-04-21' }, { refId: 'r6', status: 'paid', date: '2026-05-02' }, { refId: 'r5', status: 'paid', date: '2026-05-06' },
    { refId: 'r2', status: 'applied', date: '2026-05-19' }, { refId: 'r9', status: 'applied', date: '2026-05-24' }, { refId: 'r11', status: 'waitlist', date: '2026-06-01' },
  ],
  t2: [
    { refId: 'r9', status: 'confirmed', date: '2026-04-28' }, { refId: 'r6', status: 'confirmed', date: '2026-05-03' }, { refId: 'r10', status: 'paid', date: '2026-05-14' },
    { refId: 'r5', status: 'applied', date: '2026-05-27' }, { refId: 'r7', status: 'applied', date: '2026-06-04' }, { refId: 'r2', status: 'waitlist', date: '2026-06-10' },
  ],
  t4: [
    { refId: 'r8', status: 'confirmed', date: '2026-06-08' }, { refId: 'r11', status: 'confirmed', date: '2026-06-12' }, { refId: 'r3', status: 'paid', date: '2026-06-20' },
    { refId: 'r12', status: 'applied', date: '2026-07-01' }, { refId: 'r1', status: 'applied', date: '2026-07-05' },
  ],
}

// Match schedule per tournament. main / assistants hold referee ids (or null).
// day groups the fixtures; observer holds an observer id (or null).
export const dashMatches = {
  t1: [
    { id: 'm1', day: 'Day 1', time: '09:00', pitch: 'Pitch A', home: 'Ajax U15', away: 'Benfica U15', main: 'r3', assistants: ['r4'], observer: 'o1' },
    { id: 'm2', day: 'Day 1', time: '09:00', pitch: 'Pitch B', home: 'Porto U13', away: 'Sporting U13', main: 'r8', assistants: ['r5'], observer: null },
    { id: 'm3', day: 'Day 1', time: '11:00', pitch: 'Pitch A', home: 'Boavista U17', away: 'Braga U17', main: 'r2', assistants: ['r4'], observer: 'o2' },
    { id: 'm4', day: 'Day 1', time: '11:00', pitch: 'Pitch C', home: 'Feyenoord U15', away: 'Milan U15', main: 'r1', assistants: ['r6'], observer: null },
    { id: 'm5', day: 'Day 2', time: '13:30', pitch: 'Pitch A', home: 'Ajax U15', away: 'Porto U15', main: 'r3', assistants: ['r5'], observer: null },
    { id: 'm6', day: 'Day 2', time: '13:30', pitch: 'Pitch B', home: 'Benfica U13', away: 'Sporting U13', main: null, assistants: ['r3'], observer: null },
    { id: 'm7', day: 'Day 3', time: '16:00', pitch: 'Pitch A', home: 'Braga U17', away: 'Ajax U17', main: null, assistants: [], observer: null },
  ],
  t2: [
    { id: 'm8', day: 'Day 1', time: '10:00', pitch: 'Field 1', home: 'FCK U15', away: 'Brøndby U15', main: 'r9', assistants: ['r6'], observer: null },
    { id: 'm9', day: 'Day 1', time: '10:00', pitch: 'Field 2', home: 'AGF U13', away: 'OB U13', main: null, assistants: [], observer: null },
    { id: 'm10', day: 'Day 2', time: '12:30', pitch: 'Field 1', home: 'FCK U17', away: 'AGF U17', main: 'r6', assistants: [], observer: null },
    { id: 'm11', day: 'Day 2', time: '12:30', pitch: 'Field 3', home: 'Brøndby U13', away: 'FCN U13', main: null, assistants: [], observer: null },
  ],
  t4: [
    { id: 'm12', day: 'Day 1', time: '09:30', pitch: 'Camp 1', home: 'Girona U15', away: 'Espanyol U15', main: 'r8', assistants: ['r11'], observer: null },
    { id: 'm13', day: 'Day 1', time: '09:30', pitch: 'Camp 2', home: 'Barça U13', away: 'Girona U13', main: null, assistants: [], observer: null },
    { id: 'm14', day: 'Day 2', time: '12:00', pitch: 'Camp 1', home: 'Espanyol U17', away: 'Girona U17', main: 'r11', assistants: [], observer: null },
  ],
}

// Playing fields per tournament, uploaded per tournament (some have many).
export const dashFields = {
  t1: ['Pitch A', 'Pitch B', 'Pitch C'],
  t2: ['Field 1', 'Field 2', 'Field 3'],
  t4: ['Camp 1', 'Camp 2'],
}

// Observer pool (match observers / mentors) and guest / VIP pool.
export const dashObservers = [
  { id: 'o1', name: 'Giorgio Bruno', role: 'Observer', initials: 'GB', country: 'Italy', flag: '🇮🇹' },
  { id: 'o2', name: 'Helena Vik', role: 'Observer', initials: 'HV', country: 'Norway', flag: '🇳🇴' },
  { id: 'o3', name: 'Paul Ainsworth', role: 'Referee mentor', initials: 'PA', country: 'England', flag: '🏴' },
]
export const obsById = Object.fromEntries(dashObservers.map((o) => [o.id, o]))

export const dashGuests = [
  { id: 'g1', name: 'Maria Santos', role: 'VIP guest', initials: 'MS', org: 'Macron', country: 'Portugal', flag: '🇵🇹' },
  { id: 'g2', name: 'Tom De Vries', role: 'Sponsor', initials: 'TD', org: 'KNVB', country: 'Netherlands', flag: '🇳🇱' },
]

// Participating teams per tournament. A team = a club in one age group, so
// Ajax U13 and Ajax U15 are two separate teams of the same club. These differ
// per tournament and are imported via CSV. t3, t5 and t6 have nothing imported
// yet, so appointing stays locked for them until the teams are uploaded.
export const dashClubs = {
  t1: [
    { club: 'Ajax', ageGroup: 'U15', gender: 'Boys' }, { club: 'Ajax', ageGroup: 'U17', gender: 'Boys' },
    { club: 'Benfica', ageGroup: 'U13', gender: 'Boys' }, { club: 'Benfica', ageGroup: 'U15', gender: 'Girls' },
    { club: 'Porto', ageGroup: 'U13', gender: 'Boys' }, { club: 'Porto', ageGroup: 'U15', gender: 'Boys' },
    { club: 'Sporting', ageGroup: 'U13', gender: 'Girls' }, { club: 'Boavista', ageGroup: 'U17', gender: 'Boys' },
    { club: 'Braga', ageGroup: 'U17', gender: 'Boys' }, { club: 'Feyenoord', ageGroup: 'U15', gender: 'Girls' },
    { club: 'Milan', ageGroup: 'U15', gender: 'Boys' },
  ],
  t2: [
    { club: 'FCK', ageGroup: 'U15', gender: 'Boys' }, { club: 'FCK', ageGroup: 'U17', gender: 'Boys' },
    { club: 'Brøndby', ageGroup: 'U13', gender: 'Girls' }, { club: 'Brøndby', ageGroup: 'U15', gender: 'Boys' },
    { club: 'AGF', ageGroup: 'U13', gender: 'Boys' }, { club: 'AGF', ageGroup: 'U17', gender: 'Girls' },
    { club: 'OB', ageGroup: 'U13', gender: 'Boys' }, { club: 'FCN', ageGroup: 'U13', gender: 'Boys' },
  ],
  t4: [
    { club: 'Girona', ageGroup: 'U13', gender: 'Boys' }, { club: 'Girona', ageGroup: 'U15', gender: 'Girls' }, { club: 'Girona', ageGroup: 'U17', gender: 'Boys' },
    { club: 'Espanyol', ageGroup: 'U15', gender: 'Boys' }, { club: 'Espanyol', ageGroup: 'U17', gender: 'Girls' },
    { club: 'Barça', ageGroup: 'U13', gender: 'Boys' },
  ],
}

// AI smart inbox: incoming messages with AI triage and drafted replies.
export const dashInbox = [
  {
    id: 'i1', name: 'Lucas Bianchi', channel: 'email', tournament: 'Porto International Cup',
    topic: 'Travel', urgency: 'high', language: 'EN', confidence: 0.94, status: 'new',
    subject: 'Change of arrival flight',
    body: 'Hi, my flight got rescheduled and I now land at 11:40 instead of 09:10 on July 1. Will the transfer still work for me?',
    aiDraft: "Hi Lucas, thanks for letting us know. No problem, we run transfers throughout the day. I've noted your new arrival of 11:40 on July 1, a Referee Abroad host will meet you at arrivals with a sign. See you in Porto!",
  },
  {
    id: 'i2', name: 'Sophie Dubois', channel: 'email', tournament: 'Copenhagen Cup',
    topic: 'Kit', urgency: 'normal', language: 'EN', confidence: 0.9, status: 'new',
    subject: 'Kit size too small',
    body: 'The referee shirt I received is a size M but I need an L. Can I still change it before the tournament?',
    aiDraft: "Hi Sophie, of course. I've updated your kit size to L in your profile and we'll bring the correct shirt to the tournament. Let us know if anything else needs adjusting!",
  },
  {
    id: 'i3', name: 'Tomás Ruiz', channel: 'chat', tournament: 'IberCup Cascais',
    topic: 'Social', urgency: 'low', language: 'EN', confidence: 0.72, status: 'new',
    subject: 'Guest at the dinner?',
    body: 'Can I bring my partner to the closing dinner on Saturday? Happy to pay for the extra seat.',
    aiDraft: 'Hi Tomás, great that you want to bring a guest! The closing dinner has limited seats, so I have flagged this with the on-site host who will confirm availability and any cost. We will get back to you shortly.',
  },
  {
    id: 'i4', name: 'Emma Novak', channel: 'email', tournament: 'Porto International Cup',
    topic: 'Lodging', urgency: 'normal', language: 'EN', confidence: 0.88, status: 'new',
    subject: 'Hotel room preference',
    body: 'Is it possible to have a single room instead of sharing? I have an early match schedule.',
    aiDraft: 'Hi Emma, thanks for asking. Single rooms are limited but available for an extra fee. I have noted your request and will confirm the option and price with our logistics coordinator.',
  },
  {
    id: 'i5', name: 'Marta Kowalski', channel: 'email', tournament: 'Copenhagen Cup',
    topic: 'Dietary', urgency: 'normal', language: 'EN', confidence: 0.95, status: 'new',
    subject: 'Dietary requirements',
    body: 'I am vegetarian, will there be vegetarian meals at the tournament?',
    aiDraft: 'Hi Marta, yes, vegetarian meals are available at every meal during the tournament. I have added a vegetarian note to your registration so the catering team is aware. Enjoy!',
  },
  {
    id: 'i6', name: 'Ben Carter', channel: 'email', tournament: 'Costa Brava Cup',
    topic: 'Invoice', urgency: 'low', language: 'EN', confidence: 0.6, status: 'new',
    subject: 'Invoice for my club',
    body: 'My club needs a formal invoice with their VAT number for my participation fee. How do I arrange this?',
    aiDraft: 'Hi Ben, we can issue a formal invoice for your club. Could you reply with the club name, address and VAT number? Our finance team will then send the invoice within a few working days.',
  },
]

export const dashPnl = [
  { name: 'Porto International Cup', revenue: 8592, costs: 5140, referees: 48 },
  { name: 'Copenhagen Cup', revenue: 6169, costs: 4020, referees: 31 },
  { name: 'IberCup Cascais', revenue: 5445, costs: 3610, referees: 33 },
  { name: 'Costa Brava Cup', revenue: 9072, costs: 5480, referees: 48 },
  { name: 'Lisbon Handball Open', revenue: 4833, costs: 3120, referees: 27 },
  { name: 'Malta Youth Festival', revenue: 2388, costs: 1890, referees: 12 },
]

export const dashStaff = [
  { name: 'Reemo van Dijk', role: 'Tournament director', initials: 'RD', tournament: 'Porto International Cup' },
  { name: 'Sara Mendes', role: 'Logistics coordinator', initials: 'SM', tournament: 'Porto International Cup' },
  { name: 'Kevin Alofs', role: 'Referee mentor', initials: 'KA', tournament: 'Copenhagen Cup' },
  { name: 'Nadia Haddad', role: 'Communication', initials: 'NH', tournament: 'Costa Brava Cup' },
  { name: 'Paulo Reis', role: 'Onsite host', initials: 'PR', tournament: 'IberCup Cascais' },
  { name: 'Femke Bakker', role: 'Media & content', initials: 'FB', tournament: 'Costa Brava Cup' },
]

export const dashTickets = [
  { id: 1, name: 'Lucas Bianchi', tournament: 'Porto International Cup', subject: 'Change of arrival flight', status: 'open', ago: '12 min ago' },
  { id: 2, name: 'Sophie Dubois', tournament: 'Copenhagen Cup', subject: 'Kit size too small', status: 'open', ago: '1 hour ago' },
  { id: 3, name: 'Tomás Ruiz', tournament: 'IberCup Cascais', subject: 'Can I bring a guest to the dinner?', status: 'open', ago: '3 hours ago' },
  { id: 4, name: 'Emma Novak', tournament: 'Porto International Cup', subject: 'Hotel room preference', status: 'answered', ago: 'Yesterday' },
  { id: 5, name: 'Ben Carter', tournament: 'Costa Brava Cup', subject: 'Invoice for my club', status: 'answered', ago: '2 days ago' },
  { id: 6, name: 'Marta Kowalski', tournament: 'Copenhagen Cup', subject: 'Dietary requirements', status: 'closed', ago: '3 days ago' },
]

export const dashAnalytics = {
  refereesPerTournament: [
    { name: 'Porto', value: 48 },
    { name: 'Copenhagen', value: 31 },
    { name: 'IberCup', value: 33 },
    { name: 'Costa Brava', value: 48 },
    { name: 'Lisbon', value: 27 },
    { name: 'Malta', value: 12 },
  ],
  levels: { beginner: 3, medior: 5, talent: 4 },
  reportsByMonth: [
    { m: 'Jan', v: 18 }, { m: 'Feb', v: 22 }, { m: 'Mar', v: 30 },
    { m: 'Apr', v: 41 }, { m: 'May', v: 52 }, { m: 'Jun', v: 68 },
  ],
}
