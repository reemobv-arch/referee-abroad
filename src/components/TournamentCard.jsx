import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, BedDouble, ArrowRight } from 'lucide-react'
import { StatusBadge } from './ui.jsx'

export default function TournamentCard({ t }) {
  const nav = useNavigate()
  return (
    <button
      onClick={() => nav(`/tournament/${t.id}`)}
      className="block w-full text-left bg-white rounded-2xl overflow-hidden shadow-card active:scale-[0.99] transition-transform"
    >
      <div className="relative">
        <img src={t.img} alt={t.name} className="w-full h-28 object-cover" />
        <span className="absolute top-2.5 left-2.5 bg-white text-brand-dark text-[10px] font-semibold px-2.5 py-1 rounded-full">
          {t.age}
        </span>
        {t.spotsLeft != null && (
          <span className="absolute top-2.5 right-2.5 bg-black/55 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
            {t.spotsLeft} spots left
          </span>
        )}
      </div>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-bold text-ink leading-tight">{t.name}</h3>
          {t.applied && <StatusBadge status={t.status} />}
        </div>
        <div className="mt-1 text-xs font-medium text-neutral-500 flex items-center gap-1.5">
          <MapPin size={14} /> {t.city}, {t.country}
        </div>
        <div className="mt-0.5 text-xs font-medium text-neutral-500 flex items-center gap-1.5">
          <Calendar size={14} /> {t.dates}
          <BedDouble size={14} className="ml-1" /> {t.lodging}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-brand text-xl font-bold">€{t.price}</span>
          <span className="inline-flex items-center gap-1.5 bg-brand text-white text-xs font-semibold px-4 py-2 rounded-full">
            {t.applied ? 'View details' : 'APPLY NOW'} <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </button>
  )
}
