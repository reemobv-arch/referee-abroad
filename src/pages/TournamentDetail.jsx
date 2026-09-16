import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, Clock, BedDouble, Plane, Users, MessageCircle, FileText, ChevronLeft, ArrowRight, Check, X, CalendarCheck, ShieldCheck } from 'lucide-react'
import { tournaments, myMatches } from '../data.js'
import { Pill } from '../components/ui.jsx'

function PayModal({ t, onClose, onPaid }) {
  const [paying, setPaying] = useState(false)
  const [done, setDone] = useState(false)
  const service = 15
  const total = t.price + service
  const pay = () => {
    setPaying(true)
    setTimeout(() => { setPaying(false); setDone(true) }, 900)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-brand-light text-brand-dark flex items-center justify-center mx-auto"><Check size={26} /></div>
            <p className="mt-3 text-lg font-extrabold text-ink">You are applied!</p>
            <p className="mt-1 text-sm text-neutral-500 font-medium">Payment received for {t.name}. The team will confirm your spot shortly.</p>
            <button onClick={onPaid} className="mt-5 w-full h-11 rounded-full bg-brand text-white font-semibold">Done</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-lg font-extrabold text-ink">Apply & pay</p>
              <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-page flex items-center justify-center"><X size={18} /></button>
            </div>
            <p className="text-sm text-neutral-500 font-medium mt-0.5">{t.name}</p>
            <div className="mt-4 bg-page rounded-xl p-4 text-sm">
              <div className="flex justify-between py-1 font-medium text-neutral-600"><span>Participation fee</span><span>€{t.price}</span></div>
              <div className="flex justify-between py-1 font-medium text-neutral-600"><span>Service fee</span><span>€{service}</span></div>
              <div className="flex justify-between pt-2 mt-1 border-t border-neutral-200 font-bold text-ink"><span>Total</span><span>€{total}</span></div>
            </div>
            <button onClick={pay} disabled={paying} className="mt-4 w-full h-12 rounded-full bg-brand text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60">
              {paying ? 'Processing…' : <>Pay €{total} <ArrowRight size={17} /></>}
            </button>
            <p className="mt-2.5 text-[11px] text-neutral-400 font-medium flex items-center justify-center gap-1"><ShieldCheck size={13} /> Secure payment via the existing checkout</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function TournamentDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [requested, setRequested] = useState(false)
  const [pay, setPay] = useState(false)
  const t = tournaments.find((x) => x.id === id)
  if (!t) return <div className="p-6">Not found.</div>
  const showApplied = requested || t.applied
  const matches = myMatches.filter((m) => m.tournamentId === t.id)

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
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h1 className="text-[28px] font-extrabold leading-tight">{t.name}</h1>
          <div className="flex items-center gap-1.5 text-[14px] font-semibold mt-1 text-white/90">
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

            <h2 className="text-xl font-extrabold text-ink mt-6 mb-3">Agenda</h2>
            <div className="bg-white rounded-2xl px-3.5 shadow-card">
              {t.agenda.map((a, i) => (
                <div key={i} className={`flex items-center gap-3 py-2.5 ${i < t.agenda.length - 1 ? 'border-b border-neutral-100' : ''}`}>
                  <Pill className="w-11 justify-center">{a.d}</Pill>
                  <span className="text-sm text-ink font-medium">{a.label}</span>
                </div>
              ))}
            </div>

            <h2 className="text-xl font-extrabold text-ink mt-6 mb-3">Documents</h2>
            <Link to="/documents" className="flex items-center gap-3 bg-white rounded-2xl p-3.5 shadow-card active:scale-[0.99]">
              <span className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center">
                <FileText size={18} className="text-brand-dark" />
              </span>
              <span className="flex-1 text-sm font-bold text-ink">{t.documents.length} files for this trip</span>
              <ArrowRight size={18} className="text-brand" />
            </Link>

            {matches.length > 0 && (
              <>
                <h2 className="text-xl font-extrabold text-ink mt-6 mb-3">My matches</h2>
                <button onClick={() => nav('/matches')} className="w-full text-left flex items-center gap-3 bg-white rounded-2xl p-3.5 shadow-card active:scale-[0.99]">
                  <span className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center">
                    <CalendarCheck size={18} className="text-brand-dark" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-bold text-ink">{matches.length} matches appointed</span>
                    <span className="block text-xs text-neutral-500 font-medium">{matches.filter((m) => m.status === 'pending').length} awaiting your response</span>
                  </span>
                  <ArrowRight size={18} className="text-brand" />
                </button>
              </>
            )}

          </>
        ) : (
          <div className="mt-4 bg-white rounded-2xl p-4 shadow-card">
            <p className="text-[15px] text-neutral-500 font-medium">
              Apply for this tournament to unlock logistics, agenda, documents and the group chat.
            </p>
            <p className="text-brand-dark text-[30px] font-extrabold mt-3">€{t.price}</p>
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
            onClick={() => { if (!showApplied) setPay(true) }}
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

      {pay && <PayModal t={t} onClose={() => setPay(false)} onPaid={() => { setRequested(true); setPay(false) }} />}
    </div>
  )
}
