import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Send, Sparkles, MessageCircle } from 'lucide-react'
import { faq } from '../data.js'

// Tiny FAQ-grounded answer: score by shared keywords, fall back to a safe reply.
function answer(question) {
  const q = question.toLowerCase()
  let best = null
  let bestScore = 0
  for (const item of faq) {
    let score = 0
    for (const tag of item.tags) if (q.includes(tag)) score += 2
    for (const w of item.q.toLowerCase().split(/\W+/)) if (w.length > 3 && q.includes(w)) score += 1
    if (score > bestScore) { bestScore = score; best = item }
  }
  if (best && bestScore >= 2) return { text: best.a, fallback: false }
  return { text: "I'm not sure about that one yet. I can help with match schedules, arrival, kit, transfers, applying and payments. For anything else, the Referee Abroad team is happy to help.", fallback: true }
}

const suggestions = [
  'When do I get my match schedule?',
  'How do I change my kit size?',
  'What should I pack?',
  'How do I get to the hotel?',
]

export default function Assistant() {
  const nav = useNavigate()
  const [msgs, setMsgs] = useState([
    { from: 'bot', text: "Hi! I'm the Referee Abroad assistant 🤖 Ask me anything about your tournaments, travel or kit." },
  ])
  const [text, setText] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [msgs])

  const ask = (q) => {
    const question = (q ?? text).trim()
    if (!question) return
    setMsgs((m) => [...m, { from: 'me', text: question }])
    setText('')
    setTimeout(() => {
      const a = answer(question)
      setMsgs((m) => [...m, { from: 'bot', text: a.text, handoff: a.fallback }])
    }, 350)
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

        {msgs.length <= 1 && (
          <div className="pt-2 space-y-2">
            <p className="text-[11px] font-semibold text-neutral-400 px-1">Try asking</p>
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
