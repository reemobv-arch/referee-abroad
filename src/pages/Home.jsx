import { useNavigate } from 'react-router-dom'
import { Megaphone, Bell, Plane, Users, Award, Heart, ChevronDown, MapPin } from 'lucide-react'
import { news, tournaments, notifications } from '../data.js'
import { SectionHeader } from '../components/ui.jsx'
import ProfileCircle from '../components/ProfileCircle.jsx'
import Logo from '../components/Logo.jsx'

// The experience, in Referee Abroad's own words (informational, not selling).
const PILLARS = [
  { Icon: Plane, title: 'Travel to international locations', text: 'Referee at top youth tournaments across Europe, the USA and Asia.' },
  { Icon: Users, title: 'Meet referees from around the world', text: 'Referees from more than 100 countries have taken part.' },
  { Icon: Award, title: 'Improve your refereeing', text: 'Real-time feedback from elite observers and mentors.' },
  { Icon: Heart, title: 'A supportive community', text: 'Be part of a vibrant group and make lifelong friendships.' },
]

export default function Home() {
  const nav = useNavigate()
  const upcoming = tournaments.slice(0, 4)
  const hasUnread = notifications.some((n) => n.unread)

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

      {/* Hero: a referee in the field, like the website. Informational only. */}
      <div className="relative h-[52vh] min-h-[380px]">
        <img src="img/ra-hero.jpg" alt="Referee at an international tournament" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(11,20,14,0.85) 0%, rgba(11,20,14,0.15) 55%, rgba(11,20,14,0.1) 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <p className="text-[12px] font-bold uppercase tracking-wider text-white/80">The Referee Abroad experience</p>
          <h1 className="mt-1 text-[30px] font-extrabold leading-tight">Explore your refereeing world</h1>
          <p className="mt-1.5 text-[14px] font-semibold text-white/90">Travel. Develop. Make lifelong friendships.</p>
          <div className="mt-3 flex items-center gap-1.5 text-white/70 text-[12px] font-semibold"><ChevronDown size={15} /> Scroll to learn more</div>
        </div>
      </div>

      <div className="px-4">
        {/* About */}
        <div className="pt-6">
          <p className="text-[15px] text-neutral-600 font-medium leading-relaxed">
            Referee Abroad takes referees to international youth football tournaments around the world. More than <span className="font-bold text-ink">900 referees</span> fly out with us every year, and the memories last long after the final whistle.
          </p>
        </div>

        {/* Facts */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[['28', 'Tournaments 26/27'], ['100+', 'Countries'], ['900+', 'Referees / year']].map(([n, l]) => (
            <div key={l} className="bg-white rounded-2xl border border-neutral-200 p-3.5 text-center">
              <p className="text-2xl font-extrabold text-brand-dark leading-none">{n}</p>
              <p className="mt-1 text-[11.5px] font-semibold text-neutral-500 leading-tight">{l}</p>
            </div>
          ))}
        </div>

        {/* Where we work */}
        <div className="mt-7">
          <h2 className="text-[17px] font-extrabold text-ink mb-3">Where we work</h2>
          <div className="grid grid-cols-3 gap-3">
            {[['🇺🇸', 'USA'], ['🇪🇺', 'Europe'], ['🌏', 'Asia']].map(([flag, label]) => (
              <div key={label} className="bg-white rounded-2xl border border-neutral-200 p-4 flex flex-col items-center gap-1.5">
                <span className="text-[30px] leading-none">{flag}</span>
                <span className="text-[13px] font-bold text-ink">{label}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[12.5px] font-medium text-neutral-500">28 tournaments across Europe, the USA and Asia this season.</p>
        </div>

        {/* The experience */}
        <div className="mt-7">
          <h2 className="text-[17px] font-extrabold text-ink mb-3">What the experience brings</h2>
          <div className="space-y-2.5">
            {PILLARS.map((p, i) => (
              <div key={i} className="flex items-center gap-3.5 bg-white rounded-2xl border border-neutral-200 p-4">
                <span className="w-11 h-11 rounded-2xl bg-brand-light text-brand-dark flex items-center justify-center flex-none"><p.Icon size={20} /></span>
                <div className="min-w-0">
                  <p className="text-[15px] font-bold text-ink leading-tight">{p.title}</p>
                  <p className="text-[13px] font-medium text-neutral-500">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission */}
        <div className="mt-6 rounded-3xl bg-brand-light/60 border border-brand-light p-5">
          <h2 className="text-[16px] font-extrabold text-ink">Our mission</h2>
          <p className="mt-1.5 text-[14px] text-neutral-600 font-medium leading-relaxed">
            To give referees a unique opportunity to travel the world, develop their skills alongside elite mentors, and build a global community of officials, one tournament at a time.
          </p>
        </div>

        {/* Upcoming tournaments: a visual 2x2 grid (not personal) */}
        <div className="mt-7">
          <SectionHeader title="Upcoming tournaments" action="See all" onAction={() => nav('/tournaments')} />
          <div className="grid grid-cols-2 gap-3">
            {upcoming.map((t) => (
              <button key={t.id} onClick={() => nav(`/tournament/${t.id}`)} className="relative h-36 rounded-2xl overflow-hidden text-left active:scale-[0.99] transition shadow-card">
                <img src={t.img} alt={t.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.05))' }} />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <p className="text-[13.5px] font-extrabold leading-tight">{t.name}</p>
                  <p className="text-[11px] font-semibold text-white/85 flex items-center gap-1 mt-0.5"><MapPin size={11} /> {t.city}, {t.country}</p>
                </div>
              </button>
            ))}
          </div>
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

      {/* Technical partners footer */}
      <footer className="mt-8 border-t border-neutral-200 bg-white px-4 py-7">
        <p className="text-center text-[12px] font-bold uppercase tracking-wider text-neutral-400 mb-5">Technical partners</p>
        <div className="flex items-center justify-around gap-4 flex-wrap">
          {[['macron.png', 'Macron'], ['erasmus.png', 'Erasmus+'], ['spintso.webp', 'SPINTSO'], ['bd.png', 'b+d']].map(([f, alt]) => (
            <img key={f} src={`img/partners/${f}`} alt={alt} className="h-9 w-auto object-contain" />
          ))}
        </div>
        <p className="mt-6 text-center text-[11px] font-medium text-neutral-400">© {new Date().getFullYear()} Referee Abroad</p>
      </footer>
    </div>
  )
}
