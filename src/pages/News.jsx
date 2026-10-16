import { useEffect, useState } from 'react'
import { Megaphone } from 'lucide-react'
import { TopBar } from '../components/ui.jsx'
import { getNews } from '../lib/dataSource.js'

export default function News() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    getNews()
      .then((n) => { if (alive) setNews(n) })
      .catch((e) => { if (alive) setError(e.message || 'Could not load news') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  return (
    <div className="pb-4">
      <TopBar title="News" back />
      <div className="px-4 pt-4 space-y-3">
        {loading && [0, 1, 2].map((i) => <div key={i} className="h-28 rounded-2xl bg-white border border-neutral-200 animate-pulse" />)}
        {!loading && error && <p className="text-center text-neutral-500 font-semibold py-10">{error}</p>}
        {!loading && !error && news.length === 0 && <p className="text-center text-neutral-500 font-semibold py-10">No news yet.</p>}
        {!loading && news.map((n) => (
          <article key={n.id} className="bg-white rounded-2xl p-4 shadow-card">
            <div className="flex items-start justify-between">
              <span className="w-10 h-10 rounded-2xl bg-sky-100 flex items-center justify-center">
                <Megaphone size={18} className="text-brand" />
              </span>
              {n.ago && <span className="text-[11px] text-neutral-500 font-semibold">{n.ago}</span>}
            </div>
            <h3 className="mt-2.5 text-[16px] font-extrabold text-ink">{n.title}</h3>
            <p className="text-[14px] text-neutral-500 font-medium leading-relaxed mt-1">{n.body}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
