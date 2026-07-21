import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, Clock, BedDouble, Plane, Users, MessageCircle, FileText, ChevronLeft, ArrowRight, Check } from 'lucide-react'
import { tournaments } from '../data.js'
import { Pill } from '../components/ui.jsx'

export default function TournamentDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [requested, setRequested] = useState(false)
  const t = tournaments.find((x) => x.id === id)
  if (!t) return <div className="p-6">Not found.</div>
  const showApplied = requested || t.applied

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-6">
      <div className="relative">
        <img src={t.img} alt={t.name} className="w-full h-56 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
        <button
          onClick={() => nav(-1)}
          aria-label="Back"
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center active:scale-95"
        >
          <ChevronLeft size={22} className="text-ink" />
        </button>
        <span className="absolute top-4 right-4 bg-white text-brand-dark text-[11px] font-semibold px-3 py-1 rounded-full">
          {t.age}
        </span>
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <h1 className="text-2xl font-extrabold leading-tight">{t.name}</h1>
          <div className="flex items-center gap-1.5 text-sm font-medium mt-1 text-white/90">
            <MapPin size={15} /> {t.city}, {t.country} · {t.dates}
          </div>
        </div>
      </div>

      <div className="px-4 -mt-1">
        <div className="flex flex-wrap gap-1.5 mt-3">
          <Pill>⚽ {t.sport}</Pill>
          <Pill>Referee</Pill>
          <Pill>Kit: Yellow</Pill>
        </div>

        {t.applied ? (
          <>
            <section className="mt-4 bg-white rounded-2xl overflow-hidden shadow-card">
              <div className="bg-ink text-white px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2">
                <Clock size={15} /> Key times today
              </div>
              <ul className="px-3.5">
                {t.keyTimes.map((k, i) => (
                  <li key={i} className={`flex items-center gap-3 py-2.5 ${i < t.keyTimes.length - 1 ? 'border-b border-neutral-100' : ''}`}>
                    <span className="w-12 text-sm font-bold text-brand-dark">{k.t}</span>
                    <span className="text-sm text-neutral-500 font-medium">{k.label}</span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-white rounded-2xl p-3.5 shadow-card">
                <span className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center">
                  <BedDouble size={18} className="text-brand-dark" />
                </span>
                <p className="mt-2 text-sm font-bold text-ink">{t.hotel}</p>
                <p className="text-xs text-neutral-500 font-medium">{t.room}</p>
              </div>
              <div className="bg-white rounded-2xl p-3.5 shadow-card">
                <span className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center">
                  <Plane size={18} className="text-brand-dark" />
                </span>
                <p className="mt-2 text-sm font-bold text-ink">Transfer</p>
                <p className="text-xs text-neutral-500 font-medium">{t.transfer}</p>
              </div>
            </div>

            <h2 className="text-lg font-bold text-ink mt-5 mb-2">Agenda</h2>
            <div className="bg-white rounded-2xl px-3.5 shadow-card">
              {t.agenda.map((a, i) => (
                <div key={i} className={`flex items-center gap-3 py-2.5 ${i < t.agenda.length - 1 ? 'border-b border-neutral-100' : ''}`}>
                  <Pill className="w-11 justify-center">{a.d}</Pill>
                  <span className="text-sm text-ink font-medium">{a.label}</span>
                </div>
              ))}
            </div>

            <h2 className="text-lg font-bold text-ink mt-5 mb-2">Documents</h2>
            <Link to="/documents" className="flex items-center gap-3 bg-white rounded-2xl p-3.5 shadow-card active:scale-[0.99]">
              <span className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center">
                <FileText size={18} className="text-brand-dark" />
              </span>
              <span className="flex-1 text-sm font-bold text-ink">{t.documents.length} files for this trip</span>
              <ArrowRight size={18} className="text-brand" />
            </Link>

          </>
        ) : (
          <div className="mt-4 bg-white rounded-2xl p-4 shadow-card">
            <p className="text-sm text-neutral-500 font-medium">
              Apply for this tournament to unlock logistics, agenda, documents and the group chat.
            </p>
            <p className="text-brand text-2xl font-extrabold mt-3">€{t.price}</p>
          </div>
        )}

        {t.applied && (
          <button
            onClick={() => nav(`/tournament/${t.id}/group`)}
            className="w-full h-11 mt-4 rounded-full bg-brand-light text-brand-dark font-semibold flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Users size={16} /> Open group chat
          </button>
        )}

        <div className="grid grid-cols-2 gap-3 mt-3">
          <button
            onClick={() => setRequested(true)}
            className={`h-12 rounded-full font-semibold flex items-center justify-center gap-2 active:scale-[0.99] ${
              showApplied ? 'bg-brand-dark text-white' : 'bg-brand text-white'
            }`}
          >
            {showApplied ? (<><Check size={16} /> Applied</>) : (<>Apply now <ArrowRight size={16} /></>)}
          </button>
          <button
            onClick={() => nav('/chat')}
            className="h-12 rounded-full bg-white border-[1.5px] border-brand text-brand-dark font-semibold flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <MessageCircle size={16} /> Message org
          </button>
        </div>
      </div>
    </div>
  )
}
