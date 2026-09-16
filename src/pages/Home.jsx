import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Megaphone, Bell, CalendarCheck, MapPin, Clock } from 'lucide-react'
import { user, news, tournaments, myMatches, notifications } from '../data.js'
import { SectionHeader } from '../components/ui.jsx'
import TournamentCard from '../components/TournamentCard.jsx'
import Logo from '../components/Logo.jsx'

export default function Home() {
  const nav = useNavigate()
  const upcoming = tournaments.filter((t) => t.applied)
  const nextMatch = myMatches[0]
  const hasUnread = notifications.some((n) => n.unread)
  return (
    <div className="pb-4">
      <header className="sticky top-0 z-20 bg-white border-b border-neutral-200">
        <div className="h-14 flex items-center justify-between px-4">
          <Logo size={30} showText textClass="text-base" />
          <button onClick={() => nav('/notifications')} aria-label="Notifications" className="relative p-1">
            <Bell size={22} className="text-ink" />
            {hasUnread && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
          </button>
        </div>
      </header>

      <div className="px-4 pt-5">
        <h1 className="text-3xl font-extrabold text-ink">Hello, {user.first}!</h1>
        <p className="text-neutral-500 font-medium">Explore your refereeing world</p>

        {nextMatch && (
          <button onClick={() => nav('/matches')} className="mt-5 w-full text-left rounded-2xl bg-brand text-white p-4 shadow-card active:scale-[0.99] transition">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-white/80">
              <CalendarCheck size={14} /> Next match
            </div>
            <p className="mt-1.5 font-extrabold text-lg leading-tight">{nextMatch.home} vs {nextMatch.away}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs font-medium text-white/90">
              <span className="flex items-center gap-1"><Clock size={13} /> {nextMatch.day} · {nextMatch.time}</span>
              <span className="flex items-center gap-1"><MapPin size={13} /> {nextMatch.pitch}</span>
              <span className="font-semibold">{nextMatch.role}</span>
            </div>
          </button>
        )}

        <Link
          to="/tournaments"
          className="mt-5 flex items-center gap-3 bg-white rounded-2xl p-4 shadow-card active:scale-[0.99] transition-transform"
        >
          <span className="w-11 h-11 rounded-full bg-brand-light flex items-center justify-center">
            <Megaphone size={20} className="text-brand" />
          </span>
          <span className="flex-1">
            <span className="block font-bold text-ink">My Tournaments</span>
            <span className="block text-xs text-neutral-500 font-medium">View your applications</span>
          </span>
          <ChevronRight className="text-neutral-400" />
        </Link>

        <div className="mt-7">
          <SectionHeader title="Latest News" action="See all" onAction={() => nav('/news')} />
          <div className="space-y-3">
            {news.map((n) => (
              <article key={n.id} className="bg-white rounded-2xl p-4 shadow-card">
                <div className="flex items-start justify-between">
                  <span className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center">
                    <Megaphone size={17} className="text-brand" />
                  </span>
                  <span className="text-[11px] text-neutral-400 font-medium">{n.ago}</span>
                </div>
                <h3 className="mt-2.5 font-bold text-ink">{n.title}</h3>
                <p className="text-sm text-neutral-500 font-medium leading-relaxed mt-1">{n.body}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-7">
          <SectionHeader title="Upcoming Tournaments" action="See all" onAction={() => nav('/tournaments')} />
          <div className="space-y-4">
            {upcoming.map((t) => (
              <TournamentCard key={t.id} t={t} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
