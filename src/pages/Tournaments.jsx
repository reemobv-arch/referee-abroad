import { useMemo, useState } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import TournamentCard from '../components/TournamentCard.jsx'
import ProfileCircle from '../components/ProfileCircle.jsx'
import { tournaments } from '../data.js'
import { REGIONS, regionOf } from '../regions.js'

export default function Tournaments() {
  const [tab, setTab] = useState('all') // 'all' | 'mine'
  const [region, setRegion] = useState(null) // null = region picker, else region key
  const [q, setQ] = useState('')

  const mine = useMemo(() => tournaments.filter((t) => t.applied), [])
  const counts = useMemo(() => {
    const c = { usa: 0, europe: 0, asia: 0 }
    for (const t of tournaments) c[regionOf(t.country)]++
    return c
  }, [])

  const query = q.trim().toLowerCase()
  const inRegion = region ? tournaments.filter((t) => regionOf(t.country) === region) : []
  const regionList = inRegion.filter((t) => !query || `${t.name} ${t.city} ${t.country}`.toLowerCase().includes(query))

  return (
    <div className="pb-4">
      {/* Header with tabs + profile circle */}
      <header className="sticky top-0 z-20 bg-white border-b border-neutral-200">
        <div className="h-14 flex items-center justify-between px-4">
          <h1 className="text-[19px] font-extrabold text-ink">Tournaments</h1>
          <ProfileCircle />
        </div>
        <div className="flex px-4 gap-5">
          {[['all', `Tournaments`], ['mine', `My tournaments`]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setTab(key); setRegion(null); setQ('') }}
              className={`relative pb-2.5 text-[14px] font-bold transition ${tab === key ? 'text-brand-dark' : 'text-neutral-400'}`}
            >
              {label}
              {key === 'mine' && mine.length > 0 && <span className="ml-1 text-[11px] font-bold text-white bg-brand rounded-full px-1.5 py-0.5 align-top">{mine.length}</span>}
              {tab === key && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-brand rounded-full" />}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 pt-4">
        {tab === 'mine' ? (
          <>
            <p className="text-[12px] font-semibold text-neutral-400 mb-3">{mine.length} {mine.length === 1 ? 'tournament' : 'tournaments'} you applied to</p>
            <div className="space-y-4">
              {mine.map((t) => <TournamentCard key={t.id} t={t} />)}
              {mine.length === 0 && <p className="text-center text-neutral-400 font-semibold py-10">You haven’t applied to any tournaments yet.</p>}
            </div>
          </>
        ) : region === null ? (
          /* Region picker */
          <>
            <p className="text-[15px] font-semibold text-neutral-500 mb-4">{tournaments.length} tournaments worldwide. Pick a region to explore.</p>
            <div className="space-y-4">
              {REGIONS.map((r) => (
                <button
                  key={r.key}
                  onClick={() => { setRegion(r.key); setQ('') }}
                  className="relative w-full h-44 rounded-3xl overflow-hidden shadow-card active:scale-[0.99] transition-transform text-left"
                >
                  <div className="absolute inset-0 flex items-center justify-end pr-7 text-[132px] leading-none opacity-95 select-none" aria-hidden="true">{r.flag}</div>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
                  <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
                    <div>
                      <p className="text-2xl font-extrabold leading-tight">{r.label}</p>
                      <p className="text-[13px] font-semibold text-white/85">{r.blurb}</p>
                    </div>
                    <span className="text-[13px] font-bold inline-flex items-center gap-1">{counts[r.key]} tournaments <ChevronRight size={16} /></span>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          /* Region list */
          <>
            <button onClick={() => { setRegion(null); setQ('') }} className="inline-flex items-center gap-1 text-brand-dark font-bold text-[14px] mb-3"><ChevronLeft size={18} /> All regions</button>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[26px] leading-none">{REGIONS.find((r) => r.key === region).flag}</span>
              <h2 className="text-xl font-extrabold text-ink">{REGIONS.find((r) => r.key === region).label}</h2>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-2xl border border-neutral-200 px-4 h-12">
              <Search size={18} className="text-neutral-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tournaments or city" className="flex-1 bg-transparent outline-none text-[15px] font-medium placeholder:text-neutral-400" />
            </div>
            <p className="text-[12px] font-semibold text-neutral-400 mt-4 mb-3">{regionList.length} {regionList.length === 1 ? 'tournament' : 'tournaments'}</p>
            <div className="space-y-4">
              {regionList.map((t) => <TournamentCard key={t.id} t={t} />)}
              {regionList.length === 0 && <p className="text-center text-neutral-400 font-semibold py-10">No tournaments match your search.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
