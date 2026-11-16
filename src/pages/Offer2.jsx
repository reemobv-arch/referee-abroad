import { Link } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import Logo from '../components/Logo.jsx'

// Phase 2 commercial offer. Scope and effort, with an indicative total derived
// from the per-step sprint estimates at the sprint rate, then an agreed price
// below that honest computed range (same treatment as the Phase 1 offer).
const RATE_MIN = 5500  // euro per sprint (two weeks), excl. VAT, low end
const RATE_MAX = 6000  // euro per sprint (two weeks), excl. VAT, high end
const AGREED_MIN = 26000 // agreed Phase 2 price, excl. VAT, low end
const AGREED_MAX = 40000 // agreed Phase 2 price, excl. VAT, high end

const euro = (n) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

const steps = [
  {
    title: 'New backend & API',
    time: '2-3 sprints', min: 2, max: 3,
    body: 'Stand up an own backend with a database and APIs, separate from WordPress. Data models for tournaments, referees, enrolments and appointments. This becomes the new source of truth instead of WordPress.',
    features: [
      'Database schema for tournaments, referees, enrolments and appointments',
      'REST API with authentication and roles',
      'Own source of truth replacing WordPress',
      'App and dashboard read and write through the new API',
    ],
  },
  {
    title: 'Data cleaning & migration prep',
    time: '1-2 sprints', min: 1, max: 2,
    body: 'Clean and reconcile the current WordPress and WooCommerce data (duplicate records, inconsistent fields, categories and ages) and map it to the new data model. This is the classic overrun, hence the range.',
    features: [
      'Audit of the current WordPress and WooCommerce data',
      'Deduplicate records and fix inconsistent fields',
      'Normalise categories, ages and nationalities',
      'Map every field to the new data model',
      'A dry run to validate the mapping before migrating',
    ],
  },
  {
    title: 'Data migration & WordPress decoupling',
    time: '2 sprints', min: 2, max: 2,
    body: 'Move the cleaned data into the new backend, decouple the app from WordPress and WooCommerce, and verify everything is correct: counts, relations and no loss.',
    features: [
      'Import the cleaned data into the new backend',
      'Switch the app and dashboard off WordPress and WooCommerce',
      'Verify counts, relations and no data loss',
      'A rollback path if anything is off',
    ],
  },
  {
    title: 'New website, API integration & Stripe',
    time: '1 sprint', min: 1, max: 1,
    body: 'Connect the new website to the new API and take payments through Stripe instead of WooCommerce. Aligned with the ongoing website redesign to avoid duplicate work.',
    features: [
      'New website running on the new API',
      'Stripe checkout replacing WooCommerce payments',
      'Orders and enrolments flow into the new backend',
      'Aligned with the ongoing website redesign',
    ],
  },
  {
    title: 'Extra Phase 2 features',
    time: '2 sprints', min: 2, max: 2,
    body: 'The agreed new features, captured as a fixed list or a set hour budget so the scope stays clear.',
    features: [
      'A fixed list of agreed new features, or a set hour budget',
      'Prioritised together before the sprint starts',
      'Built and tested within the budget',
      'Anything beyond the list is quoted separately',
    ],
  },
  {
    title: 'Extend the AI appointing algorithm',
    time: '1-2 sprints', min: 1, max: 2,
    body: 'The real constraint-aware appointing: per-category counts, nationality mixing, shifts per pitch, a daily cap per referee and referee-versus-team nation conflicts. Includes capturing team nationality and a planner that turns free text into hard rules.',
    features: [
      'Per-category referee counts and birth-date filtering',
      'Mix referee nationalities within a match',
      'Shift and pitch grouping to avoid travel between fields',
      'A maximum number of matches per referee per day',
      'Referee-versus-team nation conflict checks',
    ],
  },
  {
    title: 'Testing, optimisation & go-live',
    time: '1-1.5 sprints', min: 1, max: 1.5,
    body: 'End-to-end testing, performance, bug fixes and a controlled go-live with handover.',
    features: [
      'End-to-end tests across the main flows',
      'Performance and load tuning',
      'Bug fixes from the test round',
      'A controlled go-live with handover and documentation',
      'A short warranty window after launch',
    ],
  },
]

export default function Offer2() {
  const sprintMin = steps.reduce((a, s) => a + s.min, 0)
  const sprintMax = steps.reduce((a, s) => a + s.max, 0)
  const totalMin = sprintMin * RATE_MIN
  const totalMax = sprintMax * RATE_MAX
  return (
    <div
      className="min-h-screen text-ink font-sans"
      style={{
        backgroundImage: 'linear-gradient(rgba(244,245,244,0.58), rgba(244,245,244,0.60)), url(img/doc-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-3xl mx-auto px-5 py-10">
        <Link to="/phase2" className="inline-flex items-center gap-1.5 text-brand-dark font-semibold text-sm mb-8">
          <ArrowLeft size={17} /> Back to Fase 2
        </Link>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Logo size={40} showText textClass="text-lg" />
          <span className="text-xs font-bold uppercase tracking-wide bg-amber-100 text-amber-700 px-3 py-1 rounded-full">Phase 2</span>
        </div>

        <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold leading-tight">Commercial offer</h1>
        <p className="mt-2 text-neutral-500 font-medium max-w-xl">
          Scope and effort for Phase 2: moving Referee Abroad onto its own backend and database, off WordPress, with a new website, Stripe and a smarter appointing engine.
        </p>
        <p className="mt-3 text-sm font-medium text-neutral-600">
          Prepared by{' '}
          <a href="https://reemo.nl" target="_blank" rel="noreferrer" className="font-bold text-brand-dark underline">Reemo</a>
          , software studio · reemo.nl
        </p>

        <div className="mt-5 rounded-2xl bg-amber-100 border border-amber-200 p-4">
          <p className="text-sm font-bold text-amber-800">A sprint is two weeks of work at {euro(RATE_MIN)} to {euro(RATE_MAX)} excl. VAT</p>
        </div>

        <div className="mt-8 space-y-3">
          {steps.map((s, i) => (
            <div key={i} className="relative bg-white rounded-2xl border border-neutral-200 p-5 shadow-card">
              <span className="absolute top-5 right-5 text-[11px] font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full whitespace-nowrap">{s.time}</span>
              <div className="flex items-start gap-4">
                <span className="text-sm font-extrabold text-amber-600 tabular-nums w-7 shrink-0 pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                <div className="min-w-0">
                  <h2 className="font-bold text-ink text-base leading-tight pr-28">{s.title}</h2>
                  <p className="mt-2 text-sm text-neutral-600 font-medium leading-relaxed">{s.body}</p>
                  <ul className="mt-3 space-y-1.5">
                    {s.features.map((f, j) => (
                      <li key={j} className="flex gap-2 text-sm text-neutral-600 font-medium">
                        <Check size={16} className="text-amber-600 shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 bg-white rounded-2xl border border-neutral-200 p-5 shadow-card tabular-nums">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-bold text-ink text-base leading-tight">Total estimate</h2>
              <p className="text-[12px] font-medium text-neutral-500 mt-1">{sprintMin} to {sprintMax} sprints, at {euro(RATE_MIN)} to {euro(RATE_MAX)} per sprint</p>
            </div>
            <div className="text-right whitespace-nowrap">
              <p className="text-2xl font-extrabold text-neutral-400 leading-none line-through decoration-[3px] decoration-red-500">{euro(totalMin)} to {euro(totalMax)}</p>
              <p className="text-[11px] font-semibold text-neutral-400 mt-1">excl. VAT</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-amber-100 p-4 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-bold text-amber-800">Agreed Phase 2 price</p>
              <p className="text-[11px] font-medium text-amber-700">{euro(Math.round(AGREED_MIN * 1.21))} to {euro(Math.round(AGREED_MAX * 1.21))} incl. VAT</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold text-amber-800 leading-none">{euro(AGREED_MIN)} to {euro(AGREED_MAX)}</p>
              <p className="text-[11px] font-semibold text-amber-700 mt-1">excl. VAT</p>
            </div>
          </div>
        </div>

        <p className="mt-5 text-xs text-neutral-400 font-medium leading-relaxed">
          Indicative scope and effort for Phase 2. The variable posts are the data cleaning and the extra features, so the total is a range. Excludes hosting and third party fees (payment provider, database, email).
        </p>
      </div>
    </div>
  )
}
