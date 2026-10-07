export const user = {
  name: 'Alex Klein',
  first: 'Alex',
  initials: 'AK',
  email: 'alex@mail.com',
  phone: '+31 6 12 34 56 78',
  country: 'Netherlands',
  flag: '🇳🇱',
  level: 'FIFA · Cat. 1',
  sport: 'Football',
  kit: 'L',
  languages: 'NL · EN · DE',
  emergency: 'Sofie Klein · +31 6 98 76 54 32',
}

const baseTournaments = [
  {
    id: 'porto',
    name: 'Porto International Cup',
    country: 'Portugal',
    city: 'Porto',
    img: 'img/porto.jpg',
    age: 'U11 to U19',
    sport: 'Football',
    dates: 'Jul 1 to Jul 5',
    lodging: 'Hotel',
    price: 179,
    spotsLeft: 20,
    referees: 48,
    clubs: 24,
    matches: 86,
    status: 'confirmed',
    applied: true,
    hotel: 'Hotel Vila Foz',
    room: 'Room 214',
    transfer: 'Bus 09:15, lobby',
    keyTimes: [
      { t: '08:30', label: 'Breakfast + briefing, lobby' },
      { t: '10:00', label: 'Match 1, Pitch C' },
      { t: '13:30', label: 'Match 2, Pitch A' },
      { t: '19:30', label: 'Dinner + fair play awards' },
    ],
    agenda: [
      { d: 'Tue', label: 'Arrival + accreditation' },
      { d: 'Wed', label: 'Group stage, day 1' },
      { d: 'Thu', label: 'Group stage, day 2' },
      { d: 'Fri', label: 'Finals + banquet' },
    ],
    documents: [
      { name: 'Travel itinerary.pdf', meta: 'Updated Jun 24 · 240 KB', type: 'pdf', status: 'approved' },
      { name: 'Flight ticket, LIS to OPO', meta: 'Jul 1 · 07:40', type: 'ticket', status: 'approved' },
      { name: 'Referee agreement.pdf', meta: 'Requires your signature', type: 'doc', status: 'to sign', needsSign: true },
    ],
  },
  {
    id: 'copenhagen',
    name: 'Copenhagen Cup',
    country: 'Denmark',
    city: 'Copenhagen',
    img: 'img/copenhagen.jpg',
    age: 'U10 to U19',
    sport: 'Football',
    dates: 'Jul 10 to Jul 16',
    lodging: 'Hotel',
    price: 199,
    spotsLeft: 15,
    referees: 31,
    clubs: 18,
    matches: 64,
    status: 'applied',
    applied: true,
    hotel: 'Wakeup Copenhagen',
    room: 'Room 508',
    transfer: 'Metro M2, 20 min',
    keyTimes: [
      { t: '09:00', label: 'Referee meeting' },
      { t: '11:00', label: 'Match 1, Field 4' },
      { t: '18:00', label: 'Team dinner' },
    ],
    agenda: [
      { d: 'Fri', label: 'Arrival + welcome' },
      { d: 'Sat', label: 'Group stage' },
      { d: 'Sun', label: 'Knockouts + finals' },
    ],
    documents: [
      { name: 'Welcome pack.pdf', meta: 'Updated Jul 2 · 310 KB', type: 'pdf', status: 'approved' },
      { name: 'Kit sizing guide', meta: 'PDF · 480 KB', type: 'doc', status: 'approved' },
    ],
  },
  {
    id: 'ibercup',
    name: 'IberCup Cascais',
    country: 'Portugal',
    city: 'Cascais',
    img: 'img/ibercup.jpg',
    age: 'U12 to U18',
    sport: 'Football',
    dates: 'Jun 2 to Jun 8',
    lodging: 'Campus',
    price: 165,
    spotsLeft: 7,
    referees: 33,
    clubs: 20,
    matches: 70,
    status: 'open',
    applied: false,
  },
  {
    id: 'costabrava',
    name: 'Costa Brava Cup',
    country: 'Spain',
    city: 'Girona',
    img: 'img/costabrava.jpg',
    age: 'U11 to U19',
    sport: 'Football',
    dates: 'Aug 12 to Aug 16',
    lodging: 'Hotel',
    price: 189,
    spotsLeft: 12,
    referees: 40,
    clubs: 22,
    matches: 72,
    status: 'open',
    applied: false,
  },
]

// Extra sample tournaments so the USA / Europe / Asia regions are populated in
// the prototype. Minimal fields, enough for the cards and the detail intro.
const IMGS = ['img/costabrava.jpg', 'img/porto.jpg', 'img/copenhagen.jpg', 'img/ibercup.jpg', 'img/malta.jpg', 'img/alpine.jpg']
const mk = (name, city, country, dates, price, spotsLeft, referees, i) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  name, city, country, img: IMGS[i % IMGS.length],
  age: 'U11 to U19', sport: 'Football', dates, price, spotsLeft, referees,
  clubs: Math.max(8, Math.round(referees / 2)), matches: referees * 2,
  status: spotsLeft > 0 ? 'recruiting' : 'confirmed', applied: false,
})
const regionSeed = [
  // USA / North America
  ['Dallas Cup', 'Dallas', 'United States', 'Apr 12 to Apr 18', 199, 14, 46],
  ['Surf Cup', 'San Diego', 'United States', 'Jul 19 to Jul 23', 189, 9, 40],
  ['Disney Soccer Showcase', 'Orlando', 'United States', 'Dec 27 to Jan 2', 219, 22, 60],
  ['Las Vegas Mayor’s Cup', 'Las Vegas', 'United States', 'Feb 14 to Feb 17', 179, 6, 32],
  ['Bay Area Classic', 'San Francisco', 'United States', 'May 24 to May 27', 169, 18, 44],
  ['Windy City Cup', 'Chicago', 'United States', 'Jun 7 to Jun 10', 175, 0, 50],
  ['Lone Star Invitational', 'Houston', 'United States', 'Mar 15 to Mar 19', 185, 11, 36],
  ['Rocky Mountain Cup', 'Denver', 'United States', 'Aug 2 to Aug 6', 165, 20, 42],
  ['Toronto International', 'Toronto', 'Canada', 'Jul 5 to Jul 9', 195, 13, 48],
  ['Montreal Cup', 'Montreal', 'Canada', 'Jun 21 to Jun 24', 185, 7, 34],
  ['Vancouver Cup', 'Vancouver', 'Canada', 'Aug 16 to Aug 20', 189, 16, 40],
  ['Copa Mexico', 'Mexico City', 'Mexico', 'Nov 8 to Nov 12', 159, 24, 55],
  // Asia
  ['Tokyo Youth Cup', 'Tokyo', 'Japan', 'May 3 to May 7', 189, 22, 38],
  ['Osaka Spring Cup', 'Osaka', 'Japan', 'Apr 4 to Apr 7', 179, 10, 32],
  ['Lion City Cup', 'Singapore', 'Singapore', 'Jun 14 to Jun 18', 209, 8, 36],
  ['Bangkok Football Festival', 'Bangkok', 'Thailand', 'Jul 26 to Jul 30', 169, 19, 44],
  ['Dubai Super Cup', 'Dubai', 'United Arab Emirates', 'Dec 12 to Dec 16', 239, 15, 50],
  ['Shanghai International', 'Shanghai', 'China', 'Oct 3 to Oct 7', 199, 0, 48],
  ['Seoul Youth Cup', 'Seoul', 'South Korea', 'Sep 20 to Sep 24', 185, 12, 40],
  ['Bali Cup', 'Bali', 'Indonesia', 'Aug 9 to Aug 13', 175, 21, 42],
  ['KL Invitational', 'Kuala Lumpur', 'Malaysia', 'Jul 12 to Jul 15', 169, 9, 34],
  ['Doha Youth Cup', 'Doha', 'Qatar', 'Jan 17 to Jan 21', 229, 17, 46],
  ['Ho Chi Minh Cup', 'Ho Chi Minh City', 'Vietnam', 'Mar 1 to Mar 4', 149, 23, 38],
  ['Mumbai Soccer Fest', 'Mumbai', 'India', 'Feb 7 to Feb 11', 155, 14, 40],
].map((a, i) => mk(a[0], a[1], a[2], a[3], a[4], a[5], a[6], i))

export const tournaments = [...baseTournaments, ...regionSeed]

export const news = [
  {
    id: 1,
    title: 'Welcome to Referee Abroad!',
    body: 'We are excited to have you on board. Browse available tournaments and start your international refereeing journey today!',
    ago: '2h ago',
  },
  {
    id: 2,
    title: 'IberCup Cascais, spots filling fast',
    body: 'Only 7 spots remaining for the IberCup Cascais tournament in June. Apply now to secure your place!',
    ago: '1d ago',
  },
  {
    id: 3,
    title: 'New tournament added: Costa Brava Cup',
    body: 'We have added a new tournament in Spain! The Costa Brava Cup takes place in August. Check the tournaments page for details.',
    ago: '3d ago',
  },
]

// The user's match appointments, pushed from the Command Centre.
export const myMatches = [
  { id: 'a1', tournamentId: 'porto', tournament: 'Porto International Cup', day: 'Wed Jul 2', time: '10:00', pitch: 'Pitch C', home: 'Feyenoord U15', away: 'Milan U15', role: 'Main referee', coRefs: ['Jonas Berg'], observer: 'Giorgio Bruno', status: 'confirmed' },
  { id: 'a2', tournamentId: 'porto', tournament: 'Porto International Cup', day: 'Wed Jul 2', time: '13:30', pitch: 'Pitch A', home: 'Ajax U15', away: 'Porto U15', role: 'Assistant referee', coRefs: ['Ana Nogueira'], observer: null, status: 'confirmed' },
  { id: 'a3', tournamentId: 'porto', tournament: 'Porto International Cup', day: 'Thu Jul 3', time: '16:00', pitch: 'Pitch A', home: 'Braga U17', away: 'Ajax U17', role: 'Main referee', coRefs: [], observer: 'Helena Vik', status: 'appointed' },
  { id: 'a4', tournamentId: 'copenhagen', tournament: 'Copenhagen Cup', day: 'Sat Jul 12', time: '12:30', pitch: 'Field 1', home: 'FCK U17', away: 'AGF U17', role: 'Assistant referee', coRefs: ['Jonas Berg'], observer: null, status: 'appointed' },
]

// FAQ that grounds the in-app AI assistant.
export const faq = [
  { q: 'When do I get my match schedule?', a: 'Your match appointments appear under Matches in the app as soon as the tournament team publishes them, usually a few days before the tournament. You get a notification for every new or changed appointment.', tags: ['match', 'schedule', 'appointment', 'matches'] },
  { q: 'What do I do when I arrive?', a: 'On arrival, go to accreditation at the tournament desk, then check in at your hotel. Your key times and transfer details are on each tournament page in the app.', tags: ['arrival', 'accreditation', 'check in', 'arrive'] },
  { q: 'How do I change my kit size?', a: 'Open Profile and update your Kit size, or message the organisation in the chat. Changes made before the tournament are handled automatically.', tags: ['kit', 'size', 'shirt', 'jersey'] },
  { q: 'How do I get to the hotel from the airport?', a: 'Your transfer details are shown on the tournament page under logistics. A Referee Abroad host meets you at arrivals with a sign.', tags: ['transfer', 'hotel', 'airport', 'pickup'] },
  { q: 'How do I apply and pay for a tournament?', a: 'Open a tournament, tap Apply now and complete the payment. Your status then shows as applied, and moves to confirmed once the team approves you.', tags: ['apply', 'pay', 'payment', 'register', 'sign up'] },
  { q: 'Can I bring a guest to the dinner?', a: 'Guests are sometimes possible depending on seats. Ask in the chat and the on-site host will confirm availability and any cost.', tags: ['guest', 'dinner', 'plus one', 'partner'] },
  { q: 'What should I pack?', a: 'Bring your referee kit (yellow shirt for most tournaments), boots, whistle, and any personal documents. The exact kit colour is shown on the tournament page.', tags: ['pack', 'kit', 'bring', 'whistle', 'boots'] },
  { q: 'How do I contact the organisation?', a: 'Use the chat in the app to message Referee Abroad directly, or your tournament group chat for questions to the whole group.', tags: ['contact', 'organisation', 'help', 'reach', 'support'] },
]

export const notifications = [
  { id: 'n1', type: 'appointment', title: 'New match appointment', body: 'You are appointed as Main referee, Feyenoord U15 vs Milan U15, Pitch C at 10:00.', ago: '20 min ago', unread: true },
  { id: 'n2', type: 'appointment', title: 'New match appointment', body: 'You are appointed as Main referee, Braga U17 vs Ajax U17, Pitch A on Thu Jul 3 at 16:00.', ago: '1 hour ago', unread: true },
  { id: 'n3', type: 'message', title: 'Message from Referee Abroad', body: "Done 👍 Updated to L, it's set in your profile now.", ago: '2 hours ago', unread: false },
  { id: 'n4', type: 'document', title: 'Document ready', body: 'Your travel itinerary for Porto International Cup is available.', ago: 'Yesterday', unread: false },
  { id: 'n5', type: 'payment', title: 'Payment received', body: 'We received your payment for Porto International Cup. You are all set!', ago: '2 days ago', unread: false },
]

export const generalDocs = [
  { name: 'Referee handbook 2026', meta: 'PDF · 1.2 MB', type: 'doc', status: 'approved' },
  { name: 'Kit sizing guide', meta: 'PDF · 480 KB', type: 'shirt', status: 'approved' },
  { name: 'Code of conduct', meta: 'PDF · 190 KB', type: 'doc', status: 'approved' },
]

// The referee's own uploaded documents (with review status).
export const ownDocuments = [
  { name: 'Passport.pdf', meta: 'Uploaded Jun 10 · 1.1 MB', type: 'doc', status: 'approved' },
  { name: 'Referee certificate 2026', meta: 'Uploaded Jun 12 · 640 KB', type: 'doc', status: 'submitted' },
]

// Availability per month, used by the Command Centre appointing.
export const availabilityMonths = [
  { key: 'jun', label: 'June 2026', state: 'available' },
  { key: 'jul', label: 'July 2026', state: 'available' },
  { key: 'aug', label: 'August 2026', state: 'maybe' },
  { key: 'sep', label: 'September 2026', state: 'unavailable' },
  { key: 'oct', label: 'October 2026', state: 'available' },
  { key: 'nov', label: 'November 2026', state: 'maybe' },
]

export const orgChat = [
  { from: 'org', text: 'Hi Alex! Your flight to Porto is confirmed ✈️ Arriving Jul 1 at 09:10.' },
  { from: 'org', text: 'Your pickup will be waiting at arrivals with a Referee Abroad sign.' },
  { from: 'me', text: 'Great, thanks! Can I still change my kit size to L?' },
  { from: 'org', text: "Of course 👍 I've updated your size to L, it's set in your profile now." },
  { from: 'me', text: 'Perfect 🙏' },
]

export const groupChat = [
  { sys: 'Marco created the group' },
  { from: 'Marco (org)', initials: 'MR', color: '#44A546', text: 'Welcome everyone! 👋 We meet at 09:15 in the lobby for the bus.' },
  { from: 'Lucas B.', initials: 'LB', color: '#8a6d1f', text: 'Anyone want to share a taxi from the airport? 🚕' },
  { from: 'me', text: 'Me! Also landing at 09:10 ✋' },
  { from: 'Ana N.', initials: 'AN', color: '#1d6e56', text: "Don't forget to pack your yellow kit 😄" },
]
