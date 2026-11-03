import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Logo from '../components/Logo.jsx'

// Phase 2 commercial offer. Scope and effort only, no pricing yet (prices are
// shared separately). Content lives in the repo because there are no figures to
// keep out of it.
const steps = [
  {
    title: 'Architecture & technical design',
    time: '0.5 day',
    body: 'Set the technical direction together: backend stack and database, where Stripe fits, and how the migration runs. The result is a short technical plan the rest builds on.',
  },
  {
    title: 'New backend & API',
    time: '1-2 sprints',
    body: 'Stand up an own backend with a database and APIs, separate from WordPress. Data models for tournaments, referees, enrolments and appointments. This becomes the new source of truth instead of WordPress.',
  },
  {
    title: 'Data cleaning & migration prep',
    time: '1-2 sprints',
    body: 'Clean and reconcile the current WordPress and WooCommerce data (duplicate records, inconsistent fields, categories and ages) and map it to the new data model. This is the classic overrun, hence the range.',
  },
  {
    title: 'Data migration & WordPress decoupling',
    time: '1 sprint',
    body: 'Move the cleaned data into the new backend, decouple the app from WordPress and WooCommerce, and verify everything is correct: counts, relations and no loss.',
  },
  {
    title: 'New website, API integration & Stripe',
    time: '1 sprint',
    body: 'Connect the new website to the new API and take payments through Stripe instead of WooCommerce. Aligned with the ongoing website redesign to avoid duplicate work.',
  },
  {
    title: 'Extra Phase 2 features',
    time: '1 sprint',
    body: 'The agreed new features, captured as a fixed list or a set hour budget so the scope stays clear.',
  },
  {
    title: 'Extend the AI appointing algorithm',
    time: '1-2 sprints',
    body: 'The real constraint-aware appointing: per-category counts, nationality mixing, shifts per pitch, a daily cap per referee and referee-versus-team nation conflicts. Includes capturing team nationality and a planner that turns free text into hard rules.',
  },
  {
    title: 'Testing, optimisation & go-live',
    time: '0.5-1 sprint',
    body: 'End-to-end testing, performance, bug fixes and a controlled go-live with handover.',
  },
]

export default function Offer2() {
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

        <div className="mt-8 space-y-3">
          {steps.map((s, i) => (
            <div key={i} className="relative bg-white rounded-2xl border border-neutral-200 p-5 shadow-card">
              <span className="absolute top-5 right-5 text-[11px] font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full whitespace-nowrap">{s.time}</span>
              <div className="flex items-start gap-4">
                <span className="text-sm font-extrabold text-amber-600 tabular-nums w-7 shrink-0 pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                <div className="min-w-0">
                  <h2 className="font-bold text-ink text-base leading-tight pr-28">{s.title}</h2>
                  <p className="mt-2 text-sm text-neutral-600 font-medium leading-relaxed">{s.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-5 text-xs text-neutral-400 font-medium leading-relaxed">
          Indicative scope and effort for Phase 2. The variable posts are the data cleaning and the extra features, so those carry a range or an hour budget. Pricing is shared separately and excludes hosting and third party fees (payment provider, database, email).
        </p>
      </div>
    </div>
  )
}
