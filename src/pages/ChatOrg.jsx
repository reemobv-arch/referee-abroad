import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Phone, Paperclip, Send } from 'lucide-react'
import { orgChat } from '../data.js'

export default function ChatOrg() {
  const nav = useNavigate()
  const [msgs, setMsgs] = useState(orgChat)
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
          <div className="w-9 h-9 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center">RA</div>
          <div className="flex-1">
            <p className="text-sm font-bold text-ink leading-tight">Referee Abroad</p>
            <p className="text-[11px] text-brand font-medium">● Online · replies quickly</p>
          </div>
          <Phone size={19} className="text-ink" />
        </div>
      </header>

      <div className="flex-1 min-h-0 px-3.5 py-3 space-y-2 overflow-y-auto no-scrollbar">
        <p className="text-center text-[11px] text-neutral-400 font-medium">Today</p>
        {msgs.map((m, i) => (
          <div key={i} className={`max-w-[78%] px-3.5 py-2 text-sm font-medium leading-snug ${
            m.from === 'me'
              ? 'ml-auto bg-brand text-white rounded-2xl rounded-br-md'
              : 'bg-white border border-neutral-200 text-ink rounded-2xl rounded-bl-md'
          }`}>
            {m.text}
          </div>
        ))}
      </div>

      <form onSubmit={send} className="shrink-0 bg-white border-t border-neutral-200 px-3 py-2.5 flex items-center gap-2 pb-3">
        <Paperclip size={20} className="text-neutral-400" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 bg-page rounded-full px-4 py-2.5 text-sm font-medium outline-none"
        />
        <button type="submit" aria-label="Send" className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center active:scale-95">
          <Send size={17} />
        </button>
      </form>
    </div>
  )
}
