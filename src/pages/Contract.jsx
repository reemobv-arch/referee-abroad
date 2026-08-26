import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Download, Eraser } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import offer from '../offerData.js'

const euro = (n) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

const bgStyle = {
  backgroundImage: 'linear-gradient(rgba(244,245,244,0.58), rgba(244,245,244,0.60)), url(img/doc-bg.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
}

export default function Contract() {
  const canvasRef = useRef(null)
  const [signerName, setSignerName] = useState('')
  const [signed, setSigned] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.lineWidth = 2.2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#17201A'
    let drawing = false
    let last = null
    const pos = (e) => {
      const r = canvas.getBoundingClientRect()
      return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) }
    }
    const down = (e) => { drawing = true; last = pos(e); e.preventDefault() }
    const move = (e) => {
      if (!drawing) return
      const p = pos(e)
      ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke()
      last = p; e.preventDefault()
    }
    const up = () => { drawing = false }
    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [])

  const c = offer && offer.contract
  if (!offer || !c) {
    return (
      <div className="min-h-screen bg-page text-ink font-sans flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <Logo size={56} showText textClass="text-xl" />
          <p className="mt-6 text-neutral-500 font-medium">The agreement is not available in this environment.</p>
          <Link to="/" className="mt-4 inline-flex items-center gap-1.5 text-brand-dark font-semibold text-sm">
            <ArrowLeft size={16} /> Back to hub
          </Link>
        </div>
      </div>
    )
  }

  const fee = euro(offer.friendly)
  const maint = euro(offer.maintenanceNew)
  const addRate = euro(c.additionalRate || 50)

  const clauses = [
    ['Parties & background', 'This agreement is entered into by Reemo B.V. (the provider) and Referee Abroad (the client). Referee Abroad organises international tournaments for referees. The provider designs, builds and maintains the Phase 1 platform described below.'],
    ['Subject of the agreement', 'The provider delivers Phase 1 of the Referee Abroad platform: a mobile referee webapp and an admin Tournament Command Centre, built alongside the existing WordPress and WooCommerce environment, plus ongoing maintenance after launch.'],
    ['Scope & work', 'Phase 1 delivers the referee webapp, the Tournament Command Centre, the referee appointing system, and the integration, testing and launch, all built on the phased setup described in the architecture and rollout plan in the commercial offer. Phase 2 is not part of this agreement and is quoted separately. Work not listed in the offer is additional work under clause 8.'],
    ['Term & planning', 'Work starts in mutual agreement after signing. The indicative duration follows the commercial offer. Planning depends on timely feedback, content and access provided by the client.'],
    ['Way of working & collaboration', 'The provider works in short iterations and shares progress regularly. The client appoints one contact person for decisions, feedback and the delivery of content, access and credentials.'],
    ['Fee & invoicing', `For Phase 1 the client pays a single agreed fee of ${fee} excluding VAT, invoiced in two parts: 50% on start and 50% on delivery. After launch, maintenance is ${maint} per month excluding VAT for two hours of updates, monitoring and support. Invoices are due within 14 days.`],
    ['Privacy & processing of personal data', 'In Phase 1, WordPress remains the source of truth for personal data. The provider processes personal data only on the instructions of the client and in line with the GDPR. Where the provider processes personal data on behalf of the client, the parties enter into a data processing agreement.'],
    ['Changes & additional work', `Changes to the scope are agreed in writing, where email is sufficient. Additional work outside the agreed scope is charged at ${addRate} per hour excluding VAT. This additional work is separate from and not included in the monthly maintenance.`],
    ['Intellectual property', 'On full payment, the intellectual property rights in the delivered source code and designs transfer to the client. The provider keeps the right to reuse generic building blocks, methods and libraries that are not specific to Referee Abroad.'],
    ['Confidentiality', 'Both parties keep confidential the business and technical information shared under this agreement and do not share it with third parties without consent, except where required by law.'],
    ['Liability', 'The liability of the provider is limited to the fees paid for Phase 1. The provider is not liable for indirect or consequential damage, including lost revenue or data. The software is provided without a guarantee of uninterrupted availability: the provider does not guarantee that the platform works without interruption during a tournament or event, and is not liable for any loss or disruption arising from unavailability, errors or downtime during a tournament. The provider is not responsible for downtime or unavailability caused by force majeure or by third parties, such as the hosting, the payment provider or WordPress. The client keeps a suitable fallback for on-site situations. This limit does not apply in case of intent or deliberate recklessness.'],
    ['Termination', 'Either party may terminate this agreement in writing with reasonable notice. Work performed and costs incurred up to the end date are invoiced. Maintenance is monthly and cancellable with one month notice.'],
    ['Governing law & disputes', 'The parties first try to resolve any dispute in good faith. This agreement is governed by Dutch law and any dispute is submitted to the competent court in Amsterdam.'],
    ['Final provisions', 'This agreement, together with the commercial offer, forms the complete agreement for Phase 1 and replaces earlier proposals. Changes are valid only in writing. If a provision is invalid, the remaining provisions stay in force.'],
  ]

  const clearSig = () => {
    const cv = canvasRef.current
    if (cv) cv.getContext('2d').clearRect(0, 0, cv.width, cv.height)
  }

  const handleSign = () => {
    if (!signerName.trim()) { setErr('Please enter your name.'); return }
    setErr('')
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    setSigned({ name: signerName.trim(), date })
    document.querySelectorAll('details').forEach((d) => { d.open = true })
    setTimeout(() => window.print(), 200)
  }

  const Meta = ({ label, value }) => (
    <div className="bg-white/80 rounded-xl border border-neutral-200 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-ink leading-snug">{value}</p>
    </div>
  )

  return (
    <div className="min-h-screen text-ink font-sans print:bg-white" style={bgStyle}>
      <div className="max-w-3xl mx-auto px-5 py-10">
        <Link to="/" className="no-print inline-flex items-center gap-1.5 text-brand-dark font-semibold text-sm mb-8">
          <ArrowLeft size={17} /> Back to hub
        </Link>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Logo size={40} showText textClass="text-lg" />
          <span className="text-xs font-bold uppercase tracking-wide bg-amber-100 text-amber-700 px-3 py-1 rounded-full">Draft</span>
        </div>

        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-dark">Statement of work · Nº {c.sowNo}</p>
        <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold leading-tight">Agreement, Referee Abroad platform</h1>
        <p className="mt-2 text-neutral-600 font-medium max-w-2xl">
          This document sets out the agreement between Reemo B.V. and Referee Abroad for the design, build and ongoing maintenance of the Phase 1 platform: the referee webapp and the Tournament Command Centre.
        </p>

        <div className="mt-6 grid sm:grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-neutral-200 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Provider</p>
            <p className="mt-1 font-bold text-ink">{c.provider.name}</p>
            {c.provider.lines.map((l, i) => <p key={i} className="text-sm text-neutral-500 font-medium">{l}</p>)}
            <p className="text-sm text-neutral-500 font-medium mt-1">Represented by: {c.provider.rep}</p>
            <p className="text-sm text-neutral-500 font-medium">{c.provider.contact}</p>
          </div>
          <div className="bg-white rounded-2xl border border-neutral-200 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Client</p>
            <p className="mt-1 font-bold text-ink">{c.clientName}</p>
            {c.clientLines.map((l, i) => <p key={i} className="text-sm text-neutral-500 font-medium">{l}</p>)}
            <p className="text-sm text-neutral-500 font-medium mt-1">Represented by: {c.signatories.map((s) => s.name).join(', ')}</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Meta label="Project" value="Referee Abroad platform, Phase 1" />
          <Meta label="Date" value={c.date} />
          <Meta label="Start" value="In mutual agreement" />
          <Meta label="Fee" value={`${fee} excl. VAT`} />
        </div>

        <h2 className="mt-8 text-lg font-bold text-ink">The agreement</h2>
        <div className="mt-3 space-y-2">
          {clauses.map(([title, body], i) => (
            <details key={i} className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              <summary className="flex items-center gap-3 p-4 cursor-pointer list-none">
                <span className="text-xs font-bold text-brand-dark tabular-nums w-6">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1 font-bold text-ink text-sm">{title}</span>
                <ChevronDown size={18} className="no-print text-neutral-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="px-4 pb-4 pl-12 text-sm text-neutral-600 font-medium leading-relaxed">{body}</p>
            </details>
          ))}
        </div>

        <h2 className="mt-8 text-lg font-bold text-ink">Approval &amp; signature</h2>
        <p className="text-sm text-neutral-500 font-medium mt-1">
          Signing on behalf of Referee Abroad: {c.signatories.map((s) => s.name).join(', ')}.
        </p>

        <div className="mt-4 bg-white rounded-2xl border border-neutral-200 p-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Full name of signer</label>
              <input
                value={signerName}
                onChange={(e) => { setSignerName(e.target.value); setErr('') }}
                placeholder="Your name"
                className="w-full h-10 px-3 rounded-xl border border-neutral-200 outline-none focus:border-brand text-sm font-medium"
              />
              <p className="text-xs font-semibold text-ink mt-3 mb-1">On behalf of</p>
              <p className="text-sm text-neutral-500 font-medium">Reemo B.V. — {c.provider.rep.split(' · ')[0]}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Signature</label>
              <canvas
                ref={canvasRef}
                width={600}
                height={170}
                className="w-full h-[120px] rounded-xl border border-neutral-200 bg-white touch-none cursor-crosshair"
              />
              <p className="text-[11px] text-neutral-400 font-medium mt-1 no-print">Draw your signature above with the mouse or your finger.</p>
            </div>
          </div>

          {signed && (
            <p className="mt-3 text-sm font-semibold text-brand-dark">Signed by {signed.name} on {signed.date}.</p>
          )}
          {err && <p className="mt-3 text-sm font-semibold text-red-500">{err}</p>}

          <div className="mt-4 flex gap-2 no-print">
            <button onClick={clearSig} className="h-10 px-4 rounded-full border border-neutral-200 text-sm font-semibold text-ink inline-flex items-center gap-1.5">
              <Eraser size={15} /> Clear
            </button>
            <button onClick={handleSign} className="h-10 px-5 rounded-full bg-brand text-white text-sm font-semibold inline-flex items-center gap-1.5">
              <Download size={15} /> Sign &amp; download PDF
            </button>
          </div>
        </div>

        <p className="mt-6 text-xs text-neutral-400 font-medium leading-relaxed">
          This is a draft template prepared by Reemo B.V., not legal advice. Please have it reviewed by a legal advisor and complete the remaining details (registration number) before signing.
        </p>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Reemo · agreement · 2026</p>
      </div>
    </div>
  )
}
