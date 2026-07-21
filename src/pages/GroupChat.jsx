import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Users, Smile, Send } from 'lucide-react'
import { groupChat, tournaments } from '../data.js'

function Avatar({ initials, color }) {
  return (
    <span className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0" style={{ background: color }}>
      {initials}
    </span>
  )
}

export default function GroupChat() {
  const nav = useNavigate()
  const { id } = useParams()
  const t = tournaments.find((x) => x.id === id)
  const [msgs, setMsgs] = useState(groupChat)
  const [text, setText] = useState('')

  function send(e) {
    e.preventDefault()
    if (!text.trim()) return
    setMsgs((m) => [...m, { from: 'me', text: text.trim() }])
    setText('')
  }

  return (
    <div className="flex flex-col h-full bg-page">
      <header className="shrink-0 bg-white border-b border-neutral-200">
        <div className="h-14 flex items-center gap-3 px-3">
          <button onClick={() => nav(-1)} aria-label="Back"><ChevronLeft size={24} className="text-ink" /></button>
          <div className="w-9 h-9 rounded-xl bg-brand-light text-brand-dark flex items-center justify-center"><Users size={18} /></div>
          <div className="flex-1">
            <p className="text-sm font-bold text-ink leading-tight">{t?.name || 'Tournament'}</p>
            <p className="text-[11px] text-neutral-500 font-medium">Group · 40 members</p>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 px-3.5 py-3 space-y-2.5 overflow-y-auto no-scrollbar">
        {msgs.map((m, i) => {
          if (m.sys) {
            return (
              <p key={i} className="text-center">
                <span className="inline-block bg-neutral-200 text-neutral-500 text-[11px] font-semibold px-3 py-1 rounded-full">{m.sys}</span>
              </p>
            )
          }
          if (m.from === 'me') {
            return (
              <div key={i} className="ml-auto max-w-[78%] bg-brand text-white text-sm font-medium px-3.5 py-2 rounded-2xl rounded-br-md">
                {m.text}
              </div>
            )
          }
          return (
            <div key={i} className="max-w-[82%]">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Avatar initials={m.initials} color={m.color} />
                <span className="text-[11px] font-bold text-ink">{m.from}</span>
              </div>
              <div className="bg-white border border-neutral-200 text-ink text-sm font-medium px-3.5 py-2 rounded-2xl rounded-bl-md">
                {m.text}
              </div>
            </div>
          )
        })}
      </div>

      <form onSubmit={send} className="shrink-0 bg-white border-t border-neutral-200 px-3 py-2.5 flex items-center gap-2 pb-3">
        <Smile size={20} className="text-neutral-400" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message the group…"
          className="flex-1 bg-page rounded-full px-4 py-2.5 text-sm font-medium outline-none"
        />
        <button type="submit" aria-label="Send" className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center active:scale-95">
          <Send size={17} />
        </button>
      </form>
    </div>
  )
}
