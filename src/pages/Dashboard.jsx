import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Trophy, Users, MessageSquare, BarChart3, ArrowLeft, Plus,
  Search, Settings, X,
} from 'lucide-react'
import {
  DashboardTournaments, DashboardPeople, DashboardCommunication,
  DashboardInsights, DashboardSettingsHub,
} from '../dashboard/sections.jsx'
import { LIVE } from '../lib/dataSource.js'

const MENU = [
  { key: 'tournaments', label: 'Tournaments', Icon: Trophy, title: 'Tournaments', desc: 'Plan and manage every tournament.', action: 'New tournament' },
  { key: 'people', label: 'People', Icon: Users, title: 'People', desc: 'Referees and staff in one place.', Comp: DashboardPeople },
  { key: 'communication', label: 'Inbox', Icon: MessageSquare, title: 'Inbox', desc: 'The smart inbox and the AI assistant.', Comp: DashboardCommunication },
  { key: 'insights', label: 'Insights', Icon: BarChart3, title: 'Insights', desc: 'P&L and analytics across tournaments.', Comp: DashboardInsights },
  { key: 'settings', label: 'Settings', Icon: Settings, title: 'Settings', desc: 'Organisation, integrations and roles.', Comp: DashboardSettingsHub },
]

function RaMark({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="#E7F4E1" />
      <path d="M14 30c-4-2-6-8-2-12s10-2 12 2c2-5 9-6 13-2s2 12-4 13c3 3 1 9-4 9-4 0-6-3-6-6-3 3-9 2-9-4z" fill="#44A546" />
      <circle cx="20" cy="22" r="5" fill="#17201A" /><circle cx="21.5" cy="20.5" r="1.6" fill="#fff" />
      <circle cx="31" cy="27" r="3" fill="#17201A" />
    </svg>
  )
}

// Command Centre login. In the prototype any sign-in goes straight through, like
// the referee app; the real dashboard wires this to WordPress admin auth.
function DashboardLogin({ onSignIn }) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const submit = (e) => { e.preventDefault(); onSignIn() }
  const inputCls = 'w-full h-11 px-3.5 rounded-xl border border-white/15 bg-white/5 text-sm font-medium text-white placeholder-white/35 outline-none focus:border-brand'
  return (
    <div className="h-screen relative flex font-sans bg-ink text-white overflow-hidden">
      <div className="hidden md:block absolute inset-y-0 w-[80%]" style={{ left: '-5%' }}>
        <img src="/cc-login.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 45%, rgba(27,27,27,0.7) 78%, #1b1b1b 100%)' }} />
      </div>
      <div className="relative z-10 ml-auto w-full md:w-[42%] md:min-w-[400px] md:max-w-[560px] flex flex-col px-8 sm:px-14 py-10">
        <div className="flex items-center gap-2.5">
          <RaMark />
          <div className="leading-none">
            <p className="font-extrabold text-base text-white">Referee <span className="text-brand">abroad</span></p>
            <p className="text-[10px] font-medium text-white/50 mt-0.5">Command Centre</p>
          </div>
        </div>
        <form onSubmit={submit} className="m-auto w-full max-w-[340px]">
          <h2 className="text-2xl font-extrabold text-white">Sign in</h2>
          <p className="text-[13px] text-white/60 font-medium mt-1 mb-6">Use your Referee Abroad account.</p>
          <label className="block mb-3.5"><span className="block text-xs font-semibold text-white/60 mb-1.5">Email or username</span><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@refereeabroad.com" className={inputCls} autoFocus /></label>
          <label className="block mb-2"><span className="block text-xs font-semibold text-white/60 mb-1.5">Password</span><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" className={inputCls} /></label>
          <div className="text-right mb-5"><a href="#" onClick={(e) => e.preventDefault()} className="text-xs font-semibold text-brand hover:underline">Forgot password?</a></div>
          <button type="submit" className="w-full h-12 rounded-full bg-brand text-white font-semibold active:scale-[0.99] transition hover:bg-brand-dark">Sign in</button>
        </form>
        <div className="absolute bottom-3.5 right-5 flex items-center gap-1.5 text-[10px] font-medium text-white/40">
          <span className="w-3.5 h-3.5 rounded bg-white/20" /> built by Reemo
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [authed, setAuthed] = useState(() => { try { return sessionStorage.getItem('ra_cc_authed') === '1' } catch { return false } })
  const signIn = () => { try { sessionStorage.setItem('ra_cc_authed', '1') } catch { /* ignore */ } setAuthed(true) }
  const [active, setActive] = useState('tournaments')
  const [createSignal, setCreateSignal] = useState(0)
  const [focusT, setFocusT] = useState({ id: null, n: 0 })
  const [q, setQ] = useState('')
  const [homeList, setHomeList] = useState(true)
  const current = MENU.find((m) => m.key === active)
  const Section = current.Comp
  const showPhoto = active === 'tournaments' && homeList
  const onHeaderAction = () => { if (active === 'tournaments') setCreateSignal((s) => s + 1) }

  const query = q.trim().toLowerCase()
  useEffect(() => { setQ('') }, [active])

  // Cross-section navigation (e.g. the referee popup's Message button jumps to
  // Communication) without prop-drilling through the hubs.
  useEffect(() => {
    const go = (e) => { if (e.detail && MENU.some((m) => m.key === e.detail)) setActive(e.detail) }
    window.addEventListener('ra-nav', go)
    return () => window.removeEventListener('ra-nav', go)
  }, [])

  if (!authed) return <DashboardLogin onSignIn={signIn} />

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
        {showPhoto && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
            <div className="absolute inset-0 bg-cover" style={{ backgroundImage: 'url(img/hub-bg.jpg)', backgroundPosition: 'center 22%' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(244,245,244,0.58) 0%, rgba(244,245,244,0.42) 150px, rgba(244,245,244,0.72) 460px, rgba(244,245,244,0.92) 640px, #f4f5f4 820px)' }} />
          </div>
        )}
        <header className={`h-16 shrink-0 flex items-center justify-between px-6 gap-4 relative z-20 ${showPhoto ? '' : 'bg-white/80 backdrop-blur border-b border-neutral-200'}`}>
          <div className="min-w-0">
            <h1 className={`text-lg font-extrabold leading-tight truncate text-ink ${showPhoto ? '[text-shadow:0_1px_3px_rgba(255,255,255,0.6)]' : ''}`}>{current.title}</h1>
            <p className={`text-xs font-medium truncate ${showPhoto ? 'text-neutral-600 [text-shadow:0_1px_2px_rgba(255,255,255,0.6)]' : 'text-neutral-500'}`}>{current.desc}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search (filters the tournaments grid) */}
            {active === 'tournaments' && (
              <div className="hidden md:block relative">
                <div className="flex items-center gap-2 h-9 px-3 rounded-full bg-page border border-neutral-200 w-56 focus-within:border-brand">
                  <Search size={15} className="text-neutral-500" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tournaments…" className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-neutral-500" />
                  {q && <button onClick={() => setQ('')} className="text-neutral-500 hover:text-ink"><X size={15} /></button>}
                </div>
              </div>
            )}
            {current.action && !LIVE && (
              <button onClick={onHeaderAction} className="inline-flex items-center gap-1.5 bg-brand text-white text-sm font-semibold px-4 h-9 rounded-full hover:bg-brand-dark transition shadow-sm">
                <Plus size={15} /> {current.action}
              </button>
            )}
            {/* Notifications: disabled until the Phase 1 notifications work (group H) */}
            <span className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs ring-2 ring-brand-light">SM</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 relative z-10">
          {active === 'tournaments'
            ? <DashboardTournaments createSignal={createSignal} focusT={focusT} onListChange={setHomeList} searchQuery={query} />
            : <Section />}
        </div>
      </main>
    </div>
  )
}
