import { Link } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import Logo from '../components/Logo.jsx'

const euro = (n) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

const items = [
  {
    title: 'Architecture & rollout plan',
    sprints: 1,
    price: 4500,
    req: [
      'Analysis of the current WordPress + WooCommerce setup',
      'Target architecture for Phase 1 and Phase 2',
      'Phased rollout plan and integration decisions',
    ],
  },
  {
    title: 'Clickable prototype — Referee webapp',
    sprints: 1,
    price: 5500,
    req: [
      'Mobile-first screens: tournaments, detail, documents, profile, chats',
      'Referee Abroad branding and interactions',
      'Clickable flows on a hosted preview link',
    ],
  },
  {
    title: 'Clickable prototype — Tournament Command Centre',
    sprints: 1,
    price: 5500,
    req: [
      'Admin dashboard shell with left navigation',
      'Sections: tournaments, referees, staff, communication, P&L, analytics',
      'Example data and clickable actions',
    ],
  },
  {
    title: 'Referee webapp — production build',
    sprints: 3,
    price: 19500,
    req: [
      'Login via existing WordPress accounts',
      'Tournaments & enrolment data from WooCommerce',
      'Apply & pay through the existing checkout',
      'In-app messages + push notifications, profile editing',
    ],
  },
  {
    title: 'Tournament Command Centre — production build',
    sprints: 3,
    price: 19500,
    req: [
      'Manage tournaments, enrolments, referees and staff',
      'Broadcast messages to tournament groups + support tickets',
      'P&L and analytics overview',
      'Two-way sync with WordPress (source of truth in Phase 1)',
    ],
  },
  {
    title: 'Integration, testing & launch',
    sprints: 1,
    price: 5500,
    req: [
      'WordPress / WooCommerce API and webhooks',
      'QA across devices and browsers',
      'Deployment, documentation and handover',
    ],
  },
]

export default function Offer() {
  const subtotal = items.reduce((a, b) => a + b.price, 0)
  const vat = Math.round(subtotal * 0.21)
  const total = subtotal + vat
  const sprints = items.reduce((a, b) => a + b.sprints, 0)
  const friendly = 5000
  const friendlyIncl = Math.round(friendly * 1.21)

  return (
    <div className="min-h-screen bg-page text-ink font-sans">
      <div className="max-w-3xl mx-auto px-5 py-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-brand-dark font-semibold text-sm mb-8">
          <ArrowLeft size={17} /> Back to hub
        </Link>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Logo size={40} showText textClass="text-lg" />
          <span className="text-xs font-bold uppercase tracking-wide bg-brand-light text-brand-dark px-3 py-1 rounded-full">Phase 1</span>
        </div>

        <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold leading-tight">Commercial offer</h1>
        <p className="mt-2 text-neutral-500 font-medium max-w-xl">
          Indicative pricing per component for Phase 1 — building alongside the current platform. {sprints} sprints in total (± {sprints * 2} weeks).
        </p>

        <div className="mt-8 space-y-3">
          {items.map((it, i) => (
            <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold text-ink text-base leading-tight">{it.title}</h2>
                  <span className="inline-block mt-1.5 text-[11px] font-semibold text-neutral-500 bg-page px-2.5 py-0.5 rounded-full">
                    {it.sprints} {it.sprints === 1 ? 'sprint' : 'sprints'}
                  </span>
                </div>
                <span className="text-brand-dark font-extrabold text-lg whitespace-nowrap tabular-nums">{euro(it.price)}</span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {it.req.map((r, j) => (
                  <li key={j} className="flex gap-2 text-sm text-neutral-600 font-medium">
                    <Check size={16} className="text-brand shrink-0 mt-0.5" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-4 bg-white rounded-2xl border border-neutral-200 p-5 shadow-card tabular-nums">
          <div className="flex justify-between text-sm font-medium text-neutral-600 py-1">
            <span>Subtotal (excl. VAT)</span><span>{euro(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium text-neutral-600 py-1">
            <span>VAT (21%)</span><span>{euro(vat)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-neutral-400 border-t border-neutral-200 pt-3 mt-2">
            <span>Total (incl. VAT)</span>
            <span className="line-through decoration-[3px] decoration-red-500">{euro(total)}</span>
          </div>
          <div className="mt-4 rounded-xl bg-brand-light p-4 flex items-end justify-between">
            <div>
              <p className="text-sm font-bold text-brand-dark">Agreed friendly price</p>
              <p className="text-[11px] font-medium text-brand-dark/70">{euro(friendlyIncl)} incl. VAT</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold text-brand-dark leading-none">{euro(friendly)}</p>
              <p className="text-[11px] font-semibold text-brand-dark/70 mt-1">excl. VAT</p>
            </div>
          </div>
        </div>

        <p className="mt-5 text-xs text-neutral-400 font-medium leading-relaxed">
          Figures are indicative and for Phase 1 only. Excludes hosting and third-party fees (payment provider, push service).
          Phase 2 — the full Tournament Command Centre, an own database and a new website replacing WordPress — is scoped as a separate offer.
        </p>
      </div>
    </div>
  )
}
