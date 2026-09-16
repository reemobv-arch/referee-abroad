import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Database, KanbanSquare, Activity, PackageCheck } from 'lucide-react'
import Logo from '../components/Logo.jsx'

const activeCard =
  'group flex flex-col rounded-2xl bg-white border border-neutral-200 hover:bg-brand hover:border-brand p-5 min-h-[180px] shadow-card active:scale-[0.98] transition'
const soonCard =
  'flex flex-col rounded-2xl bg-white/70 border border-dashed border-neutral-300 p-5 min-h-[180px] cursor-default select-none'

const iconActive =
  'w-11 h-11 rounded-xl bg-brand-light text-brand-dark group-hover:bg-white/20 group-hover:text-white flex items-center justify-center transition'
const iconSoon = 'w-11 h-11 rounded-xl bg-neutral-100 text-neutral-400 flex items-center justify-center'

export default function Phase1Hub() {
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
        <Link to="/" className="inline-flex items-center gap-1.5 text-brand-dark font-semibold text-sm mb-8">
          <ArrowLeft size={17} /> Back to hub
        </Link>

        <div className="flex flex-col items-center text-center">
          <Logo size={64} showText textClass="text-2xl" />
          <span className="mt-4 text-xs font-bold uppercase tracking-wide bg-brand text-white px-3 py-1 rounded-full">Fase 1 · build workspace</span>
          <p className="mt-3 text-sm font-medium text-neutral-600 max-w-md">
            The working space for building Phase 1. Everything the team needs to align, build and hand over.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 items-stretch">
          <Link to="/phase1/source-of-truth" className={activeCard}>
            <span className={iconActive}><Database size={22} /></span>
            <h2 className="mt-auto text-base font-bold leading-tight text-ink group-hover:text-white transition">Source of truths</h2>
            <p className="mt-0.5 text-[11px] font-medium text-neutral-500 group-hover:text-white/80 transition">Architecture timeline, design system and requirements</p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-dark group-hover:text-white transition">
              Open <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          <div className={soonCard}>
            <span className={iconSoon}><KanbanSquare size={22} /></span>
            <h2 className="mt-auto text-base font-bold leading-tight text-neutral-400">Sprint board</h2>
            <p className="mt-0.5 text-[11px] font-medium text-neutral-400">Track work per sprint</p>
            <span className="mt-2 text-[10px] font-bold uppercase tracking-wide text-neutral-400">Coming soon</span>
          </div>

          <div className={soonCard}>
            <span className={iconSoon}><Activity size={22} /></span>
            <h2 className="mt-auto text-base font-bold leading-tight text-neutral-400">Progress log</h2>
            <p className="mt-0.5 text-[11px] font-medium text-neutral-400">What shipped and when</p>
            <span className="mt-2 text-[10px] font-bold uppercase tracking-wide text-neutral-400">Coming soon</span>
          </div>

          <div className={soonCard}>
            <span className={iconSoon}><PackageCheck size={22} /></span>
            <h2 className="mt-auto text-base font-bold leading-tight text-neutral-400">Handover</h2>
            <p className="mt-0.5 text-[11px] font-medium text-neutral-400">Docs, access and go-live</p>
            <span className="mt-2 text-[10px] font-bold uppercase tracking-wide text-neutral-400">Coming soon</span>
          </div>
        </div>
      </div>
    </div>
  )
}
