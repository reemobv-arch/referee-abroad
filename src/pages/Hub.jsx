import { Link } from 'react-router-dom'
import { Smartphone, Route, LayoutDashboard, ArrowRight, ArrowUpRight } from 'lucide-react'
import Logo from '../components/Logo.jsx'

export default function Hub() {
  return (
    <div className="min-h-screen bg-page text-ink font-sans flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-4xl">
        <div className="flex justify-center">
          <Logo size={44} showText textClass="text-xl" />
        </div>

        <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-4 items-stretch">
          <Link
            to="/login"
            className="group flex flex-col rounded-3xl bg-brand text-white p-5 sm:p-6 min-h-[190px] shadow-card active:scale-[0.98] transition-transform"
          >
            <span className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
              <Smartphone size={22} />
            </span>
            <h2 className="mt-auto text-base sm:text-lg font-bold leading-tight">Referee webapp</h2>
            <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold">
              Open <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          <a
            href="/architecture.html"
            className="group flex flex-col rounded-3xl bg-white border border-neutral-200 p-5 sm:p-6 min-h-[190px] shadow-card active:scale-[0.98] transition-transform"
          >
            <span className="w-11 h-11 rounded-2xl bg-brand-light text-brand-dark flex items-center justify-center">
              <Route size={22} />
            </span>
            <h2 className="mt-auto text-base sm:text-lg font-bold leading-tight">Architecture</h2>
            <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-dark">
              View <ArrowUpRight size={16} />
            </span>
          </a>

          <Link
            to="/dashboard"
            className="group relative flex flex-col rounded-3xl bg-white border border-neutral-200 p-5 sm:p-6 min-h-[190px] shadow-card active:scale-[0.98] transition-transform"
          >
            <span className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-wide bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
              Soon
            </span>
            <span className="w-11 h-11 rounded-2xl bg-brand-light text-brand-dark flex items-center justify-center">
              <LayoutDashboard size={22} />
            </span>
            <h2 className="mt-auto text-base sm:text-lg font-bold leading-tight">Command Centre</h2>
            <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-400">
              Preview <ArrowRight size={16} />
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
