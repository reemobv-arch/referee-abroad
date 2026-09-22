import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, ArrowRight, Check, Clock } from 'lucide-react'

const appliedChip = {
  confirmed: { label: "You're in", cls: 'bg-brand text-white', Icon: Check },
  approved: { label: "You're in", cls: 'bg-brand text-white', Icon: Check },
  applied: { label: 'Applied', cls: 'bg-amber-500 text-white', Icon: Clock },
  paid: { label: 'Applied', cls: 'bg-amber-500 text-white', Icon: Clock },
  pending: { label: 'Applied', cls: 'bg-amber-500 text-white', Icon: Clock },
}

export default function TournamentCard({ t }) {
  const nav = useNavigate()
  const chip = t.applied ? (appliedChip[t.status] || appliedChip.applied) : null
  const ChipIcon = chip && chip.Icon
  return (
    <button
      onClick={() => nav(`/tournament/${t.id}`)}
      className="block w-full text-left bg-white rounded-3xl overflow-hidden shadow-card active:scale-[0.99] transition-transform"
    >
      <div className="relative h-44">
        <img src={t.img} alt={t.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        <span className="absolute top-3 left-3 bg-white/95 text-brand-dark text-[11px] font-bold px-3 py-1 rounded-full">{t.age}</span>
        {chip
          ? <span className={`absolute top-3 right-3 ${chip.cls} text-[11px] font-bold px-3 py-1 rounded-full inline-flex items-center gap-1`}><ChipIcon size={12} /> {chip.label}</span>
          : t.spotsLeft != null && <span className="absolute top-3 right-3 bg-black/55 text-white text-[11px] font-bold px-3 py-1 rounded-full">{t.spotsLeft} spots left</span>}
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <h3 className="text-xl font-extrabold leading-tight drop-shadow-sm">{t.name}</h3>
          <p className="mt-0.5 text-[13px] font-semibold text-white/90 flex items-center gap-1.5"><MapPin size={14} /> {t.city}, {t.country}</p>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3.5">
        <span className="text-[13px] font-semibold text-neutral-500 flex items-center gap-1.5"><Calendar size={15} /> {t.dates}</span>
        {t.applied
          ? <span className="text-brand-dark text-sm font-extrabold">View details</span>
          : <span className="inline-flex items-center gap-1.5 bg-brand text-white text-[13px] font-bold px-4 py-2 rounded-full">€{t.price} · Apply <ArrowRight size={14} /></span>}
      </div>
    </button>
  )
}
