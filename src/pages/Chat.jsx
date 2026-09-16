import { useNavigate } from 'react-router-dom'
import { Users, Sparkles, ArrowRight } from 'lucide-react'
import { TopBar } from '../components/ui.jsx'

const convos = [
  { id: 'org', name: 'Referee Abroad', kind: 'org', last: "Done 👍 Updated to L, it's set in your profile.", time: '14:32', unread: 0, to: '/chat', tag: 'Organisation' },
  { id: 'porto', name: 'Porto International Cup', kind: 'group', last: "Ana N.: Don't forget your yellow kit 😄", time: '09:12', unread: 2, to: '/tournament/porto/group', tag: 'Group' },
  { id: 'copenhagen', name: 'Copenhagen Cup', kind: 'group', last: 'Marco (org): Welcome everyone! 👋', time: 'Yesterday', unread: 0, to: '/tournament/copenhagen/group', tag: 'Group' },
]

export default function Chat() {
  const nav = useNavigate()
  return (
    <div className="pb-4">
      <TopBar title="Chat" />
      <div className="px-4 pt-4">
        <button
          onClick={() => nav('/assistant')}
          className="w-full text-left rounded-3xl p-5 text-white active:scale-[0.99] transition relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#2FA850,#1B6E36)' }}
        >
          <span className="pointer-events-none absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-4">
            <span className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-none"><Sparkles size={26} /></span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-extrabold text-[17px]">Referee Abroad Assistant</p>
                <span className="text-[10px] font-bold bg-white/25 px-2 py-0.5 rounded-full">AI</span>
              </div>
              <p className="text-[13px] font-medium text-white/90 mt-0.5">Ask me anything about tournaments, travel or kit</p>
            </div>
            <ArrowRight size={20} className="flex-none" />
          </div>
        </button>

        <p className="text-sm font-extrabold text-ink mt-6 mb-2.5">Messages</p>
        <div className="space-y-2.5">
          {convos.map((c) => (
            <button
              key={c.id}
              onClick={() => nav(c.to)}
              className="w-full text-left flex items-center gap-3.5 bg-white rounded-3xl border border-neutral-200 p-4 active:scale-[0.99] transition"
            >
              {c.kind === 'org' ? (
                <span className="rounded-2xl bg-brand text-white flex items-center justify-center font-extrabold flex-none" style={{ width: 52, height: 52 }}>RA</span>
              ) : (
                <span className="rounded-2xl bg-brand-light text-brand-dark flex items-center justify-center flex-none" style={{ width: 52, height: 52 }}><Users size={24} /></span>
              )}
              <span className="flex-1 min-w-0">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-ink text-[15px] truncate">{c.name}</span>
                  <span className="text-[11px] text-neutral-400 font-semibold flex-none">{c.time}</span>
                </span>
                <span className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.kind === 'org' ? 'bg-brand-light text-brand-dark' : 'bg-sky-100 text-sky-700'}`}>{c.tag}</span>
                  <span className="text-[13px] text-neutral-500 font-medium truncate flex-1">{c.last}</span>
                  {c.unread > 0 && (
                    <span className="flex-none min-w-[20px] h-5 px-1.5 rounded-full bg-brand text-white text-[11px] font-bold flex items-center justify-center">{c.unread}</span>
                  )}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
