import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck, MessageCircle, FileText, CreditCard } from 'lucide-react'
import { TopBar } from '../components/ui.jsx'
import { notifications } from '../data.js'

const iconFor = {
  appointment: { Icon: CalendarCheck, cls: 'bg-brand-light text-brand-dark', to: '/matches' },
  message: { Icon: MessageCircle, cls: 'bg-sky-100 text-sky-700', to: '/chats' },
  document: { Icon: FileText, cls: 'bg-amber-100 text-amber-700', to: '/documents' },
  payment: { Icon: CreditCard, cls: 'bg-brand-light text-brand-dark', to: '/matches' },
}

export default function Notifications() {
  const nav = useNavigate()
  const [items, setItems] = useState(() => notifications.map((n) => ({ ...n })))

  const open = (n) => {
    setItems((prev) => prev.map((x) => x.id === n.id ? { ...x, unread: false } : x))
    const dest = iconFor[n.type]?.to
    if (dest) nav(dest)
  }
  const markAll = () => setItems((prev) => prev.map((x) => ({ ...x, unread: false })))

  return (
    <div className="flex flex-col h-full bg-page">
      <TopBar title="Notifications" back right={
        <button onClick={markAll} className="text-brand text-xs font-semibold">Mark all read</button>
      } />
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 space-y-2.5 pb-6">
        {items.map((n) => {
          const { Icon, cls } = iconFor[n.type] || iconFor.message
          return (
            <button key={n.id} onClick={() => open(n)} className={`w-full text-left flex gap-3 rounded-2xl p-3.5 shadow-card active:scale-[0.99] transition ${n.unread ? 'bg-white' : 'bg-white/70'}`}>
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-none ${cls}`}><Icon size={19} /></span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2">
                  <span className="font-bold text-ink text-sm">{n.title}</span>
                  {n.unread && <span className="w-2 h-2 rounded-full bg-brand flex-none" />}
                  <span className="ml-auto text-[11px] text-neutral-400 font-medium flex-none">{n.ago}</span>
                </span>
                <span className="block text-xs text-neutral-500 font-medium mt-0.5 leading-snug">{n.body}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
