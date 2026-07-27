import { Link } from 'react-router-dom'
import { Route, Smartphone, LayoutDashboard, ArrowRight, ArrowUpRight } from 'lucide-react'
import Logo from '../components/Logo.jsx'

export default function Hub() {
  return (
    <div className="min-h-screen bg-page text-ink font-sans flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-3xl">
        <div className="flex justify-center">
          <Logo size={40} showText textClass="text-lg" />
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3 items-stretch">
          <a
            href="/architecture.html"
            className="group flex flex-col rounded-2xl bg-white border border-neutral-200 p-4 min-h-[150px] shadow-card active:scale-[0.98] transition-transform"
          >
            <span className="w-10 h-10 rounded-xl bg-brand-light text-brand-dark flex items-center justify-center">
              <Route size={20} />
            </span>
            <h2 className="mt-auto text-sm sm:text-base font-bold leading-tight">Architectural advice</h2>
            <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-brand-dark">
              View <ArrowUpRight size={14} />
            </span>
          </a>

          <Link
            to="/login"
            className="group flex flex-col rounded-2xl bg-brand text-white p-4 min-h-[150px] shadow-card active:scale-[0.98] transition-transform"
          >
            <span className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Smartphone size={20} />
            </span>
            <h2 className="mt-auto text-sm sm:text-base font-bold leading-tight">Referee webapp</h2>
            <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold">
              Open <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          <Link
            to="/dashboard"
            className="group relative flex flex-col rounded-2xl bg-white border border-neutral-200 p-4 min-h-[150px] shadow-card active:scale-[0.98] transition-transform"
          >
            <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wide bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
              Soon
            </span>
            <span className="w-10 h-10 rounded-xl bg-brand-light text-brand-dark flex items-center justify-center">
              <LayoutDashboard size={20} />
            </span>
            <h2 className="mt-auto text-sm sm:text-base font-bold leading-tight">Dashboard</h2>
            <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-neutral-400">
              Preview <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
