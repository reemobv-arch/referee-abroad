import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Plus, MapPin, Calendar, Users, X, Send, MessageSquare, Search, TrendingUp,
  Mail, MessageCircle, AlertTriangle, AlertCircle, Check, Sparkles, Star, Globe, Phone, ClipboardList,
  ChevronRight, Clock, Pencil, Trash2, RefreshCw, CheckCircle2, Coins, Building2, Plug, HelpCircle, UserPlus,
  Upload, Lock, FileText, SlidersHorizontal, ChevronDown, Download, Save,
} from 'lucide-react'
import {
  dashTournaments, dashReferees, dashStaff, dashTickets, dashPnl,
  dashEnrolments, dashMatches, dashInbox, refById, dashClubs,
  dashFields, dashObservers, dashGuests, obsById, dashReports,
} from './data.js'
import { FAQ_ITEMS } from '../faqContent.js'
import Flag from '../components/Flag.jsx'
import { countryCode } from '../regions.js'
import { getDashTournaments, getEnrolmentSummary, getParticipants, getReferees, getPnl, getAnalytics, approveApplication, getRefereeApplications, updateApplication, getSyncLog, getDmThreads, getDmThread, sendDmReply, markDmReadAdmin, LIVE } from '../lib/dataSource.js'

const euro = (n) => '€' + n.toLocaleString('en-US')
const initialsOf = (name) => name.split(' ').map((w) => w[0]).join('').slice(0, 2)
const GENDER_SHORT = { Boys: 'B', Girls: 'G', Mixed: 'M' }
const teamLabel = (t) => `${t.club} ${t.ageGroup}${t.gender ? ' ' + (GENDER_SHORT[t.gender] || '') : ''}`

/* ---- Smart import: parse any file, map columns, normalise age + gender ---- */
const CURRENT_SEASON_YEAR = 2026

function splitLine(line, d) {
  const out = []; let cur = ''; let q = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++ } else q = false } else cur += c }
    else { if (c === '"') q = true; else if (c === d) { out.push(cur); cur = '' } else cur += c }
  }
  out.push(cur); return out.map((s) => s.trim())
}
function detectDelimiter(line) {
  const c = { ',': (line.match(/,/g) || []).length, ';': (line.match(/;/g) || []).length, '\t': (line.match(/\t/g) || []).length }
  return Object.entries(c).sort((a, b) => b[1] - a[1])[0][1] > 0 ? Object.entries(c).sort((a, b) => b[1] - a[1])[0][0] : ','
}
// Parse arbitrary CSV/TSV into { header, rows }, auto-detecting the header row
// (it is not always the first row: some exports start with summary blocks).
function parseTable(text) {
  const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n').filter((l) => l.trim() !== '')
  if (!lines.length) return { header: [], rows: [] }
  const dLine = lines.find((l) => /[,;\t]/.test(l)) || lines[0]
  const d = detectDelimiter(dLine)
  const all = lines.map((l) => splitLine(l, d))
  let hi = 0, best = -1
  for (let i = 0; i < Math.min(all.length, 12); i++) {
    const n = all[i].filter((c) => c && isNaN(Number(c))).length
    if (n > best) { best = n; hi = i }
  }
  return { header: all[hi], rows: all.slice(hi + 1).filter((r) => r.some((c) => c !== '')) }
}

const FIELD_SYNONYMS = {
  home: ['home', 'hemmalag', 'team a', 'thuis', 'local'],
  away: ['away', 'bortalag', 'team b', 'uit', 'visitor', 'gäst'],
  team: ['team', 'lag', 'equipo', 'club'],
  category: ['category', 'team_type', 'team type', 'grupp', 'group', 'klass', 'division', 'cat', 'age group', 'age'],
  date: ['date', 'dag', 'day', 'datum', 'fecha', 'data'],
  time: ['time', 'tid', 'hour', 'kickoff', 'kick-off', 'hora', 'uur'],
  field: ['field', 'venue', 'spelplan', 'pitch', 'plan', 'court', 'ground', 'campo'],
  main: ['huvuddomare', 'referee 1', 'referee', 'main', 'scheidsrechter', 'centre', 'arbitro', 'árbitro'],
  ar1: ['assisterande 1', 'ar1', 'ar 1', 'referee 2', 'assistant 1', 'lineman 1'],
  ar2: ['assisterande 2', 'ar2', 'ar 2', 'referee 3', 'assistant 2', 'lineman 2'],
  fourth: ['fjärdedomare', '4th', 'fourth', 'referee 4', 'fourth official'],
}
const FIELD_LABELS = {
  home: 'Home team', away: 'Away team', team: 'Team (if no home/away)', category: 'Category (age / gender)',
  date: 'Date', time: 'Time', field: 'Field / pitch', main: 'Main referee', ar1: 'Assistant 1', ar2: 'Assistant 2', fourth: '4th official',
}
const FIELD_ORDER = ['home', 'away', 'team', 'category', 'date', 'time', 'field', 'main', 'ar1', 'ar2', 'fourth']

function autoMap(header) {
  const map = {}; const used = new Set()
  const norm = header.map((h) => String(h || '').toLowerCase().trim())
  for (const field of FIELD_ORDER) {
    for (let i = 0; i < norm.length; i++) {
      if (used.has(i) || !norm[i]) continue
      if (FIELD_SYNONYMS[field].some((s) => norm[i] === s || norm[i].includes(s))) { map[field] = i; used.add(i); break }
    }
  }
  return map
}

// Read gender + age from tokens like "U13 Boys", "G18", "u14girls", "U-13-11",
// "Cat BI11 - 2013" (birth year) or a bare "14".
function parseAgeGender(text) {
  const low = String(text || '').toLowerCase()
  let gender = null
  if (/girl|meisje|flick|female|\bwomen\b|\bg\s?-?\s?\d/.test(low)) gender = 'Girls'
  else if (/boy|jongen|pojk|\bmale\b|\bmen\b|\bb\s?-?\s?\d/.test(low)) gender = 'Boys'
  else if (/mix|coed|co-ed/.test(low)) gender = 'Mixed'
  let age = null
  let m = low.match(/\b[uo]\s?-?\s?(\d{1,2})\b/)
  if (m) age = 'U' + m[1]
  if (!age && (m = low.match(/\b[gb]\s?-?\s?(\d{2})\b/))) age = 'U' + m[1]
  if (!age && (m = low.match(/\b(20\d{2})\b/))) age = 'U' + (CURRENT_SEASON_YEAR - Number(m[1]))
  if (!age && (m = low.match(/\b(\d{2})\b/))) age = 'U' + m[1]
  return { age, gender }
}
function extractClub(name) {
  let s = String(name || '').trim()
  s = s.replace(/\bu\s?-?\s?\d{1,2}(\s?-\s?\d{1,2})?\b/ig, '')
  s = s.replace(/\b[gb]\s?-?\s?\d{2}\b/ig, '')
  s = s.replace(/\b(boys?|girls?|mixed|meisjes|jongens|flickor|pojkar)\b/ig, '')
  s = s.replace(/\b20\d{2}\b/g, '')
  s = s.replace(/[-–]+\s*$/, '').replace(/\s{2,}/g, ' ').trim()
  return s || String(name || '').trim()
}

// Read a dropped file into table text. .xlsx/.xls go through SheetJS (loaded on
// demand, so it never weighs down the initial bundle); everything else is read
// as plain text (CSV / TSV).
async function fileToTableText(file) {
  const name = (file.name || '').toLowerCase()
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    const XLSX = await import('xlsx')
    const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    return XLSX.utils.sheet_to_csv(sheet)
  }
  return await file.text()
}

// Trigger a client-side download of text as a file.
function downloadText(filename, text, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
}

// Reusable column-mapping profiles (I6), saved per source name in the browser,
// so an organiser's recurring export format only has to be mapped once.
const MAP_STORE = 'ra_import_maps'
function loadMapProfiles() { try { return JSON.parse(localStorage.getItem(MAP_STORE) || '{}') } catch { return {} } }
function saveMapProfile(name, header, map) {
  try { const all = loadMapProfiles(); all[name] = { header, map }; localStorage.setItem(MAP_STORE, JSON.stringify(all)) } catch { /* ignore */ }
}

// Turn a parsed table + a column mapping into { teams, matches }.
function buildImport(table, map) {
  const val = (r, f) => (map[f] != null ? (r[map[f]] ?? '') : '').toString().trim()
  const hasHomeAway = map.home != null && map.away != null
  const teams = new Map()
  const addTeam = (rawName, catText) => {
    if (!rawName) return
    const a = parseAgeGender(catText); const b = parseAgeGender(rawName)
    const ageGroup = a.age || b.age || 'U?'
    const gender = a.gender || b.gender || 'Mixed'
    const club = extractClub(rawName)
    const key = `${club}::${ageGroup}::${gender}`.toLowerCase()
    if (!teams.has(key)) teams.set(key, { club, ageGroup, gender })
  }
  const matches = []
  for (const r of table.rows) {
    const cat = val(r, 'category')
    if (hasHomeAway) {
      const home = val(r, 'home'); const away = val(r, 'away')
      if (!home && !away) continue
      addTeam(home, cat); addTeam(away, cat)
      matches.push({ id: 'm' + Math.random().toString(36).slice(2, 8), day: val(r, 'date') || 'Day 1', time: val(r, 'time') || 'TBD', pitch: val(r, 'field') || 'TBD', home, away, main: null, assistants: [],
        // Referee names from the file, matched to the directory on import below.
        mainName: val(r, 'main') || null, arNames: [val(r, 'ar1'), val(r, 'ar2')].filter(Boolean), fourthName: val(r, 'fourth') || null })
    } else {
      addTeam(val(r, 'team') || val(r, 'home'), cat)
    }
  }
  return { teams: [...teams.values()], matches }
}

const SAMPLE_TEAMS_CSV = `club,age_group,gender
Ajax,U13,Boys
Ajax,U15,Girls
Benfica,U13,Boys
Benfica,U15,Girls`

function LevelPill({ level }) {
  const map = {
    beginner: 'bg-neutral-100 text-neutral-600',
    medior: 'bg-sky-100 text-sky-700',
    talent: 'bg-brand-light text-brand-dark',
  }
  if (!level) return null
  return <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize whitespace-nowrap ${map[level] || 'bg-brand-light text-brand-dark'}`}>{level}</span>
}

// Short creation date for the tournament card, e.g. "15 Sep 2025".
function fmtCreated(iso) {
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return '' }
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

// Which tournaments each referee enrolled for, with their status. Built from the
// enrolments so the referee list can show it directly.
const enrolmentsByRef = (() => {
  const map = {}
  for (const [tid, list] of Object.entries(dashEnrolments)) {
    const t = dashTournaments.find((x) => x.id === tid)
    if (!t) continue
    for (const e of list) (map[e.refId] ||= []).push({ tid: t.id, tournament: t.name, city: t.city, status: e.status, date: e.date })
  }
  return map
})()

const fmtEnrolDate = (v) => v ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

const EnrolChips = ({ refId, className = '' }) => {
  const items = enrolmentsByRef[refId] || []
  if (items.length === 0) return <span className={`text-xs text-neutral-300 font-medium ${className}`}>Not enrolled</span>
  return (
    <span className={`flex flex-wrap gap-1 ${className}`}>
      {items.map((e, i) => (
        <span key={i} className={`inline-flex items-center gap-1 text-[10px] font-semibold pl-2 pr-1.5 py-0.5 rounded-full ${enrolMap[e.status]}`}>
          {e.city}<span className="opacity-40">·</span><span className="capitalize">{e.status}</span>
        </span>
      ))}
    </span>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 hover:shadow-md transition-shadow">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1.5 text-2xl font-extrabold text-ink leading-none">{value}</p>
      {sub && <p className="text-xs font-semibold text-brand-dark mt-1.5">{sub}</p>}
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

// Sub-tab bar used inside the consolidated hubs (People, Communication, Insights, Settings).
function SubTabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 mb-5 border-b border-neutral-200 overflow-x-auto no-scrollbar">
      {tabs.map((x) => (
        <button key={x.k} onClick={() => onChange(x.k)}
          className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition ${active === x.k ? 'border-brand text-brand-dark' : 'border-transparent text-neutral-500 hover:text-ink'}`}>
          {x.label}
        </button>
      ))}
    </div>
  )
}

/* ---------------- Tournaments ---------------- */
function Crumb({ children, onClick, current }) {
  if (current) return <span className="text-ink font-semibold">{children}</span>
  return <button onClick={onClick} className="text-neutral-500 hover:text-brand-dark font-medium transition">{children}</button>
}

function EnrolmentList({ enrol, onAction }) {
  if (enrol.length === 0) return <EmptyState title="No participants yet" sub="Referees who apply for this tournament will appear here." />

  const actionsFor = (status) => {
    if (status === 'applied') return [['approve', 'Approve', 'bg-brand text-white'], ['decline', 'Decline', 'border border-neutral-200 text-neutral-500']]
    if (status === 'paid') return [['approve', 'Confirm', 'bg-brand text-white'], ['decline', 'Remove', 'border border-neutral-200 text-neutral-500']]
    if (status === 'waitlist') return [['promote', 'Move off waitlist', 'bg-brand-light text-brand-dark'], ['decline', 'Remove', 'border border-neutral-200 text-neutral-500']]
    return [['decline', 'Remove', 'border border-neutral-200 text-neutral-500']]
  }
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
      <div className="flex items-center px-4 py-2.5 border-b border-neutral-200 text-[11px] uppercase tracking-wide text-neutral-500 font-semibold">
        <span className="w-56 flex-none">Referee</span>
        <span className="w-40 hidden md:block">Country</span>
        <span className="w-32 hidden sm:block">Applied</span>
        <span className="w-24">Status</span>
        <span className="flex-1 text-right">Actions</span>
      </div>
      <div className="divide-y divide-neutral-100">
        {enrol.map((e, i) => {
          const r = refById[e.refId] || {}
          const name = e.name || r.name || `Referee #${e.id ?? ''}`
          const country = e.country || r.country || ''
          const flag = r.flag || ''
          return (
            <div key={e.id ?? e.refId ?? i} className="flex items-center px-4 py-2.5">
              <span className="w-56 flex-none flex items-center gap-3 min-w-0">
                <span className="w-8 h-8 rounded-full bg-brand text-white text-[11px] font-bold flex items-center justify-center flex-none">{initialsOf(name)}</span>
                <span className="text-sm font-semibold text-ink truncate">{name}</span>
              </span>
              <span className="w-40 text-sm text-neutral-500 font-medium hidden md:block truncate">{flag} {country}</span>
              <span className="w-32 text-xs text-neutral-500 font-medium hidden sm:flex items-center gap-1">{fmtEnrolDate(e.date)}</span>
              <span className="w-24"><span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${enrolMap[e.status]}`}>{e.status}</span></span>
              <span className="flex-1 flex gap-1.5 justify-end">
                {onAction
                  ? actionsFor(e.status).map(([act, label, cls]) => (
                      <button key={act} onClick={() => onAction(e.refId, act)} className={`text-[11px] font-semibold px-2.5 h-7 rounded-full ${cls}`}>{label}</button>
                    ))
                  : <span className="text-[11px] font-medium text-neutral-300">read-only</span>}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---- Participants table: operational view with a column picker ----
   Live Phase 1 only has a few whitelisted fields per participant (name,
   country, status, email, sex); the richer operational columns (phone, DOB,
   size, cost, accommodation, flights, ...) are mock-only until that data
   exists. In live we therefore show only the available columns. */
const FEMALE_NAMES = new Set(['Ana', 'Sophie', 'Emma', 'Lena', 'Marta', 'Chiara', 'Sara', 'Julia', 'Nina', 'Laura'])
const SIZES = ['XS', 'S', 'M', 'L', 'XL']
const HOTELS = ['Hotel Vila Foz', 'Grand Plaza', 'City Garden Inn', 'Seaside Resort', 'Olympic Lodge', 'Central Suites']
function hashN(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h }
function flightNo(seed) { const L = 'ABDEFKLNOQSTUW'; return L[seed % L.length] + L[(seed >> 4) % L.length] + (100 + (seed % 899)) }
function partExtras(r, t) {
  const h = hashN(r.id || 'x'); const ht = hashN((r.id || 'x') + (t?.id || ''))
  const parts = (r.name || '').split(' '); const first = parts[0] || ''; const surname = parts.slice(1).join(' ')
  const age = 24 + (h % 26); const birthYear = 2026 - age; const day = 1 + (h % 28); const month = 1 + ((h >> 3) % 12)
  const dd = String(day).padStart(2, '0'); const mm = String(month).padStart(2, '0')
  const parcels = String(t?.dates || '').split(' to ')
  return {
    first, surname, size: SIZES[h % SIZES.length], age, dob: `${dd}-${mm}-${birthYear}`,
    whatsapp: r.phone || '', sex: FEMALE_NAMES.has(first) ? 'F' : 'M', accommodation: HOTELS[h % HOTELS.length],
    arrival: parcels[0] || '', arrivalFlight: flightNo(ht), departure: parcels[1] || parcels[0] || '', departureFlight: flightNo(ht >> 2),
  }
}
const PART_ROLES = ['referee', 'staff', 'observer', 'media', 'observer VIP', 'coach']
const ROLE_PILL = {
  referee: 'bg-brand-light text-brand-dark', staff: 'bg-sky-100 text-sky-700', observer: 'bg-amber-100 text-amber-700',
  media: 'bg-purple-100 text-purple-700', 'observer VIP': 'bg-rose-100 text-rose-700', coach: 'bg-teal-100 text-teal-700',
}
const PART_LIVE_COLS = new Set(['num', 'name', 'surname', 'country', 'status', 'role', 'fa', 'email', 'sex'])
const PART_DEFAULT_OFF = new Set(['arrflight', 'departure', 'depflight', 'actions'])

// Export to a real .xlsx file, SheetJS loaded on demand.
async function exportToXlsx(filename, headers, rows) {
  const XLSX = await import('xlsx')
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Export')
  XLSX.writeFile(wb, filename)
}
// Multi-sheet export: { 'Sheet name': { headers, rows } }.
async function exportSheetsToXlsx(filename, sheets) {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()
  for (const [name, { headers, rows }] of Object.entries(sheets)) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([headers, ...rows]), name.slice(0, 31))
  }
  XLSX.writeFile(wb, filename)
}

function ParticipantsTable({ t, enrol, onAction }) {
  const rows = useMemo(() => enrol.map((e, i) => {
    if (LIVE) {
      const parts = (e.name || '').split(' ')
      return { num: i + 1, first: parts[0] || '', surname: parts.slice(1).join(' '), country: e.country || '', flag: '', status: e.status, role: e.role || 'referee', fa: !!e.fa, orderId: e.orderId, email: e.email || '', sex: e.sex || '', paid: e.status === 'confirmed', e }
    }
    const r = refById[e.refId] || { name: `Referee ${i + 1}` }
    const x = partExtras(r, t)
    const paid = e.status === 'confirmed' || e.status === 'paid'
    const role = i % 9 === 8 ? 'observer' : i % 6 === 5 ? 'staff' : 'referee'
    return {
      num: i + 1, first: x.first, surname: x.surname, country: r.country || '', flag: r.flag || '', status: e.status, role,
      email: r.email || '', phone: r.phone || '', size: x.size, age: x.age, dob: x.dob, whatsapp: x.whatsapp, sex: x.sex,
      fee: paid ? 'Paid' : 'No fee', cost: paid ? `€${150 + (hashN(r.id || 'x') % 90)}` : '—', accom: x.accommodation,
      arrival: x.arrival, arrflight: x.arrivalFlight, departure: x.departure, depflight: x.departureFlight, paid, e,
    }
  }), [enrol, t])

  // Local prototype state (no backend yet): per-row role override, FA flag, selection.
  const [roleOv, setRoleOv] = useState({})
  const [faMap, setFaMap] = useState({})
  const [sel, setSel] = useState(() => new Set())
  // Prototype accommodation options + per-row pick (the real build reads these
  // from the tournament config and persists them).
  const ACCOM_OPTIONS = ['Hotel Centro', 'Hotel Rio', 'Guesthouse Park']
  const [accomPick, setAccomPick] = useState({})
  const roleOf = (d) => roleOv[d.num] ?? d.role
  const faOf = (d) => faMap[d.num] ?? !!d.fa
  const toggleFa = (d) => {
    const next = !faOf(d)
    setFaMap((m) => ({ ...m, [d.num]: next }))
    if (d.orderId) updateApplication(d.orderId, { fa: next }).catch(() => {})
  }
  const setRole = (d, role) => {
    setRoleOv((m) => ({ ...m, [d.num]: role }))
    if (d.orderId) updateApplication(d.orderId, { role }).catch(() => {})
  }
  const toggleSel = (num) => setSel((s) => { const n = new Set(s); n.has(num) ? n.delete(num) : n.add(num); return n })

  const dash = (v) => (v == null || v === '' ? '—' : v)
  const ALL_COLS = [
    { key: 'num', label: '#', cell: (d) => d.num, hideable: false },
    { key: 'name', label: 'Name', cell: (d) => dash(d.first) },
    { key: 'surname', label: 'Surname', cell: (d) => dash(d.surname) },
    { key: 'country', label: 'Country', cell: (d) => <span className="inline-flex items-center gap-1.5"><Flag code={countryCode(d.country)} emoji={d.flag} size={12} /> {d.country || '—'}</span> },
    { key: 'status', label: 'Status', cell: (d) => <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${enrolMap[d.status]}`}>{d.status}</span> },
    { key: 'role', label: 'Role', cell: (d) => (
      <select value={roleOf(d)} onChange={(e) => setRole(d, e.target.value)}
        className={`text-[10px] font-semibold pl-2 pr-1 py-1 rounded-full capitalize border-0 outline-none cursor-pointer ${ROLE_PILL[roleOf(d)] || 'bg-neutral-100 text-neutral-500'}`}>
        {PART_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
    ) },
    { key: 'fa', label: 'FA referee', cell: (d) => (
      <button onClick={() => toggleFa(d)} className={`text-[10px] font-bold px-2.5 h-6 rounded-full transition ${faOf(d) ? 'bg-brand text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}>{faOf(d) ? 'Yes' : 'No'}</button>
    ) },
    { key: 'email', label: 'Email', cell: (d) => dash(d.email) },
    { key: 'phone', label: 'Phone', cell: (d) => dash(d.phone) },
    { key: 'size', label: 'Size', cell: (d) => dash(d.size) },
    { key: 'age', label: 'Age', cell: (d) => dash(d.age) },
    { key: 'dob', label: 'Date of birth', cell: (d) => dash(d.dob) },
    { key: 'whatsapp', label: 'WhatsApp', cell: (d) => dash(d.whatsapp) },
    { key: 'sex', label: 'Sex', cell: (d) => dash(d.sex) },
    { key: 'fee', label: 'Fee', cell: (d) => <span className={d.paid ? 'text-brand-dark font-semibold' : 'text-neutral-500'}>{dash(d.fee)}</span> },
    { key: 'cost', label: 'Cost', cell: (d) => dash(d.cost) },
    { key: 'accom', label: 'Accommodation', cell: (d) => (
      <select value={accomPick[d.num] ?? d.accom ?? ''} onChange={(e) => setAccomPick((p) => ({ ...p, [d.num]: e.target.value }))}
        className="text-[11px] font-semibold pl-2 pr-1 py-1 rounded-full border border-neutral-200 outline-none cursor-pointer bg-white max-w-[150px]">
        <option value="">—</option>
        {[...new Set([...(d.accom ? [d.accom] : []), ...ACCOM_OPTIONS])].map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    ) },
    { key: 'arrival', label: 'Arrival', cell: (d) => dash(d.arrival) },
    { key: 'arrflight', label: 'Arrival flight', cell: (d) => dash(d.arrflight) },
    { key: 'departure', label: 'Departure', cell: (d) => dash(d.departure) },
    { key: 'depflight', label: 'Departure flight', cell: (d) => dash(d.depflight) },
    ...(LIVE ? [] : [{ key: 'actions', label: 'Actions', cell: (d) => (
      d.e.status === 'applied' || d.e.status === 'paid'
        ? <span className="flex gap-1.5">
            <button onClick={() => onAction(d.e.refId, 'approve')} className="text-[10px] font-semibold px-2 h-6 rounded-full bg-brand text-white">{d.e.status === 'paid' ? 'Confirm' : 'Approve'}</button>
            <button onClick={() => onAction(d.e.refId, 'decline')} className="text-[10px] font-semibold px-2 h-6 rounded-full border border-neutral-200 text-neutral-500">Remove</button>
          </span>
        : <span className="text-neutral-300">—</span>
    ) }]),
  ]
  const COLS = LIVE ? ALL_COLS.filter((c) => PART_LIVE_COLS.has(c.key)) : ALL_COLS

  const [vis, setVis] = useState(() => Object.fromEntries(COLS.map((c) => [c.key, LIVE ? true : !PART_DEFAULT_OFF.has(c.key)])))
  const [pickerOpen, setPickerOpen] = useState(false)
  const shown = COLS.filter((c) => vis[c.key])
  const toggle = (k) => setVis((v) => ({ ...v, [k]: !v[k] }))

  const cellText = (key, d) => {
    switch (key) {
      case 'num': return String(d.num)
      case 'name': return d.first || ''
      case 'surname': return d.surname || ''
      case 'country': return d.country || ''
      case 'role': return roleOf(d)
      case 'fa': return faOf(d) ? 'Yes' : 'No'
      default: return d[key] != null ? String(d[key]) : ''
    }
  }
  const allSel = rows.length > 0 && rows.every((d) => sel.has(d.num))
  const toggleAll = () => setSel(allSel ? new Set() : new Set(rows.map((d) => d.num)))
  const doExport = async () => {
    const cols = shown.filter((c) => c.key !== 'actions')
    const chosen = rows.filter((d) => sel.size === 0 || sel.has(d.num))
    const headers = cols.map((c) => c.label)
    const data = chosen.map((d) => cols.map((c) => cellText(c.key, d)))
    await exportToXlsx(`${(t?.name || 'participants').replace(/[^\w]+/g, '-').toLowerCase()}-participants.xlsx`, headers, data)
  }

  if (enrol.length === 0) return <EmptyState title="No participants yet" sub="Referees who apply for this tournament will appear here." />


  return (
    <div>
      <div className="flex items-center justify-between mb-3 gap-2">
        <p className="text-[13px] font-semibold text-neutral-500">{enrol.length} participants{sel.size ? ` · ${sel.size} selected` : ''}</p>
        <div className="flex items-center gap-2">
        <button onClick={doExport} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-neutral-200 bg-white text-[13px] font-semibold text-ink hover:border-brand">
          <Download size={15} /> Export{sel.size ? ` (${sel.size})` : ''}
        </button>
        <div className="relative">
          <button onClick={() => setPickerOpen((o) => !o)} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-neutral-200 bg-white text-[13px] font-semibold text-ink hover:border-brand">
            <SlidersHorizontal size={15} /> Columns <ChevronDown size={14} className="text-neutral-500" />
          </button>
          {pickerOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setPickerOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto bg-white rounded-2xl border border-neutral-200 shadow-xl z-30 p-2">
                {COLS.filter((c) => c.hideable !== false).map((c) => (
                  <label key={c.key} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-page cursor-pointer text-sm font-medium text-ink">
                    <input type="checkbox" checked={!!vis[c.key]} onChange={() => toggle(c.key)} className="accent-brand" />
                    {c.label}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-neutral-500 border-b border-neutral-200 bg-page/60">
              <th className="px-3 py-2.5 w-8"><input type="checkbox" checked={allSel} onChange={toggleAll} className="accent-brand" aria-label="Select all" /></th>
              {shown.map((c) => <th key={c.key} className="px-3 py-2.5 font-semibold">{c.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((d) => (
              <tr key={d.num} className={`hover:bg-page ${sel.has(d.num) ? 'bg-brand-light/40' : ''}`}>
                <td className="px-3 py-2.5"><input type="checkbox" checked={sel.has(d.num)} onChange={() => toggleSel(d.num)} className="accent-brand" aria-label={`Select row ${d.num}`} /></td>
                {shown.map((c) => <td key={c.key} className="px-3 py-2.5 text-neutral-600 font-medium">{c.cell(d)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const genderPill = (g) => g === 'Girls' ? 'bg-pink-100 text-pink-700' : g === 'Boys' ? 'bg-sky-100 text-sky-700' : 'bg-neutral-100 text-neutral-500'

function SmartImportModal({ tournamentName, existing = 0, dayScope = null, onClose, onImport }) {
  const [step, setStep] = useState('input')
  const [text, setText] = useState('')
  const [map, setMap] = useState({})
  const table = useMemo(() => parseTable(text), [text])
  const result = useMemo(() => step === 'preview' ? buildImport(table, map) : { teams: [], matches: [] }, [step, table, map])
  const clubCount = useMemo(() => new Set(result.teams.map((t) => t.club.toLowerCase())).size, [result])
  const apptCols = ['main', 'ar1', 'ar2', 'fourth'].filter((f) => map[f] != null).length
  const [profiles, setProfiles] = useState(() => loadMapProfiles())

  const onFile = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    try { setText(await fileToTableText(file)) } catch { setText('') }
    e.target.value = ''
  }
  const toMap = () => {
    // Reuse a saved mapping when this file's header matches one (I6); else auto-map.
    const sig = (h) => (h || []).join('|').toLowerCase()
    const match = Object.values(profiles).find((p) => sig(p.header) === sig(table.header))
    setMap(match ? match.map : autoMap(table.header))
    setStep('map')
  }
  const setField = (f) => (e) => setMap((m) => ({ ...m, [f]: e.target.value === '' ? null : Number(e.target.value) }))
  const applyProfile = (name) => { const p = profiles[name]; if (p) setMap(p.map) }
  const saveProfile = () => {
    const name = (window.prompt('Save this column mapping for next time. Name it after the organiser or source:') || '').trim()
    if (!name) return
    saveMapProfile(name, table.header, map)
    setProfiles(loadMapProfiles())
  }
  const profileNames = Object.keys(profiles)

  return (
    <Modal onClose={onClose} wide>
      <div className="p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xl font-extrabold text-ink">{dayScope ? `Import into ${dayScope}` : 'Import teams & fixtures'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-page flex items-center justify-center"><X size={18} /></button>
        </div>
        <p className="text-[12px] font-medium text-neutral-500 mb-4">
          {step === 'input' && (dayScope ? `Upload the schedule for ${dayScope} of ${tournamentName}. Any organiser format works, we map the columns in the next step.` : `Upload the schedule for the whole of ${tournamentName}. Any organiser format works, we map the columns in the next step.`)}
          {step === 'map' && 'Check the detected columns. We read age and gender from the team names or the category column.'}
          {step === 'preview' && 'Review what will be imported, then confirm.'}
        </p>

        {step === 'input' && (
          <>
            {dayScope ? (
              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3.5 mb-3 flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-sky-600 flex-none mt-0.5" />
                <p className="text-[12.5px] font-medium text-sky-800 leading-snug"><span className="font-bold">This imports only into {dayScope}.</span> It replaces the matches on {dayScope} and leaves the other days untouched. To import the whole tournament at once, use <span className="font-bold">Import</span> on the Teams tab instead.</p>
              </div>
            ) : existing > 0 ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5 mb-3 flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-amber-600 flex-none mt-0.5" />
                <p className="text-[12.5px] font-medium text-amber-800 leading-snug"><span className="font-bold">This replaces the whole tournament's teams and schedule.</span> Referee appointments on the existing matches are cleared, unless the new file includes referee columns. To update the schedule and keep the appointments, use <span className="font-bold">Revised schedule</span>; to change one day only, open that day and use <span className="font-bold">Import into Day X</span>.</p>
              </div>
            ) : null}
            <div className="rounded-2xl border border-neutral-200 bg-page p-4">
              <p className="text-[13px] font-bold text-ink flex items-center gap-1.5"><HelpCircle size={14} className="text-brand-dark" /> Works with any file</p>
              <ul className="mt-2 space-y-1 text-[12.5px] text-neutral-600 font-medium list-disc pl-4">
                <li>Paste or upload a CSV / Excel export from the organiser. Columns can be in any language.</li>
                <li>We detect the header row and auto-map the fields, then you confirm.</li>
                <li>Age and gender are read from the team names or a category column (e.g. u14girls, G18, birth year 2013).</li>
              </ul>
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="text-[12px] font-semibold text-ink">No export system? Use this simple template:</p>
                <button onClick={() => downloadText('referee-abroad-teams-template.csv', SAMPLE_TEAMS_CSV)}
                  className="inline-flex items-center gap-1.5 text-[12px] font-bold text-brand-dark hover:underline shrink-0">
                  <Download size={13} /> Download template
                </button>
              </div>
              <pre className="mt-1 bg-white border border-neutral-200 rounded-xl p-3 text-[12px] text-ink font-mono overflow-x-auto whitespace-pre">{SAMPLE_TEAMS_CSV}</pre>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-ink">Paste data or upload a file</span>
                <label className="inline-flex items-center gap-1.5 text-[12px] font-bold text-brand-dark cursor-pointer hover:underline">
                  <Upload size={13} /> Choose file
                  <input type="file" accept=".csv,.tsv,.xlsx,.xls,text/csv,text/plain" onChange={onFile} className="hidden" />
                </label>
              </div>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder={SAMPLE_TEAMS_CSV}
                className="w-full rounded-xl border border-neutral-200 p-3 text-[13px] font-mono outline-none focus:border-brand resize-y" />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={onClose} className="h-11 px-5 rounded-full border border-neutral-200 text-neutral-600 font-semibold">Cancel</button>
              <button onClick={toMap} disabled={!table.header.length}
                className="flex-1 h-11 rounded-full bg-brand text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                Continue <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}

        {step === 'map' && (
          <>
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              {profileNames.length > 0 ? (
                <label className="inline-flex items-center gap-2 text-[12px] font-semibold text-neutral-500">
                  Saved mapping
                  <select onChange={(e) => e.target.value && applyProfile(e.target.value)} defaultValue=""
                    className="h-8 px-2 rounded-lg border border-neutral-200 text-sm font-medium outline-none focus:border-brand">
                    <option value="">— choose —</option>
                    {profileNames.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
              ) : <span className="text-[12px] font-medium text-neutral-500">Tip: save this mapping to reuse it for this organiser next time.</span>}
              <button onClick={saveProfile} className="inline-flex items-center gap-1.5 text-[12px] font-bold text-brand-dark hover:underline">
                <Save size={13} /> Save mapping
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 max-h-[46vh] overflow-y-auto pr-1">
              {FIELD_ORDER.map((f) => (
                <div key={f}>
                  <p className="text-[11px] font-semibold text-neutral-500 mb-1">{FIELD_LABELS[f]}</p>
                  <select value={map[f] ?? ''} onChange={setField(f)}
                    className={`w-full h-9 px-2.5 rounded-lg border text-sm font-medium outline-none focus:border-brand ${map[f] != null ? 'border-neutral-200' : 'border-neutral-200 text-neutral-500'}`}>
                    <option value="">— not in file —</option>
                    {table.header.map((h, i) => <option key={i} value={i}>{h || `Column ${i + 1}`}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[12px] font-medium text-neutral-500">Detected {table.rows.length} rows. Appointment columns found: {apptCols}. Referee names are matched to your directory and appointed automatically; unmatched ones stay open for manual assignment.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setStep('input')} className="h-11 px-5 rounded-full border border-neutral-200 text-neutral-600 font-semibold">Back</button>
              <button onClick={() => setStep('preview')} disabled={map.home == null && map.team == null}
                className="flex-1 h-11 rounded-full bg-brand text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                Preview <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}

        {step === 'preview' && (
          <>
            <div className="flex flex-wrap gap-3 mb-3">
              <div className="bg-page rounded-xl px-4 py-2.5"><p className="text-[11px] text-neutral-500 font-medium">Teams</p><p className="font-bold text-ink text-lg leading-none">{result.teams.length}</p></div>
              <div className="bg-page rounded-xl px-4 py-2.5"><p className="text-[11px] text-neutral-500 font-medium">Clubs</p><p className="font-bold text-ink text-lg leading-none">{clubCount}</p></div>
              <div className="bg-page rounded-xl px-4 py-2.5"><p className="text-[11px] text-neutral-500 font-medium">Matches</p><p className="font-bold text-ink text-lg leading-none">{result.matches.length}</p></div>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden divide-y divide-neutral-100 max-h-[40vh] overflow-y-auto">
              {result.teams.slice(0, 40).map((t, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2">
                  <span className="flex-1 text-sm font-semibold text-ink truncate">{t.club}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-page text-neutral-600 border border-neutral-200">{t.ageGroup}</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${genderPill(t.gender)}`}>{t.gender}</span>
                </div>
              ))}
              {result.teams.length === 0 && <p className="p-4 text-sm text-neutral-500 font-medium">Nothing detected. Go back and check the column mapping.</p>}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setStep('map')} className="h-11 px-5 rounded-full border border-neutral-200 text-neutral-600 font-semibold">Back</button>
              <button onClick={() => result.teams.length && onImport(result)} disabled={!result.teams.length}
                className="flex-1 h-11 rounded-full bg-brand text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                <Upload size={16} /> Import{existing > 0 ? ` (replaces ${existing})` : ''}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

function ClubsTab({ teams, onOpenImport }) {
  if (teams.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-brand-light text-brand-dark flex items-center justify-center mx-auto"><Building2 size={22} /></div>
        <p className="mt-3 text-sm font-bold text-ink">No teams imported yet</p>
        <p className="mt-1 text-[13px] text-neutral-500 font-medium max-w-md mx-auto">Import the participating teams first. Appointing referees stays locked until the teams are known, because you cannot build the schedule without them.</p>
        <button onClick={onOpenImport} className="mt-4 inline-flex items-center gap-2 bg-brand text-white text-sm font-semibold px-5 h-11 rounded-full"><Upload size={16} /> Import teams</button>
      </div>
    )
  }
  const byClub = {}
  for (const t of teams) (byClub[t.club] ||= []).push(t)
  const clubs = Object.keys(byClub).sort()
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-[13px] font-semibold text-neutral-500">{teams.length} teams · {clubs.length} clubs</p>
        <button onClick={onOpenImport} className="inline-flex items-center gap-1.5 border border-neutral-200 text-ink text-sm font-semibold px-4 h-10 rounded-full hover:border-brand transition"><Upload size={15} /> Re-import</button>
      </div>
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-neutral-100">
          <span className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">Club</span>
          <span className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">Teams · age and gender</span>
        </div>
        <div className="divide-y divide-neutral-100">
          {clubs.map((club) => {
            const tms = byClub[club].slice().sort((a, b) => a.ageGroup.localeCompare(b.ageGroup))
            return (
              <div key={club} className="flex items-center gap-3 px-4 py-3 flex-wrap">
                <span className="w-9 h-9 rounded-full bg-brand text-white text-[11px] font-bold flex items-center justify-center flex-none">{initialsOf(club)}</span>
                <span className="flex-1 min-w-[120px]">
                  <span className="block text-sm font-semibold text-ink">{club}</span>
                  <span className="block text-[12px] font-medium text-neutral-400">{tms.length} {tms.length === 1 ? 'team' : 'teams'}</span>
                </span>
                <span className="flex flex-wrap gap-1.5 justify-end">
                  {tms.map((tm, i) => (
                    <span key={i} className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${genderPill(tm.gender)}`}>{tm.ageGroup} · {tm.gender || 'Mixed'}</span>
                  ))}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Phase 1 keeps the briefing / kick-off light: the admin ticks a box once the
// meeting is arranged. Generating and sending the actual Google Meet links is a
// Phase 2 item (Google Calendar integration); for now the admin shares the link
// outside the dashboard.
function ReadinessCheck({ label, sub, checked, onToggle }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex-1 min-w-0">
        <span className="block text-[14px] font-bold text-ink">{label}</span>
        <span className="block text-[12px] font-medium text-neutral-500">{sub}</span>
      </span>
      <button onClick={() => onToggle(!checked)} role="switch" aria-checked={checked}
        className={`text-[11px] font-bold px-3 h-7 rounded-full inline-flex items-center gap-1.5 flex-none ${checked ? 'bg-brand text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}>
        {checked ? <><Check size={13} /> Arranged</> : 'Mark arranged'}
      </button>
    </div>
  )
}

// Admin enters the tournament's hotels; participants are assigned one and see it in the app.
function AccommodationModal({ accommodation, onClose, onSave }) {
  const [options, setOptions] = useState(accommodation.options.length ? [...accommodation.options] : [''])
  const [ready, setReady] = useState(!!accommodation.ready)
  const setAt = (i, v) => setOptions((o) => o.map((x, j) => (j === i ? v : x)))
  return (
    <Modal onClose={onClose}>
      <div className="p-5">
        <h3 className="text-xl font-extrabold text-ink">Accommodation</h3>
        <p className="mt-1 text-sm text-neutral-500 font-medium">Add the hotels for this tournament. You assign each participant a hotel in the Participants table, and they see it in the app.</p>
        <div className="mt-4 space-y-2">
          {options.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={o} onChange={(e) => setAt(i, e.target.value)} placeholder={`Hotel ${String.fromCharCode(65 + i)}`} className={inputCls} />
              <button onClick={() => setOptions((arr) => arr.filter((_, j) => j !== i))} className="w-9 h-9 rounded-xl border border-neutral-200 text-neutral-400 hover:text-red-500 flex items-center justify-center flex-none"><X size={16} /></button>
            </div>
          ))}
          <button onClick={() => setOptions((o) => [...o, ''])} className="inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-dark"><Plus size={15} /> Add hotel</button>
        </div>
        <label className="mt-4 flex items-center gap-2 cursor-pointer select-none">
          <span onClick={() => setReady((v) => !v)} className={`w-10 h-6 rounded-full transition relative ${ready ? 'bg-brand' : 'bg-neutral-300'}`}><span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${ready ? 'left-[18px]' : 'left-0.5'}`} /></span>
          <span className="text-sm font-semibold text-ink">Rooms arranged</span>
        </label>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="h-11 px-5 rounded-full border border-neutral-200 text-neutral-600 font-semibold">Cancel</button>
          <button onClick={() => onSave({ options: options.map((o) => o.trim()).filter(Boolean), ready })} className="flex-1 h-11 rounded-full bg-brand text-white font-semibold">Save</button>
        </div>
      </div>
    </Modal>
  )
}

// Briefing / staff kick-off details (meeting link, date, time), shown in the app.
function MeetingModal({ kind, value, onClose, onSave }) {
  const [link, setLink] = useState(value?.link || '')
  const [date, setDate] = useState(value?.date || '')
  const [time, setTime] = useState(value?.time || '')
  const title = kind === 'kickoff' ? 'Staff kick-off' : 'Tournament briefing'
  const lbl = 'text-[12px] font-bold uppercase tracking-wide text-neutral-500 mb-1.5'
  return (
    <Modal onClose={onClose}>
      <div className="p-5">
        <h3 className="text-xl font-extrabold text-ink">{title}</h3>
        <p className="mt-1 text-sm text-neutral-500 font-medium">The referees and staff see this in their app.</p>
        <div className="mt-4 space-y-3">
          <div><p className={lbl}>Meeting link</p><input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://meet.google.com/..." className={inputCls} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><p className={lbl}>Date</p><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} /></div>
            <div><p className={lbl}>Time</p><input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputCls} /></div>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="h-11 px-4 rounded-full border border-neutral-200 text-neutral-600 font-semibold">Cancel</button>
          {value && <button onClick={() => onSave(null)} className="h-11 px-4 rounded-full border border-neutral-200 text-neutral-500 font-semibold">Clear</button>}
          <button onClick={() => { const l = link.trim(), d = date.trim(), ti = time.trim(); onSave(l || d || ti ? { link: l, date: d, time: ti } : null) }} className="flex-1 h-11 rounded-full bg-brand text-white font-semibold">Save</button>
        </div>
      </div>
    </Modal>
  )
}

// Who uploaded their travel documents and who still has to.
function TravelConfirmationModal({ list, onClose, onOpenParticipants }) {
  const uploaded = list.filter((p) => p.uploaded)
  const pending = list.filter((p) => !p.uploaded)
  const Row = ({ p, ok }) => (
    <div className="flex items-center gap-2.5 px-2.5 py-2">
      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-none ${ok ? 'bg-brand' : 'bg-neutral-300'}`}>{initialsOf(p.name)}</span>
      <span className="text-[13px] font-semibold text-ink flex-1 min-w-0 truncate">{p.name}</span>
      {ok ? <Check size={15} className="text-brand flex-none" /> : <span className="text-[11px] font-semibold text-neutral-400 flex-none">pending</span>}
    </div>
  )
  return (
    <Modal onClose={onClose} wide>
      <div className="p-5">
        <h3 className="text-xl font-extrabold text-ink">Travel documents</h3>
        <p className="mt-1 text-sm text-neutral-500 font-medium">{uploaded.length} of {list.length} participants uploaded their travel documents.</p>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wide text-brand-dark mb-1.5">Uploaded ({uploaded.length})</p>
            <div className="bg-page rounded-2xl p-1.5 max-h-[46vh] overflow-y-auto divide-y divide-white">
              {uploaded.length ? uploaded.map((p) => <Row key={p.id} p={p} ok />) : <p className="px-3 py-2 text-[12px] text-neutral-400 font-medium">None yet</p>}
            </div>
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wide text-neutral-500 mb-1.5">Not uploaded ({pending.length})</p>
            <div className="bg-page rounded-2xl p-1.5 max-h-[46vh] overflow-y-auto divide-y divide-white">
              {pending.length ? pending.map((p) => <Row key={p.id} p={p} />) : <p className="px-3 py-2 text-[12px] text-neutral-400 font-medium">Everyone is in</p>}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="h-11 px-5 rounded-full border border-neutral-200 text-neutral-600 font-semibold">Close</button>
          <button onClick={onOpenParticipants} className="flex-1 h-11 rounded-full bg-brand text-white font-semibold">Open Participants</button>
        </div>
      </div>
    </Modal>
  )
}

function TournamentView({ t, onBack, onEdit }) {
  const [tab, setTab] = useState('info')
  const [enrol, setEnrol] = useState(dashEnrolments[t.id] || [])
  const [staff, setStaff] = useState(() => new Set(dashStaff.filter((s) => s.tournament === t.name).map((s) => s.name)))
  const [showStaff, setShowStaff] = useState(false)
  const [teams, setTeams] = useState(() => dashClubs[t.id] || [])
  const [showImport, setShowImport] = useState(false)
  const [fields, setFields] = useState(() => dashFields[t.id] || [])
  const [showFields, setShowFields] = useState(false)
  const [matchCount, setMatchCount] = useState((dashMatches[t.id] || []).length)
  // Extra readiness (prototype local state).
  // Prototype: accommodation options + briefing / kick-off details, kept in local
  // state (the real build persists these to the config store).
  const [config, setConfig] = useState({ accommodation: { options: [], byRef: {}, ready: false }, briefing: null, kickoff: null })
  const [accomModal, setAccomModal] = useState(false)
  const [meetingModal, setMeetingModal] = useState(null) // null | 'briefing' | 'kickoff'
  const applyConfig = (patch) => setConfig((prev) => {
    const next = { ...prev, accommodation: { ...prev.accommodation, byRef: { ...prev.accommodation.byRef } } }
    if (Array.isArray(patch.accommodationOptions)) next.accommodation.options = patch.accommodationOptions
    if (typeof patch.accommodationReady === 'boolean') next.accommodation.ready = patch.accommodationReady
    if ('briefing' in patch) next.briefing = patch.briefing
    if ('kickoff' in patch) next.kickoff = patch.kickoff
    return next
  })
  const onEnrolAction = (refId, action) => setEnrol((prev) =>
    action === 'decline' ? prev.filter((e) => e.refId !== refId)
      : prev.map((e) => e.refId === refId ? { ...e, status: action === 'promote' ? 'applied' : 'confirmed' } : e))
  const importTeams = ({ teams: list, matches: fixtures }) => {
    setTeams(list)
    dashClubs[t.id] = list // share with the appointing screen
    if (fixtures && fixtures.length) { dashMatches[t.id] = fixtures; setMatchCount(fixtures.length) }
    setShowImport(false)
    setTab('clubs')
  }
  const [summary, setSummary] = useState(null)
  useEffect(() => {
    let alive = true
    getEnrolmentSummary(t).then((s) => { if (alive) setSummary(s) }).catch(() => {})
    getParticipants(t).then((p) => { if (alive) setEnrol(p) }).catch(() => {})
    return () => { alive = false }
  }, [t.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const matchesArr = dashMatches[t.id] || []
  const appointedCount = matchesArr.filter((m) => m.main).length
  const clubCount = new Set(teams.map((x) => x.club)).size
  // Days fully appointed: a day counts when every match that day has a main referee.
  const dayGroups = matchesArr.reduce((acc, m) => { const d = m.day || 'Day 1'; (acc[d] = acc[d] || []).push(m); return acc }, {})
  const dayNames = Object.keys(dayGroups)
  const fullDays = dayNames.filter((d) => dayGroups[d].length && dayGroups[d].every((m) => m.main)).length
  // Fields come from the imported schedule (the pitch/field column), not manual entry.
  const importedFields = [...new Set(matchesArr.map((m) => m.pitch).filter(Boolean))]
  const fieldsReady = fields.length > 0 || importedFields.length > 0
  const fieldCount = Math.max(fields.length, importedFields.length)
  // Enrolment numbers: live from orders when available, else the tournament/mock figures.
  const enrolledCount = summary ? summary.enrolled : (t.enrolled ?? 0)
  // Prototype: a plausible number of uploaded travel docs so the readiness demo reads well.
  const travelCount = Math.round((enrolledCount || 0) * 0.65)
  const [travelModal, setTravelModal] = useState(false)
  const travelList = enrol.map((e, i) => ({ id: String(e.refId ?? i), name: (refById[e.refId] && refById[e.refId].name) || `Referee ${i + 1}`, uploaded: i < Math.round(enrol.length * 0.65) }))
  const capacityCount = (summary && summary.capacity != null) ? summary.capacity : (t.capacity ?? 0)
  const awaitingCount = summary ? summary.awaiting : enrol.filter((e) => e.status === 'applied').length
  const steps = [
    { title: 'Teams imported', status: teams.length ? 'done' : 'todo',
      metric: teams.length ? `${teams.length} teams across ${clubCount} clubs` : 'Not imported yet',
      onClick: () => teams.length ? setTab('clubs') : setShowImport(true) },
    { title: 'Participants', status: capacityCount && enrolledCount >= capacityCount ? 'done' : (enrolledCount > 0 ? 'progress' : 'todo'),
      metric: `${enrolledCount} of ${capacityCount} spots filled${awaitingCount ? ` · ${awaitingCount} awaiting approval` : ''}`,
      onClick: () => setTab('enrolments') },
    { title: 'Fields uploaded', status: fieldsReady ? 'done' : 'todo',
      metric: fieldsReady ? `${fieldCount} ${fieldCount === 1 ? 'pitch' : 'pitches'} from the import` : 'Comes with the team / fixture import',
      onClick: () => teams.length ? setTab('appointing') : setShowImport(true) },
    { title: 'Match schedule', status: teams.length === 0 ? 'todo' : (matchesArr.length ? 'done' : 'todo'),
      metric: teams.length === 0 ? 'Import the teams first' : (matchesArr.length ? `${matchesArr.length} matches scheduled` : 'No matches yet'),
      onClick: () => teams.length ? setTab('appointing') : setShowImport(true) },
    { title: 'Referees appointed', status: matchesArr.length === 0 ? 'todo' : (appointedCount >= matchesArr.length ? 'done' : 'progress'),
      metric: matchesArr.length === 0 ? 'Add matches first' : `${appointedCount} of ${matchesArr.length} matches have a main referee`,
      pill: matchesArr.length && appointedCount < matchesArr.length ? `${matchesArr.length - appointedCount} open` : null,
      onClick: () => setTab('appointing') },
    { title: 'Days fully appointed', status: dayNames.length === 0 ? 'todo' : (fullDays >= dayNames.length ? 'done' : (fullDays > 0 ? 'progress' : 'todo')),
      metric: dayNames.length === 0 ? 'Add matches first' : `${fullDays} of ${dayNames.length} ${dayNames.length === 1 ? 'day' : 'days'} fully appointed`,
      onClick: () => setTab('appointing') },
    { title: 'On-site staff', status: staff.size ? 'done' : 'todo',
      metric: staff.size ? `${staff.size} staff assigned` : 'No staff yet',
      onClick: () => setShowStaff(true) },
    { title: 'Publish appointments', status: 'todo', publish: true,
      metric: 'Communicate the saved changes to the officials',
      onClick: () => setTab('appointing') },
    { title: 'Travel confirmation', status: enrolledCount && travelCount >= enrolledCount ? 'done' : (travelCount > 0 ? 'progress' : 'todo'),
      metric: enrolledCount ? `${travelCount} of ${enrolledCount} participants uploaded travel documents` : 'Participants upload their travel documents in the app',
      pill: enrolledCount && travelCount < enrolledCount && travelCount > 0 ? `${travelCount}/${enrolledCount}` : null,
      onClick: () => setTravelModal(true) },
    { title: 'Accommodation', status: config.accommodation.ready ? 'done' : (config.accommodation.options.length ? 'progress' : 'todo'),
      metric: config.accommodation.options.length ? `${config.accommodation.options.length} ${config.accommodation.options.length === 1 ? 'hotel' : 'hotels'} · ${Object.keys(config.accommodation.byRef).length} assigned${config.accommodation.ready ? ' · rooms arranged' : ''}` : 'Add the hotels, then assign participants',
      onClick: () => setAccomModal(true) },
    { title: 'Tournament briefing', status: config.briefing ? 'done' : 'todo',
      metric: config.briefing ? `${config.briefing.date || 'Date TBC'}${config.briefing.time ? ` · ${config.briefing.time}` : ''}${config.briefing.link ? ' · meeting link set' : ''}` : 'Set the meeting link, date and time',
      onClick: () => setMeetingModal('briefing') },
    { title: 'Staff kick-off', status: config.kickoff ? 'done' : 'todo',
      metric: config.kickoff ? `${config.kickoff.date || 'Date TBC'}${config.kickoff.time ? ` · ${config.kickoff.time}` : ''}${config.kickoff.link ? ' · meeting link set' : ''}` : 'Set the staff kick-off details',
      onClick: () => setMeetingModal('kickoff') },
  ]
  const doneCount = steps.filter((s) => s.status === 'done').length

  const tabs = [
    { k: 'info', label: 'Tournament information' },
    { k: 'clubs', label: `Teams (${teams.length})` },
    { k: 'enrolments', label: `Participants (${enrol.length})` },
    { k: 'appointing', label: `Appointing (${matchCount})` },
    { k: 'broadcast', label: 'Communication' },
  ]
  const crumbLabel = { info: 'Tournament information', clubs: 'Teams', enrolments: 'Participants', appointing: 'Appointing', broadcast: 'Communication' }[tab]

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-5">
        <Crumb onClick={onBack}>Tournaments</Crumb>
        <ChevronRight size={15} className="text-neutral-300" />
        <Crumb onClick={() => setTab('info')} current={tab === 'info'}>{t.name}</Crumb>
        {tab !== 'info' && (<><ChevronRight size={15} className="text-neutral-300" /><Crumb current>{crumbLabel}</Crumb></>)}
      </nav>

      {/* Hero */}
      <div className="relative h-56 rounded-3xl overflow-hidden shadow-sm">
        <img src={t.img} alt={t.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <span className="absolute top-4 left-4"><StatusPill status={t.status} /></span>
        {!LIVE && <button onClick={() => onEdit && onEdit(t)} className="absolute top-4 right-4 inline-flex items-center gap-1.5 bg-white/90 hover:bg-white text-ink text-xs font-semibold px-3 h-8 rounded-full transition"><Pencil size={13} /> Edit</button>}
        <div className="absolute bottom-5 left-6 right-6 text-white">
          <h2 className="text-3xl font-extrabold leading-tight">{t.name}</h2>
          <p className="text-sm font-medium text-white/90 flex items-center gap-1.5 mt-1"><MapPin size={15} /> {t.city}, {t.country} · {t.dates}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mt-5 border-b border-neutral-200 overflow-x-auto no-scrollbar">
        {tabs.map((x) => (
          <button key={x.k} onClick={() => setTab(x.k)}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition ${tab === x.k ? 'border-brand text-brand-dark' : 'border-transparent text-neutral-500 hover:text-ink'}`}>
            {x.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === 'info' && (
          <div className="grid lg:grid-cols-[1.7fr_1fr] gap-4 items-start">
            {/* Setup checklist */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-bold text-ink text-sm">Tournament readiness</h3>
                  <p className="text-[12.5px] text-neutral-500 font-medium">What is done and what still needs attention</p>
                </div>
                <span className="text-[13px] font-bold text-brand-dark whitespace-nowrap">{doneCount}/{steps.length} done</span>
              </div>
              <div className="relative h-2.5 rounded-full bg-neutral-200/80 mb-5 mt-1">
                <span className="absolute inset-y-0 left-0 rounded-full bg-brand transition-all" style={{ width: `${Math.round((doneCount / steps.length) * 100)}%` }} />
                <span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-7 min-w-[34px] px-1.5 rounded-full bg-brand text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm ring-2 ring-white transition-all" style={{ left: `${Math.round((doneCount / steps.length) * 100)}%` }}>{Math.round((doneCount / steps.length) * 100)}%</span>
              </div>
              <div>
                {steps.map((s, i) => {
                  const ic = s.status === 'done' ? 'bg-brand text-white' : s.status === 'progress' ? 'bg-amber-100 text-amber-700' : 'bg-neutral-100 text-neutral-500 border border-dashed border-neutral-300'
                  const pillTxt = s.pill || (s.status === 'done' ? 'Done' : s.status === 'progress' ? 'In progress' : 'To do')
                  const pillCls = s.status === 'done' ? 'bg-brand-light text-brand-dark' : (s.status === 'progress' || s.pill) ? 'bg-amber-100 text-amber-700' : 'bg-neutral-100 text-neutral-500'
                  return (
                    <button key={i} onClick={s.onClick} className="w-full flex items-center gap-3.5 py-3 border-t border-neutral-100 first:border-t-0 text-left hover:bg-page/60 -mx-2 px-2 rounded-lg transition">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-none ${ic}`}>
                        {s.status === 'done' ? <Check size={16} /> : s.status === 'progress' ? <Clock size={15} /> : s.publish ? <Send size={14} /> : <span className="w-2 h-2 rounded-full bg-neutral-300" />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[14.5px] font-bold text-ink">{s.title}</span>
                        <span className="block text-[12.5px] font-medium text-neutral-500">{s.metric}</span>
                      </span>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${pillCls}`}>{pillTxt}</span>
                      <ChevronRight size={18} className="text-neutral-300 flex-none" />
                    </button>
                  )
                })}
              </div>

            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
                <h3 className="font-bold text-ink text-sm mb-3">At a glance</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-page rounded-xl p-3"><p className="text-[10.5px] font-bold uppercase tracking-wide text-neutral-500">Sport</p><p className="text-base font-extrabold text-ink mt-0.5">{t.sport}</p></div>
                  <div className="bg-page rounded-xl p-3"><p className="text-[10.5px] font-bold uppercase tracking-wide text-neutral-500">Dates</p><p className="text-sm font-extrabold text-ink mt-0.5">{t.dates}</p></div>
                  <div className="bg-page rounded-xl p-3"><p className="text-[10.5px] font-bold uppercase tracking-wide text-neutral-500">Referees</p><p className="text-base font-extrabold text-ink mt-0.5">{enrolledCount}/{capacityCount}</p></div>
                  <div className="bg-page rounded-xl p-3"><p className="text-[10.5px] font-bold uppercase tracking-wide text-neutral-500">Teams</p><p className="text-base font-extrabold text-ink mt-0.5">{teams.length || '—'}</p></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold text-ink text-sm">Staff on site <span className="text-neutral-500 font-medium">({staff.size})</span></h3>
                  <button onClick={() => setShowStaff(true)} className="text-[13px] font-bold text-brand-dark inline-flex items-center gap-1"><UserPlus size={14} /> Appoint</button>
                </div>
                {staff.size === 0 ? (
                  <p className="mt-2 text-[13px] text-neutral-500 font-medium">No staff assigned yet.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {[...staff].map((name) => {
                      const s = dashStaff.find((x) => x.name === name)
                      return (
                        <div key={name} className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center flex-none">{initialsOf(name)}</span>
                          <span className="min-w-0"><span className="block text-[13px] font-bold text-ink truncate">{name}</span><span className="block text-[11.5px] font-medium text-neutral-500">{s ? s.role : 'Staff'}</span></span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
                <h3 className="font-bold text-ink text-sm mb-2.5">Quick actions</h3>
                <div className="flex flex-col gap-1">
                  <button onClick={() => teams.length ? setTab('clubs') : setShowImport(true)} className="flex items-center gap-2 py-1.5 text-[13.5px] font-semibold text-brand-dark"><Upload size={15} /> {teams.length ? 'Manage teams' : 'Import teams'}</button>
                  <button onClick={() => setShowFields(true)} className="flex items-center gap-2 py-1.5 text-[13.5px] font-semibold text-brand-dark"><MapPin size={15} /> Manage fields</button>
                  <button onClick={() => setTab('appointing')} className="flex items-center gap-2 py-1.5 text-[13.5px] font-semibold text-brand-dark"><ClipboardList size={15} /> Appoint referees</button>
                  <button onClick={() => setTab('enrolments')} className="flex items-center gap-2 py-1.5 text-[13.5px] font-semibold text-brand-dark"><Users size={15} /> Participants</button>
                  <button className="flex items-center gap-2 py-1.5 text-[13.5px] font-semibold text-brand-dark"><MessageSquare size={15} /> Message the group</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {tab === 'clubs' && <ClubsTab teams={teams} onOpenImport={() => setShowImport(true)} />}
        {tab === 'enrolments' && <ParticipantsTable t={t} enrol={enrol} onAction={onEnrolAction} />}
        {tab === 'appointing' && <DashboardAppointing initialTournament={t.id} onImport={() => setShowImport(true)} lockTournament />}
        {tab === 'broadcast' && <TournamentBroadcast tournamentName={t.name} />}
      </div>
      {showStaff && <AppointStaffModal tournamentName={t.name} assigned={staff} onToggle={(name) => setStaff((prev) => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n })} onClose={() => setShowStaff(false)} />}
      {showImport && <SmartImportModal tournamentName={t.name} existing={teams.length} onClose={() => setShowImport(false)} onImport={importTeams} />}
      {showFields && <FieldsModal tournamentName={t.name} initial={fields} onClose={() => setShowFields(false)} onSave={(list) => { setFields(list); dashFields[t.id] = list; setShowFields(false) }} />}
      {accomModal && <AccommodationModal accommodation={config.accommodation} onClose={() => setAccomModal(false)}
        onSave={({ options, ready }) => { applyConfig({ accommodationOptions: options, accommodationReady: ready }); setAccomModal(false) }} />}
      {meetingModal && <MeetingModal kind={meetingModal} value={config[meetingModal]} onClose={() => setMeetingModal(null)}
        onSave={(m) => { applyConfig({ [meetingModal]: m }); setMeetingModal(null) }} />}
      {travelModal && <TravelConfirmationModal list={travelList} onClose={() => setTravelModal(false)} onOpenParticipants={() => { setTravelModal(false); setTab('enrolments') }} />}
    </div>
  )
}

function AppointStaffModal({ tournamentName, assigned, onToggle, onClose }) {
  return (
    <Modal onClose={onClose}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xl font-extrabold text-ink">Appoint staff</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-page flex items-center justify-center"><X size={18} /></button>
        </div>
        <p className="text-[12px] font-medium text-neutral-500 mb-4">Select who is on site for {tournamentName}.</p>
        <div className="space-y-2 max-h-[52vh] overflow-y-auto">
          {dashStaff.map((s) => {
            const on = assigned.has(s.name)
            return (
              <button key={s.name} onClick={() => onToggle(s.name)} className={`w-full flex items-center gap-3 rounded-2xl border p-3 text-left transition ${on ? 'border-brand bg-brand-light' : 'border-neutral-200 hover:border-brand'}`}>
                <span className="w-9 h-9 rounded-full bg-brand text-white text-[11px] font-bold flex items-center justify-center flex-none">{s.initials}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-ink">{s.name}</span>
                  <span className="block text-[12px] font-medium text-neutral-500">{s.role}</span>
                </span>
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center flex-none ${on ? 'bg-brand text-white' : 'border-2 border-neutral-300'}`}>{on && <Check size={14} />}</span>
              </button>
            )
          })}
        </div>
        <button onClick={onClose} className="mt-4 w-full h-11 rounded-full bg-brand text-white font-semibold">Done ({assigned.size} appointed)</button>
      </div>
    </Modal>
  )
}

const PRESET_IMAGES = ['img/porto.jpg', 'img/copenhagen.jpg', 'img/ibercup.jpg', 'img/costabrava.jpg', 'img/malta.jpg', 'img/alpine.jpg']
const COUNTRIES = [
  'Austria', 'Belgium', 'Croatia', 'Czechia', 'Denmark', 'England', 'Finland', 'France', 'Germany',
  'Greece', 'Hungary', 'Ireland', 'Italy', 'Malta', 'Netherlands', 'Norway', 'Poland', 'Portugal',
  'Scotland', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Turkey', 'Wales',
]
const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }) : ''

function Field({ label, children, error }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-ink mb-1">{label}</span>
      {children}
      {error && <span className="block text-[11px] font-semibold text-red-600 mt-1">{error}</span>}
    </label>
  )
}
const inputCls = 'w-full h-10 px-3 rounded-xl border border-neutral-200 text-sm font-medium outline-none focus:border-brand bg-white'
const inputInvalidCls = 'w-full h-10 px-3 rounded-xl border border-red-300 bg-red-50 text-sm font-medium outline-none focus:border-red-400'
// Pick the input styling based on whether the field currently has an error (U8).
const fieldCls = (hasError) => (hasError ? inputInvalidCls : inputCls)

// A friendly empty state: icon, title and a short line of context (U6).
function EmptyState({ icon: Icon = Users, title, sub, className = '' }) {
  return (
    <div className={`text-center py-10 px-4 ${className}`}>
      {Icon && <span className="w-12 h-12 rounded-2xl bg-page text-neutral-500 flex items-center justify-center mx-auto mb-3"><Icon size={22} /></span>}
      <p className="text-sm font-bold text-ink">{title}</p>
      {sub && <p className="text-[12.5px] font-medium text-neutral-500 mt-1 max-w-xs mx-auto leading-snug">{sub}</p>}
    </div>
  )
}

// Loading placeholder block with a subtle pulse (U5).
function Skel({ className = '' }) {
  return <span className={`block bg-neutral-200/70 rounded-lg animate-pulse ${className}`} />
}
// A grid of card skeletons for the tournament overview while it loads.
function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <Skel className="h-32 rounded-none" />
          <div className="p-4 space-y-2.5">
            <Skel className="h-4 w-3/4" />
            <Skel className="h-3 w-1/2" />
            <Skel className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
// Stacked row skeletons for list and table views.
function RowsSkeleton({ count = 6, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-neutral-200 p-3">
          <Skel className="w-9 h-9 rounded-full flex-none" />
          <Skel className="h-3.5 flex-1" />
          <Skel className="h-3.5 w-16 flex-none" />
        </div>
      ))}
    </div>
  )
}

function FieldsModal({ tournamentName, initial, onClose, onSave }) {
  const [text, setText] = useState((initial || []).join('\n'))
  const list = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  return (
    <Modal onClose={onClose}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xl font-extrabold text-ink">Playing fields</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-page flex items-center justify-center"><X size={18} /></button>
        </div>
        <p className="text-[12.5px] font-medium text-neutral-500 mb-3">One field per line for {tournamentName}. Some tournaments have 20 or more. These feed the field picker when you add matches.</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8}
          placeholder={'Pitch A\nPitch B\nPitch C'}
          className="w-full rounded-xl border border-neutral-200 p-3 text-sm font-medium outline-none focus:border-brand resize-y" />
        <p className="mt-2 text-[12.5px] font-semibold text-brand-dark">{list.length} fields</p>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="h-11 px-5 rounded-full border border-neutral-200 text-neutral-600 font-semibold">Cancel</button>
          <button onClick={() => onSave(list)} className="flex-1 h-11 rounded-full bg-brand text-white font-semibold flex items-center justify-center gap-2"><Check size={16} /> Save fields</button>
        </div>
      </div>
    </Modal>
  )
}

function TournamentFormModal({ initial, onClose, onSave }) {
  const edit = !!initial
  const [f, setF] = useState({
    name: initial?.name || '', sport: initial?.sport || 'Football', city: initial?.city || '', country: initial?.country || '',
    start: '', end: '', firstMatch: '', lastMatch: '', capacity: initial?.capacity ?? 40, status: initial?.status || 'planned', img: initial?.img || PRESET_IMAGES[0],
  })
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  const [tried, setTried] = useState(false)
  const errors = {
    name: !f.name.trim() ? 'Enter a tournament name' : '',
    city: !f.city.trim() ? 'Enter a city' : '',
    country: !f.country.trim() ? 'Select a country' : '',
  }
  const valid = !errors.name && !errors.city && !errors.country
  const showErr = (k) => (tried ? errors[k] : '')

  const submit = () => {
    if (!valid) { setTried(true); return }
    // "dates" shows the arrival to departure window on cards.
    const dates = f.start && f.end ? `${fmtDate(f.start)} to ${fmtDate(f.end)}` : (f.start ? fmtDate(f.start) : (initial?.dates || 'Dates to be set'))
    onSave({
      id: initial?.id || ('t' + Math.random().toString(36).slice(2, 7)),
      name: f.name.trim(), city: f.city.trim(), country: f.country.trim(),
      sport: f.sport, dates, status: f.status,
      arrivalDate: f.start || initial?.arrivalDate || null,
      departureDate: f.end || initial?.departureDate || null,
      firstMatchDate: f.firstMatch || initial?.firstMatchDate || null,
      lastMatchDate: f.lastMatch || initial?.lastMatchDate || null,
      enrolled: initial?.enrolled ?? 0, capacity: Number(f.capacity) || 0, img: f.img,
    })
  }

  return (
    <Modal onClose={onClose}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-extrabold text-ink">{edit ? 'Edit tournament' : 'New tournament'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-page flex items-center justify-center"><X size={18} /></button>
        </div>
        {edit && <p className="-mt-3 mb-3 text-[11px] font-medium text-neutral-500">Leave the dates empty to keep the current dates ({initial.dates}).</p>}

        <div className="space-y-3">
          <Field label="Tournament name" error={showErr('name')}>
            <input value={f.name} onChange={set('name')} placeholder="e.g. Lisbon Spring Cup" className={fieldCls(showErr('name'))} autoFocus />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sport">
              <select value={f.sport} onChange={set('sport')} className={inputCls}>
                <option>Football</option><option>Hockey</option><option>Handball</option>
              </select>
            </Field>
            <Field label="Status">
              <select value={f.status} onChange={set('status')} className={inputCls}>
                <option value="planned">Planned</option><option value="recruiting">Recruiting</option><option value="confirmed">Confirmed</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City" error={showErr('city')}><input value={f.city} onChange={set('city')} placeholder="Lisbon" className={fieldCls(showErr('city'))} /></Field>
            <Field label="Country" error={showErr('country')}>
              <select value={f.country} onChange={set('country')} className={fieldCls(showErr('country'))}>
                <option value="">Select a country…</option>
                {[...new Set([...(f.country ? [f.country] : []), ...COUNTRIES])].sort().map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Arrival date"><input type="date" value={f.start} onChange={set('start')} className={inputCls} /></Field>
            <Field label="Departure date"><input type="date" value={f.end} onChange={set('end')} className={inputCls} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First match date (optional)"><input type="date" value={f.firstMatch} onChange={set('firstMatch')} className={inputCls} /></Field>
            <Field label="Last match date (optional)"><input type="date" value={f.lastMatch} onChange={set('lastMatch')} className={inputCls} /></Field>
          </div>
          <Field label="Referee capacity"><input type="number" min="0" value={f.capacity} onChange={set('capacity')} className={inputCls} /></Field>
          <Field label="Cover image">
            <div className="grid grid-cols-6 gap-2">
              {PRESET_IMAGES.map((img) => (
                <button key={img} type="button" onClick={() => setF((s) => ({ ...s, img }))}
                  className={`h-12 rounded-lg overflow-hidden ring-2 transition ${f.img === img ? 'ring-brand' : 'ring-transparent hover:ring-neutral-300'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="h-11 px-5 rounded-full border border-neutral-200 text-neutral-600 font-semibold">Cancel</button>
          <button onClick={submit} className="flex-1 h-11 rounded-full bg-brand text-white font-semibold flex items-center justify-center gap-2">
            {edit ? <><Check size={16} /> Save changes</> : <><Plus size={16} /> Create tournament</>}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function DashboardTournaments({ createSignal, focusT, onListChange, searchQuery = '' }) {
  const [selected, setSelected] = useState(null)
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    let alive = true
    getDashTournaments()
      .then((list) => { if (alive) setTournaments(list) })
      .catch(() => { if (alive) setTournaments([]) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  useEffect(() => { onListChange?.(!selected) }, [selected]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (createSignal) { setSelected(null); setCreating(true) } }, [createSignal])
  useEffect(() => {
    if (focusT && focusT.id) {
      const t = tournaments.find((x) => x.id === focusT.id)
      if (t) { setCreating(false); setSelected(t) }
    }
  }, [focusT]) // eslint-disable-line react-hooks/exhaustive-deps

  const create = (t) => { setTournaments((prev) => [t, ...prev]); setCreating(false); setSelected(t) }
  const update = (t) => {
    setTournaments((prev) => prev.map((x) => x.id === t.id ? { ...x, ...t } : x))
    setSelected((s) => (s && s.id === t.id ? { ...s, ...t } : s))
    setEditing(null)
  }

  if (selected) return (
    <>
      <TournamentView key={selected.id} t={selected} onBack={() => setSelected(null)} onEdit={(t) => setEditing(t)} />
      {editing && <TournamentFormModal initial={editing} onClose={() => setEditing(null)} onSave={update} />}
    </>
  )

  const barCls = (status) => status === 'confirmed' ? 'bg-brand' : status === 'recruiting' ? 'bg-amber-400' : 'bg-neutral-300'

  const q = searchQuery.trim().toLowerCase()
  const shown = q
    ? tournaments.filter((t) => [t.name, t.city, t.country].some((v) => (v || '').toLowerCase().includes(q)))
    : tournaments

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading && [0, 1, 2].map((i) => <div key={`sk${i}`} className="rounded-[22px] bg-white/70 border border-white/80 min-h-[196px] animate-pulse" />)}
        {!loading && shown.map((t) => {
          const pct = t.capacity ? Math.round((t.enrolled / t.capacity) * 100) : 0
          return (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className="group relative text-left bg-white/90 backdrop-blur-sm border border-white/90 rounded-[22px] p-5 overflow-hidden shadow-[0_12px_34px_rgba(23,32,26,0.14)] hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(23,32,26,0.20)] transition-all duration-200"
            >
              <span className={`absolute left-0 top-0 bottom-0 w-1.5 ${barCls(t.status)}`} />
              <div className="flex items-center justify-between gap-2 mb-3">
                <StatusPill status={t.status} />
                <span className="flex items-center gap-2">
                  {t.createdAt && <span className="text-[11px] font-semibold text-neutral-400" title="Date this tournament was created (drives the default order)">Added {fmtCreated(t.createdAt)}</span>}
                  <ChevronRight size={18} className="text-neutral-300 group-hover:text-brand-dark transition" />
                </span>
              </div>
              <p className="text-[21px] font-extrabold text-ink leading-tight">{t.name}</p>
              <p className="mt-1.5 flex items-center gap-2 text-[13px] font-semibold text-neutral-500 flex-wrap">
                <span className="flex items-center gap-1"><MapPin size={13} /> {t.city}, {t.country}</span>
                <span className="w-1 h-1 rounded-full bg-neutral-300" />
                <span>{t.dates}</span>
              </p>
              <div className="mt-4">
                <p className="text-[13px] font-bold text-ink mb-1.5"><span className="text-brand-dark">{t.enrolled}</span> / {t.capacity} referees</p>
                <div className="h-2 rounded-full bg-neutral-200/80 overflow-hidden">
                  <span className={`block h-full rounded-full ${barCls(t.status)}`} style={{ width: pct + '%' }} />
                </div>
              </div>
            </button>
          )
        })}

        {!loading && !q && !LIVE && (
          <button onClick={() => setCreating(true)} className="flex flex-col items-center justify-center gap-2 rounded-[22px] border-2 border-dashed border-neutral-300 text-neutral-500 hover:text-brand-dark hover:border-brand min-h-[196px] bg-white/50 backdrop-blur-sm transition">
            <span className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center"><Plus size={24} /></span>
            <span className="text-sm font-semibold">Create new tournament</span>
          </button>
        )}
      </div>
      {!loading && q && shown.length === 0 && (
        <p className="text-sm text-neutral-500 font-medium mt-2">No tournaments match “{searchQuery.trim()}”.</p>
      )}
      {creating && <TournamentFormModal onClose={() => setCreating(false)} onSave={create} />}
    </div>
  )
}

/* ---------------- Referees ---------------- */
export function DashboardReferees() {
  const [q, setQ] = useState('')
  const [level, setLevel] = useState('all')
  const [tourId, setTourId] = useState('all')
  const [open, setOpen] = useState(null)
  const [referees, setReferees] = useState(LIVE ? [] : dashReferees)
  const [loading, setLoading] = useState(LIVE)
  const [error, setError] = useState(null)
  const [appsByRef, setAppsByRef] = useState({}) // live: refereeId -> [applications]
  const [busyOrder, setBusyOrder] = useState(null)

  const loadApps = () => {
    if (!LIVE) return
    Promise.all([getRefereeApplications(), getDashTournaments()])
      .then(([apps, tours]) => {
        const name = {}
        for (const t of tours) name[String(t.productId ?? t.id)] = t.name
        const byRef = {}
        for (const a of apps) {
          if (a.refereeId == null) continue
          ;(byRef[a.refereeId] ||= []).push({
            orderId: a.id, tournamentId: a.tournamentId,
            tournament: name[String(a.tournamentId)] || `#${a.tournamentId}`,
            status: a.appStatus, paid: a.paid, date: a.datePaid,
          })
        }
        setAppsByRef(byRef)
      })
      .catch(() => { /* non-fatal: the directory still works without applications */ })
  }

  const loadReferees = () => {
    if (!LIVE) return
    setLoading(true); setError(null)
    getReferees()
      .then((rows) => setReferees(rows))
      .catch((e) => setError(e.message || 'Could not load referees'))
      .finally(() => setLoading(false))
    loadApps()
  }

  useEffect(() => { loadReferees() }, [])

  // Approve / decline an application (two-way sync: writes back to WordPress).
  const decide = async (orderId, approved) => {
    setBusyOrder(orderId)
    try {
      await approveApplication(orderId, approved)
      setAppsByRef((prev) => {
        const next = {}
        for (const rid of Object.keys(prev)) {
          next[rid] = prev[rid].map((a) => a.orderId === orderId ? { ...a, status: approved ? 'confirmed' : 'declined' } : a)
        }
        return next
      })
    } catch { /* keep the buttons so the admin can retry */ }
    finally { setBusyOrder(null) }
  }

  const filtered = referees.filter((r) => {
    const okLevel = level === 'all' || r.level === level
    const okText = !q || r.name.toLowerCase().includes(q.toLowerCase()) || (r.country || '').toLowerCase().includes(q.toLowerCase())
    const okTour = LIVE || tourId === 'all' || (enrolmentsByRef[r.id] || []).some((e) => e.tid === tourId)
    return okLevel && okText && okTour
  })

  // Level filter options: derive from the loaded data so live levels show too.
  const levels = ['all', ...Array.from(new Set(referees.map((r) => r.level).filter(Boolean)))]
  const enrolledTournaments = dashTournaments.filter((t) => (dashEnrolments[t.id] || []).length > 0)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-neutral-200 px-3 h-10 flex-1 min-w-[200px]">
          <Search size={16} className="text-neutral-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or country" className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-neutral-500" />
        </div>
        {!LIVE && (
          <select value={tourId} onChange={(e) => setTourId(e.target.value)}
            className="h-10 px-3 rounded-xl border border-neutral-200 text-sm font-semibold text-ink outline-none focus:border-brand bg-white">
            <option value="all">All tournaments</option>
            {enrolledTournaments.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}
        <div className="flex gap-1.5">
          {levels.map((l) => (
            <button key={l} onClick={() => setLevel(l)} className={`text-xs font-semibold px-3 h-10 rounded-xl capitalize border transition ${level === l ? 'bg-brand text-white border-brand' : 'bg-white text-neutral-500 border-neutral-200 hover:border-brand'}`}>{l}</button>
          ))}
        </div>
      </div>

      {error && <DashError message={error} onRetry={loadReferees} />}

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="flex items-center px-4 py-2.5 border-b border-neutral-200 text-[11px] uppercase tracking-wide text-neutral-500 font-semibold">
          <span className="w-52 flex-none">Referee</span>
          <span className="w-32 hidden lg:block">Country</span>
          {!LIVE && <span className="flex-1 min-w-0 hidden md:block">Enrolments</span>}
          {LIVE && <span className="flex-1 min-w-0 hidden md:block">Federation</span>}
          <span className="w-12 text-center hidden sm:block">Sex</span>
          <span className="w-14 text-center hidden sm:block">Age</span>
          <span className={`${LIVE ? 'w-28' : 'w-24'} text-right flex-none`}>Level</span>
        </div>
        <div className="divide-y divide-neutral-100">
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center px-4 py-2.5">
              <span className="w-7 h-7 rounded-full bg-neutral-100 animate-pulse mr-3" />
              <span className="h-3 w-40 bg-neutral-100 rounded animate-pulse" />
            </div>
          ))}
          {!loading && filtered.map((r) => {
            const sx = r.sex || (FEMALE_NAMES.has((r.name || '').split(' ')[0]) ? 'F' : 'M')
            const ag = r.age ?? (24 + hashN(r.id || 'x') % 26)
            return (
            <button key={r.id} onClick={() => setOpen(r)} className="w-full flex items-center px-4 py-2.5 hover:bg-page transition text-left">
              <span className="w-52 flex-none flex items-center min-w-0">
                <span className="w-7 h-7 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center flex-none mr-3">{initialsOf(r.name)}</span>
                <span className="font-semibold text-ink text-sm truncate">{r.name}</span>
              </span>
              <span className="w-32 text-sm text-neutral-500 font-medium hidden lg:flex items-center gap-1.5 truncate"><Flag code={countryCode(r.country)} emoji={r.flag} size={13} /> {r.country}</span>
              {!LIVE && <span className="flex-1 min-w-0 hidden md:flex"><EnrolChips refId={r.id} /></span>}
              {LIVE && <span className="flex-1 min-w-0 hidden md:block text-sm text-neutral-500 font-medium truncate">{r.federation || '—'}</span>}
              <span className="w-12 text-center hidden sm:block text-sm font-semibold text-neutral-600">{sx}</span>
              <span className="w-14 text-center hidden sm:block text-sm font-medium text-neutral-500 tabular-nums">{ag}</span>
              <span className={`${LIVE ? 'w-28' : 'w-24'} flex-none flex justify-end`}><LevelPill level={r.level} /></span>
            </button>
          ) })}
          {!loading && filtered.length === 0 && <EmptyState title="No referees found" sub="No referees match your search. Try a different name or clear the filters." />}
        </div>
      </div>

      {open && (
        <Modal onClose={() => setOpen(null)}>
          <div className="p-5">
            <div className="flex items-start gap-3">
              <span className="w-14 h-14 rounded-full bg-brand text-white text-lg font-bold flex items-center justify-center flex-none">{initialsOf(open.name)}</span>
              <div className="flex-1">
                <h3 className="text-xl font-extrabold text-ink leading-tight">{open.name}</h3>
                <p className="text-sm text-neutral-500 font-medium inline-flex items-center gap-1.5"><Flag code={countryCode(open.country)} emoji={open.flag} size={13} /> {open.country}</p>
                <div className="mt-1.5"><LevelPill level={open.level} /></div>
              </div>
              <button onClick={() => setOpen(null)} className="w-8 h-8 rounded-full hover:bg-page flex items-center justify-center flex-none"><X size={18} /></button>
            </div>

            {LIVE ? (
              <>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-page rounded-xl p-3"><p className="text-[11px] text-neutral-500 font-medium">Nationality</p><p className="font-bold text-ink text-sm">{open.nationality || '—'}</p></div>
                  <div className="bg-page rounded-xl p-3"><p className="text-[11px] text-neutral-500 font-medium">Federation</p><p className="font-bold text-ink text-sm">{open.federation || '—'}</p></div>
                  <div className="bg-page rounded-xl p-3"><p className="text-[11px] text-neutral-500 font-medium">Registered</p><p className="font-bold text-ink text-sm">{open.yearsRegistered || '—'}</p></div>
                </div>
                <div className="mt-4 space-y-2.5 text-sm">
                  {open.email && <div className="flex items-center gap-2 text-neutral-600 font-medium"><Mail size={15} className="text-neutral-500" /> {open.email}</div>}
                  {open.phone && <div className="flex items-center gap-2 text-neutral-600 font-medium"><Phone size={15} className="text-neutral-500" /> {open.phone}</div>}
                  {open.emergencyContact && <div className="flex items-center gap-2 text-neutral-600 font-medium"><AlertCircle size={15} className="text-neutral-500" /> Emergency: {open.emergencyContact}</div>}
                  {open.dietary && <div className="flex items-center gap-2 text-neutral-600 font-medium"><AlertTriangle size={15} className="text-amber-500" /> Dietary: {open.dietary}</div>}
                </div>

                <div className="mt-4">
                  <p className="text-[11px] uppercase tracking-wide text-neutral-500 font-semibold mb-2">Applications</p>
                  {(appsByRef[open.id] || []).length === 0
                    ? <p className="text-sm text-neutral-500 font-medium">No applications yet.</p>
                    : (
                      <div className="space-y-1.5">
                        {appsByRef[open.id].map((a) => (
                          <div key={a.orderId} className="flex items-center justify-between gap-2 bg-page rounded-xl px-3 py-2">
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-ink truncate">{a.tournament}</span>
                              <span className="block text-[11px] text-neutral-500 font-medium flex items-center gap-1"><Calendar size={11} className="text-neutral-500" /> Applied {fmtEnrolDate(a.date)}</span>
                            </span>
                            {a.status === 'applied' ? (
                              <span className="flex items-center gap-1.5 flex-none">
                                <button disabled={busyOrder === a.orderId} onClick={() => decide(a.orderId, true)} className="text-[12px] font-bold text-white bg-brand rounded-full px-3 h-8 disabled:opacity-50">Accept</button>
                                <button disabled={busyOrder === a.orderId} onClick={() => decide(a.orderId, false)} className="text-[12px] font-bold text-red-600 border border-red-200 rounded-full px-3 h-8 hover:bg-red-50 disabled:opacity-50">Decline</button>
                              </span>
                            ) : (
                              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex-none ${a.status === 'confirmed' ? 'bg-brand-light text-brand-dark' : a.status === 'declined' ? 'bg-red-50 text-red-600' : 'bg-neutral-100 text-neutral-500'}`}>{a.status === 'confirmed' ? "You're in" : a.status === 'declined' ? 'Declined' : a.status}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-page rounded-xl p-3"><p className="text-[11px] text-neutral-500 font-medium">Tournaments</p><p className="font-bold text-ink text-sm">{open.apps}</p></div>
                  <div className="bg-page rounded-xl p-3"><p className="text-[11px] text-neutral-500 font-medium">Reports</p><p className="font-bold text-ink text-sm">{open.reports}</p></div>
                  <div className="bg-page rounded-xl p-3"><p className="text-[11px] text-neutral-500 font-medium">Rating</p><p className="font-bold text-ink text-sm flex items-center gap-1"><Star size={13} className="text-amber-500 fill-amber-500" /> {open.rating}</p></div>
                </div>

                <div className="mt-4">
                  <p className="text-[11px] uppercase tracking-wide text-neutral-500 font-semibold mb-2">Enrolled in</p>
                  {(enrolmentsByRef[open.id] || []).length === 0
                    ? <p className="text-sm text-neutral-500 font-medium">Not enrolled for any tournament yet.</p>
                    : (
                      <div className="space-y-1.5">
                        {enrolmentsByRef[open.id].map((e, i) => (
                          <div key={i} className="flex items-center justify-between gap-2 bg-page rounded-xl px-3 py-2">
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-ink truncate">{e.tournament}</span>
                              <span className="block text-[11px] text-neutral-500 font-medium flex items-center gap-1"><Calendar size={11} className="text-neutral-500" /> Applied {fmtEnrolDate(e.date)}</span>
                            </span>
                            <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize flex-none ${enrolMap[e.status]}`}>{e.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                <div className="mt-4 space-y-2.5 text-sm">
                  <div className="flex items-center gap-2 text-neutral-600 font-medium"><Mail size={15} className="text-neutral-500" /> {open.email}</div>
                  <div className="flex items-center gap-2 text-neutral-600 font-medium"><Phone size={15} className="text-neutral-500" /> {open.phone}</div>
                  <div className="flex items-center gap-2 text-neutral-600 font-medium"><Globe size={15} className="text-neutral-500" /> {open.languages.join(' · ')}</div>
                  {open.dietary && <div className="flex items-center gap-2 text-neutral-600 font-medium"><AlertTriangle size={15} className="text-amber-500" /> Dietary: {open.dietary}</div>}
                </div>
              </>
            )}

            <div className="flex gap-3 mt-5">
              <button onClick={() => { setOpen(null); window.dispatchEvent(new CustomEvent('ra-nav', { detail: 'communication' })) }} className="flex-1 h-11 rounded-full bg-brand text-white font-semibold flex items-center justify-center gap-2"><MessageSquare size={16} /> Message</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function AddStaffModal({ onClose, onAdd, initial = null }) {
  const [f, setF] = useState({ name: '', role: 'Logistics coordinator', tournament: dashTournaments[0].name, email: '', phone: '', languages: '', country: '', city: '', iban: '', ...(initial || {}) })
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  const roles = ['Tournament director', 'Logistics coordinator', 'Referee mentor', 'Communication', 'Onsite host', 'Media & content']
  const [tried, setTried] = useState(false)
  const nameErr = tried && !f.name.trim() ? 'Enter a full name' : ''
  const submit = () => {
    if (!f.name.trim()) { setTried(true); return }
    onAdd({ name: f.name.trim(), role: f.role, tournament: f.tournament, email: f.email.trim(), phone: f.phone.trim(), languages: f.languages.trim(), country: f.country.trim(), city: f.city.trim(), iban: f.iban.trim(), initials: initialsOf(f.name.trim()) })
  }
  return (
    <Modal onClose={onClose}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-extrabold text-ink">{initial ? 'Edit staff member' : 'Add staff member'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-page flex items-center justify-center"><X size={18} /></button>
        </div>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          <Field label="Full name" error={nameErr}><input value={f.name} onChange={set('name')} placeholder="e.g. Sara Mendes" className={fieldCls(nameErr)} autoFocus /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Role"><select value={f.role} onChange={set('role')} className={inputCls}>{roles.map((r) => <option key={r}>{r}</option>)}</select></Field>
            <Field label="Assigned to"><select value={f.tournament} onChange={set('tournament')} className={inputCls}>{dashTournaments.map((t) => <option key={t.id}>{t.name}</option>)}</select></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email"><input value={f.email} onChange={set('email')} placeholder="name@example.com" className={inputCls} /></Field>
            <Field label="Phone"><input value={f.phone} onChange={set('phone')} placeholder="+31 6 …" className={inputCls} /></Field>
          </div>
          <Field label="Languages spoken"><input value={f.languages} onChange={set('languages')} placeholder="e.g. English, Portuguese, Spanish" className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Country"><input value={f.country} onChange={set('country')} placeholder="e.g. Portugal" className={inputCls} /></Field>
            <Field label="City"><input value={f.city} onChange={set('city')} placeholder="e.g. Lisbon" className={inputCls} /></Field>
          </div>
          <Field label="IBAN"><input value={f.iban} onChange={set('iban')} placeholder="NL00 BANK 0000 0000 00" className={inputCls} /></Field>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="h-11 px-5 rounded-full border border-neutral-200 text-neutral-600 font-semibold">Cancel</button>
          <button onClick={submit} className="flex-1 h-11 rounded-full bg-brand text-white font-semibold flex items-center justify-center gap-2">{initial ? <><Check size={16} /> Save changes</> : <><Plus size={16} /> Add staff</>}</button>
        </div>
      </div>
    </Modal>
  )
}

/* ---------------- Staff ---------------- */
export function DashboardStaff({ createSignal }) {
  const [staff, setStaff] = useState(dashStaff)
  const [adding, setAdding] = useState(false)
  const [editIdx, setEditIdx] = useState(null)
  useEffect(() => { if (createSignal) setAdding(true) }, [createSignal])
  const add = (s) => { setStaff((prev) => [...prev, s]); setAdding(false) }
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {staff.map((s, i) => (
        <button key={i} onClick={() => setEditIdx(i)} className="text-left bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 hover:border-brand hover:shadow-card transition">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm">{s.initials}</span>
            <div className="min-w-0">
              <p className="font-bold text-ink text-sm truncate">{s.name}</p>
              <p className="text-xs text-neutral-500 font-medium">{s.role}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wide text-neutral-400">{s.tournament || 'Not assigned'}</div>
            {[[Globe, s.languages], [Mail, s.email], [Phone, s.phone], [MapPin, [s.city, s.country].filter(Boolean).join(', ')], [Building2, s.iban]].map(([Icon, val], j) => (
              <div key={j} className="flex items-center gap-2 text-[13px]">
                <Icon size={14} className="text-neutral-400 flex-none" />
                {val ? <span className="text-ink truncate">{val}</span> : <span className="text-neutral-400 italic">Not provided</span>}
              </div>
            ))}
          </div>
        </button>
      ))}
      <button onClick={() => setAdding(true)} className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 text-neutral-500 hover:text-brand-dark hover:border-brand min-h-[128px] transition">
        <Plus size={24} />
        <span className="text-sm font-semibold">Add staff member</span>
      </button>
      {adding && <AddStaffModal onClose={() => setAdding(false)} onAdd={add} />}
      {editIdx != null && <AddStaffModal initial={staff[editIdx]} onClose={() => setEditIdx(null)} onAdd={(s) => { setStaff((prev) => prev.map((x, j) => j === editIdx ? { ...x, ...s } : x)); setEditIdx(null) }} />}
    </div>
  )
}

/* ---------------- Observers & Guests / VIP ---------------- */
// Observer grading level. Filled with a dropdown when adding an observer and
// shown as a coloured chip on the observer card and in the appointing selector.
export const OBSERVER_CATEGORIES = ['International', 'National', 'Regional', 'Grassroots']
const OBS_CAT_PILL = {
  International: 'bg-violet-100 text-violet-700',
  National: 'bg-sky-100 text-sky-700',
  Regional: 'bg-teal-100 text-teal-700',
  Grassroots: 'bg-amber-100 text-amber-700',
}
function CategoryPill({ category, className = '' }) {
  if (!category) return null
  return <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${OBS_CAT_PILL[category] || 'bg-neutral-100 text-neutral-600'} ${className}`}>{category}</span>
}

function AddPersonModal({ title, roles, categories = null, cta, initial = null, onClose, onAdd }) {
  const [f, setF] = useState({
    name: initial?.name || '', role: initial?.role || roles[0],
    category: initial?.category || (categories ? categories[0] : ''),
    tournament: initial?.tournament || dashTournaments[0].name,
  })
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  return (
    <Modal onClose={onClose}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-extrabold text-ink">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-page flex items-center justify-center"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <Field label="Full name"><input value={f.name} onChange={set('name')} placeholder="e.g. Giorgio Bruno" className={inputCls} autoFocus /></Field>
          <Field label="Role"><select value={f.role} onChange={set('role')} className={inputCls}>{roles.map((r) => <option key={r}>{r}</option>)}</select></Field>
          {categories && <Field label="Category"><select value={f.category} onChange={set('category')} className={inputCls}>{categories.map((c) => <option key={c}>{c}</option>)}</select></Field>}
          <Field label="Assigned to"><select value={f.tournament} onChange={set('tournament')} className={inputCls}>{dashTournaments.map((t) => <option key={t.id}>{t.name}</option>)}</select></Field>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="h-11 px-5 rounded-full border border-neutral-200 text-neutral-600 font-semibold">Cancel</button>
          <button onClick={() => f.name.trim() && onAdd({ name: f.name.trim(), role: f.role, ...(categories ? { category: f.category } : {}), tournament: f.tournament, initials: initialsOf(f.name.trim()) })}
            disabled={!f.name.trim()} className="flex-1 h-11 rounded-full bg-brand text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50">{initial ? <Check size={16} /> : <Plus size={16} />} {cta}</button>
        </div>
      </div>
    </Modal>
  )
}

function PeopleGrid({ seed, roles, categories = null, addTitle, addCta, emptyAdd }) {
  const [people, setPeople] = useState(seed)
  const [adding, setAdding] = useState(false)
  const [editIdx, setEditIdx] = useState(null)
  const editTitle = addTitle.replace(/^Add/i, 'Edit')
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {people.map((s, i) => (
        <button key={i} onClick={() => setEditIdx(i)} className="text-left bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 hover:border-brand hover:shadow-card transition">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm">{s.initials}</span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-ink text-sm truncate">{s.name}</p>
              <p className="text-xs text-neutral-500 font-medium">{s.role}</p>
            </div>
          </div>
          {s.category && <div className="mt-2.5"><CategoryPill category={s.category} /></div>}
          <div className="mt-3 pt-3 border-t border-neutral-100 text-[13px]">
            <span className="text-[11px] font-bold uppercase tracking-wide text-neutral-400 block">{s.org ? 'Organisation' : 'Assigned to'}</span>
            <span className="text-ink">{s.org || s.tournament || 'Not assigned'}</span>
          </div>
        </button>
      ))}
      <button onClick={() => setAdding(true)} className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 text-neutral-500 hover:text-brand-dark hover:border-brand min-h-[128px] transition">
        <Plus size={24} /><span className="text-sm font-semibold">{emptyAdd}</span>
      </button>
      {adding && <AddPersonModal title={addTitle} roles={roles} categories={categories} cta={addCta} onClose={() => setAdding(false)} onAdd={(p) => { setPeople((prev) => [...prev, p]); setAdding(false) }} />}
      {editIdx != null && <AddPersonModal title={editTitle} roles={roles} categories={categories} cta="Save changes" initial={people[editIdx]} onClose={() => setEditIdx(null)} onAdd={(p) => { setPeople((prev) => prev.map((x, j) => j === editIdx ? { ...x, ...p } : x)); setEditIdx(null) }} />}
    </div>
  )
}

export function DashboardObservers() {
  return <PeopleGrid seed={dashObservers} roles={['Observer', 'Referee mentor', 'Assessor']} categories={OBSERVER_CATEGORIES} addTitle="Add observer" addCta="Add observer" emptyAdd="Add observer" />
}
export function DashboardGuests() {
  return <PeopleGrid seed={dashGuests} roles={['VIP guest', 'Sponsor', 'Federation', 'Press']} addTitle="Add guest / VIP" addCta="Add guest" emptyAdd="Add guest / VIP" />
}

function AddMatchModal({ onClose, onAdd, teams = [], fields = [] }) {
  const [f, setF] = useState({ time: '', pitch: fields[0] || '', home: '', away: '' })
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  const valid = f.time && f.home.trim() && f.away.trim() && f.home !== f.away
  const options = teams.map(teamLabel).sort()
  return (
    <Modal onClose={onClose}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-extrabold text-ink">New match</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-page flex items-center justify-center"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kick-off time"><input type="time" value={f.time} onChange={set('time')} className={inputCls} autoFocus /></Field>
            <Field label="Field">
              {fields.length ? (
                <select value={f.pitch} onChange={set('pitch')} className={inputCls}>
                  {fields.map((fl) => <option key={fl} value={fl}>{fl}</option>)}
                </select>
              ) : (
                <input value={f.pitch} onChange={set('pitch')} placeholder="Pitch A" className={inputCls} />
              )}
            </Field>
          </div>
          <Field label="Home team">
            <select value={f.home} onChange={set('home')} className={inputCls}>
              <option value="">Select a team…</option>
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Away team">
            <select value={f.away} onChange={set('away')} className={inputCls}>
              <option value="">Select a team…</option>
              {options.filter((o) => o !== f.home).map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <p className="text-[11px] font-medium text-neutral-500">Teams come from the imported CSV. Import more on the tournament page if one is missing.</p>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="h-11 px-5 rounded-full border border-neutral-200 text-neutral-600 font-semibold">Cancel</button>
          <button onClick={() => valid && onAdd({ time: f.time, pitch: f.pitch.trim() || 'TBD', home: f.home.trim(), away: f.away.trim() })} disabled={!valid}
            className="flex-1 h-11 rounded-full bg-brand text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"><Plus size={16} /> Add match</button>
        </div>
      </div>
    </Modal>
  )
}

/* ---------------- Appointing ---------------- */
const SLOTS = [
  { key: 'main', label: 'Main referee' },
  { key: 'a1', label: 'Assistant 1' },
  { key: 'a2', label: 'Assistant 2' },
  { key: 'fourth', label: '4th official' },
]
const DAY_FALLBACK = 'Day 1'
const officialsOf = (m) => SLOTS.map((s) => m[s.key]).filter(Boolean)
const shortName = (id) => { const n = refById[id]?.name || ''; const p = n.split(' '); return p[1] ? `${p[0]} ${p[1][0]}.` : p[0] }

// Greedy, conflict-aware auto-appointment honouring a free-text requirement prompt.
function autoAppoint(list, prompt) {
  const p = (prompt || '').toLowerCase()
  const noBeginner = /no beginner|geen beginner|experienced|minimum medior|min medior/.test(p)
  const preferTalent = /talent|best|top|senior|highest/.test(p)
  let pool = dashReferees.slice()
  if (preferTalent) pool.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  const busy = {}
  const mark = (t, id) => { (busy[t] ||= new Set()).add(id) }
  const isBusy = (t, id) => busy[t]?.has(id)
  for (const m of list) for (const k of ['main', 'a1', 'a2', 'fourth']) if (m[k]) mark(m.time, m[k])
  const next = list.map((m) => ({ ...m }))
  let filled = 0
  for (const m of next) {
    for (const slot of ['main', 'a1', 'a2']) {
      if (m[slot]) continue
      const used = ['main', 'a1', 'a2', 'fourth'].map((k) => m[k]).filter(Boolean)
      const cand = pool.find((r) => !used.includes(r.id) && !isBusy(m.time, r.id) && !(slot === 'main' && noBeginner && r.level === 'beginner'))
      if (cand) { m[slot] = cand.id; mark(m.time, cand.id); filled++ }
    }
  }
  return { next, filled }
}

function AppointAiModal({ onClose, onRun }) {
  const [prompt, setPrompt] = useState('')
  return (
    <Modal onClose={onClose}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xl font-extrabold text-ink flex items-center gap-2"><Sparkles size={18} className="text-brand" /> Appoint with AI</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-page flex items-center justify-center"><X size={18} /></button>
        </div>
        <p className="text-[12.5px] font-medium text-neutral-500 mb-3">The AI fills every open slot, avoiding double bookings. Add any requirements below.</p>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4}
          placeholder={'e.g. Only talent and medior referees for U17 finals, no beginners as main referee, spread the workload evenly.'}
          className="w-full rounded-xl border border-neutral-200 p-3 text-sm font-medium outline-none focus:border-brand resize-y" />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {['No beginners as main', 'Prefer talent for finals', 'Spread evenly'].map((s) => (
            <button key={s} onClick={() => setPrompt((v) => v ? v + ' ' + s + '.' : s + '.')} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-page text-neutral-600 border border-neutral-200 hover:border-brand">{s}</button>
          ))}
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="h-11 px-5 rounded-full border border-neutral-200 text-neutral-600 font-semibold">Cancel</button>
          <button onClick={() => onRun(prompt)} className="flex-1 h-11 rounded-full bg-brand text-white font-semibold flex items-center justify-center gap-2"><Sparkles size={16} /> Fill appointments</button>
        </div>
      </div>
    </Modal>
  )
}

const CardChip = ({ color, n }) => <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-ink"><span className="inline-block w-3 h-4 rounded-[2px]" style={{ background: color }} /> {n}</span>

function MatchReport({ r }) {
  return (
    <div className="mt-3 rounded-xl border border-brand-light bg-brand-light/40 p-3.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-[11px] font-bold uppercase tracking-wide text-brand-dark flex items-center gap-1.5"><CheckCircle2 size={14} /> Match report</p>
        <span className="text-[11px] font-medium text-neutral-500">by {r.by} · {r.at}</span>
      </div>
      <div className="flex items-center gap-5 mt-2.5">
        <span className="text-xl font-extrabold text-ink tabular-nums">{r.score.h} – {r.score.a}</span>
        <CardChip color="#F4C400" n={r.yellow} />
        <CardChip color="#E03131" n={r.red} />
        <span className="flex items-center gap-0.5">{[1, 2, 3, 4, 5].map((n) => <Star key={n} size={15} className={n <= r.fair ? 'text-amber-400 fill-amber-400' : 'text-neutral-200 fill-neutral-200'} />)}</span>
      </div>
      {r.notes && <p className="text-[13px] text-neutral-600 font-medium mt-2 leading-snug">{r.notes}</p>}
    </div>
  )
}

const mkey = (m) => `${(m.home || '').trim().toLowerCase()}|${(m.away || '').trim().toLowerCase()}`
const slotShape = (f) => ({ id: f.id || 'm' + Math.random().toString(36).slice(2, 8), day: f.day || DAY_FALLBACK, time: f.time || 'TBD', pitch: f.pitch || 'TBD', home: f.home, away: f.away, main: null, a1: null, a2: null, fourth: null, observer: null })

function RevisedScheduleModal({ current, onClose, onApply }) {
  const [text, setText] = useState('')
  const [analysed, setAnalysed] = useState(null)
  const hasAppointments = current.some((m) => m.main || m.a1 || m.a2 || m.fourth || m.observer)

  const analyse = () => {
    const table = parseTable(text)
    const fixtures = buildImport(table, autoMap(table.header)).matches
    if (!fixtures.length) { setAnalysed({ empty: true }); return }
    const curByKey = {}; current.forEach((m) => { curByKey[mkey(m)] = m })
    const newKeys = new Set(fixtures.map(mkey))
    const merged = fixtures.map((f) => {
      const c = curByKey[mkey(f)]
      return c ? { ...slotShape(f), id: c.id, main: c.main, a1: c.a1, a2: c.a2, fourth: c.fourth, observer: c.observer } : slotShape(f)
    })
    const added = fixtures.filter((f) => !curByKey[mkey(f)])
    const removed = current.filter((m) => !newKeys.has(mkey(m)))
    const changed = fixtures.filter((f) => { const c = curByKey[mkey(f)]; return c && (c.day !== (f.day || DAY_FALLBACK) || c.time !== f.time || c.pitch !== f.pitch) })
    const noRef = merged.filter((m) => !m.main)
    const seen = {}; const dbl = new Set()
    for (const m of merged) for (const r of [m.main, m.a1, m.a2, m.fourth].filter(Boolean)) { const k = `${m.time}::${r}`; if (seen[k]) { dbl.add(k) } else seen[k] = 1 }
    const removedWithRefs = removed.filter((m) => m.main || m.a1 || m.a2 || m.fourth)
    setAnalysed({ merged, added, removed, changed, noRef, dbl: dbl.size, removedWithRefs })
  }

  // No appointments yet → straight overwrite.
  const applyOverwrite = () => {
    const table = parseTable(text)
    const fixtures = buildImport(table, autoMap(table.header)).matches
    if (fixtures.length) onApply(fixtures.map(slotShape), 'replaced')
  }

  return (
    <Modal onClose={onClose} wide>
      <div className="p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xl font-extrabold text-ink">Upload revised schedule</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-page flex items-center justify-center"><X size={18} /></button>
        </div>
        <p className="text-[12.5px] font-medium text-neutral-500 mb-3">
          {hasAppointments
            ? 'Appointments already exist, so we compare the new schedule and flag conflicts before you apply.'
            : 'No appointments made yet, so the new schedule simply replaces the current one.'}
        </p>

        {!analysed && (
          <>
            <div className="flex justify-end mb-1">
              <label className="inline-flex items-center gap-1.5 text-[12px] font-bold text-brand-dark cursor-pointer hover:underline">
                <Upload size={13} /> Choose file (CSV / Excel)
                <input type="file" accept=".csv,.tsv,.xlsx,.xls,text/csv,text/plain"
                  onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { setText(await fileToTableText(f)) } catch { /* ignore */ } e.target.value = '' }}
                  className="hidden" />
              </label>
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6}
              placeholder={'date,time,field,home,away\nDay 1,09:00,Pitch A,Ajax U15,Benfica U15'}
              className="w-full rounded-xl border border-neutral-200 p-3 text-[13px] font-mono outline-none focus:border-brand resize-y" />
            <div className="flex gap-3 mt-4">
              <button onClick={onClose} className="h-11 px-5 rounded-full border border-neutral-200 text-neutral-600 font-semibold">Cancel</button>
              {hasAppointments
                ? <button onClick={analyse} disabled={!text.trim()} className="flex-1 h-11 rounded-full bg-brand text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50">Compare changes <ChevronRight size={16} /></button>
                : <button onClick={applyOverwrite} disabled={!text.trim()} className="flex-1 h-11 rounded-full bg-brand text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"><Upload size={16} /> Replace schedule</button>}
            </div>
          </>
        )}

        {analysed && analysed.empty && (
          <>
            <p className="text-sm font-semibold text-red-600">No matches detected in that file. Check the columns and try again.</p>
            <div className="flex justify-end mt-4"><button onClick={() => setAnalysed(null)} className="h-11 px-5 rounded-full border border-neutral-200 text-neutral-600 font-semibold">Back</button></div>
          </>
        )}

        {analysed && !analysed.empty && (
          <>
            <div className="flex flex-wrap gap-2.5 mb-3">
              <span className="text-[12px] font-semibold px-3 py-1.5 rounded-xl bg-brand-light text-brand-dark">{analysed.added.length} added</span>
              <span className="text-[12px] font-semibold px-3 py-1.5 rounded-xl bg-amber-100 text-amber-700">{analysed.changed.length} changed</span>
              <span className="text-[12px] font-semibold px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-600">{analysed.removed.length} removed</span>
            </div>
            {(analysed.noRef.length > 0 || analysed.dbl > 0 || analysed.removedWithRefs.length > 0) && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-3 mb-3 space-y-1.5">
                <p className="text-[12.5px] font-bold text-red-700 flex items-center gap-1.5"><AlertTriangle size={14} /> Needs attention</p>
                {analysed.noRef.length > 0 && <p className="text-[12.5px] font-medium text-red-700">{analysed.noRef.length} matches without a main referee</p>}
                {analysed.dbl > 0 && <p className="text-[12.5px] font-medium text-red-700">{analysed.dbl} double bookings at the same time</p>}
                {analysed.removedWithRefs.length > 0 && <p className="text-[12.5px] font-medium text-red-700">{analysed.removedWithRefs.length} removed matches had appointments (they will be lost)</p>}
              </div>
            )}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden divide-y divide-neutral-100 max-h-[34vh] overflow-y-auto">
              {analysed.changed.map((f, i) => {
                const c = current.find((m) => mkey(m) === mkey(f))
                return (
                  <div key={'c' + i} className="px-3 py-2 text-[12.5px]">
                    <span className="font-semibold text-ink">{f.home} vs {f.away}</span>
                    <span className="text-amber-700 font-medium"> · {c.day} {c.time} {c.pitch} → {f.day || DAY_FALLBACK} {f.time} {f.pitch}</span>
                  </div>
                )
              })}
              {analysed.added.map((f, i) => <div key={'a' + i} className="px-3 py-2 text-[12.5px]"><span className="font-semibold text-ink">{f.home} vs {f.away}</span><span className="text-brand-dark font-medium"> · new · {f.day || DAY_FALLBACK} {f.time} {f.pitch}</span></div>)}
              {analysed.removed.map((m, i) => <div key={'r' + i} className="px-3 py-2 text-[12.5px]"><span className="font-semibold text-neutral-500 line-through">{m.home} vs {m.away}</span><span className="text-neutral-500 font-medium"> · removed</span></div>)}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setAnalysed(null)} className="h-11 px-5 rounded-full border border-neutral-200 text-neutral-600 font-semibold">Back</button>
              <button onClick={() => onApply(analysed.merged, 'merged')} className="flex-1 h-11 rounded-full bg-brand text-white font-semibold flex items-center justify-center gap-2"><Check size={16} /> Apply changes</button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export function DashboardAppointing({ initialTournament, onImport, lockTournament = false }) {
  const startTid = initialTournament || dashTournaments[0].id
  // Referee names imported from the file are matched to the directory by full
  // name (case-insensitive), so the schedule comes in with referees already
  // appointed; unmatched names stay open for manual assignment.
  const byRefName = Object.fromEntries(dashReferees.map((r) => [(r.name || '').trim().toLowerCase(), r.id]))
  const resolveRef = (n) => byRefName[(n || '').trim().toLowerCase()] || null
  const toSlots = (data) => Object.fromEntries(Object.entries(data).map(([k, arr]) => [k, arr.map((m) => ({
    id: m.id, day: m.day || DAY_FALLBACK, time: m.time, pitch: m.pitch, home: m.home, away: m.away,
    main: m.main || resolveRef(m.mainName) || null,
    a1: m.assistants?.[0] || resolveRef(m.arNames?.[0]) || null,
    a2: m.assistants?.[1] || resolveRef(m.arNames?.[1]) || null,
    fourth: resolveRef(m.fourthName) || null, observer: m.observer || null,
  }))]))
  const [tid, setTid] = useState(startTid)
  const [matches, setMatches] = useState(() => toSlots(JSON.parse(JSON.stringify(dashMatches))))
  const [openDay, setOpenDay] = useState(null)
  const [openId, setOpenId] = useState(null)
  const [edited, setEdited] = useState(() => new Set())
  const [addingMatch, setAddingMatch] = useState(false)
  const [publishDirty, setPublishDirty] = useState(false)
  const [confirmPublish, setConfirmPublish] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [conflictHidden, setConflictHidden] = useState(false)
  const [extraDays, setExtraDays] = useState([])
  const [showDayImport, setShowDayImport] = useState(null)
  const [showAI, setShowAI] = useState(false)
  const [showRevised, setShowRevised] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [toast, setToast] = useState('')

  const list = matches[tid] || []
  const teams = dashClubs[tid] || []
  const fields = dashFields[tid] || []
  const days = useMemo(() => { const seen = []; for (const m of list) { const d = m.day || DAY_FALLBACK; if (!seen.includes(d)) seen.push(d) } return seen }, [list])
  const allDays = useMemo(() => [...days, ...extraDays.filter((d) => !days.includes(d))], [days, extraDays])
  const nextDayName = () => {
    const nums = allDays.map((d) => { const m = /day\s*(\d+)/i.exec(d); return m ? Number(m[1]) : 0 })
    return `Day ${Math.max(0, ...nums, allDays.length) + 1}`
  }
  const dayList = openDay ? list.filter((m) => (m.day || DAY_FALLBACK) === openDay) : []

  useEffect(() => { setOpenDay(null); setOpenId(null); setExtraDays([]) }, [tid])

  const conflicts = useMemo(() => {
    const seen = {}; const bad = new Set()
    for (const m of list) for (const r of officialsOf(m)) {
      const key = `${m.time}::${r}`
      if (seen[key]) { bad.add(`${m.id}::${r}`); bad.add(`${seen[key]}::${r}`) } else seen[key] = m.id
    }
    return bad
  }, [list])
  useEffect(() => { setConflictHidden(false) }, [conflicts.size])

  const setSlot = (mid, slot, ref) => {
    setEdited((p) => new Set(p).add(mid))
    setMatches((prev) => ({ ...prev, [tid]: prev[tid].map((m) => m.id === mid ? { ...m, [slot]: ref || null } : m) }))
  }
  const addMatch = (m) => {
    const id = 'm' + Math.random().toString(36).slice(2, 7)
    setMatches((prev) => ({ ...prev, [tid]: [...(prev[tid] || []), { id, day: openDay || days[0] || DAY_FALLBACK, main: null, a1: null, a2: null, fourth: null, observer: null, ...m }] }))
    setAddingMatch(false)
    setOpenId(id)
  }
  const importIntoDay = (day, { teams: list, matches: fixtures }) => {
    const slots = toSlots({ _: (fixtures || []).map((m) => ({ ...m, day })) })._ || []
    setMatches((prev) => {
      const others = (prev[tid] || []).filter((m) => (m.day || DAY_FALLBACK) !== day)
      return { ...prev, [tid]: [...others, ...slots] }
    })
    const otherFixtures = (dashMatches[tid] || []).filter((m) => (m.day || DAY_FALLBACK) !== day)
    dashMatches[tid] = [...otherFixtures, ...(fixtures || []).map((m) => ({ ...m, day }))]
    if (list && list.length) {
      const key = (x) => `${x.club}::${x.ageGroup}::${x.gender}`.toLowerCase()
      const existing = dashClubs[tid] || []; const seen = new Set(existing.map(key))
      dashClubs[tid] = [...existing, ...list.filter((x) => !seen.has(key(x)))]
    }
    setExtraDays((d) => d.filter((x) => x !== day))
    setPublishDirty(true); setShowDayImport(null); setOpenDay(day); setOpenId(null)
  }
  const saveMatch = (m, i) => {
    if (edited.has(m.id)) { setPublishDirty(true); setEdited((p) => { const n = new Set(p); n.delete(m.id); return n }) }
    const next = dayList[i + 1]
    setOpenId(next ? next.id : null)
  }
  const publish = () => {
    setToast(`Appointments published. The officials for ${dashTournaments.find((t) => t.id === tid)?.name || 'this tournament'} are notified in their app.`)
    setPublishDirty(false); setEdited(new Set()); setConfirmPublish(false)
  }
  const runAI = (prompt) => {
    const { next, filled } = autoAppoint(list, prompt)
    setMatches((prev) => ({ ...prev, [tid]: next }))
    setShowAI(false)
    if (filled > 0) { setPublishDirty(true); setToast(`AI filled ${filled} open slot${filled === 1 ? '' : 's'}. Review and publish.`) }
    else setToast('No open slots to fill.')
  }
  // Empty this tournament's imported content (teams, schedule and appointments)
  // so a wrong import can be wiped and re-imported from scratch.
  const resetTournament = () => {
    setConfirmReset(false)
    setMatches((prev) => ({ ...prev, [tid]: [] }))
    dashMatches[tid] = []; dashClubs[tid] = []; dashFields[tid] = []
    setExtraDays([]); setOpenDay(null); setOpenId(null); setEdited(new Set()); setPublishDirty(false)
    setToast('Tournament cleared. Import a file to start again.')
  }
  const APPT_HEAD = ['Day', 'Time', 'Field', 'Home', 'Away', 'Main referee', 'Assistant 1', 'Assistant 2', '4th official', 'Observer', 'Observer category']
  const appointmentRows = () => list.map((m) => [m.day || '', m.time || '', m.pitch || '', m.home || '', m.away || '',
    refById[m.main]?.name || '', refById[m.a1]?.name || '', refById[m.a2]?.name || '', refById[m.fourth]?.name || '', obsById[m.observer]?.name || '', obsById[m.observer]?.category || ''])
  const apptFile = () => `${(dashTournaments.find((t) => t.id === tid)?.name || 'tournament')} - appointments`
  const exportCsv = () => {
    const rows = [APPT_HEAD, ...appointmentRows()]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a'); a.href = url; a.download = `${apptFile()}.csv`; a.click(); URL.revokeObjectURL(url)
    setToast('Appointments exported as CSV.')
  }
  const exportXlsx = async () => {
    await exportToXlsx(`${apptFile()}.xlsx`, APPT_HEAD, appointmentRows())
    setToast('Appointments exported to Excel.')
  }

  const openSlots = list.filter((m) => !m.main).length

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {!lockTournament && (
          <select value={tid} onChange={(e) => setTid(e.target.value)} className="h-10 px-3 rounded-xl border border-neutral-200 text-sm font-semibold outline-none focus:border-brand bg-white">
            {dashTournaments.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}
        <span className="text-xs font-medium text-neutral-500">{teams.length === 0 ? 'Teams not imported' : `${list.length} matches · ${openSlots} without a main referee`}</span>
        {(teams.length > 0 || list.length > 0) && (
          <button onClick={() => setConfirmReset(true)} title="Clear this tournament's imported teams, schedule and appointments" className="inline-flex items-center gap-1.5 border border-red-200 text-red-600 text-sm font-semibold px-3.5 h-10 rounded-full hover:bg-red-50 transition"><Trash2 size={15} /> Reset</button>
        )}
        {teams.length > 0 && list.length > 0 && (
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowAI(true)} className="inline-flex items-center gap-1.5 border border-brand text-brand-dark text-sm font-semibold px-4 h-10 rounded-full hover:bg-brand-light transition"><Sparkles size={15} /> Appoint with AI</button>
            <button onClick={() => setShowRevised(true)} className="inline-flex items-center gap-1.5 border border-neutral-200 text-ink text-sm font-semibold px-4 h-10 rounded-full hover:border-brand transition"><RefreshCw size={15} /> Revised schedule</button>
            {onImport && <button onClick={onImport} className="inline-flex items-center gap-1.5 border border-neutral-200 text-ink text-sm font-semibold px-4 h-10 rounded-full hover:border-brand transition"><Upload size={15} /> Import CSV/Excel</button>}
            <div className="relative">
              <button onClick={() => setExportOpen((o) => !o)} className="inline-flex items-center gap-1.5 border border-neutral-200 text-ink text-sm font-semibold px-4 h-10 rounded-full hover:border-brand transition"><Download size={15} /> Export <ChevronDown size={14} className="text-neutral-500" /></button>
              {exportOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
                  <div className="absolute right-0 mt-1 z-20 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden min-w-[150px]">
                    <button onClick={() => { setExportOpen(false); exportXlsx() }} className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm font-semibold text-ink hover:bg-page"><Download size={14} className="text-neutral-500" /> Excel (.xlsx)</button>
                    <button onClick={() => { setExportOpen(false); exportCsv() }} className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm font-semibold text-ink hover:bg-page border-t border-neutral-100"><FileText size={14} className="text-neutral-500" /> CSV (.csv)</button>
                  </div>
                </>
              )}
            </div>
            <button onClick={() => setAddingMatch(true)} className="inline-flex items-center gap-1.5 border border-neutral-200 text-ink text-sm font-semibold px-4 h-10 rounded-full hover:border-brand transition"><Plus size={15} /> Add match</button>
            <button onClick={() => publishDirty && setConfirmPublish(true)} disabled={!publishDirty}
              className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 h-10 rounded-full transition ${publishDirty ? 'bg-brand text-white hover:bg-brand-dark' : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'}`}>
              <Send size={15} /> Publish
            </button>
          </div>
        )}
      </div>

      {teams.length === 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto"><Lock size={22} /></div>
          <p className="mt-3 text-sm font-bold text-ink">Appointing is locked for {dashTournaments.find((t) => t.id === tid)?.name || 'this tournament'}</p>
          <p className="mt-1 text-[13px] text-neutral-500 font-medium max-w-md mx-auto">You can only appoint referees once the participating teams are imported. Import a CSV/Excel below (fixtures with referee columns are appointed automatically), or import on the Teams tab.</p>
          {onImport && <button onClick={onImport} className="mt-4 inline-flex items-center gap-1.5 bg-brand text-white text-sm font-semibold px-5 h-11 rounded-full"><Upload size={16} /> Import CSV/Excel</button>}
        </div>
      )}

      {teams.length > 0 && conflicts.size > 0 && !conflictHidden && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-700 text-sm font-semibold px-4 py-2.5 rounded-xl border border-red-100">
          <AlertTriangle size={16} className="flex-none" /> <span className="flex-1">A referee is double-booked at the same time. Check the highlighted matches.</span>
          <button onClick={() => setConflictHidden(true)} aria-label="Dismiss" className="flex-none text-red-400 hover:text-red-700"><X size={16} /></button>
        </div>
      )}

      {teams.length > 0 && list.length === 0 && extraDays.length === 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-10 text-center">
          <p className="text-sm font-semibold text-ink">No matches scheduled yet</p>
          <p className="text-xs text-neutral-500 font-medium mt-1">Add matches to start appointing officials.</p>
          <button onClick={() => setAddingMatch(true)} className="mt-4 inline-flex items-center gap-1.5 bg-brand text-white text-sm font-semibold px-4 h-10 rounded-full"><Plus size={15} /> Add match</button>
        </div>
      )}

      {/* Day blocks */}
      {teams.length > 0 && allDays.length > 0 && !openDay && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {allDays.map((day, di) => {
            const dm = list.filter((m) => (m.day || DAY_FALLBACK) === day)
            const appointed = dm.filter((m) => m.main).length
            const hasConf = dm.some((m) => officialsOf(m).some((r) => conflicts.has(`${m.id}::${r}`)))
            const empty = dm.length === 0
            const allDone = !empty && appointed === dm.length
            return (
              <button key={day} onClick={() => { setOpenDay(day); setOpenId(null) }}
                className="group aspect-square flex flex-col text-left bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 hover:bg-brand hover:border-brand transition">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-brand-light text-brand-dark group-hover:bg-white/20 group-hover:text-white flex items-center justify-center font-extrabold transition">{di + 1}</span>
                  {empty ? <span className="text-[11px] font-semibold text-neutral-400 group-hover:text-white">empty</span>
                    : hasConf ? <span className="text-[11px] font-semibold text-red-600 group-hover:text-white flex items-center gap-1"><AlertTriangle size={13} /> conflict</span>
                    : allDone ? <span className="text-[11px] font-semibold text-brand-dark group-hover:text-white flex items-center gap-1"><Check size={13} /> complete</span>
                    : <span className="text-[11px] font-semibold text-amber-600 group-hover:text-white">{dm.length - appointed} open</span>}
                </div>
                <div className="mt-auto">
                  <p className="text-lg font-extrabold text-ink group-hover:text-white transition">{day}</p>
                  <p className="text-[13px] font-semibold text-neutral-500 group-hover:text-white/85 transition">{empty ? 'No matches yet' : `${dm.length} matches · ${appointed}/${dm.length} appointed`}</p>
                  <div className="mt-2.5 h-1.5 rounded-full bg-neutral-200 group-hover:bg-white/30 overflow-hidden transition"><span className="block h-full bg-brand group-hover:bg-white transition" style={{ width: `${empty ? 0 : Math.round((appointed / dm.length) * 100)}%` }} /></div>
                </div>
              </button>
            )
          })}
          <button onClick={() => setExtraDays((d) => [...d, nextDayName()])}
            className="aspect-square flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-brand-dark bg-white/60 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-brand transition">
            <span className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center"><Plus size={20} /></span>
            <span className="text-[13px] font-bold">Add a day</span>
          </button>
        </div>
      )}

      {/* Matches for the selected day */}
      {teams.length > 0 && openDay && (
        <>
          <button onClick={() => { setOpenDay(null); setOpenId(null) }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-dark mb-3"><ChevronRight size={16} className="rotate-180" /> All days</button>
          <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
            <p className="text-sm font-extrabold text-ink">{openDay} <span className="text-neutral-500 font-medium">· {dayList.length} matches</span></p>
            <div className="flex items-center gap-2">
              <button onClick={() => setAddingMatch(true)} className="inline-flex items-center gap-1.5 border border-neutral-200 text-ink text-[13px] font-semibold px-3 h-9 rounded-full hover:border-brand transition"><Plus size={14} /> Add match</button>
              <button onClick={() => setShowDayImport(openDay)} className="inline-flex items-center gap-1.5 border border-neutral-200 text-ink text-[13px] font-semibold px-3 h-9 rounded-full hover:border-brand transition"><Upload size={14} /> Import into {openDay}</button>
            </div>
          </div>
          {dayList.length === 0 && (
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 text-center mb-2">
              <p className="text-sm font-semibold text-ink">No matches on {openDay} yet</p>
              <p className="text-xs text-neutral-500 font-medium mt-1">Add a match, or import a CSV/Excel for this day.</p>
            </div>
          )}
          <div className="space-y-2.5">
            {dayList.map((m, i) => {
              const open = openId === m.id
              const hasConflict = officialsOf(m).some((r) => conflicts.has(`${m.id}::${r}`))
              return (
                <div key={m.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${hasConflict ? 'border-red-200' : 'border-neutral-200'}`}>
                  <button onClick={() => setOpenId(open ? null : m.id)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
                    <span className="text-sm font-bold text-brand-dark w-12 tabular-nums">{m.time}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-ink truncate">{m.home} <span className="text-neutral-500 font-medium">vs</span> {m.away}</span>
                      {!open && (
                        <span className="block text-[12px] font-medium mt-0.5 truncate">
                          {m.main
                            ? <span className="text-neutral-500">{shortName(m.main)}{officialsOf(m).length > 1 ? ` +${officialsOf(m).length - 1}` : ''}</span>
                            : <span className="text-amber-600">No main referee</span>}
                        </span>
                      )}
                    </span>
                    <span className="text-xs font-medium text-neutral-500 hidden sm:block">{m.pitch}</span>
                    {dashReports[m.id] && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-light text-brand-dark flex items-center gap-1"><CheckCircle2 size={11} /> Report</span>}
                    {edited.has(m.id) && <span className="w-2 h-2 rounded-full bg-amber-400" title="Unsaved changes" />}
                    <ChevronRight size={18} className={`text-neutral-500 transition-transform ${open ? 'rotate-90' : ''}`} />
                  </button>

                  {open && (
                    <div className="px-4 pb-4 border-t border-neutral-100 pt-3">
                      <div className="grid sm:grid-cols-3 gap-3 mb-3 pb-3 border-b border-neutral-100">
                        <div>
                          <p className="text-[11px] font-semibold text-neutral-500 mb-1">Day</p>
                          <select value={m.day || DAY_FALLBACK} onChange={(e) => setSlot(m.id, 'day', e.target.value)} className="w-full h-9 px-2.5 rounded-lg border border-neutral-200 text-sm font-medium outline-none focus:border-brand">
                            {days.map((d) => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-neutral-500 mb-1">Kick-off</p>
                          <input type="time" value={m.time || ''} onChange={(e) => setSlot(m.id, 'time', e.target.value)} className="w-full h-9 px-2.5 rounded-lg border border-neutral-200 text-sm font-medium outline-none focus:border-brand" />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-neutral-500 mb-1">Field</p>
                          {fields.length ? (
                            <select value={m.pitch || ''} onChange={(e) => setSlot(m.id, 'pitch', e.target.value)} className="w-full h-9 px-2.5 rounded-lg border border-neutral-200 text-sm font-medium outline-none focus:border-brand">
                              {fields.map((fl) => <option key={fl} value={fl}>{fl}</option>)}
                            </select>
                          ) : (
                            <input value={m.pitch || ''} onChange={(e) => setSlot(m.id, 'pitch', e.target.value)} className="w-full h-9 px-2.5 rounded-lg border border-neutral-200 text-sm font-medium outline-none focus:border-brand" />
                          )}
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {SLOTS.map((slot) => {
                          const val = m[slot.key] || ''
                          const conflict = val && conflicts.has(`${m.id}::${val}`)
                          const usedElsewhere = SLOTS.filter((s) => s.key !== slot.key).map((s) => m[s.key]).filter(Boolean)
                          const isMain = slot.key === 'main'
                          return (
                            <div key={slot.key}>
                              <p className="text-[11px] font-semibold text-neutral-500 mb-1">{slot.label}</p>
                              <select value={val} onChange={(e) => setSlot(m.id, slot.key, e.target.value)}
                                className={`w-full h-9 px-2.5 rounded-lg border text-sm font-medium outline-none focus:border-brand ${conflict ? 'border-red-300 bg-red-50 text-red-700' : val ? 'border-neutral-200' : isMain ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-neutral-200 text-neutral-500'}`}>
                                <option value="">Unassigned</option>
                                {dashReferees.filter((r) => !usedElsewhere.includes(r.id) || r.id === val).map((r) => <option key={r.id} value={r.id}>{r.name} ({r.level})</option>)}
                              </select>
                            </div>
                          )
                        })}
                        <div>
                          <p className="text-[11px] font-semibold text-neutral-500 mb-1">Observer</p>
                          <select value={m.observer || ''} onChange={(e) => setSlot(m.id, 'observer', e.target.value)}
                            className={`w-full h-9 px-2.5 rounded-lg border text-sm font-medium outline-none focus:border-brand ${m.observer ? 'border-neutral-200' : 'border-neutral-200 text-neutral-500'}`}>
                            <option value="">No observer</option>
                            {dashObservers.map((o) => <option key={o.id} value={o.id}>{o.name}{o.category ? ` · ${o.category}` : ` (${o.role})`}</option>)}
                          </select>
                          {obsById[m.observer]?.category && <div className="mt-1.5"><CategoryPill category={obsById[m.observer].category} /></div>}
                        </div>
                      </div>
                      <div className="flex justify-end mt-4">
                        <button onClick={() => saveMatch(m, i)} className="inline-flex items-center gap-2 h-10 px-6 rounded-full bg-brand text-white font-semibold hover:bg-brand-dark transition"><Check size={16} /> Save</button>
                      </div>
                      {dashReports[m.id]
                        ? <MatchReport r={dashReports[m.id]} />
                        : m.main && <p className="mt-3 text-[12.5px] font-medium text-neutral-500 flex items-center gap-1.5"><Clock size={13} /> Awaiting the main referee’s match report.</p>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {addingMatch && <AddMatchModal onClose={() => setAddingMatch(false)} onAdd={addMatch} teams={teams} fields={fields} />}
      {showDayImport && <SmartImportModal tournamentName={dashTournaments.find((x) => x.id === tid)?.name || 'this tournament'} dayScope={showDayImport} existing={dayList.length} onClose={() => setShowDayImport(null)} onImport={(result) => importIntoDay(showDayImport, result)} />}
      {showAI && <AppointAiModal onClose={() => setShowAI(false)} onRun={runAI} />}
      {showRevised && <RevisedScheduleModal current={list} onClose={() => setShowRevised(false)} onApply={(merged, mode) => {
        setMatches((prev) => ({ ...prev, [tid]: merged }))
        setShowRevised(false); setOpenDay(null); setOpenId(null); setPublishDirty(true)
        setToast(mode === 'replaced' ? 'Schedule replaced.' : 'Revised schedule applied. Review the flags and publish.')
      }} />}
      {confirmPublish && (
        <Modal onClose={() => setConfirmPublish(false)}>
          <div className="p-5">
            <div className="w-11 h-11 rounded-2xl bg-brand-light text-brand-dark flex items-center justify-center"><Send size={20} /></div>
            <h3 className="mt-3 text-xl font-extrabold text-ink">Publish appointments?</h3>
            <p className="mt-1.5 text-sm text-neutral-600 font-medium">The saved changes are communicated to the officials for {dashTournaments.find((t) => t.id === tid)?.name || 'this tournament'}, and each appointed official sees their matches in their app.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setConfirmPublish(false)} className="h-11 px-5 rounded-full border border-neutral-200 text-neutral-600 font-semibold">Cancel</button>
              <button onClick={publish} className="flex-1 h-11 rounded-full bg-brand text-white font-semibold flex items-center justify-center gap-2"><Send size={16} /> Publish</button>
            </div>
          </div>
        </Modal>
      )}
      {confirmReset && (
        <Modal onClose={() => setConfirmReset(false)}>
          <div className="p-5">
            <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center"><Trash2 size={20} /></div>
            <h3 className="mt-3 text-xl font-extrabold text-ink">Reset this tournament?</h3>
            <p className="mt-1.5 text-sm text-neutral-600 font-medium">This clears all imported content for {dashTournaments.find((t) => t.id === tid)?.name || 'this tournament'}: teams, fields, the schedule and every appointment. Use it to start over after a wrong import, then import a corrected file. Already published appointments stay in the app until you publish again.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setConfirmReset(false)} className="h-11 px-5 rounded-full border border-neutral-200 text-neutral-600 font-semibold">Cancel</button>
              <button onClick={resetTournament} className="flex-1 h-11 rounded-full bg-red-600 text-white font-semibold flex items-center justify-center gap-2"><Trash2 size={16} /> Reset tournament</button>
            </div>
          </div>
        </Modal>
      )}
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
// Broadcast / chat for one tournament. Admins create chats that land in the
// referees' webapp: either a read-only broadcast (admin posts only) or an open
// group chat (everyone can type), aimed at a chosen audience. A phone preview
// shows how it looks in the app. Prototype: messages live in local state until
// the chat backend (Phase 2) persists and delivers them.
const BC_AUDIENCES = ['Referees', 'Observers', 'Staff', 'Everyone']
function TournamentBroadcast({ tournamentName }) {
  const [chats, setChats] = useState(() => [
    { id: 'c1', name: 'Announcements', type: 'broadcast', audience: ['Everyone'], messages: [{ from: 'admin', text: `Welcome to ${tournamentName}! Your schedules follow soon.`, at: '09:00' }] },
    { id: 'c2', name: 'Referees group', type: 'open', audience: ['Referees'], messages: [{ from: 'admin', text: 'Use this chat to coordinate travel with each other.', at: '09:05' }, { from: 'ref', who: 'Dylan', text: 'Landing Friday 14:00, anyone sharing a taxi?', at: '09:12' }] },
  ])
  const [activeId, setActiveId] = useState('c1')
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState({ name: '', type: 'broadcast', audience: ['Everyone'] })
  const [msg, setMsg] = useState('')
  const active = chats.find((c) => c.id === activeId) || chats[0]

  const send = () => {
    if (!msg.trim()) return
    setChats((cs) => cs.map((c) => c.id === active.id ? { ...c, messages: [...c.messages, { from: 'admin', text: msg.trim(), at: 'now' }] } : c))
    setMsg('')
  }
  const toggleAud = (a) => setDraft((d) => ({ ...d, audience: d.audience.includes(a) ? d.audience.filter((x) => x !== a) : [...d.audience, a] }))
  const createChat = () => {
    if (!draft.name.trim() || draft.audience.length === 0) return
    const id = 'c' + Math.random().toString(36).slice(2, 6)
    setChats((cs) => [...cs, { id, name: draft.name.trim(), type: draft.type, audience: draft.audience, messages: [] }])
    setActiveId(id); setCreating(false); setDraft({ name: '', type: 'broadcast', audience: ['Everyone'] })
  }

  return (
    <div className="grid lg:grid-cols-[250px_1fr_300px] gap-4 items-start">
      {/* Chat list */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-2">
        {chats.map((c) => (
          <button key={c.id} onClick={() => { setActiveId(c.id); setCreating(false) }}
            className={`w-full text-left px-3 py-2.5 rounded-xl mb-1 ${activeId === c.id && !creating ? 'bg-brand-light' : 'hover:bg-page'}`}>
            <span className="flex items-center gap-1.5 text-sm font-bold text-ink">{c.type === 'broadcast' ? <Lock size={12} className="text-neutral-500" /> : <Users size={12} className="text-neutral-500" />} {c.name}</span>
            <span className="block text-[11px] font-medium text-neutral-500 mt-0.5">{c.type === 'broadcast' ? 'Admin only' : 'Open chat'} · {c.audience.join(', ')}</span>
          </button>
        ))}
        <button onClick={() => { setCreating(true) }} className="w-full flex items-center gap-1.5 text-[13px] font-semibold text-brand-dark px-3 py-2 rounded-xl hover:bg-page"><Plus size={15} /> New chat</button>
      </div>

      {/* Composer / new-chat form */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
        {creating ? (
          <>
            <p className="font-bold text-ink text-sm mb-3">New chat</p>
            <label className="block text-xs font-semibold text-ink mb-1">Name</label>
            <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="e.g. Finals day briefing"
              className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-sm font-medium outline-none focus:border-brand" />
            <label className="block text-xs font-semibold text-ink mt-3 mb-1">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[['broadcast', 'Broadcast', 'Admin posts, read-only'], ['open', 'Open chat', 'Everyone can type']].map(([val, label, sub]) => (
                <button key={val} onClick={() => setDraft((d) => ({ ...d, type: val }))}
                  className={`text-left px-3 py-2.5 rounded-xl border ${draft.type === val ? 'border-brand bg-brand-light' : 'border-neutral-200'}`}>
                  <span className="block text-sm font-bold text-ink">{label}</span>
                  <span className="block text-[11px] font-medium text-neutral-500">{sub}</span>
                </button>
              ))}
            </div>
            <label className="block text-xs font-semibold text-ink mt-3 mb-1">Who can see it</label>
            <div className="flex flex-wrap gap-2">
              {BC_AUDIENCES.map((a) => (
                <button key={a} onClick={() => toggleAud(a)}
                  className={`text-[12px] font-semibold px-3 h-9 rounded-full border inline-flex items-center gap-1.5 ${draft.audience.includes(a) ? 'bg-brand text-white border-brand' : 'bg-white text-neutral-500 border-neutral-200'}`}>
                  {draft.audience.includes(a) && <Check size={13} />} {a}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setCreating(false)} className="h-10 px-4 rounded-full border border-neutral-200 text-neutral-600 font-semibold text-sm">Cancel</button>
              <button onClick={createChat} disabled={!draft.name.trim() || draft.audience.length === 0}
                className="flex-1 h-10 rounded-full bg-brand text-white font-semibold text-sm disabled:opacity-50">Create chat</button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="font-bold text-ink text-sm flex items-center gap-1.5">{active.type === 'broadcast' ? <Lock size={13} className="text-neutral-500" /> : <Users size={13} className="text-neutral-500" />} {active.name}</p>
              <span className="text-[11px] font-semibold text-neutral-500">{active.type === 'broadcast' ? 'Read-only broadcast' : 'Open chat'}</span>
            </div>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">To {active.audience.join(', ')} in {tournamentName}. {active.type === 'open' ? 'Participants can reply.' : 'Only admins can post.'}</p>
            <label className="block text-xs font-semibold text-ink mt-4 mb-1">Message</label>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={5} placeholder="Type your message…"
              className="w-full p-3 rounded-xl border border-neutral-200 text-sm font-medium outline-none focus:border-brand resize-none" />
            <button onClick={send} disabled={!msg.trim()} className="mt-3 w-full h-11 rounded-full bg-brand text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
              <Send size={16} /> Send to {active.audience.join(' + ').toLowerCase()}
            </button>
            <p className="mt-2 text-[11px] text-neutral-500 font-medium">Messages are stored and delivered once the chat backend is live (Phase 2).</p>
          </>
        )}
      </div>

      {/* Phone preview of the chat as the referee sees it */}
      <div className="bg-neutral-900 rounded-[28px] p-2.5 shadow-lg">
        <div className="bg-page rounded-[20px] overflow-hidden h-[460px] flex flex-col">
          <div className="bg-white px-4 py-3 border-b border-neutral-200">
            <p className="text-[13px] font-extrabold text-ink flex items-center gap-1.5">{active.type === 'broadcast' ? <Lock size={12} /> : <Users size={12} />} {active.name}</p>
            <p className="text-[10px] font-medium text-neutral-500">{tournamentName}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {active.messages.length === 0 && <p className="text-[12px] text-neutral-500 font-medium text-center mt-6">No messages yet.</p>}
            {active.messages.map((m, i) => (
              <div key={i} className={m.from === 'admin' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'}>
                {m.from !== 'admin' && <p className="text-[9px] font-bold text-neutral-500 mb-0.5 ml-1">{m.who || 'Referee'}</p>}
                <div className={`px-3 py-2 text-[12px] font-medium leading-snug ${m.from === 'admin' ? 'bg-brand text-white rounded-2xl rounded-br-sm' : 'bg-white border border-neutral-200 text-ink rounded-2xl rounded-bl-sm'}`}>{m.text}</div>
              </div>
            ))}
          </div>
          {active.type === 'open' ? (
            <div className="bg-white border-t border-neutral-200 px-3 py-2 flex items-center gap-2">
              <span className="flex-1 bg-page rounded-full px-3 py-1.5 text-[11px] text-neutral-500">Message…</span>
              <Send size={14} className="text-brand" />
            </div>
          ) : (
            <div className="bg-white border-t border-neutral-200 px-3 py-2.5 text-center text-[10px] font-semibold text-neutral-500 flex items-center justify-center gap-1"><Lock size={11} /> Only admins can post here</div>
          )}
        </div>
      </div>
    </div>
  )
}

// Consolidated communication hub: the AI smart inbox, group broadcasts and the
// AI assistant knowledge base all live here as tabs.
export function DashboardCommunication() {
  const [tab, setTab] = useState('inbox')
  const [dmUnread, setDmUnread] = useState(0)
  useEffect(() => { if (LIVE) getDmThreads().then((d) => setDmUnread(d.totalUnread || 0)).catch(() => {}) }, [tab])
  const dmLabel = dmUnread > 0 ? `Direct messages (${dmUnread})` : 'Direct messages'
  return (
    <div>
      <SubTabs tabs={[
        { k: 'inbox', label: 'Inbox' },
        { k: 'dm', label: dmLabel },
        { k: 'assistant', label: 'Assistant' },
      ]} active={tab} onChange={setTab} />
      {tab === 'inbox' && <DashboardInbox />}
      {tab === 'dm' && <DashboardDirectMessages onUnread={setDmUnread} />}
      {tab === 'assistant' && <DashboardAssistant />}
    </div>
  )
}

/* ---------------- Direct messages (referee <-> org) ---------------- */
const dmMockThreads = {
  'm-sofia': {
    refId: 'm-sofia', name: 'Sofia Marques',
    messages: [
      { from: 'ref', text: 'Hi! Is lunch provided on match days in Porto?', at: new Date(Date.now() - 55 * 60000).toISOString() },
      { from: 'ref', text: 'And can I arrive a day earlier?', at: new Date(Date.now() - 54 * 60000).toISOString() },
    ],
  },
  'm-alex': {
    refId: 'm-alex', name: 'Alex Berg',
    messages: [
      { from: 'ref', text: 'Quick question about my kit size', at: new Date(Date.now() - 26 * 3600000).toISOString() },
      { from: 'admin', text: 'Sure, what do you need?', at: new Date(Date.now() - 25 * 3600000).toISOString() },
      { from: 'ref', text: 'Thanks, see you in Porto!', at: new Date(Date.now() - 24 * 3600000).toISOString() },
    ],
  },
}
const dmMockList = {
  threads: [
    { refId: 'm-sofia', name: 'Sofia Marques', last: 'And can I arrive a day earlier?', at: dmMockThreads['m-sofia'].messages.at(-1).at, unread: 2 },
    { refId: 'm-alex', name: 'Alex Berg', last: 'Thanks, see you in Porto!', at: dmMockThreads['m-alex'].messages.at(-1).at, unread: 0 },
  ],
  totalUnread: 2,
}

export function DashboardDirectMessages({ onUnread }) {
  const [list, setList] = useState(LIVE ? { threads: [], totalUnread: 0 } : dmMockList)
  const [selId, setSelId] = useState(LIVE ? null : dmMockList.threads[0].refId)
  const [thread, setThread] = useState(LIVE ? null : dmMockThreads[dmMockList.threads[0].refId])
  const [reply, setReply] = useState('')
  const scrollRef = useRef(null)

  // Report the unread total to the parent tab label and to the sidebar badge
  // (via a window event, like ra-nav), so both stay in sync in live and demo.
  const reportUnread = (total) => { onUnread?.(total); window.dispatchEvent(new CustomEvent('ra-dm-unread', { detail: total })) }

  const loadList = () => {
    if (!LIVE) return
    getDmThreads().then((d) => { setList(d); reportUnread(d.totalUnread || 0) }).catch(() => {})
  }
  useEffect(() => {
    if (LIVE) loadList()
    else reportUnread(dmMockList.totalUnread) // seed the demo badge
  }, [])

  const openThread = async (refId) => {
    setSelId(refId)
    if (!LIVE) { setThread(dmMockThreads[refId]); markReadLocal(refId); return }
    const t = await getDmThread(refId)
    setThread(t)
    await markDmReadAdmin(refId)
    loadList()
  }

  // Mock: clear the unread badge locally when a thread is opened.
  const markReadLocal = (refId) => {
    setList((l) => {
      const threads = l.threads.map((t) => t.refId === refId ? { ...t, unread: 0 } : t)
      const totalUnread = threads.reduce((n, t) => n + t.unread, 0)
      reportUnread(totalUnread)
      return { threads, totalUnread }
    })
  }

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight) }, [thread])

  const send = async () => {
    const t = reply.trim()
    if (!t || !selId) return
    setReply('')
    setThread((th) => ({ ...th, messages: [...(th?.messages || []), { from: 'admin', text: t, at: new Date().toISOString() }] }))
    if (LIVE) { try { await sendDmReply(selId, t) } catch { /* keep optimistic */ } loadList() }
  }

  return (
    <div className="grid md:grid-cols-[300px_1fr] gap-4 h-[calc(100vh-220px)] min-h-[420px]">
      {/* Thread list */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-y-auto no-scrollbar divide-y divide-neutral-100">
        {list.threads.length === 0 && <div className="p-5 text-sm font-medium text-neutral-500">No direct messages yet. Referees can message the organisation from the app.</div>}
        {list.threads.map((t) => (
          <button key={t.refId} onClick={() => openThread(t.refId)} className={`w-full text-left px-4 py-3 flex items-center gap-3 transition ${selId === t.refId ? 'bg-brand-light/60' : 'hover:bg-neutral-50'}`}>
            <span className="w-9 h-9 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center flex-none">{(t.name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}</span>
            <span className="flex-1 min-w-0">
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-ink truncate">{t.name}</span>
                <span className="text-[10px] text-neutral-400 font-semibold flex-none">{relativeTime(t.at)}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 font-medium truncate flex-1">{t.last}</span>
                {t.unread > 0 && <span className="flex-none min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">{t.unread}</span>}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Conversation */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm flex flex-col overflow-hidden">
        {!thread ? (
          <div className="flex-1 flex items-center justify-center text-sm font-medium text-neutral-500">Select a conversation</div>
        ) : (
          <>
            <div className="px-4 h-14 flex items-center gap-3 border-b border-neutral-100 shrink-0">
              <span className="w-9 h-9 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center">{(thread.name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}</span>
              <div><p className="text-sm font-bold text-ink leading-tight">{thread.name}</p><p className="text-[11px] text-neutral-500 font-medium">Direct message</p></div>
            </div>
            <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-4 space-y-2 bg-page/40">
              {(thread.messages || []).map((m, i) => (
                <div key={i} className={`max-w-[75%] px-3.5 py-2 text-sm font-medium leading-snug ${m.from === 'admin' ? 'ml-auto bg-brand text-white rounded-2xl rounded-br-sm' : 'bg-white border border-neutral-200 text-ink rounded-2xl rounded-bl-sm'}`}>{m.text}</div>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send() }} className="shrink-0 border-t border-neutral-100 p-3 flex items-center gap-2">
              <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply to this referee…" className="flex-1 bg-page rounded-full px-4 h-10 text-sm font-medium outline-none border border-neutral-200 focus:border-brand" />
              <button type="submit" className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center active:scale-95"><Send size={17} /></button>
            </form>
          </>
        )}
      </div>
    </div>
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
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
          <p className="font-bold text-ink text-sm">Inbox</p>
          <span className="text-xs font-medium text-neutral-500">{items.filter((x) => x.status === 'new').length} new</span>
        </div>
        <div className="divide-y divide-neutral-100 max-h-[540px] overflow-y-auto">
          {items.map((it) => (
            <button key={it.id} onClick={() => pick(it)} className={`w-full text-left px-4 py-3 transition ${sel === it.id ? 'bg-page' : 'hover:bg-page'}`}>
              <div className="flex items-center gap-2">
                {it.channel === 'email' ? <Mail size={14} className="text-neutral-500" /> : <MessageCircle size={14} className="text-neutral-500" />}
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
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
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

// Shared error state for the live dashboard views: a clear message plus a
// Retry button so a failed load is never a dead end (U7).
function DashError({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-3 flex-wrap">
      <AlertTriangle size={16} className="text-red-600 flex-none" />
      <span className="text-sm font-medium text-red-700 flex-1 min-w-0">{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="text-[12px] font-bold text-white bg-red-600 hover:bg-red-700 rounded-full px-3 h-8 inline-flex items-center gap-1.5 flex-none">
          <RefreshCw size={13} /> Retry
        </button>
      )}
    </div>
  )
}

/* ---------------- P&L ---------------- */
export function DashboardPnL() {
  const [rows, setRows] = useState(LIVE ? [] : dashPnl.map((p) => ({ ...p, hasCosts: true })))
  const [loading, setLoading] = useState(LIVE)
  const [error, setError] = useState(null)

  const loadPnl = () => {
    if (!LIVE) return
    setLoading(true); setError(null)
    getPnl()
      .then((r) => setRows(r))
      .catch((e) => setError(e.message || 'Could not load P&L'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadPnl() }, [])

  const hasCosts = rows.length > 0 && rows.every((r) => r.hasCosts)
  const totalRev = rows.reduce((a, b) => a + b.revenue, 0)
  const totalRefs = rows.reduce((a, b) => a + (b.referees || 0), 0)
  const totalCost = hasCosts ? rows.reduce((a, b) => a + b.costs, 0) : 0
  const net = totalRev - totalCost
  const marginPct = totalRev ? Math.round((net / totalRev) * 100) : 0

  const exportPnl = async () => {
    const headers = hasCosts ? ['Tournament', 'Revenue', 'Costs', 'Margin', '%'] : ['Tournament', 'Revenue', 'Paid referees']
    const data = rows.map((p) => {
      const m = p.revenue - (p.costs || 0)
      const pct = p.revenue ? Math.round((m / p.revenue) * 100) : 0
      return hasCosts ? [p.name, p.revenue, p.costs, m, pct] : [p.name, p.revenue, p.referees]
    })
    await exportToXlsx('referee-abroad-pnl.xlsx', headers, data)
  }

  if (loading) return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">{Array.from({ length: 4 }).map((_, i) => <Skel key={i} className="h-20" />)}</div>
      <RowsSkeleton count={5} />
    </div>
  )

  return (
    <div>
      {error && <DashError message={error} onRetry={loadPnl} />}
      <div className="flex justify-end mb-3">
        <button onClick={exportPnl} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-neutral-200 bg-white text-[13px] font-semibold text-ink hover:border-brand"><Download size={15} /> Export to Excel</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total revenue" value={euro(totalRev)} sub={`${rows.length} tournaments`} />
        {hasCosts ? (
          <>
            <StatCard label="Total costs" value={euro(totalCost)} />
            <StatCard label="Net margin" value={euro(net)} sub={`${marginPct}% margin`} />
            <StatCard label="Avg. per referee" value={euro(totalRefs ? Math.round(net / totalRefs) : 0)} />
          </>
        ) : (
          <>
            <StatCard label="Paid referees" value={totalRefs} />
            <StatCard label="Avg. revenue / referee" value={euro(totalRefs ? Math.round(totalRev / totalRefs) : 0)} />
          </>
        )}
      </div>

      {!hasCosts && (
        <p className="mt-3 text-xs text-neutral-500 font-medium flex items-center gap-1.5">
          <Lock size={13} className="text-neutral-500" /> Costs and net margin aren’t tracked in WordPress; they come with the own backend in Phase 2.
        </p>
      )}

      <div className="mt-5 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-neutral-500 border-b border-neutral-200 bg-page/60">
              <th className="px-4 py-3 font-semibold">Tournament</th>
              <th className="px-4 py-3 font-semibold text-right">Revenue</th>
              {hasCosts
                ? <><th className="px-4 py-3 font-semibold text-right">Costs</th><th className="px-4 py-3 font-semibold text-right">Margin</th><th className="px-4 py-3 font-semibold text-right">%</th></>
                : <th className="px-4 py-3 font-semibold text-right">Paid referees</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 tabular-nums">
            {rows.map((p, i) => {
              const m = p.revenue - (p.costs || 0)
              const pct = p.revenue ? Math.round((m / p.revenue) * 100) : 0
              return (
                <tr key={i} className="hover:bg-page">
                  <td className="px-4 py-3 font-semibold text-ink">{p.name}</td>
                  <td className="px-4 py-3 text-right font-medium text-neutral-600">{euro(p.revenue)}</td>
                  {hasCosts
                    ? <><td className="px-4 py-3 text-right font-medium text-neutral-600">{euro(p.costs)}</td><td className="px-4 py-3 text-right font-bold text-brand-dark">{euro(m)}</td><td className="px-4 py-3 text-right font-medium text-neutral-500">{pct}%</td></>
                    : <td className="px-4 py-3 text-right font-medium text-neutral-600">{p.referees}</td>}
                </tr>
              )
            })}
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-4 text-sm text-neutral-500 font-medium">No paid tournaments yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------------- Analytics ---------------- */
const LEVEL_PALETTE = { talent: '#44A546', medior: '#7FB2E8', beginner: '#D3D6D2' }
const GENDER_PALETTE = { Male: '#7FB2E8', Female: '#E8768F', Other: '#F2A541' }
const CHART_COLORS = ['#44A546', '#7FB2E8', '#F2A541', '#9B8BD6', '#E8768F', '#2FA8A0', '#D3D6D2', '#C9A227']

// Donut chart with a legend. data = [{key, val}].
function DonutCard({ title, data, palette = {} }) {
  const total = data.reduce((s, d) => s + d.val, 0) || 1
  const slices = data.map((d, i) => ({ ...d, color: palette[d.key] || CHART_COLORS[i % CHART_COLORS.length] }))
  const circ = 2 * Math.PI * 42
  let acc = 0
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4">
      <p className="font-bold text-ink text-sm mb-3">{title}</p>
      <div className="flex items-center gap-4">
        <svg width="104" height="104" viewBox="0 0 100 100" className="-rotate-90 flex-none">
          {slices.map((d) => {
            const frac = d.val / total
            const el = <circle key={d.key} cx="50" cy="50" r="42" fill="none" stroke={d.color} strokeWidth="16" strokeDasharray={`${frac * circ} ${circ}`} strokeDashoffset={-acc * circ} />
            acc += frac
            return el
          })}
        </svg>
        <div className="flex-1 min-w-0 space-y-1.5">
          {slices.map((d) => (
            <div key={d.key} className="flex items-center gap-2 text-sm">
              <span className="w-2.5 h-2.5 rounded-sm flex-none" style={{ background: d.color }} />
              <span className="font-semibold text-ink capitalize truncate flex-1 min-w-0">{d.key}</span>
              <span className="font-medium text-neutral-500 tabular-nums flex-none">{d.val}</span>
              <span className="font-medium text-neutral-500 tabular-nums flex-none w-9 text-right">{Math.round((d.val / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Horizontal bar list. data = [{key, val}].
function HBarCard({ title, data, color = '#44A546' }) {
  const max = Math.max(1, ...data.map((d) => d.val))
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4">
      <p className="font-bold text-ink text-sm mb-3">{title}</p>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.key} className="flex items-center gap-3">
            <span className="w-28 flex-none text-[13px] font-semibold text-ink truncate">{d.key}</span>
            <span className="flex-1 h-5 bg-page rounded-md overflow-hidden"><span className="block h-full rounded-md" style={{ width: `${(d.val / max) * 100}%`, background: color }} /></span>
            <span className="w-8 flex-none text-right text-[13px] font-medium text-neutral-500 tabular-nums">{d.val}</span>
          </div>
        ))}
        {data.length === 0 && <p className="text-sm text-neutral-500 font-medium">No data.</p>}
      </div>
    </div>
  )
}

// Simple responsive line chart. `data` is [{ month|m, value|v }]; `format`
// turns a value into its label (e.g. a euro amount).
const niceStep = (r) => { const base = Math.max(r, 1); const p = Math.pow(10, Math.floor(Math.log10(base))); const n = base / p; const s = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10; return s * p }

function LineChartCard({ title, data, color = '#44A546', format = (n) => String(n) }) {
  const pts = data.map((d) => ({ label: d.month ?? d.m, value: Number(d.value ?? d.v) || 0 }))
  const max = Math.max(1, ...pts.map((p) => p.value))
  const step = niceStep(max / 4)
  const niceMax = Math.max(step, step * Math.ceil(max / step))
  const ticks = []; for (let v = 0; v <= niceMax + 0.001; v += step) ticks.push(v)
  const W = 680, H = 220, x0 = 54, x1 = W - 16, y0 = 18, y1 = H - 28
  const x = (i) => x0 + (i * (x1 - x0)) / Math.max(1, pts.length - 1)
  const y = (v) => y1 - (v / niceMax) * (y1 - y0)
  const line = pts.map((p, i) => `${x(i)},${y(p.value)}`).join(' ')
  const area = `M${x(0)},${y1} ${pts.map((p, i) => `L${x(i)},${y(p.value)}`).join(' ')} L${x(pts.length - 1)},${y1} Z`
  const gid = `lcg-${title.replace(/\W/g, '')}`
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4">
      <p className="font-bold text-ink text-sm mb-1 flex items-center gap-1.5"><TrendingUp size={16} className="text-brand" /> {title}</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" className="block">
        <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity="0.2" /><stop offset="1" stopColor={color} stopOpacity="0.02" /></linearGradient></defs>
        {ticks.map((v, i) => (
          <g key={i}>
            <line x1={x0} x2={x1} y1={y(v)} y2={y(v)} stroke="#eef0ee" strokeWidth="1" />
            <text x={x0 - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#9ca3af">{format(v)}</text>
          </g>
        ))}
        <path d={area} fill={`url(#${gid})`} />
        <polyline points={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.value)} r="3.5" fill={color} />
            <text x={x(i)} y={y(p.value) - 9} textAnchor="middle" fontSize="11" fill="#6b7280" fontWeight="600">{format(p.value)}</text>
            <text x={x(i)} y={y1 + 18} textAnchor="middle" fontSize="11" fill="#9ca3af">{p.label}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

export function DashboardAnalytics() {
  const [a, setA] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadAnalytics = () => {
    setLoading(true); setError(null)
    getAnalytics()
      .then((d) => setA(d))
      .catch((e) => setError(e.message || 'Could not load analytics'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadAnalytics() }, [])

  if (loading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <Skel key={i} className="h-20" />)}</div>
      <div className="grid md:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skel key={i} className="h-40" />)}</div>
    </div>
  )
  if (error) return <div className="p-4"><DashError message={error} onRetry={loadAnalytics} /></div>
  if (!a) return null

  const maxBar = Math.max(1, ...a.refereesPerTournament.map((d) => d.value))
  const euro = (n) => '€' + Number(n).toLocaleString('en-GB')
  const hasApps = (a.applicationsByMonth || []).some((d) => d.value > 0)
  const hasRev = (a.revenueByMonth || []).some((d) => d.value > 0)

  const tiles = [
    { label: 'Total referees', value: a.tiles.totalReferees },
    { label: 'Avg. referees / tournament', value: a.tiles.avgReferees },
    { label: 'Countries reached', value: a.tiles.countriesReached },
    a.tiles.womenPct != null ? { label: 'Women', value: `${a.tiles.womenPct}%` } : null,
    a.tiles.reportsSubmitted != null ? { label: 'Reports submitted', value: a.tiles.reportsSubmitted } : null,
    a.tiles.avgScore != null ? { label: 'Avg. report score', value: a.tiles.avgScore } : null,
  ].filter(Boolean).slice(0, 4)

  const exportAnalytics = async () => {
    const list = (l) => (l || []).map((x) => [x.key, x.val])
    const months = (m) => (m || []).map((x) => [x.month, x.value])
    const sheets = {
      Overview: { headers: ['Metric', 'Value'], rows: tiles.map((t) => [t.label, String(t.value)]) },
      'Per tournament': { headers: ['Tournament', 'Referees'], rows: (a.refereesPerTournament || []).map((d) => [d.name, d.value]) },
      Levels: { headers: ['Level', 'Count'], rows: list(a.levelList) },
      Gender: { headers: ['Gender', 'Count'], rows: list(a.genderList) },
      Countries: { headers: ['Country', 'Count'], rows: list(a.countriesList) },
    }
    if ((a.ageList || []).length) sheets.Age = { headers: ['Age band', 'Count'], rows: list(a.ageList) }
    if ((a.experienceList || []).length) sheets.Experience = { headers: ['Experience', 'Count'], rows: list(a.experienceList) }
    if ((a.applicationsByMonth || []).length) sheets['Applications per month'] = { headers: ['Month', 'Applications'], rows: months(a.applicationsByMonth) }
    if ((a.revenueByMonth || []).length) sheets['Revenue per month'] = { headers: ['Month', 'Revenue'], rows: months(a.revenueByMonth) }
    await exportSheetsToXlsx('referee-abroad-analytics.xlsx', sheets)
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={exportAnalytics} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-neutral-200 bg-white text-[13px] font-semibold text-ink hover:border-brand"><Download size={15} /> Export to Excel</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t) => <StatCard key={t.label} label={t.label} value={String(t.value)} />)}
      </div>

      <div className="mt-5 grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4">
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

        {a.levelList.length > 0 && <DonutCard title="Referee levels" data={a.levelList} palette={LEVEL_PALETTE} />}
        {a.genderList.length > 0 && <DonutCard title="Gender" data={a.genderList} palette={GENDER_PALETTE} />}
        {(a.ageList || []).length > 0 && <HBarCard title="Age groups" data={a.ageList} color="#9B8BD6" />}
        {a.countriesList.length > 0 && <HBarCard title="Top countries" data={a.countriesList} />}
        {a.experienceList.length > 0 && <HBarCard title="Experience (years registered)" data={a.experienceList} color="#7FB2E8" />}

        {hasApps && <LineChartCard title="Applications per month" data={a.applicationsByMonth} />}
        {hasRev && <LineChartCard title="Revenue per month" data={a.revenueByMonth} color="#2F7D37" format={euro} />}
        {a.reportsByMonth && (
          <LineChartCard title="Reports submitted over time" data={a.reportsByMonth} />
        )}
      </div>

      {LIVE && (
        <p className="mt-4 text-xs text-neutral-500 font-medium flex items-center gap-1.5">
          <Lock size={13} className="text-neutral-500" />
          {(a.ageList || []).length ? '' : 'Age groups appear once dates of birth are recorded in WordPress. '}
          Match-report analytics (scores, trends) arrive with the own backend in Phase 2.
        </p>
      )}
    </div>
  )
}

/* ---------------- Assistant (FAQ + AI usage) ---------------- */
const fmtTokens = (n) => n == null ? '—' : n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : String(n)

export function DashboardAssistant() {
  const [items, setItems] = useState(() => FAQ_ITEMS.map((x, i) => ({ id: 'f' + i, q: x.q, a: x.a })))
  const [editing, setEditing] = useState(null) // id or 'new'
  const [draft, setDraft] = useState({ q: '', a: '' })
  const [ai, setAi] = useState(null)

  useEffect(() => {
    if (!LIVE) return
    let alive = true
    fetch('/api/assistant').then((r) => (r.ok ? r.json() : null)).then((d) => { if (alive) setAi(d) }).catch(() => {})
    return () => { alive = false }
  }, [])

  const startEdit = (it) => { setEditing(it.id); setDraft({ q: it.q, a: it.a }) }
  const startNew = () => { setEditing('new'); setDraft({ q: '', a: '' }) }
  const save = () => {
    if (!draft.q.trim() || !draft.a.trim()) return
    if (editing === 'new') setItems((prev) => [...prev, { id: 'f' + Math.random().toString(36).slice(2, 6), ...draft }])
    else setItems((prev) => prev.map((x) => x.id === editing ? { ...x, ...draft } : x))
    setEditing(null)
  }
  const remove = (id) => setItems((prev) => prev.filter((x) => x.id !== id))

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-ink"><Coins size={17} className="text-brand" /> AI assistant</div>
        {LIVE ? (
          ai && ai.configured ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Status" value="Live" sub="answering in the app" />
              <StatCard label="Provider" value={ai.provider === 'openai' ? 'OpenAI' : ai.provider === 'anthropic' ? 'Anthropic' : (ai.provider || '—')} sub={ai.model || ''} />
              <StatCard label="Tokens this month" value={fmtTokens(ai.tokensThisMonth)} sub={ai.tokensThisMonth == null ? 'budget tracking off' : ''} />
              <StatCard label="Monthly budget" value={ai.budget ? fmtTokens(ai.budget) + ' tokens' : 'No cap'} sub={ai.budget ? 'hard limit' : 'set LLM_MONTHLY_TOKEN_BUDGET'} />
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm font-medium">
              The assistant is not switched on yet. Add an LLM provider key in Vercel (ANTHROPIC_API_KEY or OPENAI_API_KEY, with optional LLM_PROVIDER / LLM_MODEL) to turn it on. Until then the app answers from the FAQ below.
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Messages handled" value="428" sub="sample data" />
            <StatCard label="Tokens used" value="1.24M" sub="sample data" />
            <StatCard label="Estimated cost" value="€42" sub="sample data" />
            <StatCard label="Auto-answered" value="63%" sub="sample data" />
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink"><HelpCircle size={17} className="text-brand" /> FAQ knowledge base <span className="text-neutral-500 font-medium">({items.length})</span></div>
          <button onClick={startNew} className="inline-flex items-center gap-1.5 bg-brand text-white text-sm font-semibold px-4 h-9 rounded-full hover:bg-brand-dark transition"><Plus size={15} /> Add entry</button>
        </div>
        <p className="text-xs font-medium text-neutral-500 mb-3">This is the source the chatbot and the smart inbox draft replies from. Keep it accurate.</p>

        <div className="space-y-3">
          {editing === 'new' && (
            <FaqEditor draft={draft} setDraft={setDraft} onSave={save} onCancel={() => setEditing(null)} />
          )}
          {items.map((it) => editing === it.id ? (
            <FaqEditor key={it.id} draft={draft} setDraft={setDraft} onSave={save} onCancel={() => setEditing(null)} />
          ) : (
            <div key={it.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold text-ink text-sm">{it.q}</p>
                <div className="flex items-center gap-1 flex-none">
                  <button onClick={() => startEdit(it)} className="w-8 h-8 rounded-lg hover:bg-page flex items-center justify-center text-neutral-500"><Pencil size={15} /></button>
                  <button onClick={() => remove(it.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-neutral-500 hover:text-red-500"><Trash2 size={15} /></button>
                </div>
              </div>
              <p className="mt-1 text-sm text-neutral-600 font-medium leading-relaxed">{it.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FaqEditor({ draft, setDraft, onSave, onCancel }) {
  return (
    <div className="bg-white rounded-2xl border border-brand/40 shadow-sm p-4">
      <Field label="Question"><input value={draft.q} onChange={(e) => setDraft((d) => ({ ...d, q: e.target.value }))} placeholder="What do referees ask?" className={inputCls} autoFocus /></Field>
      <div className="mt-3">
        <span className="block text-xs font-semibold text-ink mb-1">Answer</span>
        <textarea value={draft.a} onChange={(e) => setDraft((d) => ({ ...d, a: e.target.value }))} rows={3} placeholder="The grounded answer the AI should give." className="w-full p-3 rounded-xl border border-neutral-200 text-sm font-medium outline-none focus:border-brand resize-none" />
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <button onClick={onCancel} className="text-xs font-bold text-neutral-500 px-3 h-9">Cancel</button>
        <button onClick={onSave} className="text-xs font-bold text-white bg-brand rounded-full px-4 h-9">Save entry</button>
      </div>
    </div>
  )
}

/* ---------------- Sync status ---------------- */
const syncLog = [
  { time: '2 min ago', event: 'Order #10428 imported as enrolment', status: 'ok' },
  { time: '18 min ago', event: 'Tournament products synced (6 items)', status: 'ok' },
  { time: '1 hour ago', event: 'Referee profile updated in WordPress', status: 'ok' },
  { time: '3 hours ago', event: 'Retry: order #10419 (timeout, succeeded on retry)', status: 'retry' },
  { time: 'Yesterday', event: 'Webhook received: new WooCommerce order', status: 'ok' },
]

// "3 min ago" / "2 hours ago" / "Yesterday" from an ISO timestamp.
function relativeTime(iso) {
  const t = Date.parse(iso)
  if (!t) return ''
  const s = Math.max(0, Math.round((Date.now() - t) / 1000))
  if (s < 60) return 'Just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`
  const d = Math.round(h / 24)
  return d === 1 ? 'Yesterday' : `${d} days ago`
}

// Turn a live webhook delivery into a log row.
function webhookToRow(e) {
  const topic = (e.topic || '').replace('order.', '')
  const label = topic === 'created' ? 'created' : topic === 'updated' ? 'updated' : topic || 'received'
  return {
    time: relativeTime(e.at),
    event: e.orderId ? `Order #${e.orderId} ${label}${e.status ? ` (${e.status})` : ''}` : `WooCommerce order ${label}`,
    status: e.verified === false ? 'error' : 'ok',
  }
}

export function DashboardSync() {
  const [toast, setToast] = useState('')
  const [live, setLive] = useState(null) // { last, log } from the webhook receiver
  const statusCls = { ok: 'bg-brand-light text-brand-dark', retry: 'bg-amber-100 text-amber-700', error: 'bg-red-50 text-red-600' }

  const loadLive = () => { if (LIVE) getSyncLog().then(setLive).catch(() => {}) }
  useEffect(loadLive, [])

  const rows = live ? (live.log || []).map(webhookToRow) : syncLog
  const lastSync = live ? (live.last ? relativeTime(live.last.at) : 'No deliveries yet') : '2 minutes ago'
  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 flex items-center gap-3">
          <CheckCircle2 size={22} className="text-brand" />
          <div><p className="font-bold text-ink text-sm">WordPress</p><p className="text-xs text-brand-dark font-semibold">Connected</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 flex items-center gap-3">
          <CheckCircle2 size={22} className="text-brand" />
          <div><p className="font-bold text-ink text-sm">WooCommerce</p><p className="text-xs text-brand-dark font-semibold">Connected</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 flex items-center gap-3">
          <Clock size={22} className="text-neutral-500" />
          <div><p className="font-bold text-ink text-sm">Last sync</p><p className="text-xs text-neutral-500 font-semibold">{lastSync}</p></div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">Recent sync activity</p>
        <button onClick={() => { loadLive(); setToast('Sync refreshed. WordPress is the source of truth in Phase 1.') }} className="inline-flex items-center gap-1.5 border border-neutral-200 text-ink text-sm font-semibold px-4 h-9 rounded-full hover:border-brand transition"><RefreshCw size={15} /> Sync now</button>
      </div>

      <div className="mt-3 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden divide-y divide-neutral-100">
        {rows.length === 0 && <div className="px-4 py-6 text-sm font-medium text-neutral-500 text-center">No webhook deliveries yet. WooCommerce will post here on new and changed orders.</div>}
        {rows.map((l, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex-none ${statusCls[l.status]}`}>{l.status === 'retry' ? 'Retried' : l.status === 'error' ? 'Unverified' : 'OK'}</span>
            <span className="flex-1 text-sm font-medium text-ink">{l.event}</span>
            <span className="text-xs text-neutral-500 font-medium flex-none">{l.time}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-neutral-500 font-medium leading-relaxed">Two-way sync with automatic retries and logging. WordPress remains the single source of truth in Phase 1.</p>
      {toast && <Toast text={toast} onDone={() => setToast('')} />}
    </div>
  )
}

/* ---------------- Settings ---------------- */
const TEAM_CURRENT_USER = 'Reemo van Dijk'
const TEAM_ROLES = ['Admin', 'Coordinator', 'Communication', 'Viewer']
const TEAM_ROLE_ACCESS = { Admin: 'Full access', Coordinator: 'Tournaments, communication', Communication: 'Inbox, communication', Viewer: 'Read only' }
function RolePill({ role, editable, onChange }) {
  const [open, setOpen] = useState(false)
  if (!editable) return <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-brand-light text-brand-dark w-32 text-center inline-block">{role}</span>
  return (
    <span className="relative inline-block w-32">
      <button onClick={() => setOpen((o) => !o)} className="w-full text-[11px] font-semibold px-2.5 py-1 rounded-full bg-brand-light text-brand-dark inline-flex items-center justify-center gap-1 hover:bg-brand/20 transition">{role} <ChevronDown size={12} /></button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 z-20 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden min-w-[150px]">
            {TEAM_ROLES.map((r) => (
              <button key={r} onClick={() => { setOpen(false); onChange(r) }} className={`w-full text-left px-3 py-2 text-[12px] font-semibold hover:bg-page ${r === role ? 'text-brand-dark' : 'text-ink'}`}>{r}</button>
            ))}
          </div>
        </>
      )}
    </span>
  )
}
const roleRows = [
  { name: 'Reemo van Dijk', role: 'Admin', access: 'Full access' },
  { name: 'Sara Mendes', role: 'Coordinator', access: 'Tournaments, communication' },
  { name: 'Nadia Haddad', role: 'Communication', access: 'Inbox, communication' },
  { name: 'Paulo Reis', role: 'Viewer', access: 'Read only' },
]

function Toggle({ on, onClick }) {
  return (
    <span onClick={onClick} className={`w-10 h-6 rounded-full transition relative cursor-pointer ${on ? 'bg-brand' : 'bg-neutral-300'}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${on ? 'left-[18px]' : 'left-0.5'}`} />
    </span>
  )
}

export function DashboardSettings() {
  const [org, setOrg] = useState({ name: 'Referee Abroad', email: 'info@refereeabroad.com', country: 'Netherlands' })
  const [integrations, setIntegrations] = useState({ wordpress: true, woocommerce: true, push: true, llm: true })
  const [saved, setSaved] = useState(false)
  const [team, setTeam] = useState(roleRows)
  const setRole = (i, role) => setTeam((prev) => prev.map((x, j) => j === i ? { ...x, role, access: TEAM_ROLE_ACCESS[role] || x.access } : x))
  const set = (k) => (e) => { setOrg((s) => ({ ...s, [k]: e.target.value })); setSaved(false) }
  const toggle = (k) => setIntegrations((s) => ({ ...s, [k]: !s[k] }))
  const intList = [
    { k: 'wordpress', label: 'WordPress', desc: 'Source of truth for data' },
    { k: 'woocommerce', label: 'WooCommerce', desc: 'Applications and payments' },
    { k: 'push', label: 'Push notifications', desc: 'In-app messages and appointments' },
    { k: 'llm', label: 'AI / language model', desc: 'Chatbot and smart inbox' },
  ]

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4 text-sm font-bold text-ink"><Building2 size={17} className="text-brand-dark" /> Organisation profile</div>
        <div className="space-y-3">
          <Field label="Organisation name"><input value={org.name} onChange={set('name')} className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Contact email"><input value={org.email} onChange={set('email')} className={inputCls} /></Field>
            <Field label="Country"><input value={org.country} onChange={set('country')} className={inputCls} /></Field>
          </div>
        </div>
        <button onClick={() => setSaved(true)} className="mt-4 inline-flex items-center gap-1.5 bg-brand text-white text-sm font-semibold px-4 h-10 rounded-full hover:bg-brand-dark transition">
          {saved ? <><Check size={15} /> Saved</> : 'Save profile'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4 text-sm font-bold text-ink"><Plug size={17} className="text-brand-dark" /> Integrations</div>
        <div className="divide-y divide-neutral-100">
          {intList.map((it) => (
            <div key={it.k} className="flex items-center gap-3 py-3">
              <div className="flex-1"><p className="font-semibold text-ink text-sm">{it.label}</p><p className="text-xs text-neutral-500 font-medium">{it.desc}</p></div>
              <Toggle on={integrations[it.k]} onClick={() => toggle(it.k)} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="flex items-center gap-2 text-sm font-bold text-ink"><Users size={17} className="text-brand-dark" /> Team &amp; roles</span>
          <span className="text-[12px] font-medium text-neutral-400">Click a role to change it</span>
        </div>
        <div className="divide-y divide-neutral-100">
          {team.map((r, i) => {
            const isYou = r.name === TEAM_CURRENT_USER
            return (
              <div key={i} className="flex items-center gap-3 py-2.5">
                <span className="w-8 h-8 rounded-full bg-brand text-white text-[11px] font-bold flex items-center justify-center flex-none">{r.name.split(' ').map((w) => w[0]).join('')}</span>
                <span className="flex-1 min-w-0 text-sm font-semibold text-ink flex items-center gap-2"><span className="truncate">{r.name}</span>{isYou && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand text-white flex-none">You</span>}</span>
                <span className="text-xs font-medium text-neutral-500 hidden sm:block w-56">{r.access}</span>
                <RolePill role={r.role} editable={!isYou} onChange={(role) => setRole(i, role)} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ---------------- Consolidated hubs ---------------- */
export function DashboardPeople() {
  const [tab, setTab] = useState('referees')
  return (
    <div>
      <SubTabs tabs={[
        { k: 'referees', label: 'Referees' },
        { k: 'staff', label: 'Staff' },
        { k: 'observers', label: 'Observers' },
        { k: 'guests', label: 'Guests / VIP' },
      ]} active={tab} onChange={setTab} />
      {tab === 'referees' && <DashboardReferees />}
      {tab === 'staff' && <DashboardStaff />}
      {tab === 'observers' && <DashboardObservers />}
      {tab === 'guests' && <DashboardGuests />}
    </div>
  )
}

export function DashboardInsights() {
  const [tab, setTab] = useState('pnl')
  return (
    <div>
      <SubTabs tabs={[{ k: 'pnl', label: 'P&L' }, { k: 'analytics', label: 'Analytics' }]} active={tab} onChange={setTab} />
      {tab === 'pnl' && <DashboardPnL />}
      {tab === 'analytics' && <DashboardAnalytics />}
    </div>
  )
}

export function DashboardSettingsHub() {
  const [tab, setTab] = useState('general')
  return (
    <div>
      <SubTabs tabs={[{ k: 'general', label: 'General' }, { k: 'integrations', label: 'Integrations' }]} active={tab} onChange={setTab} />
      {tab === 'general' && <DashboardSettings />}
      {tab === 'integrations' && <DashboardSync />}
    </div>
  )
}
