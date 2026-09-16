import { useState } from 'react'
import { Check } from 'lucide-react'
import { TopBar } from '../components/ui.jsx'

function Toggle({ on, onClick }) {
  return (
    <button onClick={onClick} className={`w-11 h-7 rounded-full transition relative flex-none ${on ? 'bg-brand' : 'bg-neutral-300'}`} role="switch" aria-checked={on}>
      <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition ${on ? 'left-[22px]' : 'left-1'}`} />
    </button>
  )
}

const ROWS = [
  { key: 'appointments', label: 'Appointments', sub: 'New and changed match appointments' },
  { key: 'messages', label: 'Messages', sub: 'Chats from the organisation and groups' },
  { key: 'documents', label: 'Documents', sub: 'When a document needs your attention' },
  { key: 'payments', label: 'Payments', sub: 'Payment confirmations and reminders' },
]

export default function NotificationPrefs() {
  const [push, setPush] = useState({ appointments: true, messages: true, documents: true, payments: false })
  const [email, setEmail] = useState({ appointments: true, messages: false, documents: true, payments: true })
  const [saved, setSaved] = useState(false)
  const flip = (setter) => (key) => { setter((s) => ({ ...s, [key]: !s[key] })); setSaved(false) }

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-8">
      <TopBar title="Notifications" back />
      <div className="px-4 pt-4">
        <Section title="Push notifications" rows={ROWS} state={push} onFlip={flip(setPush)} />
        <div className="mt-6" />
        <Section title="Email" rows={ROWS} state={email} onFlip={flip(setEmail)} />

        <button onClick={() => setSaved(true)} className="mt-6 w-full h-12 rounded-full bg-brand text-white font-bold flex items-center justify-center gap-2 active:scale-[0.99]">
          {saved ? <><Check size={17} /> Saved</> : 'Save preferences'}
        </button>
      </div>
    </div>
  )
}

function Section({ title, rows, state, onFlip }) {
  return (
    <div>
      <p className="text-sm font-extrabold text-ink mb-2.5">{title}</p>
      <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center gap-3 px-4 py-3.5">
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-ink">{r.label}</p>
              <p className="text-[12px] font-medium text-neutral-500">{r.sub}</p>
            </div>
            <Toggle on={state[r.key]} onClick={() => onFlip(r.key)} />
          </div>
        ))}
      </div>
    </div>
  )
}
