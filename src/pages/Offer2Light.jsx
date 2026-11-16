import { Link } from 'react-router-dom'
import { ArrowLeft, Check, X } from 'lucide-react'
import Logo from '../components/Logo.jsx'

// Phase 2 "light" commercial offer. The trimmed scope that fits a tighter budget:
// an own backend and Stripe, but WITHOUT the data migration, the new website, the
// extra features or the smart appointing engine. Same sprint rate as the full
// Phase 2 offer so the two are directly comparable.
const RATE = 4000      // euro per sprint (two weeks at 50/hour), excl. VAT

const euro = (n) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

const steps = [
  {
    title: 'Own backend, database & API (lean)',
    time: '1-1.5 sprints', min: 1, max: 1.5,
    body: 'Stand up an own backend with a database and APIs, separate from WordPress, as the new source of truth for the app and dashboard. Lean: built for new data going forward, not a full historic migration.',
    features: [
      'Database schema for tournaments, referees, enrolments and appointments',
      'REST API with authentication and roles',
      'App and dashboard read and write through the new API',
      'New data (sign-ups, payments) flows into the new backend from go-live',
    ],
  },
  {
    title: 'Referee accounts imported & decoupled from WordPress',
    time: '0.5 sprint', min: 0.5, max: 0.5,
    body: 'A one-time import of the existing referee accounts so nobody has to re-register, and the app and dashboard are switched off the WordPress/WooCommerce data layer. The old WordPress stays available read-only as an archive.',
    features: [
      'One-time import of the existing referee accounts',
      'App and dashboard no longer depend on WordPress/WooCommerce for data',
      'Removes the SiteGround anti-bot and service-account dependency',
      'Old WordPress kept read-only as a historic archive',
    ],
  },
  {
    title: 'Stripe integration & backend coupling',
    time: '0.5 sprint', min: 0.5, max: 0.5,
    body: 'The real work in this step is not the web pages, it is the payment plumbing behind the buy button. We replace the WooCommerce checkout with Stripe and wire every payment into the new backend, reusing the existing site so no new website is built.',
    features: [
      'Stripe checkout and webhooks (paid, failed, refunded)',
      'Each payment creates the order in the new backend, not WooCommerce',
      'Buy button on the existing pages points at the new Stripe flow',
      'Payment confirmation and receipt handling',
      'Controlled go-live, client-assisted payment testing',
    ],
  },
]

const notIncluded = [
  'Historic data migration (past orders, past tournaments, revenue history)',
  'A new website (the current WordPress site stays as the public site)',
  'The extra Phase 2 feature list',
  'The smart constraint-aware appointing engine',
  'Full analytics on past data: reporting starts fresh from go-live',
]

export default function Offer2Light() {
  const sprintMin = steps.reduce((a, s) => a + s.min, 0)
  const sprintMax = steps.reduce((a, s) => a + s.max, 0)
  const totalMin = sprintMin * RATE
  const totalMax = sprintMax * RATE
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
          <span className="text-xs font-bold uppercase tracking-wide bg-amber-100 text-amber-700 px-3 py-1 rounded-full">Phase 2 · light</span>
        </div>

        <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold leading-tight">Commercial offer · light</h1>
        <p className="mt-2 text-neutral-500 font-medium max-w-xl">
          A trimmed Phase 2 that fits a tighter budget: an own backend and Stripe, off the WordPress data layer, while keeping the current website. Without the historic migration, new website, extra features or smart appointing.
        </p>
        <p className="mt-3 text-sm font-medium text-neutral-600">
          Prepared by{' '}
          <a href="https://reemo.nl" target="_blank" rel="noreferrer" className="font-bold text-brand-dark underline">Reemo</a>
          , software studio · reemo.nl
        </p>

        <div className="mt-5 rounded-2xl bg-amber-100 border border-amber-200 p-4">
          <p className="text-sm font-bold text-amber-800">A sprint is two weeks of work at {euro(RATE)} excl. VAT</p>
          <p className="text-[12px] font-medium text-amber-700 mt-0.5">Based on €50 per hour.</p>
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

        <div className="mt-4 bg-white rounded-2xl border border-neutral-200 p-5 shadow-card">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-bold text-ink text-base leading-tight">Total estimate</h2>
              <p className="text-[12px] font-medium text-neutral-500 mt-1">{sprintMin} to {sprintMax} sprints, at {euro(RATE)} per sprint</p>
            </div>
            <div className="text-right tabular-nums whitespace-nowrap">
              <p className="text-2xl font-extrabold text-amber-700 leading-none">{euro(totalMin)} to {euro(totalMax)}</p>
              <p className="text-[11px] font-semibold text-neutral-400 mt-1">excl. VAT</p>
              <p className="text-[11px] font-medium text-neutral-400 mt-0.5">{euro(Math.round(totalMin * 1.21))} to {euro(Math.round(totalMax * 1.21))} incl. VAT</p>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-white rounded-2xl border border-neutral-200 p-5 shadow-card">
          <h2 className="font-bold text-ink text-base leading-tight">Not in this light version</h2>
          <ul className="mt-3 space-y-1.5">
            {notIncluded.map((f, j) => (
              <li key={j} className="flex gap-2 text-sm text-neutral-500 font-medium">
                <X size={16} className="text-neutral-400 shrink-0 mt-0.5" /> {f}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] font-medium text-neutral-500">These move to a later phase. The full Phase 2 offer keeps them in scope.</p>
        </div>

        <p className="mt-5 text-xs text-neutral-400 font-medium leading-relaxed">
          Indicative scope and effort for a light Phase 2. The public website stays on WordPress; only the data layer moves to the new backend. Excludes hosting and third party fees (payment provider, database, email).
        </p>
      </div>
    </div>
  )
}
