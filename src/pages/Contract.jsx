import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Download, Eraser, Mail } from 'lucide-react'
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

function SignField({ index, label, name, role, onSign }) {
  const ref = useRef(null)
  const savedRef = useRef(false)
  const [saved, setSaved] = useState(false)
  const [date, setDate] = useState('')
  const [hint, setHint] = useState('')

  useEffect(() => {
    const canvas = ref.current
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
    const down = (e) => { if (savedRef.current) return; drawing = true; last = pos(e); setHint(''); e.preventDefault() }
    const move = (e) => {
      if (!drawing || savedRef.current) return
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

  const hasInk = () => {
    const cv = ref.current
    const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data
    for (let j = 3; j < d.length; j += 4) { if (d[j] > 0) return true }
    return false
  }
  const clear = () => { const cv = ref.current; cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); setHint('') }
  const save = () => {
    if (!hasInk()) { setHint('Draw your signature first.'); return }
    savedRef.current = true
    setSaved(true)
    setDate(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }))
    onSign(index, ref.current.toDataURL('image/png'))
  }
  const edit = () => { savedRef.current = false; setSaved(false); onSign(index, null) }

  return (
    <div className={`rounded-2xl border p-4 ${saved ? 'bg-brand-light border-brand/40' : 'bg-white border-neutral-200'}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="mt-1 font-bold text-ink text-sm">{name}</p>
      {role && <p className="text-xs text-neutral-500 font-medium">{role}</p>}
      <div className="relative mt-2">
        <canvas
          ref={ref}
          width={520}
          height={130}
          className={`w-full h-[100px] rounded-xl border bg-white touch-none ${saved ? 'border-brand/40' : 'border-neutral-200 cursor-crosshair'}`}
        />
        {saved && <span className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wide bg-brand text-white px-2 py-0.5 rounded-full">Saved</span>}
      </div>
      <div className="mt-2 flex items-center justify-between no-print min-h-[20px]">
        {saved ? (
          <>
            <span className="text-[11px] font-semibold text-brand-dark">Signed · {date}</span>
            <button type="button" onClick={edit} className="text-[11px] font-semibold text-neutral-500">Edit</button>
          </>
        ) : (
          <>
            <button type="button" onClick={clear} className="text-[11px] font-semibold text-neutral-500 inline-flex items-center gap-1">
              <Eraser size={12} /> Clear
            </button>
            <button type="button" onClick={save} className="text-xs font-bold text-white bg-brand px-3 py-1 rounded-full">Save</button>
          </>
        )}
      </div>
      {hint && <p className="text-[11px] font-semibold text-red-500 no-print">{hint}</p>}
    </div>
  )
}

export default function Contract() {
  const [signedDate, setSignedDate] = useState('')
  const [sigs, setSigs] = useState({})
  const [sending, setSending] = useState(false)
  const [sendMsg, setSendMsg] = useState('')

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
    ['Scope & work', 'Phase 1 delivers the referee webapp, the Tournament Command Centre, the referee appointing system, and the integration, testing and launch, all built on the phased setup described in the architecture and rollout plan in the commercial offer. Phase 2 is not part of this agreement and is quoted separately. Work not listed in the offer is additional work under the additional work clause.'],
    ['Collaboration & client responsibilities', 'The provider works in short iterations and shares progress regularly. The client appoints one contact person and provides content, access, credentials and approvals in good time. Delays caused by the client shift the planning and may lead to additional work.'],
    ['Term & planning', 'Work starts in mutual agreement after signing. The indicative duration follows the commercial offer and depends on timely input from the client.'],
    ['Delivery & acceptance', 'Deliverables are made available for review. The client tests within a reasonable period, indicatively 10 working days. Work is accepted when the client approves it, starts using it in production, or lets the review period pass without a substantiated objection. Acceptance of the final delivery triggers the final invoice.'],
    ['Warranty', 'For two weeks after go live, the provider fixes defects in the delivered Phase 1 work free of charge. A defect is a demonstrable deviation from the agreed functionality. New wishes, changes and functionality outside the agreed scope are additional work. After this period, corrections fall under the monthly maintenance or additional work.'],
    ['Fee & invoicing', `For Phase 1 the client pays a single agreed fee of ${fee} excluding VAT, invoiced in two parts: 50% on start and 50% on delivery. Invoices are due within 14 days. If an invoice is not paid on time, the provider may charge statutory interest and suspend the work and the maintenance until payment is received. The offer prices are valid for 30 days. The monthly maintenance fee may be indexed once a year.`],
    ['Third party costs & services', 'Costs of third parties are not included in the fee and are borne by the client, including hosting, domains, the payment provider fees, the push notification service, and any plugins or licenses. The provider advises on these but does not carry their cost.'],
    ['Changes & additional work', `Changes to the scope are agreed in writing, where email is sufficient. Additional work outside the agreed scope is charged at ${addRate} per hour excluding VAT and is separate from and not included in the monthly maintenance. Changes required because third party platforms change, such as WordPress, WooCommerce or their APIs, are also additional work.`],
    ['Support & maintenance', 'After launch, the maintenance covers two hours per month of updates, monitoring and support during business hours. There is no 24/7 guarantee. The provider aims to respond within one business day. Unused hours do not carry over. Work beyond the two hours is additional work.'],
    ['Privacy & processing of personal data', 'In Phase 1, WordPress remains the source of truth for personal data. The provider processes personal data only on the instructions of the client and in line with the GDPR. Where the provider processes personal data on behalf of the client, the parties enter into a data processing agreement.'],
    ['Security, backups & incidents', 'In Phase 1, backups and platform security are handled through the hosting and WordPress environment, which is the responsibility of the client and its host. The provider works with care and reports any security incident or data breach it becomes aware of without undue delay.'],
    ['Accounts & handover', 'The client owns the hosting, domain, payment provider and other service accounts and their credentials. On request or at the end of the agreement, the provider hands over the delivered source code, access and documentation.'],
    ['Intellectual property', 'On full payment, the intellectual property rights in the delivered source code and designs transfer to the client. Delivered software may include open source or third party components that remain under their own licenses and are not transferred. The provider keeps the right to reuse generic building blocks, methods and libraries that are not specific to Referee Abroad.'],
    ['Confidentiality', 'Both parties keep confidential the business and technical information shared under this agreement and do not share it with third parties without consent, except where required by law.'],
    ['No solicitation of staff', 'During the agreement and for 12 months after it ends, neither party approaches or hires staff or contractors of the other party who were involved in the project, without written consent.'],
    ['Reference & portfolio', 'The provider may mention Referee Abroad as a client and show the delivered work in its portfolio and communication, unless the client objects in writing.'],
    ['Subcontracting & assignment', 'The provider may engage subcontractors while remaining responsible for the result. Neither party transfers this agreement to a third party without the written consent of the other.'],
    ['Liability', 'The liability of the provider is limited to the fees paid for Phase 1. The provider is not liable for indirect or consequential damage, including lost revenue or data. The software is provided without a guarantee of uninterrupted availability: the provider does not guarantee that the platform works without interruption during a tournament or event, and is not liable for any loss or disruption arising from unavailability, errors or downtime during a tournament. The provider is not responsible for downtime or unavailability caused by force majeure or by third parties, such as the hosting, the payment provider or WordPress. The client keeps a suitable fallback for on-site situations. Any claim must be filed within six months after the client became aware of it. This limit does not apply in case of intent or deliberate recklessness.'],
    ['Termination', 'Either party may terminate this agreement in writing with reasonable notice. Work performed and costs incurred up to the end date are invoiced. Maintenance is monthly and cancellable with one month notice.'],
    ['Governing law & disputes', 'The parties first try to resolve any dispute in good faith. This agreement is governed by Dutch law and any dispute is submitted to the competent court in Amsterdam.'],
    ['Final provisions', 'This agreement, together with the commercial offer, forms the complete agreement for Phase 1 and replaces earlier proposals. Changes are valid only in writing. If a provision is invalid, the remaining provisions stay in force.'],
  ]

  const signers = [
    { label: 'For Reemo B.V.', name: c.provider.rep.split(' · ')[0], role: 'Founder' },
    ...c.signatories.map((s) => ({ label: 'For Referee Abroad', name: s.name, role: s.role })),
  ]

  const onSign = (i, url) => setSigs((prev) => ({ ...prev, [i]: url }))
  const allSigned = signers.every((_, i) => !!sigs[i])

  const download = () => {
    setSignedDate(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))
    document.querySelectorAll('details').forEach((d) => { d.open = true })
    setTimeout(() => window.print(), 200)
  }

  const sendCopy = async () => {
    if (!allSigned || sending) return
    setSending(true); setSendMsg('')
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    try {
      const res = await fetch('/api/sign', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ date, signers: signers.map((s, i) => ({ label: s.label, name: s.name, img: sigs[i] })) }),
      })
      const data = await res.json().catch(() => ({}))
      setSendMsg(res.ok ? 'A signed copy has been sent to Reemo.' : (data.error || 'Could not send the copy.'))
    } catch {
      setSendMsg('Could not send the copy.')
    }
    setSending(false)
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

        <div className="flex items-center gap-4 flex-wrap">
          <Logo size={40} showText textClass="text-lg" />
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
          Each party signs in their own field below. A copy is sent to Reemo once all four have signed.
        </p>

        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {signers.map((s, i) => (
            <SignField key={i} index={i} label={s.label} name={s.name} role={s.role} onSign={onSign} />
          ))}
        </div>

        {signedDate
          ? <p className="mt-4 text-sm font-semibold text-brand-dark">Signed on {signedDate}.</p>
          : <p className="mt-4 text-sm font-medium text-neutral-500">Date: ______________</p>}

        <div className="no-print mt-4 flex flex-wrap gap-2">
          <button onClick={download} className="h-11 px-5 rounded-full bg-white border border-neutral-200 text-ink text-sm font-semibold inline-flex items-center gap-1.5">
            <Download size={16} /> Download signed PDF
          </button>
          <button
            onClick={sendCopy}
            disabled={!allSigned || sending}
            className={`h-11 px-5 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 ${allSigned && !sending ? 'bg-brand text-white' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'}`}
          >
            <Mail size={16} /> {sending ? 'Sending…' : 'Send signed copy to Reemo'}
          </button>
        </div>
        {!allSigned && <p className="no-print mt-2 text-xs font-medium text-neutral-500">All four fields must be signed before a copy is sent.</p>}
        {sendMsg && <p className="no-print mt-2 text-sm font-semibold text-brand-dark">{sendMsg}</p>}

        <p className="mt-8 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Reemo · agreement · 2026</p>
      </div>
    </div>
  )
}
