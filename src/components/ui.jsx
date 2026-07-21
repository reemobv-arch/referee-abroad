import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export function StatusBadge({ status }) {
  const map = {
    approved: { label: 'Approved', cls: 'bg-brand-light text-brand-dark' },
    pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700' },
    open: { label: 'Open', cls: 'bg-brand-light text-brand-dark' },
    completed: { label: 'Completed', cls: 'bg-neutral-100 text-neutral-500' },
  }
  const s = map[status] || map.open
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${s.cls}`}>
      {s.label}
    </span>
  )
}

export function Pill({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-brand-light text-brand-dark ${className}`}>
      {children}
    </span>
  )
}

export function TopBar({ title, back = false, right = null }) {
  const nav = useNavigate()
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-neutral-200">
      <div className="h-14 flex items-center justify-center relative px-4">
        {back && (
          <button
            onClick={() => nav(-1)}
            aria-label="Back"
            className="absolute left-3 p-1 text-ink active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <h1 className="text-[17px] font-semibold text-ink">{title}</h1>
        {right && <div className="absolute right-3">{right}</div>}
      </div>
    </header>
  )
}

export function SectionHeader({ title, action, onAction }) {
  return (
    <div className="flex items-center justify-between mt-1 mb-2">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      {action && (
        <button onClick={onAction} className="text-brand text-sm font-semibold">
          {action}
        </button>
      )}
    </div>
  )
}
