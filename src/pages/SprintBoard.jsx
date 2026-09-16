import { Link } from 'react-router-dom'
import { ArrowLeft, KanbanSquare } from 'lucide-react'
import Logo from '../components/Logo.jsx'

/* Work items mapped to the Phase 1 timeline, grouped by board status. */
const board = [
  {
    key: 'done', title: 'Done', dot: 'bg-brand', headChip: 'bg-brand-light text-brand-dark',
    cards: [
      { title: 'Architecture & rollout plan', sprint: 'Sprint 1', accent: '#2F7D33', note: 'Analysis, target architecture, rollout plan' },
      { title: 'Clickable prototypes', sprint: 'Sprint 1', accent: '#2F7D33', note: 'Referee webapp + Command Centre previews' },
    ],
  },
  {
    key: 'doing', title: 'In progress', dot: 'bg-brand-dark', headChip: 'bg-brand-dark text-white',
    cards: [
      { title: 'Discovery & access', sprint: 'Kickoff', accent: '#44A546', note: 'WordPress, staging, API keys, LLM key, mailboxes' },
    ],
  },
  {
    key: 'todo', title: 'To do', dot: 'bg-neutral-300', headChip: 'bg-neutral-100 text-neutral-500',
    cards: [
      { title: 'WordPress & WooCommerce integration', sprint: 'Sprint 2', accent: '#9aa39b', note: 'Read/write, orders, webhooks, two-way sync' },
      { title: 'Referee webapp, production build', sprint: 'Sprints 2 to 4', accent: '#9aa39b', note: 'Login, apply & pay, messages, push, profile' },
      { title: 'Tournament Command Centre, production build', sprint: 'Sprints 3 to 5', accent: '#9aa39b', note: 'Manage, broadcast, tickets, P&L, analytics' },
      { title: 'Referee appointing system', sprint: 'Sprint 5', accent: '#9aa39b', note: 'Matches, appoint, conflicts, push' },
      { title: 'AI communication assistant', sprint: 'Sprints 5 to 6', accent: '#9aa39b', note: 'Chatbot + smart inbox, triage, drafts' },
      { title: 'Integration, testing & launch', sprint: 'Sprint 6', accent: '#9aa39b', note: 'API + webhooks, QA, deploy, handover' },
      { title: 'Warranty & maintenance', sprint: 'Aftercare', accent: '#9aa39b', note: 'Two-week warranty, then monthly maintenance' },
    ],
  },
]

const totals = board.reduce((a, c) => ({ ...a, [c.key]: c.cards.length }), {})

export default function SprintBoard() {
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
      <div className="max-w-5xl mx-auto px-5 py-10">
        <Link to="/phase1" className="inline-flex items-center gap-1.5 text-brand-dark font-semibold text-sm mb-8">
          <ArrowLeft size={17} /> Back to Fase 1
        </Link>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Logo size={40} showText textClass="text-lg" />
          <span className="text-xs font-bold uppercase tracking-wide bg-brand-light text-brand-dark px-3 py-1 rounded-full">Sprint board</span>
        </div>

        <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold leading-tight flex items-center gap-3">
          <KanbanSquare size={30} className="text-brand-dark" /> Sprint board
        </h1>
        <p className="mt-2 text-neutral-600 font-medium max-w-2xl">
          The Phase 1 work at a glance. Cards move from To do to Done as sprints ship.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
          <span className="px-3 py-1 rounded-full bg-brand-light text-brand-dark">{totals.done} done</span>
          <span className="px-3 py-1 rounded-full bg-brand-dark text-white">{totals.doing} in progress</span>
          <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-500">{totals.todo} to do</span>
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-4 items-start">
          {board.map((col) => (
            <div key={col.key} className="bg-white/70 rounded-2xl border border-neutral-200 p-3">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                <h2 className="text-sm font-bold">{col.title}</h2>
                <span className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full ${col.headChip}`}>{col.cards.length}</span>
              </div>
              <div className="mt-1 space-y-2.5">
                {col.cards.map((c, i) => (
                  <div key={i} className="bg-white rounded-xl border border-neutral-200 shadow-card p-3.5 border-l-4" style={{ borderLeftColor: c.accent }}>
                    <p className="text-[13px] font-bold leading-snug">{c.title}</p>
                    <p className="mt-1 text-[11px] font-medium text-neutral-500 leading-snug">{c.note}</p>
                    <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-wide text-neutral-400">{c.sprint}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-neutral-400 font-medium leading-relaxed">
          Sprints are about two weeks each. The exact split is confirmed at kickoff and updated here as work ships.
        </p>
      </div>
    </div>
  )
}
