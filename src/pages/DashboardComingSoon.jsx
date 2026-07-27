import { Link } from 'react-router-dom'
import { ArrowLeft, LayoutDashboard } from 'lucide-react'

export default function DashboardComingSoon() {
  return (
    <div className="min-h-screen bg-page text-ink font-sans">
      <div className="max-w-2xl mx-auto px-5 py-12 w-full">
        <Link to="/" className="inline-flex items-center gap-1.5 text-brand-dark font-semibold">
          <ArrowLeft size={18} /> Back
        </Link>
        <div className="mt-10 rounded-3xl bg-white border border-neutral-200 p-8 sm:p-10 text-center shadow-card">
          <span className="mx-auto w-16 h-16 rounded-2xl bg-brand-light text-brand-dark flex items-center justify-center">
            <LayoutDashboard size={30} />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold">Tournament Command Centre</h1>
          <p className="mt-2 text-neutral-500 font-medium leading-relaxed">
            The admin dashboard prototype is next on the list. We&apos;ll design and build this together.
          </p>
          <span className="mt-6 inline-block text-xs font-bold uppercase tracking-wide bg-neutral-100 text-neutral-500 px-3 py-1.5 rounded-full">
            Coming soon
          </span>
        </div>
      </div>
    </div>
  )
}
