import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Search, Sparkles, LifeBuoy } from 'lucide-react'
import { TopBar } from '../components/ui.jsx'
import { FAQ_GROUPS } from '../faqContent.js'

function Item({ q, a, open, onToggle }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 text-left px-4 py-3.5 active:bg-neutral-50"
        aria-expanded={open}
      >
        <span className="flex-1 text-[14px] font-bold text-ink leading-snug">{q}</span>
        <ChevronDown size={18} className={`flex-none text-neutral-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <p className="px-4 pb-4 -mt-1 text-[13.5px] text-neutral-600 font-medium leading-relaxed whitespace-pre-line">{a}</p>
      )}
    </div>
  )
}

export default function Faq() {
  const nav = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(() => new Set())

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const q = query.trim().toLowerCase()
  const groups = FAQ_GROUPS.map((g) => ({
    ...g,
    items: q ? g.items.filter((it) => (it.q + ' ' + it.a).toLowerCase().includes(q)) : g.items,
  })).filter((g) => g.items.length)

  const empty = groups.length === 0

  return (
    <div className="pb-8">
      <TopBar title="Help & FAQ" back />
      <div className="px-4 pt-4 space-y-5">
        <div className="relative">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions"
            className="w-full h-11 pl-10 pr-4 rounded-full bg-white border border-neutral-200 text-[14px] font-semibold text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        {empty ? (
          <div className="text-center text-neutral-500 font-medium py-12">
            <p className="text-[15px]">No questions match “{query}”.</p>
            <p className="text-[13px] mt-1">Try a different word, or ask the assistant.</p>
          </div>
        ) : (
          groups.map((g) => (
            <section key={g.key}>
              <p className="px-1 mb-2 text-[11px] font-extrabold uppercase tracking-wide text-neutral-500">{g.title}</p>
              <div className="space-y-2.5">
                {g.items.map((it) => {
                  const id = g.key + ':' + it.q
                  return <Item key={id} q={it.q} a={it.a} open={open.has(id)} onToggle={() => toggle(id)} />
                })}
              </div>
            </section>
          ))
        )}

        <button
          onClick={() => nav('/assistant')}
          className="w-full flex items-center gap-3.5 bg-brand/10 rounded-2xl border border-brand/20 p-4 active:scale-[0.99] transition text-left"
        >
          <span className="w-11 h-11 rounded-2xl bg-brand text-white flex items-center justify-center flex-none"><Sparkles size={20} /></span>
          <span className="flex-1 min-w-0">
            <span className="block text-[15px] font-bold text-ink leading-tight">Still stuck?</span>
            <span className="block text-[12px] font-medium text-neutral-600">Ask the assistant or contact the Referee Abroad team.</span>
          </span>
          <LifeBuoy size={20} className="text-brand-dark" />
        </button>
      </div>
    </div>
  )
}
