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
    <div className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-card">
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${cls}`}>
        <Icon size={18} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-ink truncate">{d.name}</p>
        <p className="text-[11px] text-neutral-500 font-medium">{d.meta}</p>
      </div>
      <button aria-label="Download" className="text-brand active:scale-90">
        <Download size={19} />
      </button>
    </div>
  )
}

export default function Documents() {
  const withDocs = tournaments.filter((t) => t.documents?.length)
  return (
    <div className="pb-4">
      <TopBar title="Documents" />
      <div className="px-4 pt-4 space-y-5">
        {withDocs.map((t) => (
          <section key={t.id}>
            <h2 className="text-xs font-bold text-neutral-500 mb-2">{t.name}</h2>
            <div className="space-y-2.5">
              {t.documents.map((d, i) => (
                <DocRow key={i} d={d} />
              ))}
            </div>
          </section>
        ))}
        <section>
          <h2 className="text-xs font-bold text-neutral-500 mb-2">General</h2>
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
