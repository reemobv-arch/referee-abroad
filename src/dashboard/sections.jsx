import { useEffect, useMemo, useState } from 'react'
import {
  Plus, MapPin, Calendar, Users, X, Send, MessageSquare, Search, TrendingUp,
  Mail, MessageCircle, AlertTriangle, Check, Sparkles, Star, Globe, Phone, ClipboardList,
} from 'lucide-react'
import {
  dashTournaments, dashReferees, dashStaff, dashTickets, dashPnl, dashAnalytics,
  dashEnrolments, dashMatches, dashInbox, refById,
} from './data.js'

const euro = (n) => '€' + n.toLocaleString('en-US')
const initialsOf = (name) => name.split(' ').map((w) => w[0]).join('').slice(0, 2)

function LevelPill({ level }) {
  const map = {
    beginner: 'bg-neutral-100 text-neutral-600',
    medior: 'bg-sky-100 text-sky-700',
    talent: 'bg-brand-light text-brand-dark',
  }
  return <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${map[level]}`}>{level}</span>
}

function StatusPill({ status }) {
  const map = {
    confirmed: 'bg-brand-light text-brand-dark',
    recruiting: 'bg-amber-100 text-amber-700',
    planned: 'bg-neutral-100 text-neutral-500',
  }
  return <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${map[status]}`}>{status}</span>
}

const enrolMap = {
  confirmed: 'bg-brand-light text-brand-dark',
  paid: 'bg-sky-100 text-sky-700',
  applied: 'bg-amber-100 text-amber-700',
  waitlist: 'bg-neutral-100 text-neutral-500',
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-ink">{value}</p>
      {sub && <p className="text-xs font-medium text-brand-dark mt-0.5">{sub}</p>}
    </div>
  )
}

function Modal({ children, onClose, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className={`w-full ${wide ? 'max-w-lg' : 'max-w-md'} bg-white rounded-3xl overflow-hidden shadow-xl max-h-[88vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

function Toast({ text, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600)
    return () => clearTimeout(t)
  }, [text, onDone])
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-ink text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2">
      <Check size={16} className="text-brand" /> {text}
    </div>
  )
}

/* ---------------- Tournaments ---------------- */
export function DashboardTournaments({ onManage }) {
  const [open, setOpen] = useState(null)
  const enrol = open ? (dashEnrolments[open.id] || []) : []

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {dashTournaments.map((t) => (
          <button
            key={t.id}
            onClick={() => setOpen(t)}
            className="text-left bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:border-brand hover:shadow-card transition active:scale-[0.99]"
          >
            <div className="relative h-24">
              <img src={t.img} alt={t.name} className="w-full h-full object-cover" />
              <span className="absolute top-2 left-2"><StatusPill status={t.status} /></span>
            </div>
            <div className="p-3">
              <p className="font-bold text-ink text-sm leading-tight">{t.name}</p>
              <p className="text-xs text-neutral-500 font-medium mt-1 flex items-center gap-1"><MapPin size={12} /> {t.city}, {t.country}</p>
              <div className="flex items-center justify-between mt-2 text-xs font-medium">
                <span className="text-neutral-500 flex items-center gap-1"><Calendar size={12} /> {t.dates}</span>
                <span className="text-brand-dark flex items-center gap-1"><Users size={12} /> {t.enrolled}/{t.capacity}</span>
              </div>
            </div>
          </button>
        ))}

        <button className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 text-neutral-400 hover:text-brand-dark hover:border-brand min-h-[180px] transition">
          <Plus size={26} />
          <span className="text-sm font-semibold">Create new tournament</span>
        </button>
      </div>

      {open && (
        <Modal onClose={() => setOpen(null)}>
          <div className="relative h-36">
            <img src={open.img} alt={open.name} className="w-full h-full object-cover" />
            <button onClick={() => setOpen(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center"><X size={18} /></button>
            <span className="absolute bottom-3 left-4"><StatusPill status={open.status} /></span>
          </div>
          <div className="p-5">
            <h3 className="text-xl font-extrabold text-ink">{open.name}</h3>
            <p className="text-sm text-neutral-500 font-medium flex items-center gap-1 mt-1"><MapPin size={14} /> {open.city}, {open.country} · {open.dates}</p>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-page rounded-xl p-3"><p className="text-[11px] text-neutral-500 font-medium">Sport</p><p className="font-bold text-ink text-sm">{open.sport}</p></div>
              <div className="bg-page rounded-xl p-3"><p className="text-[11px] text-neutral-500 font-medium">Enrolled</p><p className="font-bold text-ink text-sm">{open.enrolled}/{open.capacity}</p></div>
              <div className="bg-page rounded-xl p-3"><p className="text-[11px] text-neutral-500 font-medium">Spots left</p><p className="font-bold text-ink text-sm">{open.capacity - open.enrolled}</p></div>
            </div>

            <p className="text-xs font-bold text-neutral-500 mt-5 mb-2">Enrolments</p>
            <div className="bg-page rounded-xl divide-y divide-neutral-200/70 max-h-52 overflow-y-auto">
              {enrol.length === 0 && <p className="text-sm text-neutral-400 font-medium p-3">No enrolments yet.</p>}
              {enrol.map((e, i) => {
                const r = refById[e.refId]
                return (
                  <div key={i} className="flex items-center gap-2 px-3 py-2">
                    <span className="w-6 h-6 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center flex-none">{initialsOf(r.name)}</span>
                    <span className="flex-1 text-sm font-semibold text-ink truncate">{r.name}</span>
                    <span className="text-xs text-neutral-400 font-medium">{r.flag}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${enrolMap[e.status]}`}>{e.status}</span>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => { setOpen(null); onManage && onManage(open.id) }} className="flex-1 h-11 rounded-full bg-brand text-white font-semibold flex items-center justify-center gap-2"><ClipboardList size={16} /> Appoint referees</button>
              <button className="flex-1 h-11 rounded-full border-[1.5px] border-brand text-brand-dark font-semibold flex items-center justify-center gap-2"><MessageSquare size={16} /> Message group</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ---------------- Referees ---------------- */
export function DashboardReferees() {
  const [q, setQ] = useState('')
  const [level, setLevel] = useState('all')
  const [open, setOpen] = useState(null)

  const filtered = dashReferees.filter((r) => {
    const okLevel = level === 'all' || r.level === level
    const okText = !q || r.name.toLowerCase().includes(q.toLowerCase()) || r.country.toLowerCase().includes(q.toLowerCase())
    return okLevel && okText
  })

  const levels = ['all', 'talent', 'medior', 'beginner']

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-neutral-200 px-3 h-10 flex-1 min-w-[200px]">
          <Search size={16} className="text-neutral-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or country" className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-neutral-400" />
        </div>
        <div className="flex gap-1.5">
          {levels.map((l) => (
            <button key={l} onClick={() => setLevel(l)} className={`text-xs font-semibold px-3 h-10 rounded-xl capitalize border transition ${level === l ? 'bg-brand text-white border-brand' : 'bg-white text-neutral-500 border-neutral-200 hover:border-brand'}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="flex items-center px-4 py-2.5 border-b border-neutral-200 text-[11px] uppercase tracking-wide text-neutral-500 font-semibold">
          <span className="flex-1">Referee</span>
          <span className="w-40 hidden sm:block">Country</span>
          <span className="w-20 text-right">Apps</span>
          <span className="w-24 text-right">Level</span>
        </div>
        <div className="divide-y divide-neutral-100">
          {filtered.map((r) => (
            <button key={r.id} onClick={() => setOpen(r)} className="w-full flex items-center px-4 py-2.5 hover:bg-page transition text-left">
              <span className="w-7 h-7 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center flex-none mr-3">{initialsOf(r.name)}</span>
              <span className="flex-1 font-semibold text-ink text-sm truncate">{r.name}</span>
              <span className="w-40 text-sm text-neutral-500 font-medium hidden sm:block">{r.flag} {r.country}</span>
              <span className="w-20 text-right text-sm font-medium text-neutral-500 tabular-nums">{r.apps}</span>
              <span className="w-24 flex justify-end"><LevelPill level={r.level} /></span>
            </button>
          ))}
          {filtered.length === 0 && <p className="text-sm text-neutral-400 font-medium p-4">No referees match your search.</p>}
        </div>
      </div>

      {open && (
        <Modal onClose={() => setOpen(null)}>
          <div className="p-5">
            <div className="flex items-start gap-3">
              <span className="w-14 h-14 rounded-full bg-brand text-white text-lg font-bold flex items-center justify-center flex-none">{initialsOf(open.name)}</span>
              <div className="flex-1">
                <h3 className="text-xl font-extrabold text-ink leading-tight">{open.name}</h3>
                <p className="text-sm text-neutral-500 font-medium">{open.flag} {open.country}</p>
                <div className="mt-1.5"><LevelPill level={open.level} /></div>
              </div>
              <button onClick={() => setOpen(null)} className="w-8 h-8 rounded-full hover:bg-page flex items-center justify-center flex-none"><X size={18} /></button>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-page rounded-xl p-3"><p className="text-[11px] text-neutral-500 font-medium">Tournaments</p><p className="font-bold text-ink text-sm">{open.apps}</p></div>
              <div className="bg-page rounded-xl p-3"><p className="text-[11px] text-neutral-500 font-medium">Reports</p><p className="font-bold text-ink text-sm">{open.reports}</p></div>
              <div className="bg-page rounded-xl p-3"><p className="text-[11px] text-neutral-500 font-medium">Rating</p><p className="font-bold text-ink text-sm flex items-center gap-1"><Star size={13} className="text-amber-500 fill-amber-500" /> {open.rating}</p></div>
            </div>

            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-neutral-600 font-medium"><Mail size={15} className="text-neutral-400" /> {open.email}</div>
              <div className="flex items-center gap-2 text-neutral-600 font-medium"><Phone size={15} className="text-neutral-400" /> {open.phone}</div>
              <div className="flex items-center gap-2 text-neutral-600 font-medium"><Globe size={15} className="text-neutral-400" /> {open.languages.join(' · ')}</div>
            </div>

            <div className="flex gap-3 mt-5">
              <button className="flex-1 h-11 rounded-full bg-brand text-white font-semibold flex items-center justify-center gap-2"><MessageSquare size={16} /> Message</button>
              <button className="flex-1 h-11 rounded-full border-[1.5px] border-brand text-brand-dark font-semibold flex items-center justify-center gap-2"><ClipboardList size={16} /> Appoint</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ---------------- Staff ---------------- */
export function DashboardStaff() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {dashStaff.map((s, i) => (
        <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm">{s.initials}</span>
            <div>
              <p className="font-bold text-ink text-sm">{s.name}</p>
              <p className="text-xs text-neutral-500 font-medium">{s.role}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 text-xs font-medium text-neutral-500">
            <span className="text-neutral-400">Assigned to</span><br />{s.tournament}
          </div>
        </div>
      ))}
      <button className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 text-neutral-400 hover:text-brand-dark hover:border-brand min-h-[128px] transition">
        <Plus size={24} />
        <span className="text-sm font-semibold">Add staff member</span>
      </button>
    </div>
  )
}

/* ---------------- Appointing ---------------- */
export function DashboardAppointing({ initialTournament }) {
  const withMatches = dashTournaments.filter((t) => dashMatches[t.id])
  const [tid, setTid] = useState(initialTournament && dashMatches[initialTournament] ? initialTournament : withMatches[0].id)
  const [matches, setMatches] = useState(() => JSON.parse(JSON.stringify(dashMatches)))
  const [toast, setToast] = useState('')

  const list = matches[tid] || []

  // Conflict = a referee appointed to two matches at the same time.
  const conflicts = useMemo(() => {
    const seen = {}
    const bad = new Set()
    for (const m of list) {
      const refs = [m.main, ...m.assistants].filter(Boolean)
      for (const r of refs) {
        const key = `${m.time}::${r}`
        if (seen[key]) { bad.add(`${m.id}::${r}`); bad.add(`${seen[key]}::${r}`) }
        else seen[key] = m.id
      }
    }
    return bad
  }, [list])

  const setMain = (mid, ref) => setMatches((prev) => ({
    ...prev, [tid]: prev[tid].map((m) => m.id === mid ? { ...m, main: ref || null } : m),
  }))
  const addAssistant = (mid, ref) => { if (!ref) return; setMatches((prev) => ({
    ...prev, [tid]: prev[tid].map((m) => m.id === mid && !m.assistants.includes(ref) ? { ...m, assistants: [...m.assistants, ref] } : m),
  })) }
  const removeAssistant = (mid, ref) => setMatches((prev) => ({
    ...prev, [tid]: prev[tid].map((m) => m.id === mid ? { ...m, assistants: m.assistants.filter((a) => a !== ref) } : m),
  }))

  const openSlots = list.filter((m) => !m.main).length
  const refOptions = dashReferees

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select value={tid} onChange={(e) => setTid(e.target.value)} className="h-10 px-3 rounded-xl border border-neutral-200 text-sm font-semibold outline-none focus:border-brand bg-white">
          {withMatches.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <span className="text-xs font-medium text-neutral-500">{list.length} matches · {openSlots} without a main referee</span>
        <button onClick={() => setToast(`Appointments published to referees for ${dashTournaments.find((t) => t.id === tid).name}.`)} className="ml-auto inline-flex items-center gap-1.5 bg-brand text-white text-sm font-semibold px-4 h-10 rounded-full">
          <Send size={15} /> Publish appointments
        </button>
      </div>

      {conflicts.size > 0 && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-700 text-sm font-semibold px-4 py-2.5 rounded-xl border border-red-100">
          <AlertTriangle size={16} /> A referee is double-booked at the same time. Check the highlighted matches.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden divide-y divide-neutral-100">
        {list.map((m) => {
          const mainConflict = m.main && conflicts.has(`${m.id}::${m.main}`)
          return (
            <div key={m.id} className="p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-bold text-brand-dark w-14 tabular-nums">{m.time}</span>
                <span className="text-sm font-semibold text-ink flex-1 min-w-[160px]">{m.home} <span className="text-neutral-400 font-medium">vs</span> {m.away}</span>
                <span className="text-xs font-medium text-neutral-500">{m.pitch}</span>
              </div>

              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-neutral-500 mb-1">Main referee</p>
                  <select
                    value={m.main || ''}
                    onChange={(e) => setMain(m.id, e.target.value)}
                    className={`w-full h-9 px-2.5 rounded-lg border text-sm font-medium outline-none focus:border-brand ${mainConflict ? 'border-red-300 bg-red-50 text-red-700' : m.main ? 'border-neutral-200' : 'border-amber-200 bg-amber-50 text-amber-700'}`}
                  >
                    <option value="">Unassigned</option>
                    {refOptions.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.level})</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-neutral-500 mb-1">Assistants</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {m.assistants.map((a) => {
                      const conflict = conflicts.has(`${m.id}::${a}`)
                      return (
                        <span key={a} className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${conflict ? 'bg-red-50 text-red-700' : 'bg-brand-light text-brand-dark'}`}>
                          {refById[a].name.split(' ')[0]} {refById[a].name.split(' ')[1]?.[0]}.
                          <button onClick={() => removeAssistant(m.id, a)}><X size={12} /></button>
                        </span>
                      )
                    })}
                    <select value="" onChange={(e) => { addAssistant(m.id, e.target.value); e.target.value = '' }} className="h-8 px-2 rounded-lg border border-dashed border-neutral-300 text-xs font-medium text-neutral-500 outline-none focus:border-brand bg-white">
                      <option value="">+ Add</option>
                      {refOptions.filter((r) => !m.assistants.includes(r.id) && r.id !== m.main).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {toast && <Toast text={toast} onDone={() => setToast('')} />}
    </div>
  )
}

function TicketChat({ ticket, onClose }) {
  const first = ticket.name.split(' ')[0]
  const initials = initialsOf(ticket.name)
  const [messages, setMessages] = useState(() => {
    const base = [{ from: 'them', text: `${ticket.subject}. Could you help me with this?` }]
    if (ticket.status !== 'open') base.push({ from: 'me', text: `Hi ${first}, thanks for reaching out! We've taken care of it. 👍` })
    return base
  })
  const [input, setInput] = useState('')
  const send = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    setMessages((m) => [...m, { from: 'me', text: input }])
    setInput('')
  }
  return (
    <div className="flex flex-col h-[520px]">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 shrink-0">
        <span className="w-9 h-9 rounded-full bg-brand-light text-brand-dark flex items-center justify-center font-bold text-xs flex-none">{initials}</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-ink text-sm truncate">{ticket.name}</p>
          <p className="text-[11px] text-neutral-500 font-medium truncate">{ticket.tournament} · {ticket.subject}</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-page flex items-center justify-center flex-none"><X size={18} /></button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2 bg-page">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm font-medium ${m.from === 'me' ? 'ml-auto bg-brand text-white rounded-br-md' : 'bg-white border border-neutral-200 text-ink rounded-bl-md'}`}>{m.text}</div>
        ))}
      </div>
      <form onSubmit={send} className="flex items-center gap-2 p-3 border-t border-neutral-200 shrink-0">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a reply…"
          className="flex-1 h-10 px-3 rounded-full border border-neutral-200 text-sm font-medium outline-none focus:border-brand" />
        <button type="submit" className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center flex-none"><Send size={17} /></button>
      </form>
    </div>
  )
}

/* ---------------- Communication ---------------- */
export function DashboardCommunication() {
  const [tournament, setTournament] = useState(dashTournaments[0].name)
  const [msg, setMsg] = useState('')
  const [sent, setSent] = useState(false)
  const [openTicket, setOpenTicket] = useState(null)

  const statusMap = {
    open: 'bg-amber-100 text-amber-700',
    answered: 'bg-sky-100 text-sky-700',
    closed: 'bg-neutral-100 text-neutral-500',
  }

  return (
    <>
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5 items-start">
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
          <p className="font-bold text-ink text-sm">Tickets</p>
          <span className="text-xs font-medium text-neutral-400">{dashTickets.filter((t) => t.status === 'open').length} open</span>
        </div>
        <div className="divide-y divide-neutral-100">
          {dashTickets.map((t) => (
            <button key={t.id} onClick={() => setOpenTicket(t)} className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-page transition">
              <span className="w-8 h-8 rounded-full bg-brand-light text-brand-dark flex items-center justify-center font-bold text-xs flex-none">{initialsOf(t.name)}</span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-ink text-sm truncate">{t.subject}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize flex-none ${statusMap[t.status]}`}>{t.status}</span>
                </span>
                <span className="block text-xs text-neutral-500 font-medium mt-0.5">{t.name} · {t.tournament} · {t.ago}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-4">
        <p className="font-bold text-ink text-sm">Broadcast to a tournament</p>
        <p className="text-xs text-neutral-500 font-medium mt-0.5">Lands in the webapp group chat of every enrolled referee.</p>
        <label className="block text-xs font-semibold text-ink mt-4 mb-1">Tournament</label>
        <select value={tournament} onChange={(e) => { setTournament(e.target.value); setSent(false) }}
          className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-sm font-medium outline-none focus:border-brand">
          {dashTournaments.map((t) => <option key={t.id}>{t.name}</option>)}
        </select>
        <label className="block text-xs font-semibold text-ink mt-3 mb-1">Message</label>
        <textarea value={msg} onChange={(e) => { setMsg(e.target.value); setSent(false) }} rows={4} placeholder="Type your announcement…"
          className="w-full p-3 rounded-xl border border-neutral-200 text-sm font-medium outline-none focus:border-brand resize-none" />
        <button onClick={() => { if (msg.trim()) { setSent(true); setMsg('') } }}
          className="mt-3 w-full h-11 rounded-full bg-brand text-white font-semibold flex items-center justify-center gap-2">
          <Send size={16} /> Send to group
        </button>
        {sent && <p className="mt-3 text-xs font-semibold text-brand-dark text-center">✓ Sent, delivered to the webapp of all referees in {tournament}.</p>}
      </div>
    </div>
    {openTicket && (
      <Modal onClose={() => setOpenTicket(null)}>
        <TicketChat ticket={openTicket} onClose={() => setOpenTicket(null)} />
      </Modal>
    )}
    </>
  )
}

/* ---------------- AI smart inbox ---------------- */
const urgencyMap = {
  high: 'bg-red-50 text-red-600',
  normal: 'bg-sky-100 text-sky-700',
  low: 'bg-neutral-100 text-neutral-500',
}

export function DashboardInbox() {
  const [items, setItems] = useState(() => dashInbox.map((x) => ({ ...x })))
  const [sel, setSel] = useState(dashInbox[0].id)
  const [auto, setAuto] = useState(false)
  const [draft, setDraft] = useState(dashInbox[0].aiDraft)
  const [toast, setToast] = useState('')

  const current = items.find((x) => x.id === sel)

  const pick = (it) => { setSel(it.id); setDraft(it.aiDraft) }
  const send = () => {
    setItems((prev) => prev.map((x) => x.id === sel ? { ...x, status: 'answered' } : x))
    setToast(`Reply sent to ${current.name}.`)
  }
  const toggleAuto = (v) => {
    setAuto(v)
    if (v) {
      setItems((prev) => prev.map((x) => x.confidence >= 0.9 && x.status === 'new' ? { ...x, status: 'auto' } : x))
      setToast('Auto-answer on. High-confidence replies are sent automatically.')
    }
  }

  return (
    <>
    <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
      <div className="flex items-center gap-2 text-sm">
        <Sparkles size={17} className="text-brand" />
        <span className="font-semibold text-ink">AI triages every message and drafts a reply</span>
      </div>
      <label className="flex items-center gap-2 text-xs font-semibold text-neutral-600 cursor-pointer select-none">
        Auto-answer safe replies
        <span onClick={() => toggleAuto(!auto)} className={`w-10 h-6 rounded-full transition relative ${auto ? 'bg-brand' : 'bg-neutral-300'}`}>
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${auto ? 'left-[18px]' : 'left-0.5'}`} />
        </span>
      </label>
    </div>

    <div className="grid lg:grid-cols-[1fr_1.3fr] gap-5 items-start">
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
          <p className="font-bold text-ink text-sm">Inbox</p>
          <span className="text-xs font-medium text-neutral-400">{items.filter((x) => x.status === 'new').length} new</span>
        </div>
        <div className="divide-y divide-neutral-100 max-h-[540px] overflow-y-auto">
          {items.map((it) => (
            <button key={it.id} onClick={() => pick(it)} className={`w-full text-left px-4 py-3 transition ${sel === it.id ? 'bg-page' : 'hover:bg-page'}`}>
              <div className="flex items-center gap-2">
                {it.channel === 'email' ? <Mail size={14} className="text-neutral-400" /> : <MessageCircle size={14} className="text-neutral-400" />}
                <span className="font-semibold text-ink text-sm truncate flex-1">{it.name}</span>
                {it.status === 'answered' && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-light text-brand-dark">Answered</span>}
                {it.status === 'auto' && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand text-white inline-flex items-center gap-1"><Sparkles size={9} /> Auto</span>}
              </div>
              <p className="text-sm text-neutral-600 font-medium truncate mt-0.5">{it.subject}</p>
              <div className="flex flex-wrap items-center gap-1 mt-1.5">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">{it.topic}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${urgencyMap[it.urgency]}`}>{it.urgency}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">{it.language}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {current && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-ink text-base">{current.subject}</p>
              <p className="text-xs text-neutral-500 font-medium mt-0.5">{current.name} · {current.tournament}</p>
            </div>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${current.confidence >= 0.85 ? 'bg-brand-light text-brand-dark' : 'bg-amber-100 text-amber-700'}`}>
              {Math.round(current.confidence * 100)}% confidence
            </span>
          </div>

          <div className="mt-3 bg-page rounded-xl p-3.5 text-sm text-neutral-700 font-medium leading-relaxed">{current.body}</div>

          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-brand-dark">
            <Sparkles size={14} /> AI drafted reply
            {current.confidence >= 0.85
              ? <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-light text-brand-dark">Safe to send</span>
              : <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Needs review</span>}
          </div>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={6}
            className="mt-2 w-full p-3 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-700 outline-none focus:border-brand resize-none leading-relaxed" />

          <div className="mt-3 flex gap-3">
            <button onClick={() => setDraft(current.aiDraft)} className="h-11 px-4 rounded-full border border-neutral-200 text-neutral-600 font-semibold text-sm">Reset draft</button>
            <button onClick={send} disabled={current.status === 'answered'} className="flex-1 h-11 rounded-full bg-brand text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
              <Send size={16} /> {current.status === 'answered' ? 'Sent' : 'Send reply'}
            </button>
          </div>
        </div>
      )}
    </div>
    {toast && <Toast text={toast} onDone={() => setToast('')} />}
    </>
  )
}

/* ---------------- P&L ---------------- */
export function DashboardPnL() {
  const totalRev = dashPnl.reduce((a, b) => a + b.revenue, 0)
  const totalCost = dashPnl.reduce((a, b) => a + b.costs, 0)
  const net = totalRev - totalCost
  const marginPct = Math.round((net / totalRev) * 100)

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total revenue" value={euro(totalRev)} sub="6 tournaments" />
        <StatCard label="Total costs" value={euro(totalCost)} />
        <StatCard label="Net margin" value={euro(net)} sub={`${marginPct}% margin`} />
        <StatCard label="Avg. per referee" value={euro(Math.round(net / dashPnl.reduce((a, b) => a + b.referees, 0)))} />
      </div>

      <div className="mt-5 bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-neutral-500 border-b border-neutral-200">
              <th className="px-4 py-3 font-semibold">Tournament</th>
              <th className="px-4 py-3 font-semibold text-right">Revenue</th>
              <th className="px-4 py-3 font-semibold text-right">Costs</th>
              <th className="px-4 py-3 font-semibold text-right">Margin</th>
              <th className="px-4 py-3 font-semibold text-right">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 tabular-nums">
            {dashPnl.map((p, i) => {
              const m = p.revenue - p.costs
              const pct = Math.round((m / p.revenue) * 100)
              return (
                <tr key={i} className="hover:bg-page">
                  <td className="px-4 py-3 font-semibold text-ink">{p.name}</td>
                  <td className="px-4 py-3 text-right font-medium text-neutral-600">{euro(p.revenue)}</td>
                  <td className="px-4 py-3 text-right font-medium text-neutral-600">{euro(p.costs)}</td>
                  <td className="px-4 py-3 text-right font-bold text-brand-dark">{euro(m)}</td>
                  <td className="px-4 py-3 text-right font-medium text-neutral-500">{pct}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------------- Analytics ---------------- */
export function DashboardAnalytics() {
  const a = dashAnalytics
  const maxBar = Math.max(...a.refereesPerTournament.map((d) => d.value))
  const totalLevels = a.levels.beginner + a.levels.medior + a.levels.talent
  const donut = [
    { key: 'talent', val: a.levels.talent, color: '#44A546' },
    { key: 'medior', val: a.levels.medior, color: '#7FB2E8' },
    { key: 'beginner', val: a.levels.beginner, color: '#D3D6D2' },
  ]
  let acc = 0
  const circ = 2 * Math.PI * 42
  const maxLine = Math.max(...a.reportsByMonth.map((d) => d.v))
  const pts = a.reportsByMonth.map((d, i) => {
    const x = 20 + (i * 300) / (a.reportsByMonth.length - 1)
    const y = 130 - (d.v / maxLine) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Avg. referees / tournament" value="33" sub="+8% vs last year" />
        <StatCard label="Reports submitted" value="231" />
        <StatCard label="Avg. report score" value="4.2 / 5" sub="+0.3" />
        <StatCard label="Countries reached" value="27" />
      </div>

      <div className="mt-5 grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <p className="font-bold text-ink text-sm mb-4">Referees per tournament</p>
          <div className="flex items-end gap-3 h-40">
            {a.refereesPerTournament.map((d, i) => (
              <div key={i} className="flex-1 h-full flex flex-col justify-end items-center">
                <span className="text-[11px] font-bold text-brand-dark mb-1">{d.value}</span>
                <div className="w-full bg-brand rounded-t-md" style={{ height: `${(d.value / maxBar) * 88}%` }} />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-1.5">
            {a.refereesPerTournament.map((d, i) => (
              <span key={i} className="flex-1 text-[10px] font-medium text-neutral-500 truncate text-center">{d.name}</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <p className="font-bold text-ink text-sm mb-2">Referee levels</p>
          <div className="flex items-center gap-5">
            <svg width="110" height="110" viewBox="0 0 100 100" className="-rotate-90">
              {donut.map((d) => {
                const frac = d.val / totalLevels
                const dash = `${frac * circ} ${circ}`
                const el = <circle key={d.key} cx="50" cy="50" r="42" fill="none" stroke={d.color} strokeWidth="16" strokeDasharray={dash} strokeDashoffset={-acc * circ} />
                acc += frac
                return el
              })}
            </svg>
            <div className="space-y-1.5">
              {donut.map((d) => (
                <div key={d.key} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-sm" style={{ background: d.color }} />
                  <span className="font-semibold text-ink capitalize w-20">{d.key}</span>
                  <span className="font-medium text-neutral-500">{d.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-4 lg:col-span-2">
          <p className="font-bold text-ink text-sm mb-2 flex items-center gap-1.5"><TrendingUp size={16} className="text-brand" /> Reports submitted over time</p>
          <svg viewBox="0 0 340 150" className="w-full h-44">
            {[0, 1, 2, 3].map((g) => <line key={g} x1="20" x2="320" y1={30 + g * 33} y2={30 + g * 33} stroke="#eee" strokeWidth="1" />)}
            <polyline points={pts} fill="none" stroke="#44A546" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {a.reportsByMonth.map((d, i) => {
              const x = 20 + (i * 300) / (a.reportsByMonth.length - 1)
              const y = 130 - (d.v / maxLine) * 100
              return <g key={i}><circle cx={x} cy={y} r="3.5" fill="#44A546" /><text x={x} y="145" textAnchor="middle" fontSize="10" fill="#7c837e" fontWeight="500">{d.m}</text></g>
            })}
          </svg>
        </div>
      </div>
    </div>
  )
}
