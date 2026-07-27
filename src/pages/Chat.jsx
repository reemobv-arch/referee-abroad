import { useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import { TopBar } from '../components/ui.jsx'

const convos = [
  { id: 'org', name: 'Referee Abroad', kind: 'org', last: "Done 👍 Updated to L, it's set in your profile.", time: '14:32', unread: 0, to: '/chat' },
  { id: 'porto', name: 'Porto International Cup', kind: 'group', last: "Ana N.: Don't forget your yellow kit 😄", time: '09:12', unread: 2, to: '/tournament/porto/group' },
  { id: 'copenhagen', name: 'Copenhagen Cup', kind: 'group', last: 'Marco (org): Welcome everyone! 👋', time: 'Yesterday', unread: 0, to: '/tournament/copenhagen/group' },
]

export default function Chat() {
  const nav = useNavigate()
  return (
    <div className="pb-4">
      <TopBar title="Chat" />
      <div className="px-4 pt-3 space-y-2.5">
        {convos.map((c) => (
          <button
            key={c.id}
            onClick={() => nav(c.to)}
            className="w-full text-left flex items-center gap-3 bg-white rounded-2xl p-3.5 shadow-card active:scale-[0.99] transition"
          >
            {c.kind === 'org' ? (
              <span className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center font-bold flex-none">RA</span>
            ) : (
              <span className="w-12 h-12 rounded-full bg-brand-light text-brand-dark flex items-center justify-center flex-none"><Users size={22} /></span>
            )}
            <span className="flex-1 min-w-0">
              <span className="flex items-center justify-between gap-2">
                <span className="font-bold text-ink text-sm truncate">{c.name}</span>
                <span className="text-[11px] text-neutral-400 font-medium flex-none">{c.time}</span>
              </span>
              <span className="flex items-center justify-between gap-2 mt-0.5">
                <span className="text-xs text-neutral-500 font-medium truncate">{c.last}</span>
                {c.unread > 0 && (
                  <span className="flex-none min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">{c.unread}</span>
                )}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
