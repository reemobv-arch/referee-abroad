import { useNavigate } from 'react-router-dom'
import { Megaphone, Bell, ArrowRight, Plane, CheckCircle2, Globe, Hotel, Flag, Users, Star } from 'lucide-react'
import { user, news, tournaments, myMatches, notifications } from '../data.js'
import { SectionHeader } from '../components/ui.jsx'
import TournamentCard from '../components/TournamentCard.jsx'
import ProfileCircle from '../components/ProfileCircle.jsx'
import Logo from '../components/Logo.jsx'

const STEPS = [
  { Icon: Globe, title: 'Pick a tournament', text: 'Browse tournaments across the USA, Europe and Asia.' },
  { Icon: CheckCircle2, title: 'Apply & get selected', text: 'Apply in a few taps; the organisation confirms your spot.' },
  { Icon: Plane, title: 'We arrange everything', text: 'Flights, accommodation and your schedule, all sorted.' },
  { Icon: Flag, title: 'Referee abroad', text: 'Travel, referee great matches and grow your experience.' },
]

export default function Home() {
  const nav = useNavigate()
  const applied = tournaments.filter((t) => t.applied)
  const featured = tournaments.filter((t) => !t.applied).slice(0, 3)
  const nextMatch = myMatches[0]
  const hasUnread = notifications.some((n) => n.unread)
  const countries = new Set(tournaments.map((t) => t.country)).size

  return (
    <div className="pb-4">
      <header className="sticky top-0 z-20 bg-white border-b border-neutral-200">
        <div className="h-14 flex items-center justify-between px-4">
          <Logo size={30} showText textClass="text-base" />
          <div className="flex items-center gap-2.5">
            <button onClick={() => nav('/notifications')} aria-label="Notifications" className="relative w-10 h-10 rounded-2xl border border-neutral-200 flex items-center justify-center">
              <Bell size={20} className="text-ink" />
              {hasUnread && <span className="absolute top-2 right-2 w-2 h-2 rounded-full ring-2 ring-white" style={{ background: '#F0603C' }} />}
            </button>
            <ProfileCircle />
          </div>
        </div>
      </header>

      {/* Hero: what Referee Abroad is about */}
      <div className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-3xl text-white">
          <img src="img/hub-bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(23,107,54,0.86), rgba(20,40,26,0.78))' }} />
          <div className="relative p-6">
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur text-white text-[11px] font-bold px-3 py-1 rounded-full"><Star size={12} /> International refereeing</span>
            <h1 className="mt-3 text-[28px] font-extrabold leading-tight">Referee at tournaments abroad</h1>
            <p className="mt-1.5 text-[14px] font-medium text-white/90 leading-relaxed">Join international youth tournaments around the world. You referee the matches, Referee Abroad arranges the travel, stay and schedule.</p>
            <button onClick={() => nav('/tournaments')} className="mt-4 inline-flex items-center gap-2 bg-white text-brand-dark font-extrabold text-[15px] rounded-2xl px-5 py-3 active:scale-[0.98] transition">
              Explore tournaments <ArrowRight size={17} />
            </button>
          </div>
        </div>

        {/* Trust stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[[`${tournaments.length}+`, 'Tournaments'], [`${countries}`, 'Countries'], ['500+', 'Referees']].map(([n, l]) => (
            <div key={l} className="bg-white rounded-2xl border border-neutral-200 p-3.5 text-center">
              <p className="text-2xl font-extrabold text-brand-dark leading-none">{n}</p>
              <p className="mt-1 text-[12px] font-semibold text-neutral-500">{l}</p>
            </div>
          ))}
        </div>

        {/* Personalised: next match (only when you have one) */}
        {nextMatch && (
          <div className="mt-6 relative overflow-hidden rounded-3xl p-6 text-white" style={{ background: 'linear-gradient(135deg,#2FA850,#1B6E36)' }}>
            <span className="pointer-events-none absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
            <div className="relative">
              <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-white/90"><span className="w-2 h-2 rounded-full bg-white" /> Your next match</div>
              <h2 className="mt-2 text-[24px] font-extrabold leading-tight">{nextMatch.home} vs {nextMatch.away}</h2>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[14px] font-semibold text-white/95"><span>{nextMatch.day} · {nextMatch.time}</span><span>{nextMatch.pitch}</span></div>
              <p className="mt-0.5 text-[14px] font-semibold text-white/90">Role · {nextMatch.role}</p>
              <button onClick={() => nav('/matches')} className="mt-4 inline-flex items-center gap-2 bg-white text-brand-dark font-extrabold text-[15px] rounded-2xl px-5 py-3 active:scale-[0.98] transition">View details <ArrowRight size={17} /></button>
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="mt-7">
          <h2 className="text-[17px] font-extrabold text-ink mb-3">How it works</h2>
          <div className="space-y-2.5">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-3.5 bg-white rounded-2xl border border-neutral-200 p-4">
                <span className="w-11 h-11 rounded-2xl bg-brand-light text-brand-dark flex items-center justify-center flex-none"><s.Icon size={20} /></span>
                <div className="min-w-0">
                  <p className="text-[15px] font-bold text-ink leading-tight">{i + 1}. {s.title}</p>
                  <p className="text-[13px] font-medium text-neutral-500">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What's included */}
        <div className="mt-6 rounded-3xl bg-brand-light/60 border border-brand-light p-5">
          <h2 className="text-[16px] font-extrabold text-ink mb-3">What Referee Abroad arranges</h2>
          <div className="grid grid-cols-2 gap-3">
            {[[Plane, 'Flights & transfers'], [Hotel, 'Accommodation'], [Users, 'A full referee team'], [Flag, 'Matches & schedule']].map(([Icon, label]) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-white text-brand-dark flex items-center justify-center flex-none"><Icon size={17} /></span>
                <span className="text-[13px] font-bold text-ink leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Your tournaments */}
        {applied.length > 0 && (
          <div className="mt-7">
            <SectionHeader title="Your tournaments" action="See all" onAction={() => nav('/tournaments')} />
            <div className="space-y-4">{applied.map((t) => <TournamentCard key={t.id} t={t} />)}</div>
          </div>
        )}

        {/* Featured tournaments */}
        <div className="mt-7">
          <SectionHeader title="Featured tournaments" action="See all" onAction={() => nav('/tournaments')} />
          <div className="space-y-4">{featured.map((t) => <TournamentCard key={t.id} t={t} />)}</div>
        </div>

        {/* News */}
        <div className="mt-7">
          <SectionHeader title="Latest news" action="See all" onAction={() => nav('/news')} />
          <div className="space-y-3">
            {news.map((n) => (
              <article key={n.id} className="bg-white rounded-2xl p-4 shadow-card">
                <div className="flex items-start justify-between">
                  <span className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center"><Megaphone size={17} className="text-brand" /></span>
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
