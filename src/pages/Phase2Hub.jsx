import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Receipt, FileSignature, KanbanSquare } from 'lucide-react'
import Logo from '../components/Logo.jsx'

// Phase 2 workspace, same layout as the Phase 1 hub: the commercial offer and the
// agreement as wide rows on top, then the project blocks. Amber accent to match
// the Fase 2 card on the main hub.
const wide = 'group flex items-center gap-4 rounded-2xl bg-white border border-neutral-200 hover:bg-amber-500 hover:border-amber-500 p-4 shadow-card active:scale-[0.99] transition'
const wideIcon = 'w-11 h-11 rounded-xl bg-amber-100 text-amber-700 group-hover:bg-white/20 group-hover:text-white flex items-center justify-center transition'
const wideTitle = 'block text-sm sm:text-base font-bold leading-tight text-ink group-hover:text-white transition'
const wideSub = 'block text-[11px] font-medium text-neutral-500 group-hover:text-white/80 transition'
const wideCta = 'inline-flex items-center gap-1 text-xs font-semibold text-amber-600 group-hover:text-white transition'

const cards = [
  { to: '/phase2/sprint-board', icon: KanbanSquare, title: 'Backlog board', sub: 'Wishes and requirements for Phase 2' },
]

export default function Phase2Hub() {
  return (
    <div
      className="min-h-screen text-ink font-sans flex flex-col items-center justify-center px-5 py-12"
      style={{
        backgroundImage: 'linear-gradient(rgba(244,245,244,0.45), rgba(244,245,244,0.45)), url(img/hub-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full max-w-3xl pb-[10vh]">
        <Link to="/" className="inline-flex items-center gap-1.5 text-amber-600 font-semibold text-sm mb-8">
          <ArrowLeft size={17} /> Back to hub
        </Link>

        <div className="flex flex-col items-center text-center">
          <Logo size={64} showText textClass="text-2xl" />
          <span className="mt-4 text-xs font-bold uppercase tracking-wide bg-amber-500 text-white px-3 py-1 rounded-full">Fase 2 · backlog</span>
          <p className="mt-3 text-sm font-medium text-neutral-600 max-w-md">
            The planning space for Phase 2: an own backend and database off WordPress, a new website with Stripe and a smarter appointing engine.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <Link to="/phase2/offer" className={wide}>
            <span className={wideIcon}><Receipt size={20} /></span>
            <span className="flex-1 min-w-0">
              <span className={wideTitle}>Commercial offer</span>
              <span className={wideSub}>Phase 2 scope and effort</span>
            </span>
            <span className={wideCta}>View <ArrowRight size={14} /></span>
          </Link>
          <Link to="/phase2/contract" className={wide}>
            <span className={wideIcon}><FileSignature size={20} /></span>
            <span className="flex-1 min-w-0">
              <span className={wideTitle}>Agreement fase 2</span>
              <span className={wideSub}>The rules we play by</span>
            </span>
            <span className={wideCta}>View <ArrowRight size={14} /></span>
          </Link>
        </div>

        <p className="mt-8 mb-2 text-[11px] font-bold uppercase tracking-wide text-neutral-400">Project workspace</p>
        <div className="grid grid-cols-2 gap-3 items-stretch">
          {cards.map((c) => {
            const Icon = c.icon
            return (
              <Link key={c.to} to={c.to} className="group flex flex-col rounded-2xl bg-white border border-neutral-200 hover:bg-amber-500 hover:border-amber-500 p-5 min-h-[180px] shadow-card active:scale-[0.98] transition">
                <span className={wideIcon}><Icon size={22} /></span>
                <h2 className="mt-auto text-base font-bold leading-tight text-ink group-hover:text-white transition">{c.title}</h2>
                <p className="mt-0.5 text-[11px] font-medium text-neutral-500 group-hover:text-white/80 transition">{c.sub}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 group-hover:text-white transition">
                  Open <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
