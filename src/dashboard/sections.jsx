import { useState } from 'react'
import { Plus, MapPin, Calendar, Users, X, Send, MessageSquare, Search, TrendingUp } from 'lucide-react'
import { dashTournaments, dashReferees, dashStaff, dashTickets, dashPnl, dashAnalytics } from './data.js'

const euro = (n) => '€' + n.toLocaleString('en-US')

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

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-ink">{value}</p>
      {sub && <p className="text-xs font-medium text-brand-dark mt-0.5">{sub}</p>}
    </div>
  )
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

/* ---------------- Tournaments ---------------- */
export function DashboardTournaments() {
  const [open, setOpen] = useState(null)
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
            <div className="flex gap-3 mt-5">
              <button className="flex-1 h-11 rounded-full bg-brand text-white font-semibold flex items-center justify-center gap-2"><Users size={16} /> Manage referees</button>
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
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200">
        <Search size={16} className="text-neutral-400" />
        <input placeholder="Search referees" className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-neutral-400" />
        <span className="text-xs font-medium text-neutral-400">{dashReferees.length} referees</span>
      </div>
      <div className="divide-y divide-neutral-100">
        {dashReferees.map((r, i) => (
          <div key={i} className="flex items-center px-4 py-2.5 hover:bg-page transition">
            <span className="w-7 text-xs font-medium text-neutral-400 tabular-nums">{i + 1}</span>
            <span className="flex-1 font-semibold text-ink text-sm">{r.name}</span>
            <span className="w-40 text-sm text-neutral-500 font-medium">{r.flag} {r.country}</span>
            <span className="w-24 flex justify-end"><LevelPill level={r.level} /></span>
          </div>
        ))}
      </div>
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

function TicketChat({ ticket, onClose }) {
  const first = ticket.name.split(' ')[0]
  const initials = ticket.name.split(' ').map((w) => w[0]).join('')
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
              <span className="w-8 h-8 rounded-full bg-brand-light text-brand-dark flex items-center justify-center font-bold text-xs flex-none">{t.name.split(' ').map((w) => w[0]).join('')}</span>
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
