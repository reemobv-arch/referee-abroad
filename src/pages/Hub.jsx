import { Link } from 'react-router-dom'
import { Route, Smartphone, LayoutDashboard, Receipt, ArrowRight, ArrowUpRight } from 'lucide-react'
import Logo from '../components/Logo.jsx'

export default function Hub() {
  return (
    <div className="min-h-screen bg-page text-ink font-sans flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-3xl pb-[12vh]">
        <div className="flex justify-center">
          <Logo size={80} showText textClass="text-3xl" />
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 items-stretch">
          <a
            href="/architecture.html"
            className="group flex flex-col rounded-2xl bg-white border border-neutral-200 p-4 min-h-[160px] shadow-card active:scale-[0.98] transition-transform"
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
            className="group flex flex-col rounded-2xl bg-brand text-white p-4 min-h-[160px] shadow-card active:scale-[0.98] transition-transform"
          >
            <span className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Smartphone size={20} />
            </span>
            <h2 className="mt-auto text-sm sm:text-base font-bold leading-tight">Referee webapp</h2>
            <p className="mt-0.5 text-[11px] font-medium text-white/80">Clickable prototype</p>
            <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold">
              Open <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          <Link
            to="/dashboard"
            className="group flex flex-col rounded-2xl bg-white border border-neutral-200 p-4 min-h-[160px] shadow-card active:scale-[0.98] transition-transform"
          >
            <span className="w-10 h-10 rounded-xl bg-brand-light text-brand-dark flex items-center justify-center">
              <LayoutDashboard size={20} />
            </span>
            <h2 className="mt-auto text-sm sm:text-base font-bold leading-tight">Dashboard</h2>
            <p className="mt-0.5 text-[11px] font-medium text-neutral-500">Clickable prototype</p>
            <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-brand-dark">
              Open <ArrowRight size={14} />
            </span>
          </Link>

          <Link
            to="/offer"
            className="group flex flex-col rounded-2xl bg-white border border-neutral-200 p-4 min-h-[160px] shadow-card active:scale-[0.98] transition-transform"
          >
            <span className="w-10 h-10 rounded-xl bg-brand-light text-brand-dark flex items-center justify-center">
              <Receipt size={20} />
            </span>
            <h2 className="mt-auto text-sm sm:text-base font-bold leading-tight">Commercial offer</h2>
            <p className="mt-0.5 text-[11px] font-medium text-neutral-500">Phase 1 pricing</p>
            <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-brand-dark">
              View <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
