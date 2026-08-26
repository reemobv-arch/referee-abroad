import { Link } from 'react-router-dom'
import { Route, Smartphone, LayoutDashboard, Receipt, FileSignature, ArrowRight, ArrowUpRight } from 'lucide-react'
import Logo from '../components/Logo.jsx'

const cardCls =
  'group flex flex-col rounded-2xl bg-white border border-neutral-200 hover:bg-brand hover:border-brand p-4 min-h-[160px] shadow-card active:scale-[0.98] transition'
const iconCls =
  'w-10 h-10 rounded-xl bg-brand-light text-brand-dark group-hover:bg-white/20 group-hover:text-white flex items-center justify-center transition'
const titleCls = 'mt-auto text-sm sm:text-base font-bold leading-tight text-ink group-hover:text-white transition'
const subCls = 'mt-0.5 text-[11px] font-medium text-neutral-500 group-hover:text-white/80 transition'
const ctaCls = 'mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-brand-dark group-hover:text-white transition'

export default function Hub({ showOffer = true }) {
  return (
    <div
      className="min-h-screen text-ink font-sans flex flex-col items-center justify-center px-5 py-12"
      style={{
        backgroundImage: 'linear-gradient(rgba(244,245,244,0.45), rgba(244,245,244,0.45)), url(img/hub-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full max-w-3xl pb-[12vh]">
        <div className="flex justify-center">
          <Logo size={80} showText textClass="text-3xl" />
        </div>

        <div className={`mt-12 grid grid-cols-2 gap-3 items-stretch ${showOffer ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
          <a href="/architecture.html" className={cardCls}>
            <span className={iconCls}><Route size={20} /></span>
            <h2 className={titleCls}>Architectural advice</h2>
            <p className={subCls}>Rollout plan</p>
            <span className={ctaCls}>View <ArrowUpRight size={14} /></span>
          </a>

          <Link to="/login" className={cardCls}>
            <span className={iconCls}><Smartphone size={20} /></span>
            <h2 className={titleCls}>Referee webapp</h2>
            <p className={subCls}>Clickable prototype</p>
            <span className={ctaCls}>Open <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /></span>
          </Link>

          <Link to="/dashboard" className={cardCls}>
            <span className={iconCls}><LayoutDashboard size={20} /></span>
            <h2 className={titleCls}>Dashboard</h2>
            <p className={subCls}>Clickable prototype</p>
            <span className={ctaCls}>Open <ArrowRight size={14} /></span>
          </Link>

          {showOffer && (
            <Link to="/offer" className={cardCls}>
              <span className={iconCls}><Receipt size={20} /></span>
              <h2 className={titleCls}>Commercial offer</h2>
              <p className={subCls}>Phase 1 pricing</p>
              <span className={ctaCls}>View <ArrowRight size={14} /></span>
            </Link>
          )}

        </div>

        {showOffer && (
          <Link
            to="/contract"
            className="group mt-3 flex items-center gap-4 rounded-2xl bg-white border border-neutral-200 hover:bg-brand hover:border-brand p-4 shadow-card active:scale-[0.99] transition"
          >
            <span className={iconCls}><FileSignature size={20} /></span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm sm:text-base font-bold leading-tight text-ink group-hover:text-white transition">Agreement</span>
              <span className="block text-[11px] font-medium text-neutral-500 group-hover:text-white/80 transition">Draft</span>
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-dark group-hover:text-white transition">View <ArrowRight size={14} /></span>
          </Link>
        )}
      </div>
    </div>
  )
}
