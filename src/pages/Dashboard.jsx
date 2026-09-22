import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Trophy, UserCheck, Users, MessageSquare, BarChart3, ArrowLeft, Bell, Plus,
  Search, Settings, CalendarCheck, CreditCard, FileText,
} from 'lucide-react'
import {
  DashboardTournaments, DashboardPeople, DashboardCommunication,
  DashboardInsights, DashboardSettingsHub,
} from '../dashboard/sections.jsx'
import { dashTournaments, dashReferees } from '../dashboard/data.js'

const MENU = [
  { key: 'tournaments', label: 'Tournaments', Icon: Trophy, title: 'Tournaments', desc: 'Plan and manage every tournament.', action: 'New tournament' },
  { key: 'people', label: 'People', Icon: Users, title: 'People', desc: 'Referees and staff in one place.', Comp: DashboardPeople },
  { key: 'communication', label: 'Communication', Icon: MessageSquare, title: 'Communication', desc: 'Conversations, broadcasts and the AI assistant.', Comp: DashboardCommunication },
  { key: 'insights', label: 'Insights', Icon: BarChart3, title: 'Insights', desc: 'P&L and analytics across tournaments.', Comp: DashboardInsights },
  { key: 'settings', label: 'Settings', Icon: Settings, title: 'Settings', desc: 'Organisation, integrations and roles.', Comp: DashboardSettingsHub },
]

const NOTIFS = [
  { Icon: CreditCard, text: 'New WooCommerce order imported for Porto International Cup', ago: '2 min ago' },
  { Icon: MessageCircleIconFallback, text: 'New message from Lucas Bianchi in the inbox', ago: '20 min ago' },
  { Icon: CalendarCheck, text: 'Ana Nogueira accepted her appointment', ago: '1 hour ago' },
  { Icon: FileText, text: 'Copenhagen Cup enrolments reached 31/50', ago: 'Yesterday' },
]
function MessageCircleIconFallback(props) { return <MessageSquare {...props} /> }

export default function Dashboard() {
  const [active, setActive] = useState('tournaments')
  const [createSignal, setCreateSignal] = useState(0)
  const [focusT, setFocusT] = useState({ id: null, n: 0 })
  const [q, setQ] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const current = MENU.find((m) => m.key === active)
  const Section = current.Comp
  const isHome = active === 'tournaments'
  const onHeaderAction = () => { if (active === 'tournaments') setCreateSignal((s) => s + 1) }

  const query = q.trim().toLowerCase()
  const tMatches = query ? dashTournaments.filter((t) => t.name.toLowerCase().includes(query)).slice(0, 4) : []
  const rMatches = query ? dashReferees.filter((r) => r.name.toLowerCase().includes(query)).slice(0, 4) : []
  const openTournament = (id) => { setActive('tournaments'); setFocusT({ id, n: focusT.n + 1 }); setQ('') }
  const openReferees = () => { setActive('people'); setQ('') }

  return (
    <div className="h-screen bg-page text-ink font-sans flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-ink text-white flex flex-col">
        <div className="px-5 py-5 flex items-center gap-2.5">
          <svg width="34" height="34" viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="24" r="22" fill="#E7F4E1" />
            <path d="M14 30c-4-2-6-8-2-12s10-2 12 2c2-5 9-6 13-2s2 12-4 13c3 3 1 9-4 9-4 0-6-3-6-6-3 3-9 2-9-4z" fill="#44A546" />
            <circle cx="20" cy="22" r="5" fill="#17201A" /><circle cx="21.5" cy="20.5" r="1.6" fill="#fff" />
            <circle cx="31" cy="27" r="3" fill="#17201A" />
          </svg>
          <div className="leading-none">
            <p className="font-extrabold text-base">Referee <span className="text-brand">abroad</span></p>
            <p className="text-[10px] font-medium text-neutral-400 mt-0.5">Command Centre</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto no-scrollbar">
          {MENU.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                active === key ? 'bg-brand text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-white/10">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-400 hover:text-white transition">
            <ArrowLeft size={15} /> Back to hub
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {isHome && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
            <div className="absolute inset-0 bg-cover" style={{ backgroundImage: 'url(img/hub-bg.jpg)', backgroundPosition: 'center 22%' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(244,245,244,0.58) 0%, rgba(244,245,244,0.42) 150px, rgba(244,245,244,0.72) 460px, rgba(244,245,244,0.92) 640px, #f4f5f4 820px)' }} />
          </div>
        )}
        <header className={`h-16 shrink-0 flex items-center justify-between px-6 gap-4 relative z-20 ${isHome ? '' : 'bg-white/80 backdrop-blur border-b border-neutral-200'}`}>
          <div className="min-w-0">
            <h1 className={`text-lg font-extrabold leading-tight truncate ${isHome ? 'text-ink [text-shadow:0_1px_3px_rgba(255,255,255,0.6)]' : 'text-ink'}`}>{current.title}</h1>
            <p className={`text-xs font-medium truncate ${isHome ? 'text-neutral-600 [text-shadow:0_1px_2px_rgba(255,255,255,0.6)]' : 'text-neutral-500'}`}>{current.desc}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:block relative">
              <div className="flex items-center gap-2 h-9 px-3 rounded-full bg-page border border-neutral-200 w-56 focus-within:border-brand">
                <Search size={15} className="text-neutral-400" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-neutral-400" />
              </div>
              {query && (tMatches.length > 0 || rMatches.length > 0) && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden py-1.5">
                  {tMatches.length > 0 && <p className="px-3 pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-wide text-neutral-400">Tournaments</p>}
                  {tMatches.map((t) => (
                    <button key={t.id} onMouseDown={() => openTournament(t.id)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-page transition text-left">
                      <Trophy size={15} className="text-brand-dark flex-none" /><span className="text-sm font-semibold text-ink truncate">{t.name}</span>
                    </button>
                  ))}
                  {rMatches.length > 0 && <p className="px-3 pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-wide text-neutral-400">Referees</p>}
                  {rMatches.map((r) => (
                    <button key={r.id} onMouseDown={openReferees} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-page transition text-left">
                      <UserCheck size={15} className="text-brand-dark flex-none" /><span className="text-sm font-semibold text-ink truncate">{r.name}</span><span className="text-xs text-neutral-400 ml-auto">{r.flag}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {current.action && (
              <button onClick={onHeaderAction} className="inline-flex items-center gap-1.5 bg-brand text-white text-sm font-semibold px-4 h-9 rounded-full hover:bg-brand-dark transition shadow-sm">
                <Plus size={15} /> {current.action}
              </button>
            )}
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen((v) => !v)} className="relative w-9 h-9 rounded-full hover:bg-page flex items-center justify-center transition">
                <Bell size={19} className="text-neutral-500" /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden z-40">
                    <div className="px-4 py-2.5 border-b border-neutral-100 flex items-center justify-between">
                      <p className="font-bold text-ink text-sm">Notifications</p>
                      <button onClick={() => setNotifOpen(false)} className="text-[11px] font-semibold text-brand-dark">Mark all read</button>
                    </div>
                    <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto">
                      {NOTIFS.map((n, i) => (
                        <div key={i} className="flex gap-3 px-4 py-3">
                          <span className="w-8 h-8 rounded-lg bg-brand-light text-brand-dark flex items-center justify-center flex-none"><n.Icon size={16} /></span>
                          <div className="min-w-0"><p className="text-sm font-medium text-ink leading-snug">{n.text}</p><p className="text-[11px] text-neutral-400 font-medium mt-0.5">{n.ago}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <span className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs ring-2 ring-brand-light">SM</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 relative z-10">
          {active === 'tournaments'
            ? <DashboardTournaments createSignal={createSignal} focusT={focusT} />
            : <Section />}
        </div>
      </main>
    </div>
  )
}
