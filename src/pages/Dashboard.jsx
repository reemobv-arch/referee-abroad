import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, UserCheck, Users, MessageSquare, Wallet, BarChart3, ArrowLeft, Bell, Plus } from 'lucide-react'
import {
  DashboardTournaments, DashboardReferees, DashboardStaff,
  DashboardCommunication, DashboardPnL, DashboardAnalytics,
} from '../dashboard/sections.jsx'

const MENU = [
  { key: 'tournaments', label: 'Tournaments', Icon: Trophy, title: 'Tournaments', desc: 'Plan and manage every tournament.', action: 'New tournament', Comp: DashboardTournaments },
  { key: 'referees', label: 'Referees', Icon: UserCheck, title: 'Referees', desc: 'Everyone in the referee pool.', Comp: DashboardReferees },
  { key: 'staff', label: 'Staff', Icon: Users, title: 'Staff', desc: 'Your team working on the tournaments.', action: 'Add staff', Comp: DashboardStaff },
  { key: 'communication', label: 'Communication', Icon: MessageSquare, title: 'Communication', desc: 'Answer tickets and broadcast to groups.', Comp: DashboardCommunication },
  { key: 'pnl', label: 'P&L', Icon: Wallet, title: 'P&L', desc: 'Revenue, costs and margins per tournament.', Comp: DashboardPnL },
  { key: 'analytics', label: 'Analytics', Icon: BarChart3, title: 'Analytics', desc: 'Insights across tournaments and referees.', Comp: DashboardAnalytics },
]

export default function Dashboard() {
  const [active, setActive] = useState('tournaments')
  const current = MENU.find((m) => m.key === active)
  const Section = current.Comp

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

        <nav className="flex-1 px-3 py-2 space-y-1">
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
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 bg-white border-b border-neutral-200 flex items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-extrabold text-ink leading-tight">{current.title}</h1>
            <p className="text-xs font-medium text-neutral-500">{current.desc}</p>
          </div>
          <div className="flex items-center gap-3">
            {current.action && (
              <button className="inline-flex items-center gap-1.5 bg-brand text-white text-sm font-semibold px-4 h-9 rounded-full">
                <Plus size={15} /> {current.action}
              </button>
            )}
            <span className="relative"><Bell size={19} className="text-neutral-500" /><span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" /></span>
            <span className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs">SM</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <Section />
        </div>
      </main>
    </div>
  )
}
