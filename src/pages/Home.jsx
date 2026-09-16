import { useNavigate } from 'react-router-dom'
import { Megaphone, Bell, ArrowRight, Target, Flag, PenLine } from 'lucide-react'
import { user, news, tournaments, myMatches, notifications } from '../data.js'
import { SectionHeader } from '../components/ui.jsx'
import TournamentCard from '../components/TournamentCard.jsx'
import Logo from '../components/Logo.jsx'

export default function Home() {
  const nav = useNavigate()
  const applied = tournaments.filter((t) => t.applied)
  const nextMatch = myMatches[0]
  const hasUnread = notifications.some((n) => n.unread)

  const stats = [
    { n: applied.length, label: 'Tournaments', Icon: Target, tint: 'bg-brand-light', color: 'text-brand-dark', to: '/tournaments' },
    { n: myMatches.length, label: 'Matches', Icon: Flag, tint: 'bg-sky-100', color: 'text-sky-700', to: '/matches' },
    { n: 2, label: 'To sign', Icon: PenLine, tint: 'bg-amber-100', color: 'text-amber-700', to: '/documents' },
  ]

  return (
    <div className="pb-4">
      <header className="sticky top-0 z-20 bg-white border-b border-neutral-200">
        <div className="h-14 flex items-center justify-between px-4">
          <Logo size={30} showText textClass="text-base" />
          <button onClick={() => nav('/notifications')} aria-label="Notifications" className="relative w-10 h-10 rounded-2xl border border-neutral-200 flex items-center justify-center">
            <Bell size={20} className="text-ink" />
            {hasUnread && <span className="absolute top-2 right-2 w-2 h-2 bg-coral rounded-full ring-2 ring-white" style={{ background: '#F0603C' }} />}
          </button>
        </div>
      </header>

      <div className="px-4 pt-5">
        <h1 className="text-[32px] font-extrabold text-ink leading-tight">Hi {user.first}</h1>
        <p className="text-neutral-500 font-semibold text-[15px]">Ready for your next tournament?</p>

        {nextMatch && (
          <div className="mt-5 relative overflow-hidden rounded-3xl p-6 text-white" style={{ background: 'linear-gradient(135deg,#2FA850,#1B6E36)' }}>
            <span className="pointer-events-none absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
            <div className="relative">
              <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-white/90">
                <span className="w-2 h-2 rounded-full bg-white" /> Next match
              </div>
              <h2 className="mt-2 text-[24px] font-extrabold leading-tight">{nextMatch.home} vs {nextMatch.away}</h2>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[14px] font-semibold text-white/95">
                <span>{nextMatch.day} · {nextMatch.time}</span>
                <span>{nextMatch.pitch}</span>
              </div>
              <p className="mt-0.5 text-[14px] font-semibold text-white/90">Role · {nextMatch.role}</p>
              <button onClick={() => nav('/matches')} className="mt-4 inline-flex items-center gap-2 bg-white text-brand-dark font-extrabold text-[15px] rounded-2xl px-5 py-3 active:scale-[0.98] transition">
                View details <ArrowRight size={17} />
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <button key={s.label} onClick={() => nav(s.to)} className="bg-white rounded-2xl border border-neutral-200 p-3.5 text-center active:scale-[0.98] transition">
              <span className={`w-11 h-11 rounded-2xl ${s.tint} ${s.color} flex items-center justify-center mx-auto`}><s.Icon size={20} /></span>
              <p className="mt-2 text-2xl font-extrabold text-ink leading-none">{s.n}</p>
              <p className="mt-1 text-[12px] font-semibold text-neutral-500">{s.label}</p>
            </button>
          ))}
        </div>

        <div className="mt-7">
          <SectionHeader title="Your tournaments" action="See all" onAction={() => nav('/tournaments')} />
          <div className="space-y-4">
            {applied.map((t) => (
              <TournamentCard key={t.id} t={t} />
            ))}
          </div>
        </div>

        <div className="mt-7">
          <SectionHeader title="Latest news" action="See all" onAction={() => nav('/news')} />
          <div className="space-y-3">
            {news.map((n) => (
              <article key={n.id} className="bg-white rounded-2xl p-4 shadow-card">
                <div className="flex items-start justify-between">
                  <span className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center">
                    <Megaphone size={17} className="text-brand" />
                  </span>
                  <span className="text-[11px] text-neutral-400 font-semibold">{n.ago}</span>
                </div>
                <h3 className="mt-2.5 text-[16px] font-extrabold text-ink">{n.title}</h3>
                <p className="text-[14px] text-neutral-500 font-medium leading-relaxed mt-1">{n.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
