import { useState } from 'react'
import { Download, FileText, Ticket, Shirt, FileType, PenLine, Check, Upload, Plus } from 'lucide-react'
import { TopBar } from '../components/ui.jsx'
import { tournaments, generalDocs, ownDocuments } from '../data.js'

const iconFor = {
  pdf: { Icon: FileType, cls: 'bg-red-50 text-red-600' },
  ticket: { Icon: Ticket, cls: 'bg-brand-light text-brand-dark' },
  doc: { Icon: FileText, cls: 'bg-sky-100 text-sky-700' },
  shirt: { Icon: Shirt, cls: 'bg-amber-100 text-amber-700' },
}

const statusChip = {
  approved: 'bg-brand-light text-brand-dark',
  signed: 'bg-brand-light text-brand-dark',
  submitted: 'bg-sky-100 text-sky-700',
  'to sign': 'bg-amber-100 text-amber-700',
  required: 'bg-amber-100 text-amber-700',
}

function StatusPill({ status }) {
  return <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${statusChip[status] || 'bg-neutral-100 text-neutral-500'}`}>{status}</span>
}

function DocRow({ d, onSign }) {
  const { Icon, cls } = iconFor[d.type] || iconFor.doc
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-3.5">
      <div className="flex items-center gap-3.5">
        <span className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-none ${cls}`}><Icon size={20} /></span>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-ink truncate">{d.name}</p>
          <p className="text-[12px] text-neutral-500 font-semibold">{d.meta}</p>
        </div>
        {d.status && <StatusPill status={d.status} />}
        <button aria-label="Download" className="w-10 h-10 rounded-xl bg-page text-brand-dark flex items-center justify-center active:scale-90 flex-none">
          <Download size={18} />
        </button>
      </div>
      {d.needsSign && d.status === 'to sign' && (
        <button onClick={onSign} className="mt-3 w-full h-11 rounded-full bg-brand text-white font-bold flex items-center justify-center gap-2 active:scale-[0.99]">
          <PenLine size={16} /> Sign now
        </button>
      )}
      {d.needsSign && d.status === 'signed' && (
        <p className="mt-2 text-[12px] font-bold text-brand-dark flex items-center gap-1.5"><Check size={14} /> Signed just now</p>
      )}
    </div>
  )
}

export default function Documents() {
  const [signed, setSigned] = useState({})
  const [own, setOwn] = useState(ownDocuments)
  const withDocs = tournaments.filter((t) => t.documents?.length)

  const sign = (name) => setSigned((s) => ({ ...s, [name]: true }))
  const applyStatus = (d) => (d.needsSign && signed[d.name] ? { ...d, status: 'signed' } : d)
  const upload = () => setOwn((o) => [...o, { name: `Document ${o.length + 1}.pdf`, meta: 'Uploaded just now', type: 'doc', status: 'submitted' }])

  return (
    <div className="pb-6">
      <TopBar title="Documents" back />
      <div className="px-4 pt-4 space-y-6">
        {withDocs.map((t) => (
          <section key={t.id}>
            <h2 className="text-sm font-extrabold text-ink mb-2.5">{t.name}</h2>
            <div className="space-y-2.5">
              {t.documents.map((d, i) => {
                const dd = applyStatus(d)
                return <DocRow key={i} d={dd} onSign={() => sign(d.name)} />
              })}
            </div>
          </section>
        ))}

        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-extrabold text-ink">Your documents</h2>
            <button onClick={upload} className="text-brand-dark text-[13px] font-bold inline-flex items-center gap-1"><Plus size={14} /> Upload</button>
          </div>
          <div className="space-y-2.5">
            {own.map((d, i) => <DocRow key={i} d={d} />)}
            <button onClick={upload} className="w-full rounded-2xl border-2 border-dashed border-neutral-300 text-neutral-400 hover:text-brand-dark hover:border-brand py-4 flex flex-col items-center gap-1 transition">
              <Upload size={22} />
              <span className="text-[13px] font-bold">Upload passport, certificate…</span>
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-extrabold text-ink mb-2.5">General</h2>
          <div className="space-y-2.5">
            {generalDocs.map((d, i) => <DocRow key={i} d={d} />)}
          </div>
        </section>
      </div>
    </div>
  )
}
