import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, Users, Check, X } from 'lucide-react'
import { TopBar } from '../components/ui.jsx'
import { myMatches } from '../data.js'

const roleColor = (role) => role.startsWith('Main') ? 'bg-brand text-white' : 'bg-brand-light text-brand-dark'

export default function Matches() {
  const nav = useNavigate()
  const [items, setItems] = useState(() => myMatches.map((m) => ({ ...m })))

  const setStatus = (id, status) => setItems((prev) => prev.map((m) => m.id === id ? { ...m, status } : m))

  const byTournament = items.reduce((acc, m) => {
    (acc[m.tournament] = acc[m.tournament] || []).push(m)
    return acc
  }, {})

  const pending = items.filter((m) => m.status === 'pending').length

  return (
    <div className="pb-4">
      <TopBar title="My matches" />
      <div className="px-4 pt-4">
        <p className="text-xs font-medium text-neutral-500 mb-3">
          {items.length} appointments{pending > 0 ? ` · ${pending} need your response` : ''}
        </p>

        {Object.entries(byTournament).map(([tournament, list]) => (
          <section key={tournament} className="mb-5">
            <h2 className="text-xs font-bold text-neutral-500 mb-2">{tournament}</h2>
            <div className="space-y-3">
              {list.map((m) => (
                <div key={m.id} onClick={() => nav(`/match/${m.id}`)} className="bg-white rounded-3xl p-5 shadow-card active:scale-[0.99] transition cursor-pointer">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${roleColor(m.role)}`}>{m.role}</span>
                    {m.status === 'confirmed'
                      ? <span className="text-[11px] font-semibold text-brand-dark inline-flex items-center gap-1"><Check size={13} /> Confirmed</span>
                      : m.status === 'declined'
                        ? <span className="text-[11px] font-semibold text-red-500 inline-flex items-center gap-1"><X size={13} /> Declined</span>
                        : <span className="text-[11px] font-semibold text-amber-600">Awaiting response</span>}
                  </div>

                  <p className="mt-2.5 text-[17px] font-extrabold text-ink leading-tight">{m.home} <span className="text-neutral-300 font-semibold">vs</span> {m.away}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-neutral-500">
                    <span className="flex items-center gap-1"><Clock size={13} /> {m.day} · {m.time}</span>
                    <span className="flex items-center gap-1"><MapPin size={13} /> {m.pitch}</span>
                    {m.coRefs.length > 0 && <span className="flex items-center gap-1"><Users size={13} /> {m.coRefs.join(', ')}</span>}
                  </div>

                  {m.status === 'pending' && (
                    <div className="mt-3 flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setStatus(m.id, 'confirmed') }} className="flex-1 h-10 rounded-full bg-brand text-white text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-[0.99]">
                        <Check size={15} /> Accept
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setStatus(m.id, 'declined') }} className="h-10 px-4 rounded-full bg-white border border-neutral-200 text-neutral-500 text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-[0.99]">
                        <X size={15} /> Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
