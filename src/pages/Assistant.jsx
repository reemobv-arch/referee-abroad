import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Send, Sparkles, MessageCircle } from 'lucide-react'
import { localAnswer } from '../lib/faqAnswer.js'

// Ask the server assistant. On any failure (not configured, offline, error)
// returns null so the caller can fall back to the local answer.
async function askServer(history) {
  try {
    const messages = history
      .filter((m) => m.from === 'me' || m.from === 'bot')
      .map((m) => ({ role: m.from === 'me' ? 'user' : 'assistant', content: m.text }))
    const r = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    })
    if (!r.ok) return null
    const data = await r.json()
    if (!data || !data.reply) return null
    return { text: data.reply, fallback: !!data.handoff }
  } catch {
    return null
  }
}

const suggestions = [
  'What does the tournament fee include?',
  'How old do I need to be to take part?',
  'How is travel organised?',
  'Why is there a credit card guarantee?',
]

export default function Assistant() {
  const nav = useNavigate()
  const [msgs, setMsgs] = useState([
    { from: 'bot', text: "Hi! I'm the Referee Abroad assistant 🤖 Ask me anything about your tournaments, travel or kit." },
  ])
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [msgs, typing])

  const ask = async (q) => {
    const question = (q ?? text).trim()
    if (!question || typing) return
    const history = [...msgs, { from: 'me', text: question }]
    setMsgs(history)
    setText('')
    setTyping(true)
    // Try the live AI endpoint first; fall back to the local FAQ answer.
    const a = (await askServer(history)) || localAnswer(question)
    setTyping(false)
    setMsgs((m) => [...m, { from: 'bot', text: a.text, handoff: a.fallback }])
  }

  return (
    <div className="flex flex-col h-full bg-page">
      <header className="shrink-0 bg-white border-b border-neutral-200">
        <div className="h-14 flex items-center gap-3 px-3">
          <button onClick={() => nav(-1)} aria-label="Back"><ChevronLeft size={24} className="text-ink" /></button>
          <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center"><Sparkles size={18} /></div>
          <div className="flex-1">
            <p className="text-sm font-bold text-ink leading-tight">Referee Abroad Assistant</p>
            <p className="text-[11px] text-brand font-medium">● AI · answers from the FAQ</p>
          </div>
        </div>
      </header>

      <div ref={listRef} className="flex-1 min-h-0 px-3.5 py-3 space-y-2 overflow-y-auto no-scrollbar">
        {msgs.map((m, i) => (
          <div key={i}>
            <div className={`max-w-[80%] px-4 py-2.5 text-[15px] font-medium leading-snug ${
              m.from === 'me'
                ? 'ml-auto bg-brand text-white rounded-3xl rounded-br-md'
                : 'bg-white border border-neutral-200 text-ink rounded-3xl rounded-bl-md'
            }`}>
              {m.text}
            </div>
            {m.handoff && (
              <button onClick={() => nav('/chat')} className="mt-2 inline-flex items-center gap-2 bg-brand-light text-brand-dark font-bold text-[13px] rounded-full px-4 py-2.5 active:scale-[0.99]">
                <MessageCircle size={16} /> Message the team
              </button>
            )}
          </div>
        ))}

        {typing && (
          <div className="max-w-[80%] bg-white border border-neutral-200 rounded-3xl rounded-bl-md px-4 py-3">
            <span className="flex items-center gap-1" aria-label="Assistant is typing">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        )}

        {msgs.length <= 1 && !typing && (
          <div className="pt-2 space-y-2">
            <p className="text-[11px] font-semibold text-neutral-500 px-1">Try asking</p>
            {suggestions.map((s) => (
              <button key={s} onClick={() => ask(s)} className="block w-full text-left bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink active:scale-[0.99]">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); ask() }} className="shrink-0 bg-white border-t border-neutral-200 px-3 py-2.5 flex items-center gap-2 pb-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask the assistant…"
          className="flex-1 bg-page rounded-full px-4 py-2.5 text-sm font-medium outline-none"
        />
        <button type="submit" aria-label="Send" className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center active:scale-95">
          <Send size={17} />
        </button>
      </form>
    </div>
  )
}
