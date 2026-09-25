import { Link } from 'react-router-dom'
import { ArrowLeft, Activity } from 'lucide-react'
import Logo from '../components/Logo.jsx'

const tagStyles = {
  Milestone: 'bg-brand text-white',
  Shipped: 'bg-brand-light text-brand-dark',
  Signed: 'bg-brand-dark text-white',
  Doc: 'bg-neutral-100 text-neutral-500',
}

/* Reverse chronological build log. */
const log = [
  { date: '25 Sep 2026', tag: 'Shipped', title: 'Tournament operations requirements added', body: 'New batch from client review: tournament readiness rename, observers and guests/VIP, per-day appointing, fields upload, AI appointing, appointment export, card counts, chat with team, doc deadlines and revised-schedule handling. Captured as group J and queued on the sprint board.' },
  { date: '23 Sep 2026', tag: 'Shipped', title: 'Smart team & fixture import', body: 'Import any organiser CSV/Excel with auto column mapping and age/gender detection; teams now carry gender. Added as requirement group I.' },
  { date: '16 Sep 2026', tag: 'Milestone', title: 'Fase 1 build workspace live', body: 'Source of truth published: architecture timeline with action points, the design system and 80 fine-grained requirements.' },
  { date: '16 Sep 2026', tag: 'Shipped', title: 'AI communication assistant added', body: 'LLM chatbot and smart inbox added to the offer and the agreement, with a variable monthly usage cost.' },
  { date: '15 Sep 2026', tag: 'Signed', title: 'Agreement signed by Referee Abroad', body: 'Daniele Curcio signed. Signatures are shared and final for everyone opening the link.' },
  { date: '14 Sep 2026', tag: 'Signed', title: 'Agreement signed by Reemo', body: 'Maarten ter Velde signed. Shared signing went live, backed by Upstash so all parties see who signed.' },
  { date: '12 Sep 2026', tag: 'Doc', title: 'Commercial offer & agreement published', body: 'Phase 1 offer and the full agreement went online, behind a password so pricing stays private.' },
  { date: '10 Sep 2026', tag: 'Shipped', title: 'Clickable prototype: Tournament Command Centre', body: 'Admin dashboard shell with all sections: tournaments, referees, staff, communication, P&L and analytics.' },
  { date: '8 Sep 2026', tag: 'Shipped', title: 'Clickable prototype: Referee webapp', body: 'Mobile-first screens for tournaments, detail, documents, profile and chats on a hosted preview.' },
  { date: '5 Sep 2026', tag: 'Doc', title: 'Architecture & rollout plan delivered', body: 'Analysis of the current WordPress and WooCommerce setup, target architecture and the phased rollout.' },
]

export default function ProgressLog() {
  return (
    <div
      className="min-h-screen text-ink font-sans"
      style={{
        backgroundImage: 'linear-gradient(rgba(244,245,244,0.7), rgba(244,245,244,0.72)), url(img/hub-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-3xl mx-auto px-5 py-10">
        <Link to="/phase1" className="inline-flex items-center gap-1.5 text-brand-dark font-semibold text-sm mb-8">
          <ArrowLeft size={17} /> Back to Fase 1
        </Link>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Logo size={40} showText textClass="text-lg" />
          <span className="text-xs font-bold uppercase tracking-wide bg-brand-light text-brand-dark px-3 py-1 rounded-full">Progress log</span>
        </div>

        <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold leading-tight flex items-center gap-3">
          <Activity size={30} className="text-brand-dark" /> Progress log
        </h1>
        <p className="mt-2 text-neutral-600 font-medium max-w-2xl">
          What shipped and when. Newest first.
        </p>

        <div className="mt-8 relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-neutral-200" aria-hidden="true" />
          <div className="space-y-4">
            {log.map((e, i) => (
              <div key={i} className="relative pl-8">
                <span className="absolute left-0 top-2 w-4 h-4 rounded-full bg-brand border-2 border-white shadow" />
                <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-card">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-neutral-400 tabular-nums">{e.date}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${tagStyles[e.tag]}`}>{e.tag}</span>
                  </div>
                  <h2 className="mt-1.5 font-bold text-base leading-tight">{e.title}</h2>
                  <p className="mt-1 text-sm font-medium text-neutral-600">{e.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-xs text-neutral-400 font-medium leading-relaxed">
          Internal build log for Phase 1. New entries are added here as work ships.
        </p>
      </div>
    </div>
  )
}
