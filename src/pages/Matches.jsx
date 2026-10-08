import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, Users, Check, ChevronRight, ChevronDown, MessageCircle } from 'lucide-react'
import { TopBar } from '../components/ui.jsx'
import ProfileCircle from '../components/ProfileCircle.jsx'
import { myMatches } from '../data.js'

const roleColor = (role) => role.startsWith('Main') ? 'bg-brand text-white' : 'bg-brand-light text-brand-dark'

export default function Matches() {
  const nav = useNavigate()

  const byTournament = myMatches.reduce((acc, m) => {
    (acc[m.tournament] = acc[m.tournament] || []).push(m)
    return acc
  }, {})
  const tournaments = Object.keys(byTournament)
  const [open, setOpen] = useState(tournaments[0] || null)

  return (
    <div className="pb-4">
      <TopBar title="My matches" right={<ProfileCircle />} />
      <div className="px-4 pt-4">
        <p className="text-xs font-medium text-neutral-500 mb-3">
          {myMatches.length} appointments
        </p>

        {tournaments.map((tournament) => {
          const list = byTournament[tournament]
          const isOpen = open === tournament
          return (
          <section key={tournament} className="mb-3">
            <button
              onClick={() => setOpen(isOpen ? null : tournament)}
              className="w-full flex items-center justify-between gap-2 bg-white rounded-2xl border border-neutral-200 px-4 py-3.5 active:scale-[0.99] transition text-left"
            >
              <span className="min-w-0">
                <span className="block text-[15px] font-extrabold text-ink truncate">{tournament}</span>
                <span className="block text-[12px] font-semibold text-neutral-500">{list.length} {list.length === 1 ? 'match' : 'matches'}</span>
              </span>
              <ChevronDown size={20} className={`text-neutral-400 flex-none transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
            <div className="space-y-3 mt-3">
              {list.map((m) => (
                <button key={m.id} onClick={() => nav(`/match/${m.id}`)} className="w-full text-left bg-white rounded-3xl p-5 shadow-card active:scale-[0.99] transition">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${roleColor(m.role)}`}>{m.role}</span>
                    <span className="text-[12px] font-bold text-brand-dark inline-flex items-center gap-1"><Check size={14} /> Appointed</span>
                  </div>

                  <p className="mt-2.5 text-[17px] font-extrabold text-ink leading-tight">{m.home} <span className="text-neutral-300 font-semibold">vs</span> {m.away}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-neutral-500">
                    <span className="flex items-center gap-1"><Clock size={13} /> {m.day} · {m.time}</span>
                    <span className="flex items-center gap-1"><MapPin size={13} /> {m.pitch}</span>
                    {m.coRefs.length > 0 && <span className="flex items-center gap-1"><Users size={13} /> {m.coRefs.join(', ')}</span>}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); nav('/chat', { state: { team: { title: `${m.home} vs ${m.away}`, tournament: m.tournament, members: ['You', ...m.coRefs] } } }) }}
                      className="inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-dark bg-brand-light rounded-full px-3.5 py-1.5 active:scale-[0.98]"
                    >
                      <MessageCircle size={15} /> Chat with team
                    </span>
                    <span className="flex items-center text-[13px] font-bold text-brand-dark">
                      {m.role.startsWith('Main') ? 'Open report' : 'View details'} <ChevronRight size={16} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
            )}
          </section>
          )
        })}
      </div>
    </div>
  )
}
