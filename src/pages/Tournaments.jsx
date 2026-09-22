import { useState } from 'react'
import { Search } from 'lucide-react'
import { TopBar } from '../components/ui.jsx'
import TournamentCard from '../components/TournamentCard.jsx'
import { tournaments } from '../data.js'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'applied', label: 'Applied' },
  { key: 'going', label: "Going" },
]
const isConfirmed = (t) => t.status === 'confirmed' || t.status === 'approved'

export default function Tournaments() {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')

  const query = q.trim().toLowerCase()
  const list = tournaments.filter((t) => {
    const okFilter =
      filter === 'all' ? true
      : filter === 'open' ? !t.applied
      : filter === 'going' ? (t.applied && isConfirmed(t))
      : /* applied */ (t.applied && !isConfirmed(t))
    const okText = !query || `${t.name} ${t.city} ${t.country}`.toLowerCase().includes(query)
    return okFilter && okText
  })

  return (
    <div className="pb-4">
      <TopBar title="Tournaments" />
      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 bg-white rounded-2xl border border-neutral-200 px-4 h-12">
          <Search size={18} className="text-neutral-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tournaments or country" className="flex-1 bg-transparent outline-none text-[15px] font-medium placeholder:text-neutral-400" />
        </div>

        <div className="flex gap-2 mt-3">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`h-9 px-4 rounded-full text-[13px] font-bold transition ${filter === f.key ? 'bg-brand text-white' : 'bg-white border border-neutral-200 text-neutral-500'}`}>
              {f.label}
            </button>
          ))}
        </div>

        <p className="text-[12px] font-semibold text-neutral-400 mt-4 mb-3">{list.length} {list.length === 1 ? 'tournament' : 'tournaments'}</p>
        <div className="space-y-4">
          {list.map((t) => <TournamentCard key={t.id} t={t} />)}
          {list.length === 0 && <p className="text-center text-neutral-400 font-semibold py-10">No tournaments match your search.</p>}
        </div>
      </div>
    </div>
  )
}
