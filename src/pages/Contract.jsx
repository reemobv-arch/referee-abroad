import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import offer from '../offerData.js'

const euro = (n) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

export default function Contract() {
  const c = offer && offer.contract
  if (!offer || !c) {
    return (
      <div className="min-h-screen bg-page text-ink font-sans flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <Logo size={56} showText textClass="text-xl" />
          <p className="mt-6 text-neutral-500 font-medium">The contract is not available in this environment.</p>
          <Link to="/" className="mt-4 inline-flex items-center gap-1.5 text-brand-dark font-semibold text-sm">
            <ArrowLeft size={16} /> Back to hub
          </Link>
        </div>
      </div>
    )
  }

  const clauses = [
    ['Scope', 'Reemo develops Phase 1 of the Referee Abroad platform as described in the commercial offer: the referee webapp, the Tournament Command Centre, the referee appointing system, and integration, testing and launch.'],
    ['Fee', `Referee Abroad pays a single agreed fee of ${euro(offer.friendly)} excluding VAT for Phase 1. Invoicing in two parts: 50% on start and 50% on delivery.`],
    ['Maintenance', `After launch, Reemo provides ${euro(offer.maintenanceNew)} per month excluding VAT for two hours of updates, monitoring and support. Monthly and cancellable with one month notice.`],
    ['Timeline', 'Work starts after signing. The indicative duration follows the commercial offer.'],
    ['Intellectual property', 'On full payment, the delivered source code and designs transfer to Referee Abroad. Reemo may reuse generic building blocks that are not specific to Referee Abroad.'],
    ['Data', 'In Phase 1 WordPress remains the source of truth. Reemo handles all data with care and in line with applicable privacy rules.'],
    ['Confidentiality', 'Both parties keep shared business and technical information confidential.'],
    ['Liability', 'The liability of Reemo is limited to the fees paid for Phase 1. Reemo is not liable for indirect or consequential damages.'],
    ['Term and law', 'This agreement runs until Phase 1 is delivered and accepted. Maintenance continues monthly until cancelled. Governing law and competent court to be agreed by both parties.'],
  ]

  const SignBlock = ({ label, name, role }) => (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="mt-1 font-bold text-ink">{name}</p>
      {role && <p className="text-xs text-neutral-500 font-medium">{role}</p>}
      <div className="mt-8 border-t border-neutral-300" />
      <div className="flex justify-between text-[11px] text-neutral-400 font-medium mt-1">
        <span>Signature</span><span>Date</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-page text-ink font-sans">
      <div className="max-w-3xl mx-auto px-5 py-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-brand-dark font-semibold text-sm mb-8">
          <ArrowLeft size={17} /> Back to hub
        </Link>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Logo size={40} showText textClass="text-lg" />
          <span className="text-xs font-bold uppercase tracking-wide bg-amber-100 text-amber-700 px-3 py-1 rounded-full">Draft</span>
        </div>

        <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold leading-tight">Development agreement</h1>
        <p className="mt-2 text-neutral-500 font-medium">Phase 1 of the Referee Abroad platform, between the parties below.</p>

        <div className="mt-6 grid sm:grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-neutral-200 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Provider</p>
            <p className="mt-1 font-bold text-ink">Reemo</p>
            <p className="text-sm text-neutral-500 font-medium">Software studio · reemo.nl</p>
          </div>
          <div className="bg-white rounded-2xl border border-neutral-200 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Client</p>
            <p className="mt-1 font-bold text-ink">{c.clientName}</p>
            <p className="text-sm text-neutral-500 font-medium">{c.clientDetail}</p>
          </div>
        </div>

        <ol className="mt-6 space-y-3">
          {clauses.map(([title, body], i) => (
            <li key={i} className="bg-white rounded-2xl border border-neutral-200 p-4">
              <p className="font-bold text-ink text-sm">{i + 1}. {title}</p>
              <p className="mt-1 text-sm text-neutral-600 font-medium leading-relaxed">{body}</p>
            </li>
          ))}
        </ol>

        <h2 className="mt-8 text-lg font-bold text-ink">Signatures</h2>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          <SignBlock label="For Reemo" name="Reemo representative" role="reemo.nl" />
          {c.signatories.map((s, i) => (
            <SignBlock key={i} label="For Referee Abroad" name={s.name} role={s.role} />
          ))}
        </div>

        <p className="mt-6 text-xs text-neutral-400 font-medium leading-relaxed">
          This is a draft template prepared by Reemo, not legal advice. Please have it reviewed by a legal advisor and complete the remaining organisation and legal details before signing.
        </p>
      </div>
    </div>
  )
}
