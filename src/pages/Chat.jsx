import { useNavigate } from 'react-router-dom'
import { Users, Sparkles } from 'lucide-react'
import { TopBar } from '../components/ui.jsx'

const convos = [
  { id: 'assistant', name: 'Referee Abroad Assistant', kind: 'bot', last: 'Ask me anything about your tournaments 🤖', time: 'AI', unread: 0, to: '/assistant' },
  { id: 'org', name: 'Referee Abroad', kind: 'org', last: "Done 👍 Updated to L, it's set in your profile.", time: '14:32', unread: 0, to: '/chat' },
  { id: 'porto', name: 'Porto International Cup', kind: 'group', last: "Ana N.: Don't forget your yellow kit 😄", time: '09:12', unread: 2, to: '/tournament/porto/group' },
  { id: 'copenhagen', name: 'Copenhagen Cup', kind: 'group', last: 'Marco (org): Welcome everyone! 👋', time: 'Yesterday', unread: 0, to: '/tournament/copenhagen/group' },
]

export default function Chat() {
  const nav = useNavigate()
  return (
    <div className="pb-4">
      <TopBar title="Chat" />
      <div className="px-4 pt-4 space-y-2.5">
        {convos.map((c) => (
          <button
            key={c.id}
            onClick={() => nav(c.to)}
            className="w-full text-left flex items-center gap-3.5 bg-white rounded-3xl border border-neutral-200 p-4 active:scale-[0.99] transition"
          >
            {c.kind === 'org' ? (
              <span className="w-13 h-13 rounded-2xl bg-brand text-white flex items-center justify-center font-extrabold flex-none" style={{ width: 52, height: 52 }}>RA</span>
            ) : c.kind === 'bot' ? (
              <span className="rounded-2xl bg-brand text-white flex items-center justify-center flex-none" style={{ width: 52, height: 52 }}><Sparkles size={24} /></span>
            ) : (
              <span className="rounded-2xl bg-brand-light text-brand-dark flex items-center justify-center flex-none" style={{ width: 52, height: 52 }}><Users size={24} /></span>
            )}
            <span className="flex-1 min-w-0">
              <span className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-ink text-[15px] truncate">{c.name}</span>
                <span className="text-[11px] text-neutral-400 font-semibold flex-none">{c.time}</span>
              </span>
              <span className="flex items-center justify-between gap-2 mt-0.5">
                <span className="text-[13px] text-neutral-500 font-medium truncate">{c.last}</span>
                {c.unread > 0 && (
                  <span className="flex-none min-w-[20px] h-5 px-1.5 rounded-full bg-brand text-white text-[11px] font-bold flex items-center justify-center">{c.unread}</span>
                )}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
