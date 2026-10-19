// Shared Phase 1 scope, used by both the Source of truth page and the Sprint board.

export const requirements = [
  {
    id: 'A', title: 'Access & environment', items: [
      ['A1', 'Dedicated WordPress admin account for Reemo'],
      ['A2', 'Staging copy of the WordPress site to build against'],
      ['A3', 'WordPress REST API enabled with an application password'],
      ['A4', 'WooCommerce REST API keys with read and write access'],
      ['A5', 'Hosting and deploy access, and a target domain for the webapp'],
      ['A6', 'LLM API key on Referee Abroad’s own account'],
      ['A7', 'Mailbox access for the inbox addresses'],
      ['A8', 'Brand assets and sample tournament data delivered'],
    ],
  },
  {
    id: 'B', title: 'Authentication', items: [
      ['B1', 'Referees log in with their existing WordPress credentials'],
      ['B2', 'The session persists across app restarts'],
      ['B3', 'Password reset uses the existing WordPress flow'],
      ['B4', 'A failed login shows a clear inline error'],
      ['B5', 'Logout clears the session'],
    ],
  },
  {
    id: 'C', title: 'WordPress & WooCommerce integration', items: [
      ['C1', 'Read tournaments from WooCommerce products'],
      ['C2', 'Read enrolments from WooCommerce orders'],
      ['C3', 'Create a WooCommerce order when a referee applies'],
      ['C4', 'Payment runs through the existing WooCommerce checkout'],
      ['C5', 'WordPress remains the single source of truth in Phase 1'],
      ['C6', 'Two-way sync keeps the app and WordPress in step'],
      ['C7', 'Webhooks notify the app of new and changed orders'],
      ['C8', 'Sync failures are retried automatically with backoff'],
      ['C9', 'Sync activity is logged for troubleshooting'],
    ],
  },
  {
    id: 'D', title: 'Referee webapp', items: [
      ['D1', 'Tournament list with name, dates and location'],
      ['D2', 'Tournament detail with description, dates and pitch info'],
      ['D3', 'Apply to a tournament from the detail screen'],
      ['D4', 'Pay for an application through the checkout'],
      ['D5', 'Documents screen lists the referee’s documents'],
      ['D6', 'Profile screen shows and edits personal details'],
      ['D7', 'In-app chat per tournament group'],
      ['D8', 'Direct message to the organisation'],
      ['D9', 'Unread badge on chat'],
      ['D10', 'Mobile-first layout for common phone sizes'],
      ['D11', 'A referee sees only their own match appointments, not other referees’ matches'],
      ['D12', 'Submit a match report (final score, fair play rating, notes)'],
      ['D13', 'Only the assigned main referee can open and submit the match report; server-enforced, assistants and visitors have no access'],
      ['D14', 'Tournament application status is clear per tournament: open, applied (awaiting), or confirmed (going)'],
      ['D15', 'Referees are appointed to matches directly (no accept or decline step)'],
    ],
  },
  {
    id: 'E', title: 'Tournament Command Centre', items: [
      ['E1', 'Tournament overview with status'],
      ['E2', 'Manage a tournament’s details'],
      ['E3', 'Enrolment list per tournament'],
      ['E4', 'Referee directory with profiles'],
      ['E5', 'Staff management'],
      ['E6', 'Broadcast a message to a tournament group'],
      ['E7', 'Support ticket inbox with a chat view'],
      ['E8', 'P&L overview per tournament'],
      ['E9', 'Analytics overview with totals and trends'],
      ['E10', 'Two-way sync status visible to admins'],
      ['E11', 'Left navigation across all sections'],
    ],
  },
  {
    id: 'I', title: 'Team & fixture import (CSV / Excel)', items: [
      ['I1', 'Import teams and fixtures from an uploaded file (CSV or Excel)'],
      ['I2', 'Accept any provider format and detect the header row automatically'],
      ['I3', 'Auto-map columns to fields (home, away, category, date, time, field, referees) with multilingual synonyms'],
      ['I4', 'Normalise age and gender from team names or a category field (e.g. u14girls, G18, birth year 2013)'],
      ['I5', 'Confirmation step to review and correct the mapping before import'],
      ['I6', 'Save a reusable mapping profile per organiser / source'],
      ['I7', 'Support fixtures that already include appointment columns (main, AR1, AR2, 4th)'],
      ['I8', 'Teams carry gender (boys, girls, mixed) alongside the age group'],
      ['I9', 'Recommended CSV template for organisers without an export system'],
    ],
  },
  {
    id: 'J', title: 'Tournament operations & scheduling', items: [
      ['J1', 'Rename the tournament setup card to “Tournament readiness” (dashboard and app)'],
      ['J2', 'Referees can upload travel documents before paying for a tournament'],
      ['J3', 'People: add Observers and Guests / VIP as manageable groups next to Staff and Referees (add and appoint)'],
      ['J4', 'Export a tournament’s appointments to CSV / Excel'],
      ['J5', 'Appoint with AI: a button that pre-fills all matches from admin-provided requirements (free-text prompt)'],
      ['J6', 'Upload the tournament’s fields / pitches (supports many, e.g. 20) for use in appointing'],
      ['J7', 'Appointing organised per day: day blocks first, then the match rows for the selected day'],
      ['J8', 'Referee enrolments: left-align the referee info columns instead of crowding them to the right'],
      ['J9', 'Match report: capture yellow and red card counts with card icons'],
      ['J10', 'Match details show the appointed observer (empty row when none)'],
      ['J11', 'Matches: “Chat with team” opens a chat with the assigned referees’ team'],
      ['J12', 'App: show document upload deadlines (e.g. 8 weeks before start) in Profile → Docs'],
      ['J13', 'Upload a revised schedule: overwrite when no appointments exist; otherwise show a diff with flagged conflicts (double bookings, invalid situations, matches without a referee)'],
      ['J14', 'Reschedule matches to another day (e.g. weather) with conflicts re-checked'],
      ['J15', 'Admin sees submitted match reports (score, yellow/red cards, fair play, notes) inline in appointing'],
    ],
  },
  {
    id: 'U', title: 'User interface & design build', items: [
      ['U1', 'Design system built in code: colours, typography and spacing tokens'],
      ['U2', 'Reusable component library: buttons, cards, inputs, chips, modals'],
      ['U3', 'Referee webapp screens built to the agreed design'],
      ['U4', 'Tournament Command Centre screens built to the agreed design'],
      ['U5', 'Loading states for every data view'],
      ['U6', 'Empty states with helpful copy'],
      ['U7', 'Error states with a retry option'],
      ['U8', 'Form validation with inline error styling'],
      ['U9', 'Consistent icon set and imagery'],
      ['U10', 'Micro-interactions and transitions (taps, hovers, sheets)'],
      ['U11', 'Responsive layouts across phone and desktop'],
      ['U12', 'Brand app icon and launch / splash screen'],
      ['U13', 'Visual QA and polish pass: spacing, alignment, consistency'],
    ],
  },
  {
    id: 'F', title: 'Referee appointing', items: [
      ['F1', 'Create matches per tournament (teams, time, pitch)'],
      ['F2', 'Appoint a referee to a match'],
      ['F3', 'Assign a role: main or assistant'],
      ['F4', 'Warn on double booking or time conflict'],
      ['F5', 'Push the appointment to the referee’s webapp'],
      ['F6', 'Referee sees the appointment in the app'],
      ['F7', 'Reassign or remove an appointment'],
    ],
  },
  {
    id: 'G', title: 'AI communication assistant', items: [
      ['G1', 'Chatbot embedded in the webapp'],
      ['G2', 'Chatbot answers grounded in the Referee Abroad FAQ'],
      ['G3', 'Chatbot signals when it is unsure instead of guessing'],
      ['G4', 'Unified inbox collects incoming mails'],
      ['G5', 'AI triages the topic'],
      ['G6', 'AI triages the urgency'],
      ['G7', 'AI tags the tournament'],
      ['G8', 'AI detects the language'],
      ['G9', 'AI drafts a reply from the FAQ and tournament data'],
      ['G10', 'Safe, high-confidence cases can be answered automatically'],
      ['G11', 'Low-confidence cases are drafted for human review'],
      ['G12', 'A human can edit and send any draft'],
      ['G13', 'Token usage is tracked for the monthly usage cost'],
      ['G14', 'No auto-answer on sensitive topics'],
    ],
  },
  {
    id: 'H', title: 'Notifications', items: [
      ['H1', 'Push notification on a new message'],
      ['H2', 'Push notification on a new appointment'],
      ['H3', 'In-app read status'],
    ],
  },
  {
    id: 'N', title: 'Non-functional', items: [
      ['N1', 'App loads within a reasonable time on mobile data'],
      ['N2', 'Sync retries with backoff on failure'],
      ['N3', 'Errors are logged and monitored'],
      ['N4', 'Personal data handled per GDPR; WordPress stays source in Phase 1'],
      ['N5', 'Data processing agreement in place where needed'],
      ['N6', 'Works on the latest iOS and Android browsers'],
      ['N7', 'Basic accessibility: contrast and tap targets'],
    ],
  },
  {
    id: 'Q', title: 'QA & launch', items: [
      ['Q1', 'QA across devices and browsers'],
      ['Q2', 'End-to-end test: apply, pay and order lands in WordPress'],
      ['Q3', 'End-to-end test: appointment, push and visible in the app'],
      ['Q4', 'Deployment to production'],
      ['Q5', 'Documentation and handover'],
      ['Q6', 'Two-week warranty window after go-live'],
    ],
  },
]

export const reqCount = requirements.reduce((a, g) => a + g.items.length, 0)

// Phase 1 build timeline (shown on the Source of truth page) and the overall
// progress derived from it (shown as a fill on the Fase 1 hub card), so the two
// always stay in sync. status: 'delivered' | 'active' | 'planned'.
export const phase1Timeline = [
  {
    n: 1, tag: 'Kickoff', status: 'active', title: 'Discovery & access',
    summary: 'Get everything in place to start building, mostly through the group chat with the WordPress admin.',
    points: [
      'Dedicated WordPress admin account for Reemo',
      'Staging copy of the site to build against',
      'WordPress REST API enabled with an application password',
      'WooCommerce API keys with read and write access',
      'Hosting and deploy access, plus the webapp domain',
      'LLM API key on Referee Abroad’s own account',
      'Mailbox access for the inbox addresses',
      'Brand assets and sample tournament data',
    ],
  },
  {
    n: 2, tag: 'Sprint 1', status: 'delivered', title: 'Architecture & rollout plan',
    summary: 'Analyse the current setup and lock the target architecture for Phase 1.',
    points: [
      'Analysis of the current WordPress and WooCommerce setup',
      'Target architecture for Phase 1 and Phase 2',
      'Integration decisions and phased rollout plan',
    ],
  },
  {
    n: 3, tag: 'Sprint 1', status: 'delivered', title: 'Clickable prototypes',
    summary: 'Referee webapp and Tournament Command Centre as clickable previews to align on before building.',
    points: [
      'Mobile-first referee webapp: tournaments, detail, documents, profile, chats',
      'Admin dashboard shell with left navigation and all sections',
      'Referee Abroad branding and clickable flows on a hosted link',
    ],
  },
  {
    n: 4, tag: 'Sprint 2', status: 'delivered', title: 'WordPress & WooCommerce integration layer',
    summary: 'The connection that keeps the app and WordPress in step, with WordPress as the source of truth.',
    points: [
      'Read tournaments from WooCommerce products',
      'Read enrolments from WooCommerce orders',
      'Create a WooCommerce order when a referee applies',
      'Two-way sync with WordPress as source of truth in Phase 1',
      'Webhooks for new and changed orders',
      'Automatic retries and a sync activity log',
    ],
  },
  {
    n: 5, tag: 'Sprints 2 to 4', status: 'delivered', title: 'Referee webapp, production build',
    summary: 'The real mobile app referees use day to day.',
    points: [
      'Login via existing WordPress accounts',
      'Tournaments and enrolment data from WooCommerce',
      'Apply and pay through the existing checkout',
      'In-app messages and push notifications',
      'Documents and profile editing',
    ],
  },
  {
    n: 6, tag: 'Sprints 3 to 5', status: 'delivered', title: 'Tournament Command Centre, production build',
    summary: 'The admin side to run tournaments and all referee communication.',
    points: [
      'Manage tournaments, enrolments, referees and staff',
      'Broadcast messages to tournament groups',
      'Support ticket inbox with a chat view',
      'P&L and analytics overview',
      'Two-way sync status visible to admins',
    ],
  },
  {
    n: 7, tag: 'Sprint 5', status: 'delivered', title: 'Referee appointing system',
    summary: 'Assign referees to matches and push it straight to their app.',
    points: [
      'Create matches per tournament (teams, time, pitch)',
      'Appoint referees with roles (main, assistant)',
      'Double booking and time-conflict warnings',
      'Fixture import maps referee names to the directory and appoints them',
      'Appointment pushed to the referee’s webapp and shown in the app',
    ],
  },
  {
    n: 8, tag: 'Sprints 5 to 6', status: 'active', title: 'AI communication assistant',
    summary: 'LLM chatbot in the app plus a smart inbox that triages and drafts replies.',
    points: [
      'Chatbot in the webapp, grounded in the Referee Abroad FAQ',
      'Unified inbox with AI triage: topic, urgency, tournament and language',
      'AI-drafted replies from the FAQ and tournament data',
      'Automatic answers for safe, high-confidence cases; the rest drafted for review',
      'Token usage tracked for the monthly usage cost',
    ],
  },
  {
    n: 9, tag: 'Sprint 6', status: 'planned', title: 'Integration, testing & launch',
    summary: 'Finish the wiring, test everything and go live.',
    points: [
      'WordPress and WooCommerce API and webhooks finalised',
      'QA across devices and browsers',
      'Deployment, documentation and handover',
    ],
  },
  {
    n: 10, tag: 'Aftercare', status: 'planned', title: 'Warranty & maintenance',
    summary: 'Support right after go-live, then ongoing maintenance.',
    points: [
      'Two weeks of free defect fixing after go-live',
      'Then two hours of monthly maintenance: updates, monitoring and support',
    ],
  },
]

const STATUS_WEIGHT = { delivered: 1, active: 0.5, planned: 0 }
export const phase1Progress = Math.round(
  phase1Timeline.reduce((a, s) => a + (STATUS_WEIGHT[s.status] || 0), 0) / phase1Timeline.length * 100,
)
