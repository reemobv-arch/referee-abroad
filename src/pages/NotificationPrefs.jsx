import { useEffect, useState } from 'react'
import { Check, BellRing, BellOff } from 'lucide-react'
import { TopBar } from '../components/ui.jsx'
import { pushSupported, getPushState, enablePush, disablePush } from '../lib/dataSource.js'

function Toggle({ on, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`w-11 h-7 rounded-full transition relative flex-none ${on ? 'bg-brand' : 'bg-neutral-300'} ${disabled ? 'opacity-50' : ''}`} role="switch" aria-checked={on}>
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

// Real device-level Web Push subscription (separate from the per-category
// preferences below). Subscribes with the server VAPID key and stores it.
function DevicePush() {
  const [state, setState] = useState('off') // unsupported | denied | off | subscribed | busy
  useEffect(() => { getPushState().then(setState) }, [])

  const toggle = async () => {
    if (state === 'busy' || state === 'unsupported' || state === 'denied') return
    setState('busy')
    setState(state === 'subscribed' ? await disablePush() : await enablePush())
  }

  const on = state === 'subscribed'
  const note = state === 'unsupported' ? 'This browser does not support push notifications.'
    : state === 'denied' ? 'Blocked in your browser settings. Allow notifications for this site to turn them on.'
    : on ? 'You will get appointments and messages on this device.'
    : 'Turn on to get appointments and messages, even when the app is closed.'

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex items-center gap-3 mb-3">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-none ${on ? 'bg-brand-light text-brand-dark' : 'bg-neutral-100 text-neutral-500'}`}>
        {on ? <BellRing size={20} /> : <BellOff size={20} />}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold text-ink">Push on this device</p>
        <p className="text-[12px] font-medium text-neutral-500">{note}</p>
      </div>
      <Toggle on={on} onClick={toggle} disabled={state === 'busy' || state === 'unsupported' || state === 'denied'} />
    </div>
  )
}

export default function NotificationPrefs() {
  const [push, setPush] = useState({ appointments: true, messages: true, documents: true, payments: false })
  const [email, setEmail] = useState({ appointments: true, messages: false, documents: true, payments: true })
  const [saved, setSaved] = useState(false)
  const flip = (setter) => (key) => { setter((s) => ({ ...s, [key]: !s[key] })); setSaved(false) }

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-8">
      <TopBar title="Notifications" back />
      <div className="px-4 pt-4">
        <p className="text-sm font-extrabold text-ink mb-2.5">Push notifications</p>
        {pushSupported() && <DevicePush />}
        <Section rows={ROWS} state={push} onFlip={flip(setPush)} />
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
      {title && <p className="text-sm font-extrabold text-ink mb-2.5">{title}</p>}
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
