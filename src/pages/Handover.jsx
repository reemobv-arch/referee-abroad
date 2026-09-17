import { Link } from 'react-router-dom'
import { ArrowLeft, PackageCheck, KeyRound, Boxes, Rocket, LifeBuoy, ShieldCheck, Check } from 'lucide-react'
import Logo from '../components/Logo.jsx'

const sections = [
  {
    icon: KeyRound, kicker: 'From you', title: 'Access we need',
    desc: 'Status per item. Updated 17 Sept 2026.',
    items: [
      { t: 'Dedicated WordPress admin account for Reemo', status: 'received' },
      { t: 'WordPress REST API with an application password', status: 'received' },
      { t: 'WooCommerce API keys with read and write access', status: 'received' },
      { t: 'Hosting and deploy access, and the webapp domain', status: 'progress', note: 'Vercel + GitHub, app subdomain — being set up' },
      { t: 'Staging copy of the WordPress site', status: 'pending', note: 'SiteGround — awaiting the hosting owner' },
      { t: 'LLM API key on Referee Abroad’s own account', status: 'pending' },
      { t: 'Mailbox access for the inbox addresses', status: 'pending' },
      { t: 'Brand assets and sample tournament data', status: 'pending' },
    ],
  },
  {
    icon: Boxes, kicker: 'You receive', title: 'Deliverables at handover',
    desc: 'Everything that makes up the Phase 1 platform.',
    items: [
      'Production referee webapp on your domain',
      'Tournament Command Centre for the organisation',
      'Referee appointing system',
      'AI communication assistant: chatbot and smart inbox',
      'WordPress and WooCommerce integration with two-way sync',
      'Full source code in your own repository',
      'Admin accounts for the team',
      'Documentation: setup, deploy and day-to-day use',
    ],
  },
  {
    icon: Rocket, kicker: 'Go-live', title: 'Launch checklist',
    desc: 'The final steps before and during go-live.',
    items: [
      'Final QA across devices and browsers',
      'Deploy to production',
      'Point the domain and check certificates',
      'Smoke test: apply, pay and order lands in WordPress',
      'Smoke test: appointment, push and visible in the app',
      'Monitoring and error logging switched on',
      'Team walkthrough of the Command Centre',
    ],
  },
  {
    icon: LifeBuoy, kicker: 'After go-live', title: 'Support & maintenance',
    desc: 'How we keep the platform healthy after launch.',
    items: [
      'Two weeks of free defect fixing after go-live',
      'Then two hours of monthly maintenance: updates, monitoring and support',
      'Routine plugin and core updates covered by maintenance',
      'Automatic sync retries and activity logs for troubleshooting',
      'Additional work outside the scope is quoted separately',
    ],
  },
  {
    icon: ShieldCheck, kicker: 'Ownership', title: 'Ownership & data',
    desc: 'Who owns what after Phase 1.',
    items: [
      'Intellectual property in the delivered code transfers on full payment',
      'Third-party and open-source components keep their own licenses',
      'WordPress remains the source of truth for data in Phase 1',
      'Personal data handled per GDPR, with a data processing agreement where needed',
    ],
  },
]

export default function Handover() {
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
          <span className="text-xs font-bold uppercase tracking-wide bg-brand-light text-brand-dark px-3 py-1 rounded-full">Handover</span>
        </div>

        <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold leading-tight flex items-center gap-3">
          <PackageCheck size={30} className="text-brand-dark" /> Handover
        </h1>
        <p className="mt-2 text-neutral-600 font-medium max-w-2xl">
          What we need from you, what you receive, and how we go live and keep it running.
        </p>

        <div className="mt-8 space-y-3">
          {sections.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.title} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-card">
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-xl bg-brand-light text-brand-dark flex items-center justify-center shrink-0"><Icon size={20} /></span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-brand-dark">{s.kicker}</p>
                    <h2 className="text-lg font-extrabold leading-tight">{s.title}</h2>
                    <p className="mt-0.5 text-[12px] font-medium text-neutral-500">{s.desc}</p>
                  </div>
                </div>
                <ul className="mt-3 grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
                  {s.items.map((raw, i) => {
                    const it = typeof raw === 'string' ? { t: raw } : raw
                    const meta = {
                      received: { chip: 'bg-brand-light text-brand-dark', label: 'Received' },
                      progress: { chip: 'bg-amber-100 text-amber-700', label: 'In progress' },
                      pending: { chip: 'bg-neutral-100 text-neutral-500', label: 'Pending' },
                    }[it.status]
                    return (
                      <li key={i} className="flex gap-2 text-[13px] text-neutral-700 font-medium items-start">
                        {it.status === 'received'
                          ? <span className="w-4 h-4 rounded-md bg-brand text-white flex items-center justify-center shrink-0 mt-0.5"><Check size={11} /></span>
                          : <span className="w-4 h-4 rounded-md border-2 border-brand/50 shrink-0 mt-0.5" />}
                        <span className="flex-1 min-w-0">
                          {it.t}
                          {it.note && <span className="block text-[11px] text-neutral-400 font-medium">{it.note}</span>}
                        </span>
                        {meta && <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0 ${meta.chip}`}>{meta.label}</span>}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>

        <p className="mt-8 text-xs text-neutral-400 font-medium leading-relaxed">
          This handover follows the commercial offer and the agreement. Phase 2, the full Tournament Command Centre, an own database and a new website, is scoped separately.
        </p>
      </div>
    </div>
  )
}
