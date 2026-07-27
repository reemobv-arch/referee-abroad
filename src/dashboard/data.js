// Mock data for the Tournament Command Centre prototype

export const dashTournaments = [
  { id: 't1', name: 'Porto International Cup', city: 'Porto', country: 'Portugal', img: 'img/porto.jpg', dates: 'Jul 1 – Jul 5', sport: 'Football', status: 'confirmed', enrolled: 48, capacity: 60 },
  { id: 't2', name: 'Copenhagen Cup', city: 'Copenhagen', country: 'Denmark', img: 'img/copenhagen.jpg', dates: 'Jul 10 – Jul 16', sport: 'Football', status: 'recruiting', enrolled: 31, capacity: 50 },
  { id: 't3', name: 'IberCup Cascais', city: 'Cascais', country: 'Portugal', img: 'img/ibercup.jpg', dates: 'Jun 2 – Jun 8', sport: 'Football', status: 'recruiting', enrolled: 33, capacity: 40 },
  { id: 't4', name: 'Costa Brava Cup', city: 'Girona', country: 'Spain', img: 'img/costabrava.jpg', dates: 'Aug 12 – Aug 16', sport: 'Football', status: 'confirmed', enrolled: 48, capacity: 60 },
  { id: 't5', name: 'Malta Youth Festival', city: 'Valletta', country: 'Malta', img: 'img/malta.jpg', dates: 'Oct 3 – Oct 7', sport: 'Football', status: 'planned', enrolled: 12, capacity: 50 },
  { id: 't6', name: 'Alpine Hockey Trophy', city: 'Innsbruck', country: 'Austria', img: 'img/alpine.jpg', dates: 'Nov 21 – Nov 24', sport: 'Hockey', status: 'recruiting', enrolled: 12, capacity: 40 },
  { id: 't7', name: 'Prague Spring Trophy', city: 'Prague', country: 'Czechia', img: 'img/porto.jpg', dates: 'Apr 18 – Apr 21', sport: 'Football', status: 'planned', enrolled: 6, capacity: 44 },
  { id: 't8', name: 'Lisbon Handball Open', city: 'Lisbon', country: 'Portugal', img: 'img/ibercup.jpg', dates: 'May 9 – May 12', sport: 'Handball', status: 'confirmed', enrolled: 27, capacity: 36 },
  { id: 't9', name: 'Berlin Winter Cup', city: 'Berlin', country: 'Germany', img: 'img/costabrava.jpg', dates: 'Dec 27 – Dec 30', sport: 'Football', status: 'planned', enrolled: 4, capacity: 48 },
]

export const dashReferees = [
  { name: 'Daniel Klein', country: 'Netherlands', flag: '🇳🇱', level: 'talent' },
  { name: 'Lucas Bianchi', country: 'Italy', flag: '🇮🇹', level: 'medior' },
  { name: 'Ana Nogueira', country: 'Portugal', flag: '🇵🇹', level: 'talent' },
  { name: 'Marco Silva', country: 'Portugal', flag: '🇵🇹', level: 'medior' },
  { name: 'Sophie Dubois', country: 'France', flag: '🇫🇷', level: 'beginner' },
  { name: 'Jonas Berg', country: 'Sweden', flag: '🇸🇪', level: 'medior' },
  { name: 'Emma Novak', country: 'Czechia', flag: '🇨🇿', level: 'beginner' },
  { name: 'Tomás Ruiz', country: 'Spain', flag: '🇪🇸', level: 'talent' },
  { name: 'Lena Fischer', country: 'Germany', flag: '🇩🇪', level: 'medior' },
  { name: 'Oliver Hansen', country: 'Denmark', flag: '🇩🇰', level: 'beginner' },
  { name: 'Chiara Rossi', country: 'Italy', flag: '🇮🇹', level: 'medior' },
  { name: 'Piet de Vries', country: 'Netherlands', flag: '🇳🇱', level: 'talent' },
  { name: 'Aoife Murphy', country: 'Ireland', flag: '🇮🇪', level: 'beginner' },
  { name: 'Nikolas Weber', country: 'Austria', flag: '🇦🇹', level: 'medior' },
  { name: 'Marta Kowalski', country: 'Poland', flag: '🇵🇱', level: 'talent' },
  { name: 'Diego Fernández', country: 'Spain', flag: '🇪🇸', level: 'beginner' },
  { name: 'Ingrid Larsen', country: 'Norway', flag: '🇳🇴', level: 'medior' },
  { name: 'Ben Carter', country: 'England', flag: '🏴', level: 'talent' },
  { name: 'Júlia Costa', country: 'Portugal', flag: '🇵🇹', level: 'beginner' },
  { name: 'Stefan Petrov', country: 'Bulgaria', flag: '🇧🇬', level: 'medior' },
]

export const dashStaff = [
  { name: 'Reemo van Dijk', role: 'Tournament director', initials: 'RD', tournament: 'Porto International Cup' },
  { name: 'Sara Mendes', role: 'Logistics coordinator', initials: 'SM', tournament: 'Porto International Cup' },
  { name: 'Kevin Alofs', role: 'Referee mentor', initials: 'KA', tournament: 'Copenhagen Cup' },
  { name: 'Nadia Haddad', role: 'Communication', initials: 'NH', tournament: 'Costa Brava Cup' },
  { name: 'Paulo Reis', role: 'On-site host', initials: 'PR', tournament: 'IberCup Cascais' },
  { name: 'Femke Bakker', role: 'Media & content', initials: 'FB', tournament: 'Costa Brava Cup' },
  { name: 'Tim Vermeer', role: 'Logistics coordinator', initials: 'TV', tournament: 'Alpine Hockey Trophy' },
]

export const dashTickets = [
  { id: 1, name: 'Lucas Bianchi', tournament: 'Porto International Cup', subject: 'Change of arrival flight', status: 'open', ago: '12 min ago' },
  { id: 2, name: 'Sophie Dubois', tournament: 'Copenhagen Cup', subject: 'Kit size too small', status: 'open', ago: '1 hour ago' },
  { id: 3, name: 'Tomás Ruiz', tournament: 'IberCup Cascais', subject: 'Can I bring a guest to the dinner?', status: 'open', ago: '3 hours ago' },
  { id: 4, name: 'Emma Novak', tournament: 'Porto International Cup', subject: 'Hotel room preference', status: 'answered', ago: 'Yesterday' },
  { id: 5, name: 'Ben Carter', tournament: 'Costa Brava Cup', subject: 'Invoice for my club', status: 'answered', ago: '2 days ago' },
  { id: 6, name: 'Marta Kowalski', tournament: 'Copenhagen Cup', subject: 'Dietary requirements', status: 'closed', ago: '3 days ago' },
]

export const dashPnl = [
  { name: 'Porto International Cup', revenue: 8592, costs: 5140, referees: 48 },
  { name: 'Copenhagen Cup', revenue: 6169, costs: 4020, referees: 31 },
  { name: 'IberCup Cascais', revenue: 5445, costs: 3610, referees: 33 },
  { name: 'Costa Brava Cup', revenue: 9072, costs: 5480, referees: 48 },
  { name: 'Lisbon Handball Open', revenue: 4833, costs: 3120, referees: 27 },
  { name: 'Malta Youth Festival', revenue: 2388, costs: 1890, referees: 12 },
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
  levels: { beginner: 6, medior: 8, talent: 6 },
  reportsByMonth: [
    { m: 'Jan', v: 18 }, { m: 'Feb', v: 22 }, { m: 'Mar', v: 30 },
    { m: 'Apr', v: 41 }, { m: 'May', v: 52 }, { m: 'Jun', v: 68 },
  ],
}
