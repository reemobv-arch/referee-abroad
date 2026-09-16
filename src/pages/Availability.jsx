import { useState } from 'react'
import { Check } from 'lucide-react'
import { TopBar } from '../components/ui.jsx'
import { availabilityMonths } from '../data.js'

const OPTS = [
  { key: 'available', label: 'Available', on: 'bg-brand text-white' },
  { key: 'maybe', label: 'Maybe', on: 'bg-amber-400 text-amber-950' },
  { key: 'unavailable', label: 'No', on: 'bg-neutral-300 text-neutral-700' },
]

export default function Availability() {
  const [months, setMonths] = useState(availabilityMonths)
  const [saved, setSaved] = useState(false)
  const set = (key, state) => { setMonths((m) => m.map((x) => x.key === key ? { ...x, state } : x)); setSaved(false) }

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-8">
      <TopBar title="Availability" back />
      <div className="px-4 pt-4">
        <p className="text-[15px] font-semibold text-neutral-500 leading-relaxed">
          Let the team know when you can referee. This helps them appoint you to the right tournaments.
        </p>

        <div className="mt-5 space-y-3">
          {months.map((m) => (
            <div key={m.key} className="bg-white rounded-2xl border border-neutral-200 p-4">
              <p className="text-[15px] font-extrabold text-ink mb-3">{m.label}</p>
              <div className="grid grid-cols-3 gap-2">
                {OPTS.map((o) => (
                  <button
                    key={o.key}
                    onClick={() => set(m.key, o.key)}
                    className={`h-10 rounded-xl text-[13px] font-bold transition ${m.state === o.key ? o.on : 'bg-page text-neutral-500'}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => setSaved(true)} className="mt-5 w-full h-12 rounded-full bg-brand text-white font-bold flex items-center justify-center gap-2 active:scale-[0.99]">
          {saved ? <><Check size={17} /> Saved</> : 'Save availability'}
        </button>
      </div>
    </div>
  )
}
