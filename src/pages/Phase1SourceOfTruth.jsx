import { Link } from 'react-router-dom'
import { ArrowLeft, Check, Palette, Type as TypeIcon, MousePointerClick, LayoutGrid, ListChecks, GitBranch } from 'lucide-react'
import Logo from '../components/Logo.jsx'

/* ---------------- Architecture timeline ---------------- */
const timeline = [
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
    n: 4, tag: 'Sprint 2', status: 'planned', title: 'WordPress & WooCommerce integration layer',
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
    n: 5, tag: 'Sprints 2 to 4', status: 'planned', title: 'Referee webapp, production build',
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
    n: 6, tag: 'Sprints 3 to 5', status: 'planned', title: 'Tournament Command Centre, production build',
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
    n: 7, tag: 'Sprint 5', status: 'planned', title: 'Referee appointing system',
    summary: 'Assign referees to matches and push it straight to their app.',
    points: [
      'Create matches per tournament (teams, time, pitch)',
      'Appoint referees with roles (main, assistant)',
      'Double booking and time-conflict warnings',
      'Appointment pushed to the referee’s webapp',
    ],
  },
  {
    n: 8, tag: 'Sprints 5 to 6', status: 'planned', title: 'AI communication assistant',
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

const statusStyles = {
  delivered: { ring: 'bg-brand text-white', label: 'Delivered', chip: 'bg-brand-light text-brand-dark' },
  active: { ring: 'bg-brand-dark text-white', label: 'In progress', chip: 'bg-brand-dark text-white' },
  planned: { ring: 'bg-white text-neutral-400 border-2 border-neutral-300', label: 'Planned', chip: 'bg-neutral-100 text-neutral-500' },
}

/* ---------------- Design system ---------------- */
const colors = [
  { name: 'Brand green', hex: '#44A546', role: 'Primary actions, highlights' },
  { name: 'Brand dark', hex: '#2F7D33', role: 'Hover, links, emphasis' },
  { name: 'Brand light', hex: '#E7F4E1', role: 'Tints, icon tiles, chips' },
  { name: 'Ink', hex: '#1B1B1B', role: 'Body text and titles' },
  { name: 'Data ink', hex: '#17201A', role: 'Diagram data blocks' },
  { name: 'Page', hex: '#F4F5F4', role: 'Page background' },
  { name: 'White', hex: '#FFFFFF', role: 'Cards and surfaces' },
  { name: 'Border', hex: '#E5E7EB', role: 'Card and input borders' },
  { name: 'Muted', hex: '#6B7280', role: 'Secondary text' },
  { name: 'Alert', hex: '#EF4444', role: 'Errors and strikethrough' },
]

const typeSamples = [
  { label: 'Display title', cls: 'text-3xl font-extrabold', note: 'Baloo 2 · 800 · page titles' },
  { label: 'Section heading', cls: 'text-lg font-bold', note: 'Baloo 2 · 700 · card and section titles' },
  { label: 'Body text', cls: 'text-sm font-medium', note: 'Baloo 2 · 500 · paragraphs and lists' },
  { label: 'CAPTION / EYEBROW', cls: 'text-[11px] font-bold uppercase tracking-wide', note: 'Baloo 2 · 700 · labels and tags' },
]

/* ---------------- Requirements ---------------- */
const requirements = [
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

const reqCount = requirements.reduce((a, g) => a + g.items.length, 0)

function SectionTitle({ icon: Icon, kicker, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-10 h-10 rounded-xl bg-brand-light text-brand-dark flex items-center justify-center shrink-0"><Icon size={20} /></span>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-brand-dark">{kicker}</p>
        <h2 className="text-xl font-extrabold leading-tight">{title}</h2>
        {desc && <p className="mt-1 text-sm font-medium text-neutral-600 max-w-2xl">{desc}</p>}
      </div>
    </div>
  )
}

export default function Phase1SourceOfTruth() {
  return (
    <div
      className="min-h-screen text-ink font-sans"
      style={{
        backgroundImage: 'linear-gradient(rgba(244,245,244,0.7), rgba(244,245,244,0.72)), url(img/hub-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-4xl mx-auto px-5 py-10">
        <Link to="/phase1" className="inline-flex items-center gap-1.5 text-brand-dark font-semibold text-sm mb-8">
          <ArrowLeft size={17} /> Back to Fase 1
        </Link>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Logo size={40} showText textClass="text-lg" />
          <span className="text-xs font-bold uppercase tracking-wide bg-brand-light text-brand-dark px-3 py-1 rounded-full">Source of truth</span>
        </div>

        <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold leading-tight">Source of truths</h1>
        <p className="mt-2 text-neutral-600 font-medium max-w-2xl">
          The single reference for building Phase 1: the architecture as a timeline with action points, the design system, and every requirement broken down small.
        </p>

        {/* ============ TIMELINE ============ */}
        <section className="mt-10">
          <SectionTitle icon={GitBranch} kicker="Architecture" title="Phase 1 timeline" desc="The Phase 1 architecture, rebuilt as an ordered build plan with concrete action points per step." />

          <div className="mt-6 relative">
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-neutral-200" aria-hidden="true" />
            <div className="space-y-3">
              {timeline.map((step) => {
                const s = statusStyles[step.status]
                return (
                  <div key={step.n} className="relative pl-14">
                    <span className={`absolute left-0 top-3 w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold ${s.ring}`}>
                      {step.status === 'delivered' ? <Check size={18} /> : step.n}
                    </span>
                    <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-card">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <h3 className="font-bold text-base leading-tight">{step.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">{step.tag}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${s.chip}`}>{s.label}</span>
                        </div>
                      </div>
                      <p className="mt-1 text-sm font-medium text-neutral-600">{step.summary}</p>
                      <ul className="mt-3 grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
                        {step.points.map((p, i) => (
                          <li key={i} className="flex gap-2 text-[13px] text-neutral-700 font-medium">
                            <Check size={15} className="text-brand shrink-0 mt-0.5" /> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ============ DESIGN SYSTEM ============ */}
        <section className="mt-14">
          <SectionTitle icon={Palette} kicker="Design choices" title="Design system" desc="The visual language every screen is built from." />

          {/* Colors */}
          <div className="mt-6 bg-white rounded-2xl border border-neutral-200 p-5 shadow-card">
            <h3 className="font-bold text-base flex items-center gap-2"><Palette size={16} className="text-brand-dark" /> Colours</h3>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
              {colors.map((c) => (
                <div key={c.hex}>
                  <div className="h-16 rounded-xl border border-neutral-200" style={{ background: c.hex }} />
                  <p className="mt-1.5 text-[12px] font-bold leading-tight">{c.name}</p>
                  <p className="text-[11px] font-semibold text-neutral-500 tabular-nums">{c.hex}</p>
                  <p className="text-[10px] font-medium text-neutral-400 leading-tight mt-0.5">{c.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="mt-3 bg-white rounded-2xl border border-neutral-200 p-5 shadow-card">
            <h3 className="font-bold text-base flex items-center gap-2"><TypeIcon size={16} className="text-brand-dark" /> Typography</h3>
            <p className="mt-1 text-[12px] font-medium text-neutral-500">Typeface: Baloo 2 across the whole product.</p>
            <div className="mt-4 divide-y divide-neutral-100">
              {typeSamples.map((t) => (
                <div key={t.label} className="py-3 flex items-baseline justify-between gap-4">
                  <span className={t.cls}>{t.label}</span>
                  <span className="text-[11px] font-medium text-neutral-400 text-right shrink-0">{t.note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons + chips */}
          <div className="mt-3 bg-white rounded-2xl border border-neutral-200 p-5 shadow-card">
            <h3 className="font-bold text-base flex items-center gap-2"><MousePointerClick size={16} className="text-brand-dark" /> Buttons & tags</h3>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button className="h-11 px-5 rounded-full bg-brand text-white font-bold text-sm">Primary</button>
              <button className="h-11 px-5 rounded-full bg-brand-light text-brand-dark font-bold text-sm">Secondary</button>
              <button className="h-11 px-5 rounded-full border border-neutral-200 text-ink font-bold text-sm bg-white">Ghost</button>
              <button className="h-11 px-5 rounded-full bg-brand text-white font-bold text-sm opacity-60" disabled>Disabled</button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide bg-brand-light text-brand-dark px-3 py-1 rounded-full">Phase 1</span>
              <span className="text-[11px] font-semibold text-neutral-500 bg-page px-2.5 py-0.5 rounded-full">1 sprint</span>
              <span className="text-[10px] font-bold uppercase tracking-wide bg-brand text-white px-2 py-0.5 rounded-full inline-flex items-center gap-1"><Check size={11} /> Signed</span>
            </div>
          </div>

          {/* Cards, inputs, popups */}
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-card">
              <h3 className="font-bold text-base flex items-center gap-2"><LayoutGrid size={16} className="text-brand-dark" /> Cards & inputs</h3>
              <div className="mt-4 rounded-2xl bg-white border border-neutral-200 p-4 shadow-card">
                <span className="w-9 h-9 rounded-xl bg-brand-light text-brand-dark flex items-center justify-center"><LayoutGrid size={18} /></span>
                <p className="mt-3 text-sm font-bold">Card title</p>
                <p className="text-[11px] font-medium text-neutral-500">Rounded 2xl, soft shadow, green on hover.</p>
              </div>
              <input
                readOnly
                placeholder="Input field"
                className="mt-3 w-full h-11 px-4 rounded-2xl border border-neutral-200 outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 text-sm font-medium"
              />
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-card">
              <h3 className="font-bold text-base flex items-center gap-2"><MousePointerClick size={16} className="text-brand-dark" /> Pop-ups & dialogs</h3>
              <div className="mt-4 rounded-2xl border border-neutral-200 bg-page/60 p-3">
                <div className="rounded-xl bg-white border border-neutral-200 shadow-lg p-4">
                  <p className="text-sm font-bold">Confirm action</p>
                  <p className="mt-1 text-[12px] font-medium text-neutral-500">Short, plain-language body text that explains what happens next.</p>
                  <div className="mt-4 flex justify-end gap-2">
                    <button className="h-9 px-4 rounded-full border border-neutral-200 text-ink font-bold text-xs bg-white">Cancel</button>
                    <button className="h-9 px-4 rounded-full bg-brand text-white font-bold text-xs">Confirm</button>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-[11px] font-medium text-neutral-400">Centered card, dimmed backdrop, primary action on the right.</p>
            </div>
          </div>
        </section>

        {/* ============ REQUIREMENTS ============ */}
        <section className="mt-14">
          <SectionTitle icon={ListChecks} kicker="Scope" title={`Requirements (${reqCount})`} desc="Broken down into small, testable items grouped by module. Each has an ID for tracking." />

          <div className="mt-6 space-y-3">
            {requirements.map((g) => (
              <div key={g.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-card">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-brand text-white text-xs font-extrabold flex items-center justify-center">{g.id}</span>
                  <h3 className="font-bold text-base leading-tight">{g.title}</h3>
                  <span className="ml-auto text-[11px] font-semibold text-neutral-400">{g.items.length} items</span>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {g.items.map(([id, text]) => (
                    <li key={id} className="flex gap-2.5 text-[13px] text-neutral-700 font-medium items-start">
                      <span className="text-[11px] font-bold text-brand-dark tabular-nums bg-brand-light rounded px-1.5 py-0.5 shrink-0 mt-px">{id}</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-10 text-xs text-neutral-400 font-medium leading-relaxed">
          This is the living source of truth for Phase 1. It follows the architecture and rollout plan in the commercial offer. Phase 2 is out of scope here and is planned separately.
        </p>
      </div>
    </div>
  )
}
