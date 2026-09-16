import { Megaphone } from 'lucide-react'
import { TopBar } from '../components/ui.jsx'
import { news } from '../data.js'

export default function News() {
  return (
    <div className="pb-4">
      <TopBar title="News" />
      <div className="px-4 pt-4 space-y-3">
        {news.map((n) => (
          <article key={n.id} className="bg-white rounded-2xl p-4 shadow-card">
            <div className="flex items-start justify-between">
              <span className="w-10 h-10 rounded-2xl bg-sky-100 flex items-center justify-center">
                <Megaphone size={18} className="text-brand" />
              </span>
              <span className="text-[11px] text-neutral-400 font-semibold">{n.ago}</span>
            </div>
            <h3 className="mt-2.5 text-[16px] font-extrabold text-ink">{n.title}</h3>
            <p className="text-[14px] text-neutral-500 font-medium leading-relaxed mt-1">{n.body}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
