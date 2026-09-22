import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { MapPin, Clock, Users, Check, Star, ClipboardCheck, Lock } from 'lucide-react'
import { TopBar } from '../components/ui.jsx'
import { myMatches } from '../data.js'

export default function MatchDetail() {
  const { id } = useParams()
  const m = myMatches.find((x) => x.id === id)
  const [score, setScore] = useState({ h: '', a: '' })
  const [rating, setRating] = useState(0)
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!m) return <div className="p-6">Match not found.</div>
  const isMain = m.role.startsWith('Main')

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-8">
      <TopBar title="Match" back />
      <div className="px-4 pt-4">
        <div className="rounded-3xl p-6 text-white" style={{ background: 'linear-gradient(135deg,#2FA850,#1B6E36)' }}>
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${isMain ? 'bg-white text-brand-dark' : 'bg-white/25 text-white'}`}>{m.role}</span>
          <h1 className="mt-3 text-[26px] font-extrabold leading-tight">{m.home} <span className="text-white/70">vs</span> {m.away}</h1>
          <p className="mt-1 text-[14px] font-semibold text-white/90">{m.tournament}</p>
        </div>

        <div className="mt-4 bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
          <div className="flex items-center gap-3 px-4 py-3"><Clock size={18} className="text-brand-dark" /><span className="text-[14px] font-semibold text-ink">{m.day} · {m.time}</span></div>
          <div className="flex items-center gap-3 px-4 py-3"><MapPin size={18} className="text-brand-dark" /><span className="text-[14px] font-semibold text-ink">{m.pitch}</span></div>
          <div className="flex items-center gap-3 px-4 py-3"><Users size={18} className="text-brand-dark" /><span className="text-[14px] font-semibold text-ink">{m.coRefs.length ? m.coRefs.join(', ') : 'No co-referees'}</span></div>
        </div>

        <p className="mt-4 text-[14px] font-bold flex items-center gap-1.5 text-brand-dark"><Check size={16} /> Appointed</p>

        {isMain ? (
          <div className="mt-6">
            <h2 className="text-xl font-extrabold text-ink mb-3">Match report</h2>
            {submitted ? (
              <div className="bg-brand-light rounded-2xl p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center mx-auto"><ClipboardCheck size={24} /></div>
                <p className="mt-2 text-[15px] font-extrabold text-brand-dark">Report submitted</p>
                <p className="text-[13px] font-semibold text-brand-dark/80">Final score {score.h || 0} - {score.a || 0}. Thanks!</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-4">
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-wide text-neutral-400 mb-2">Final score</p>
                  <div className="flex items-center gap-3">
                    <input inputMode="numeric" value={score.h} onChange={(e) => setScore((s) => ({ ...s, h: e.target.value.replace(/\D/g, '') }))} placeholder="0" className="w-16 h-14 text-center text-2xl font-extrabold rounded-2xl border border-neutral-200 outline-none focus:border-brand" />
                    <span className="text-neutral-400 font-bold">–</span>
                    <input inputMode="numeric" value={score.a} onChange={(e) => setScore((s) => ({ ...s, a: e.target.value.replace(/\D/g, '') }))} placeholder="0" className="w-16 h-14 text-center text-2xl font-extrabold rounded-2xl border border-neutral-200 outline-none focus:border-brand" />
                    <div className="flex-1 text-right text-[12px] font-semibold text-neutral-400 leading-tight">{m.home}<br />{m.away}</div>
                  </div>
                </div>
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-wide text-neutral-400 mb-2">Fair play rating</p>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                        <Star size={30} className={n <= rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-200 fill-neutral-200'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-wide text-neutral-400 mb-2">Notes</p>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Any incidents, cards or remarks…" className="w-full p-3 rounded-2xl border border-neutral-200 text-[14px] font-medium outline-none focus:border-brand resize-none" />
                </div>
                <button onClick={() => setSubmitted(true)} className="w-full h-12 rounded-full bg-brand text-white font-bold active:scale-[0.99]">Submit report</button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 bg-white rounded-2xl border border-neutral-200 p-5 flex items-start gap-3">
            <span className="w-9 h-9 rounded-xl bg-page text-neutral-400 flex items-center justify-center flex-none"><Lock size={18} /></span>
            <div>
              <p className="text-[15px] font-bold text-ink">Report filed by the main referee</p>
              <p className="text-[13px] font-medium text-neutral-500 mt-0.5">As assistant referee you don’t submit the match report. The appointed main referee takes care of it.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
