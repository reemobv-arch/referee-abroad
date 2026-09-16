import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, KanbanSquare, Plus, X, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { requirements } from '../phase1Data.js'

const COLS = [
  { key: 'todo', title: 'To do', dot: 'bg-neutral-300', chip: 'bg-neutral-100 text-neutral-500' },
  { key: 'doing', title: 'In progress', dot: 'bg-brand-dark', chip: 'bg-brand-dark text-white' },
  { key: 'testing', title: 'Testing', dot: 'bg-sky-400', chip: 'bg-sky-100 text-sky-700' },
  { key: 'done', title: 'Done', dot: 'bg-brand', chip: 'bg-brand-light text-brand-dark' },
]
const ORDER = COLS.map((c) => c.key)
const LS_KEY = 'ra_board_phase1'
const SEED_VERSION = 4 // bump to re-seed the shared board
const uid = () => Math.random().toString(36).slice(2, 9)

// Cards come straight from the source-of-truth requirements, one card per item.
const cardsFor = (groupId) => {
  const g = requirements.find((x) => x.id === groupId)
  return g.items.map(([id, text]) => ({ id: uid(), title: text, sprint: id, note: g.title }))
}
const cardsExcept = (groupIds) =>
  requirements.filter((g) => !groupIds.includes(g.id)).flatMap((g) =>
    g.items.map(([id, text]) => ({ id: uid(), title: text, sprint: id, note: g.title })))

const seed = () => ({
  version: SEED_VERSION,
  updatedAt: Date.now(),
  cols: {
    todo: cardsExcept(['A']),
    doing: cardsFor('A'),
    testing: [],
    done: [
      { id: uid(), title: 'Architecture & rollout plan', sprint: 'Sprint 1', note: 'Delivered' },
      { id: uid(), title: 'Clickable prototypes', sprint: 'Sprint 1', note: 'Delivered' },
    ],
  },
})

const normalise = (b) => {
  if (!b || !b.cols) return seed()
  const cols = {}
  for (const k of ORDER) cols[k] = Array.isArray(b.cols[k]) ? b.cols[k] : []
  return { version: b.version, updatedAt: b.updatedAt || Date.now(), cols }
}

const allReqItems = requirements.flatMap((g) => g.items.map(([id, text]) => ({ id, text, note: g.title })))

// Non-destructive: append cards for requirements not yet on the board, keeping
// the existing arrangement. New requirement groups appear without a full reset.
const withMissingCards = (b) => {
  const present = new Set()
  for (const k of ORDER) for (const c of b.cols[k]) if (c.sprint) present.add(c.sprint)
  const missing = allReqItems.filter((r) => !present.has(r.id))
  if (missing.length === 0) return { board: b, changed: false }
  const cols = {}
  for (const k of ORDER) cols[k] = [...b.cols[k]]
  cols.todo = [...cols.todo, ...missing.map((r) => ({ id: uid(), title: r.text, sprint: r.id, note: r.note }))]
  return { board: { ...b, version: SEED_VERSION, cols }, changed: true }
}

export default function SprintBoard() {
  const [board, setBoard] = useState(null)
  const [status, setStatus] = useState('') // '', 'saving', 'saved', 'local'
  const [dragId, setDragId] = useState(null)
  const [adding, setAdding] = useState(null) // column key with open input
  const [draft, setDraft] = useState('')

  const localAt = useRef(0)
  const busy = useRef(false) // suppress poll adoption while dragging/adding
  const saveTimer = useRef(null)

  // Load once, then poll for shared updates.
  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const r = await fetch('/api/board')
        if (!r.ok) throw new Error('no api')
        const { board: remote } = await r.json()
        if (!alive) return
        if (remote) {
          const { board, changed } = withMissingCards(normalise(remote))
          if (changed) { board.updatedAt = Date.now(); localAt.current = board.updatedAt; setBoard(board); save(board) }
          else { localAt.current = board.updatedAt; setBoard(board) }
        } else {
          const b = seed(); localAt.current = b.updatedAt; setBoard(b); save(b)
        }
      } catch {
        // Local fallback (e.g. dev without the serverless function).
        try {
          const raw = localStorage.getItem(LS_KEY)
          const base = raw ? normalise(JSON.parse(raw)) : seed()
          const { board, changed } = withMissingCards(base)
          if (changed) board.updatedAt = Date.now()
          localAt.current = board.updatedAt; setBoard(board); setStatus('local')
          if (changed || !raw) { try { localStorage.setItem(LS_KEY, JSON.stringify(board)) } catch { /* ignore */ } }
        } catch { const b = seed(); localAt.current = b.updatedAt; setBoard(b) }
      }
    }
    load()
    const t = setInterval(async () => {
      if (busy.current) return
      try {
        const r = await fetch('/api/board')
        if (!r.ok) return
        const { board: remote } = await r.json()
        if (remote && remote.updatedAt > localAt.current) {
          const b = normalise(remote); localAt.current = b.updatedAt; setBoard(b)
        }
      } catch { /* ignore */ }
    }, 6000)
    return () => { alive = false; clearInterval(t) }
  }, [])

  const save = (b) => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(b)) } catch { /* ignore */ }
    clearTimeout(saveTimer.current)
    setStatus((s) => (s === 'local' ? 'local' : 'saving'))
    saveTimer.current = setTimeout(async () => {
      try {
        const r = await fetch('/api/board', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ board: b }),
        })
        setStatus(r.ok ? 'saved' : 'local')
      } catch { setStatus('local') }
    }, 400)
  }

  const commit = (mutator) => {
    setBoard((prev) => {
      const next = { version: SEED_VERSION, updatedAt: Date.now(), cols: { ...prev.cols } }
      for (const k of ORDER) next.cols[k] = [...prev.cols[k]]
      mutator(next.cols)
      localAt.current = next.updatedAt
      save(next)
      return next
    })
  }

  const findCard = (cols, id) => {
    for (const k of ORDER) {
      const i = cols[k].findIndex((c) => c.id === id)
      if (i !== -1) return { col: k, i }
    }
    return null
  }

  const moveTo = (id, toCol, beforeId = null) => {
    commit((cols) => {
      const loc = findCard(cols, id)
      if (!loc) return
      const [card] = cols[loc.col].splice(loc.i, 1)
      if (beforeId) {
        const idx = cols[toCol].findIndex((c) => c.id === beforeId)
        cols[toCol].splice(idx === -1 ? cols[toCol].length : idx, 0, card)
      } else {
        cols[toCol].push(card)
      }
    })
  }

  const shift = (id, dir) => {
    const loc = findCard(board.cols, id)
    if (!loc) return
    const idx = ORDER.indexOf(loc.col) + dir
    if (idx < 0 || idx >= ORDER.length) return
    moveTo(id, ORDER[idx])
  }

  const addCard = (col) => {
    const title = draft.trim()
    if (!title) { setAdding(null); return }
    commit((cols) => { cols[col].push({ id: uid(), title, sprint: '', note: '' }) })
    setDraft(''); setAdding(null); busy.current = false
  }

  const removeCard = (id) => commit((cols) => {
    const loc = findCard(cols, id)
    if (loc) cols[loc.col].splice(loc.i, 1)
  })

  if (!board) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center text-neutral-500 font-medium font-sans">Loading board…</div>
    )
  }

  const count = (k) => board.cols[k].length
  const statusText = { saving: 'Saving…', saved: 'Saved', local: 'Saved on this device' }[status] || ''

  return (
    <div
      className="min-h-screen text-ink font-sans"
      style={{
        backgroundImage: 'linear-gradient(rgba(244,245,244,0.7), rgba(244,245,244,0.72)), url(img/hub-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-5xl mx-auto px-5 py-10">
        <Link to="/phase1" className="inline-flex items-center gap-1.5 text-brand-dark font-semibold text-sm mb-8">
          <ArrowLeft size={17} /> Back to Fase 1
        </Link>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Logo size={40} showText textClass="text-lg" />
          <span className="text-xs font-bold uppercase tracking-wide bg-brand-light text-brand-dark px-3 py-1 rounded-full">Sprint board</span>
        </div>

        <div className="mt-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight flex items-center gap-3">
              <KanbanSquare size={30} className="text-brand-dark" /> Sprint board
            </h1>
            <p className="mt-2 text-neutral-600 font-medium max-w-2xl">
              Drag cards between columns as work moves. Changes are shared with everyone who opens this link.
            </p>
          </div>
          {statusText && (
            <span className="text-[11px] font-bold text-neutral-400 inline-flex items-center gap-1 mb-1">
              {status === 'saved' && <Check size={13} className="text-brand" />}{statusText}
            </span>
          )}
        </div>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {COLS.map((col) => (
            <div
              key={col.key}
              onDragOver={(e) => { if (dragId) e.preventDefault() }}
              onDrop={(e) => { e.preventDefault(); if (dragId) { moveTo(dragId, col.key); setDragId(null); busy.current = false } }}
              className="bg-white/70 rounded-2xl border border-neutral-200 p-3 min-h-[120px]"
            >
              <div className="flex items-center gap-2 px-2 py-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                <h2 className="text-sm font-bold">{col.title}</h2>
                <span className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full ${col.chip}`}>{count(col.key)}</span>
              </div>

              <div className="mt-1 space-y-2.5 max-h-[68vh] overflow-y-auto no-scrollbar pr-0.5">
                {board.cols[col.key].map((c) => {
                  const ci = ORDER.indexOf(col.key)
                  return (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={() => { setDragId(c.id); busy.current = true }}
                      onDragEnd={() => { setDragId(null); busy.current = false }}
                      onDragOver={(e) => { if (dragId && dragId !== c.id) e.preventDefault() }}
                      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (dragId) { moveTo(dragId, col.key, c.id); setDragId(null); busy.current = false } }}
                      className={`group bg-white rounded-xl border border-neutral-200 shadow-card p-3.5 border-l-4 border-l-brand cursor-grab active:cursor-grabbing ${dragId === c.id ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[13px] font-bold leading-snug">{c.title}</p>
                        <button onClick={() => removeCard(c.id)} className="text-neutral-300 hover:text-red-500 shrink-0 opacity-0 group-hover:opacity-100 transition" aria-label="Delete card">
                          <X size={14} />
                        </button>
                      </div>
                      {c.note && <p className="mt-1 text-[11px] font-medium text-neutral-500 leading-snug">{c.note}</p>}
                      <div className="mt-2 flex items-center justify-between gap-2">
                        {c.sprint
                          ? <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">{c.sprint}</span>
                          : <span />}
                        <div className="flex items-center gap-1">
                          <button onClick={() => shift(c.id, -1)} disabled={ci === 0} className="w-6 h-6 rounded-md border border-neutral-200 text-neutral-500 flex items-center justify-center disabled:opacity-30 hover:bg-page" aria-label="Move left">
                            <ChevronLeft size={14} />
                          </button>
                          <button onClick={() => shift(c.id, 1)} disabled={ci === ORDER.length - 1} className="w-6 h-6 rounded-md border border-neutral-200 text-neutral-500 flex items-center justify-center disabled:opacity-30 hover:bg-page" aria-label="Move right">
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {adding === col.key ? (
                  <div className="bg-white rounded-xl border border-brand/40 p-2.5">
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') addCard(col.key); if (e.key === 'Escape') { setAdding(null); setDraft(''); busy.current = false } }}
                      onBlur={() => addCard(col.key)}
                      placeholder="Card title"
                      className="w-full text-[13px] font-medium outline-none"
                    />
                    <div className="mt-2 flex justify-end gap-1.5">
                      <button onMouseDown={(e) => e.preventDefault()} onClick={() => { setAdding(null); setDraft(''); busy.current = false }} className="text-[11px] font-bold text-neutral-500 px-2 py-1">Cancel</button>
                      <button onMouseDown={(e) => e.preventDefault()} onClick={() => addCard(col.key)} className="text-[11px] font-bold text-white bg-brand rounded-full px-3 py-1">Add</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setAdding(col.key); setDraft(''); busy.current = true }}
                    className="w-full flex items-center gap-1.5 text-[12px] font-semibold text-neutral-400 hover:text-brand-dark px-2 py-1.5 rounded-lg hover:bg-white/70 transition"
                  >
                    <Plus size={14} /> Add card
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-neutral-400 font-medium leading-relaxed">
          Sprints are about two weeks each. Drag a card, use the arrows on mobile, or add and remove cards. The board is shared and updates for everyone.
        </p>
      </div>
    </div>
  )
}
