import { Download, FileText, Ticket, Shirt, FileType } from 'lucide-react'
import { TopBar } from '../components/ui.jsx'
import { tournaments, generalDocs } from '../data.js'

const iconFor = {
  pdf: { Icon: FileType, cls: 'bg-red-50 text-red-600' },
  ticket: { Icon: Ticket, cls: 'bg-brand-light text-brand-dark' },
  doc: { Icon: FileText, cls: 'bg-sky-100 text-sky-700' },
  shirt: { Icon: Shirt, cls: 'bg-amber-100 text-amber-700' },
}

function DocRow({ d }) {
  const { Icon, cls } = iconFor[d.type] || iconFor.doc
  return (
    <div className="flex items-center gap-3.5 bg-white rounded-2xl border border-neutral-200 p-3.5">
      <span className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-none ${cls}`}>
        <Icon size={20} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold text-ink truncate">{d.name}</p>
        <p className="text-[12px] text-neutral-500 font-semibold">{d.meta}</p>
      </div>
      <button aria-label="Download" className="w-10 h-10 rounded-xl bg-page text-brand-dark flex items-center justify-center active:scale-90">
        <Download size={19} />
      </button>
    </div>
  )
}

export default function Documents() {
  const withDocs = tournaments.filter((t) => t.documents?.length)
  return (
    <div className="pb-4">
      <TopBar title="Documents" back />
      <div className="px-4 pt-4 space-y-6">
        {withDocs.map((t) => (
          <section key={t.id}>
            <h2 className="text-sm font-extrabold text-ink mb-2.5">{t.name}</h2>
            <div className="space-y-2.5">
              {t.documents.map((d, i) => (
                <DocRow key={i} d={d} />
              ))}
            </div>
          </section>
        ))}
        <section>
          <h2 className="text-sm font-extrabold text-ink mb-2.5">General</h2>
          <div className="space-y-2.5">
            {generalDocs.map((d, i) => (
              <DocRow key={i} d={d} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
