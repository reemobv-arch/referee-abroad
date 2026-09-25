import { useEffect, useMemo, useState } from 'react'
import {
  Plus, MapPin, Calendar, Users, X, Send, MessageSquare, Search, TrendingUp,
  Mail, MessageCircle, AlertTriangle, Check, Sparkles, Star, Globe, Phone, ClipboardList,
  ChevronRight, Clock, Pencil, Trash2, RefreshCw, CheckCircle2, Coins, Building2, Plug, HelpCircle, UserPlus,
  Upload, Lock, FileText,
} from 'lucide-react'
import {
  dashTournaments, dashReferees, dashStaff, dashTickets, dashPnl, dashAnalytics,
  dashEnrolments, dashMatches, dashInbox, refById, dashClubs,
  dashFields, dashObservers, dashGuests, obsById,
} from './data.js'
import { faq } from '../data.js'

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
      matches.push({ id: 'm' + Math.random().toString(36).slice(2, 8), day: val(r, 'date') || 'Day 1', time: val(r, 'time') || 'TBD', pitch: val(r, 'field') || 'TBD', home, away, main: null, assistants: [] })
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
      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{label}</p>
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
  if (enrol.length === 0) return <p className="text-sm text-neutral-400 font-medium">No referee enrolments yet.</p>
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
          const r = refById[e.refId]
          return (
            <div key={i} className="flex items-center px-4 py-2.5">
              <span className="w-56 flex-none flex items-center gap-3 min-w-0">
                <span className="w-8 h-8 rounded-full bg-brand text-white text-[11px] font-bold flex items-center justify-center flex-none">{initialsOf(r.name)}</span>
                <span className="text-sm font-semibold text-ink truncate">{r.name}</span>
              </span>
              <span className="w-40 text-sm text-neutral-500 font-medium hidden md:block truncate">{r.flag} {r.country}</span>
              <span className="w-32 text-xs text-neutral-500 font-medium hidden sm:flex items-center gap-1">{fmtEnrolDate(e.date)}</span>
              <span className="w-24"><span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${enrolMap[e.status]}`}>{e.status}</span></span>
              <span className="flex-1 flex gap-1.5 justify-end">
                {actionsFor(e.status).map(([act, label, cls]) => (
                  <button key={act} onClick={() => onAction(e.refId, act)} className={`text-[11px] font-semibold px-2.5 h-7 rounded-full ${cls}`}>{label}</button>
                ))}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const genderPill = (g) => g === 'Girls' ? 'bg-pink-100 text-pink-700' : g === 'Boys' ? 'bg-sky-100 text-sky-700' : 'bg-neutral-100 text-neutral-500'

function SmartImportModal({ tournamentName, existing = 0, onClose, onImport }) {
  const [step, setStep] = useState('input')
  const [text, setText] = useState('')
  const [map, setMap] = useState({})
  const table = useMemo(() => parseTable(text), [text])
  const result = useMemo(() => step === 'preview' ? buildImport(table, map) : { teams: [], matches: [] }, [step, table, map])
  const clubCount = useMemo(() => new Set(result.teams.map((t) => t.club.toLowerCase())).size, [result])
  const apptCols = ['main', 'ar1', 'ar2', 'fourth'].filter((f) => map[f] != null).length

  const onFile = (e) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = () => setText(String(reader.result || ''))
    reader.readAsText(file)
  }
  const toMap = () => { setMap(autoMap(table.header)); setStep('map') }
  const setField = (f) => (e) => setMap((m) => ({ ...m, [f]: e.target.value === '' ? null : Number(e.target.value) }))

  return (
    <Modal onClose={onClose} wide>
      <div className="p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xl font-extrabold text-ink">Import teams & fixtures</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-page flex items-center justify-center"><X size={18} /></button>
        </div>
        <p className="text-[12px] font-medium text-neutral-500 mb-4">
          {step === 'input' && `Upload the schedule for ${tournamentName}. Any organiser format works, we map the columns in the next step.`}
          {step === 'map' && 'Check the detected columns. We read age and gender from the team names or the category column.'}
          {step === 'preview' && 'Review what will be imported, then confirm.'}
        </p>

        {step === 'input' && (
          <>
            <div className="rounded-2xl border border-neutral-200 bg-page p-4">
              <p className="text-[13px] font-bold text-ink flex items-center gap-1.5"><HelpCircle size={14} className="text-brand-dark" /> Works with any file</p>
              <ul className="mt-2 space-y-1 text-[12.5px] text-neutral-600 font-medium list-disc pl-4">
                <li>Paste or upload a CSV / Excel export from the organiser. Columns can be in any language.</li>
                <li>We detect the header row and auto-map the fields, then you confirm.</li>
                <li>Age and gender are read from the team names or a category column (e.g. u14girls, G18, birth year 2013).</li>
              </ul>
              <p className="mt-3 text-[12px] font-semibold text-ink">No export system? Use this simple template:</p>
              <pre className="mt-1 bg-white border border-neutral-200 rounded-xl p-3 text-[12px] text-ink font-mono overflow-x-auto whitespace-pre">{SAMPLE_TEAMS_CSV}</pre>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-ink">Paste data or upload a file</span>
                <label className="inline-flex items-center gap-1.5 text-[12px] font-bold text-brand-dark cursor-pointer hover:underline">
                  <Upload size={13} /> Choose file
                  <input type="file" accept=".csv,.tsv,text/csv,text/plain" onChange={onFile} className="hidden" />
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
            <div className="grid sm:grid-cols-2 gap-3 max-h-[46vh] overflow-y-auto pr-1">
              {FIELD_ORDER.map((f) => (
                <div key={f}>
                  <p className="text-[11px] font-semibold text-neutral-500 mb-1">{FIELD_LABELS[f]}</p>
                  <select value={map[f] ?? ''} onChange={setField(f)}
                    className={`w-full h-9 px-2.5 rounded-lg border text-sm font-medium outline-none focus:border-brand ${map[f] != null ? 'border-neutral-200' : 'border-neutral-200 text-neutral-400'}`}>
                    <option value="">— not in file —</option>
                    {table.header.map((h, i) => <option key={i} value={i}>{h || `Column ${i + 1}`}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[12px] font-medium text-neutral-500">Detected {table.rows.length} rows. Appointment columns found: {apptCols}. In the real build these referee names map to your pool; here the matches import unassigned.</p>
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
              {result.teams.length === 0 && <p className="p-4 text-sm text-neutral-400 font-medium">Nothing detected. Go back and check the column mapping.</p>}
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
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden divide-y divide-neutral-100">
        {clubs.map((club) => (
          <div key={club} className="flex items-center gap-3 px-4 py-3 flex-wrap">
            <span className="w-8 h-8 rounded-lg bg-brand-light text-brand-dark text-[11px] font-bold flex items-center justify-center flex-none">{initialsOf(club)}</span>
            <span className="flex-1 min-w-[120px] text-sm font-semibold text-ink">{club}</span>
            <span className="flex flex-wrap gap-1.5">
              {byClub[club].slice().sort((a, b) => a.ageGroup.localeCompare(b.ageGroup)).map((tm, i) => (
                <span key={i} className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${genderPill(tm.gender)}`}>{tm.ageGroup} {GENDER_SHORT[tm.gender] || ''}</span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
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
  const matchesArr = dashMatches[t.id] || []
  const appointedCount = matchesArr.filter((m) => m.main).length
  const appliedCount = enrol.filter((e) => e.status === 'applied').length
  const clubCount = new Set(teams.map((x) => x.club)).size
  const steps = [
    { title: 'Teams imported', status: teams.length ? 'done' : 'todo',
      metric: teams.length ? `${teams.length} teams across ${clubCount} clubs` : 'Not imported yet',
      onClick: () => teams.length ? setTab('clubs') : setShowImport(true) },
    { title: 'Referee enrolments', status: enrol.length === 0 ? 'todo' : (t.enrolled >= t.capacity ? 'done' : 'progress'),
      metric: `${t.enrolled} of ${t.capacity} spots filled${appliedCount ? ` · ${appliedCount} awaiting approval` : ''}`,
      onClick: () => setTab('enrolments') },
    { title: 'Fields uploaded', status: fields.length ? 'done' : 'todo',
      metric: fields.length ? `${fields.length} fields` : 'No fields yet',
      onClick: () => setShowFields(true) },
    { title: 'Match schedule', status: teams.length === 0 ? 'todo' : (matchesArr.length ? 'done' : 'todo'),
      metric: teams.length === 0 ? 'Import the teams first' : (matchesArr.length ? `${matchesArr.length} matches scheduled` : 'No matches yet'),
      onClick: () => teams.length ? setTab('appointing') : setShowImport(true) },
    { title: 'Referees appointed', status: matchesArr.length === 0 ? 'todo' : (appointedCount >= matchesArr.length ? 'done' : 'progress'),
      metric: matchesArr.length === 0 ? 'Add matches first' : `${appointedCount} of ${matchesArr.length} matches have a main referee`,
      pill: matchesArr.length && appointedCount < matchesArr.length ? `${matchesArr.length - appointedCount} open` : null,
      onClick: () => setTab('appointing') },
    { title: 'On-site staff', status: staff.size ? 'done' : 'todo',
      metric: staff.size ? `${staff.size} staff assigned` : 'No staff yet',
      onClick: () => setShowStaff(true) },
    { title: 'Publish appointments', status: 'todo', publish: true,
      metric: 'Communicate the saved changes to the officials',
      onClick: () => setTab('appointing') },
  ]
  const doneCount = steps.filter((s) => s.status === 'done').length

  const tabs = [
    { k: 'info', label: 'Tournament information' },
    { k: 'clubs', label: `Teams (${teams.length})` },
    { k: 'enrolments', label: `Referee enrolments (${enrol.length})` },
    { k: 'appointing', label: `Appointing (${matchCount})` },
  ]
  const crumbLabel = { info: 'Tournament information', clubs: 'Teams', enrolments: 'Referee enrolments', appointing: 'Appointing' }[tab]

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
        <button onClick={() => onEdit && onEdit(t)} className="absolute top-4 right-4 inline-flex items-center gap-1.5 bg-white/90 hover:bg-white text-ink text-xs font-semibold px-3 h-8 rounded-full transition"><Pencil size={13} /> Edit</button>
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
                <span className="text-[13px] font-bold text-brand-dark whitespace-nowrap">{doneCount} / {steps.length} done</span>
              </div>
              <div className="h-2 rounded-full bg-neutral-200/80 overflow-hidden mb-2">
                <span className="block h-full rounded-full bg-brand transition-all" style={{ width: `${Math.round((doneCount / steps.length) * 100)}%` }} />
              </div>
              <div>
                {steps.map((s, i) => {
                  const ic = s.status === 'done' ? 'bg-brand text-white' : s.status === 'progress' ? 'bg-amber-100 text-amber-700' : 'bg-neutral-100 text-neutral-400 border border-dashed border-neutral-300'
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
                  <div className="bg-page rounded-xl p-3"><p className="text-[10.5px] font-bold uppercase tracking-wide text-neutral-400">Sport</p><p className="text-base font-extrabold text-ink mt-0.5">{t.sport}</p></div>
                  <div className="bg-page rounded-xl p-3"><p className="text-[10.5px] font-bold uppercase tracking-wide text-neutral-400">Dates</p><p className="text-sm font-extrabold text-ink mt-0.5">{t.dates}</p></div>
                  <div className="bg-page rounded-xl p-3"><p className="text-[10.5px] font-bold uppercase tracking-wide text-neutral-400">Referees</p><p className="text-base font-extrabold text-ink mt-0.5">{t.enrolled}/{t.capacity}</p></div>
                  <div className="bg-page rounded-xl p-3"><p className="text-[10.5px] font-bold uppercase tracking-wide text-neutral-400">Teams</p><p className="text-base font-extrabold text-ink mt-0.5">{teams.length || '—'}</p></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold text-ink text-sm">Staff on site <span className="text-neutral-400 font-medium">({staff.size})</span></h3>
                  <button onClick={() => setShowStaff(true)} className="text-[13px] font-bold text-brand-dark inline-flex items-center gap-1"><UserPlus size={14} /> Appoint</button>
                </div>
                {staff.size === 0 ? (
                  <p className="mt-2 text-[13px] text-neutral-400 font-medium">No staff assigned yet.</p>
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
                  <button onClick={() => setTab('enrolments')} className="flex items-center gap-2 py-1.5 text-[13.5px] font-semibold text-brand-dark"><Users size={15} /> Referee enrolments</button>
                  <button className="flex items-center gap-2 py-1.5 text-[13.5px] font-semibold text-brand-dark"><MessageSquare size={15} /> Message the group</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {tab === 'clubs' && <ClubsTab teams={teams} onOpenImport={() => setShowImport(true)} />}
        {tab === 'enrolments' && <EnrolmentList enrol={enrol} onAction={onEnrolAction} />}
        {tab === 'appointing' && <DashboardAppointing initialTournament={t.id} lockTournament />}
      </div>
      {showStaff && <AppointStaffModal tournamentName={t.name} assigned={staff} onToggle={(name) => setStaff((prev) => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n })} onClose={() => setShowStaff(false)} />}
      {showImport && <SmartImportModal tournamentName={t.name} existing={teams.length} onClose={() => setShowImport(false)} onImport={importTeams} />}
      {showFields && <FieldsModal tournamentName={t.name} initial={fields} onClose={() => setShowFields(false)} onSave={(list) => { setFields(list); dashFields[t.id] = list; setShowFields(false) }} />}
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

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-ink mb-1">{label}</span>
      {children}
    </label>
  )
}
const inputCls = 'w-full h-10 px-3 rounded-xl border border-neutral-200 text-sm font-medium outline-none focus:border-brand bg-white'

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
    start: '', end: '', capacity: initial?.capacity ?? 40, status: initial?.status || 'planned', img: initial?.img || PRESET_IMAGES[0],
  })
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  const valid = f.name.trim() && f.city.trim() && f.country.trim()

  const submit = () => {
    if (!valid) return
    const dates = f.start && f.end ? `${fmtDate(f.start)} to ${fmtDate(f.end)}` : (f.start ? fmtDate(f.start) : (initial?.dates || 'Dates to be set'))
    onSave({
      id: initial?.id || ('t' + Math.random().toString(36).slice(2, 7)),
      name: f.name.trim(), city: f.city.trim(), country: f.country.trim(),
      sport: f.sport, dates, status: f.status,
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
        {edit && <p className="-mt-3 mb-3 text-[11px] font-medium text-neutral-400">Leave the dates empty to keep the current dates ({initial.dates}).</p>}

        <div className="space-y-3">
          <Field label="Tournament name">
            <input value={f.name} onChange={set('name')} placeholder="e.g. Lisbon Spring Cup" className={inputCls} autoFocus />
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
            <Field label="City"><input value={f.city} onChange={set('city')} placeholder="Lisbon" className={inputCls} /></Field>
            <Field label="Country">
              <select value={f.country} onChange={set('country')} className={inputCls}>
                <option value="">Select a country…</option>
                {[...new Set([...(f.country ? [f.country] : []), ...COUNTRIES])].sort().map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date"><input type="date" value={f.start} onChange={set('start')} className={inputCls} /></Field>
            <Field label="End date"><input type="date" value={f.end} onChange={set('end')} className={inputCls} /></Field>
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
          <button onClick={submit} disabled={!valid} className="flex-1 h-11 rounded-full bg-brand text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
            {edit ? <><Check size={16} /> Save changes</> : <><Plus size={16} /> Create tournament</>}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function DashboardTournaments({ createSignal, focusT, onListChange }) {
  const [selected, setSelected] = useState(null)
  const [tournaments, setTournaments] = useState(dashTournaments)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(null)

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

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {tournaments.map((t) => {
          const pct = t.capacity ? Math.round((t.enrolled / t.capacity) * 100) : 0
          return (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className="group relative text-left bg-white/90 backdrop-blur-sm border border-white/90 rounded-[22px] p-5 overflow-hidden shadow-[0_12px_34px_rgba(23,32,26,0.14)] hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(23,32,26,0.20)] transition-all duration-200"
            >
              <span className={`absolute left-0 top-0 bottom-0 w-1.5 ${barCls(t.status)}`} />
              <div className="flex items-center justify-between mb-3">
                <StatusPill status={t.status} />
                <ChevronRight size={18} className="text-neutral-300 group-hover:text-brand-dark transition" />
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

        <button onClick={() => setCreating(true)} className="flex flex-col items-center justify-center gap-2 rounded-[22px] border-2 border-dashed border-neutral-300 text-neutral-500 hover:text-brand-dark hover:border-brand min-h-[196px] bg-white/50 backdrop-blur-sm transition">
          <span className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center"><Plus size={24} /></span>
          <span className="text-sm font-semibold">Create new tournament</span>
        </button>
      </div>
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

  const filtered = dashReferees.filter((r) => {
    const okLevel = level === 'all' || r.level === level
    const okText = !q || r.name.toLowerCase().includes(q.toLowerCase()) || r.country.toLowerCase().includes(q.toLowerCase())
    const okTour = tourId === 'all' || (enrolmentsByRef[r.id] || []).some((e) => e.tid === tourId)
    return okLevel && okText && okTour
  })

  const levels = ['all', 'talent', 'medior', 'beginner']
  const enrolledTournaments = dashTournaments.filter((t) => (dashEnrolments[t.id] || []).length > 0)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-neutral-200 px-3 h-10 flex-1 min-w-[200px]">
          <Search size={16} className="text-neutral-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or country" className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-neutral-400" />
        </div>
        <select value={tourId} onChange={(e) => setTourId(e.target.value)}
          className="h-10 px-3 rounded-xl border border-neutral-200 text-sm font-semibold text-ink outline-none focus:border-brand bg-white">
          <option value="all">All tournaments</option>
          {enrolledTournaments.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <div className="flex gap-1.5">
          {levels.map((l) => (
            <button key={l} onClick={() => setLevel(l)} className={`text-xs font-semibold px-3 h-10 rounded-xl capitalize border transition ${level === l ? 'bg-brand text-white border-brand' : 'bg-white text-neutral-500 border-neutral-200 hover:border-brand'}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="flex items-center px-4 py-2.5 border-b border-neutral-200 text-[11px] uppercase tracking-wide text-neutral-500 font-semibold">
          <span className="w-52 flex-none">Referee</span>
          <span className="w-32 hidden lg:block">Country</span>
          <span className="flex-1 min-w-0 hidden md:block">Enrolments</span>
          <span className="w-16 text-right">Apps</span>
          <span className="w-24 text-right">Level</span>
        </div>
        <div className="divide-y divide-neutral-100">
          {filtered.map((r) => (
            <button key={r.id} onClick={() => setOpen(r)} className="w-full flex items-center px-4 py-2.5 hover:bg-page transition text-left">
              <span className="w-52 flex-none flex items-center min-w-0">
                <span className="w-7 h-7 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center flex-none mr-3">{initialsOf(r.name)}</span>
                <span className="font-semibold text-ink text-sm truncate">{r.name}</span>
              </span>
              <span className="w-32 text-sm text-neutral-500 font-medium hidden lg:block truncate">{r.flag} {r.country}</span>
              <span className="flex-1 min-w-0 hidden md:flex"><EnrolChips refId={r.id} /></span>
              <span className="w-16 text-right text-sm font-medium text-neutral-500 tabular-nums">{r.apps}</span>
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

            <div className="mt-4">
              <p className="text-[11px] uppercase tracking-wide text-neutral-400 font-semibold mb-2">Enrolled in</p>
              {(enrolmentsByRef[open.id] || []).length === 0
                ? <p className="text-sm text-neutral-400 font-medium">Not enrolled for any tournament yet.</p>
                : (
                  <div className="space-y-1.5">
                    {enrolmentsByRef[open.id].map((e, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 bg-page rounded-xl px-3 py-2">
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-ink truncate">{e.tournament}</span>
                          <span className="block text-[11px] text-neutral-500 font-medium flex items-center gap-1"><Calendar size={11} className="text-neutral-400" /> Applied {fmtEnrolDate(e.date)}</span>
                        </span>
                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize flex-none ${enrolMap[e.status]}`}>{e.status}</span>
                      </div>
                    ))}
                  </div>
                )}
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

function AddStaffModal({ onClose, onAdd }) {
  const [f, setF] = useState({ name: '', role: 'Logistics coordinator', tournament: dashTournaments[0].name })
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  const roles = ['Tournament director', 'Logistics coordinator', 'Referee mentor', 'Communication', 'Onsite host', 'Media & content']
  return (
    <Modal onClose={onClose}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-extrabold text-ink">Add staff member</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-page flex items-center justify-center"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <Field label="Full name"><input value={f.name} onChange={set('name')} placeholder="e.g. Sara Mendes" className={inputCls} autoFocus /></Field>
          <Field label="Role"><select value={f.role} onChange={set('role')} className={inputCls}>{roles.map((r) => <option key={r}>{r}</option>)}</select></Field>
          <Field label="Assigned to"><select value={f.tournament} onChange={set('tournament')} className={inputCls}>{dashTournaments.map((t) => <option key={t.id}>{t.name}</option>)}</select></Field>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="h-11 px-5 rounded-full border border-neutral-200 text-neutral-600 font-semibold">Cancel</button>
          <button onClick={() => f.name.trim() && onAdd({ name: f.name.trim(), role: f.role, tournament: f.tournament, initials: initialsOf(f.name.trim()) })}
            disabled={!f.name.trim()} className="flex-1 h-11 rounded-full bg-brand text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"><Plus size={16} /> Add staff</button>
        </div>
      </div>
    </Modal>
  )
}

/* ---------------- Staff ---------------- */
export function DashboardStaff({ createSignal }) {
  const [staff, setStaff] = useState(dashStaff)
  const [adding, setAdding] = useState(false)
  useEffect(() => { if (createSignal) setAdding(true) }, [createSignal])
  const add = (s) => { setStaff((prev) => [...prev, s]); setAdding(false) }
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {staff.map((s, i) => (
        <div key={i} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4">
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
      <button onClick={() => setAdding(true)} className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 text-neutral-400 hover:text-brand-dark hover:border-brand min-h-[128px] transition">
        <Plus size={24} />
        <span className="text-sm font-semibold">Add staff member</span>
      </button>
      {adding && <AddStaffModal onClose={() => setAdding(false)} onAdd={add} />}
    </div>
  )
}

/* ---------------- Observers & Guests / VIP ---------------- */
function AddPersonModal({ title, roles, cta, onClose, onAdd }) {
  const [f, setF] = useState({ name: '', role: roles[0], tournament: dashTournaments[0].name })
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
          <Field label="Assigned to"><select value={f.tournament} onChange={set('tournament')} className={inputCls}>{dashTournaments.map((t) => <option key={t.id}>{t.name}</option>)}</select></Field>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="h-11 px-5 rounded-full border border-neutral-200 text-neutral-600 font-semibold">Cancel</button>
          <button onClick={() => f.name.trim() && onAdd({ name: f.name.trim(), role: f.role, tournament: f.tournament, initials: initialsOf(f.name.trim()) })}
            disabled={!f.name.trim()} className="flex-1 h-11 rounded-full bg-brand text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"><Plus size={16} /> {cta}</button>
        </div>
      </div>
    </Modal>
  )
}

function PeopleGrid({ seed, roles, addTitle, addCta, emptyAdd }) {
  const [people, setPeople] = useState(seed)
  const [adding, setAdding] = useState(false)
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {people.map((s, i) => (
        <div key={i} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm">{s.initials}</span>
            <div className="min-w-0">
              <p className="font-bold text-ink text-sm truncate">{s.name}</p>
              <p className="text-xs text-neutral-500 font-medium">{s.role}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 text-xs font-medium text-neutral-500">
            <span className="text-neutral-400">{s.org ? 'Organisation' : 'Assigned to'}</span><br />{s.org || s.tournament || '—'}
          </div>
        </div>
      ))}
      <button onClick={() => setAdding(true)} className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 text-neutral-400 hover:text-brand-dark hover:border-brand min-h-[128px] transition">
        <Plus size={24} /><span className="text-sm font-semibold">{emptyAdd}</span>
      </button>
      {adding && <AddPersonModal title={addTitle} roles={roles} cta={addCta} onClose={() => setAdding(false)} onAdd={(p) => { setPeople((prev) => [...prev, p]); setAdding(false) }} />}
    </div>
  )
}

export function DashboardObservers() {
  return <PeopleGrid seed={dashObservers} roles={['Observer', 'Referee mentor', 'Assessor']} addTitle="Add observer" addCta="Add observer" emptyAdd="Add observer" />
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
          <p className="text-[11px] font-medium text-neutral-400">Teams come from the imported CSV. Import more on the tournament page if one is missing.</p>
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
              {analysed.removed.map((m, i) => <div key={'r' + i} className="px-3 py-2 text-[12.5px]"><span className="font-semibold text-neutral-500 line-through">{m.home} vs {m.away}</span><span className="text-neutral-400 font-medium"> · removed</span></div>)}
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

export function DashboardAppointing({ initialTournament, lockTournament = false }) {
  const startTid = initialTournament || dashTournaments[0].id
  const toSlots = (data) => Object.fromEntries(Object.entries(data).map(([k, arr]) => [k, arr.map((m) => ({
    id: m.id, day: m.day || DAY_FALLBACK, time: m.time, pitch: m.pitch, home: m.home, away: m.away,
    main: m.main || null, a1: m.assistants?.[0] || null, a2: m.assistants?.[1] || null, fourth: null, observer: m.observer || null,
  }))]))
  const [tid, setTid] = useState(startTid)
  const [matches, setMatches] = useState(() => toSlots(JSON.parse(JSON.stringify(dashMatches))))
  const [openDay, setOpenDay] = useState(null)
  const [openId, setOpenId] = useState(null)
  const [edited, setEdited] = useState(() => new Set())
  const [addingMatch, setAddingMatch] = useState(false)
  const [publishDirty, setPublishDirty] = useState(false)
  const [confirmPublish, setConfirmPublish] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [showRevised, setShowRevised] = useState(false)
  const [toast, setToast] = useState('')

  const list = matches[tid] || []
  const teams = dashClubs[tid] || []
  const fields = dashFields[tid] || []
  const days = useMemo(() => { const seen = []; for (const m of list) { const d = m.day || DAY_FALLBACK; if (!seen.includes(d)) seen.push(d) } return seen }, [list])
  const dayList = openDay ? list.filter((m) => (m.day || DAY_FALLBACK) === openDay) : []

  useEffect(() => { setOpenDay(null); setOpenId(null) }, [tid])

  const conflicts = useMemo(() => {
    const seen = {}; const bad = new Set()
    for (const m of list) for (const r of officialsOf(m)) {
      const key = `${m.time}::${r}`
      if (seen[key]) { bad.add(`${m.id}::${r}`); bad.add(`${seen[key]}::${r}`) } else seen[key] = m.id
    }
    return bad
  }, [list])

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
  const saveMatch = (m, i) => {
    if (edited.has(m.id)) { setPublishDirty(true); setEdited((p) => { const n = new Set(p); n.delete(m.id); return n }) }
    const next = dayList[i + 1]
    setOpenId(next ? next.id : null)
  }
  const publish = () => {
    setToast(`Appointments published. The officials for ${dashTournaments.find((t) => t.id === tid).name} are notified in their app.`)
    setPublishDirty(false); setEdited(new Set()); setConfirmPublish(false)
  }
  const runAI = (prompt) => {
    const { next, filled } = autoAppoint(list, prompt)
    setMatches((prev) => ({ ...prev, [tid]: next }))
    setShowAI(false)
    if (filled > 0) { setPublishDirty(true); setToast(`AI filled ${filled} open slot${filled === 1 ? '' : 's'}. Review and publish.`) }
    else setToast('No open slots to fill.')
  }
  const exportCsv = () => {
    const head = ['Day', 'Time', 'Field', 'Home', 'Away', 'Main referee', 'Assistant 1', 'Assistant 2', '4th official', 'Observer']
    const rows = [head, ...list.map((m) => [m.day || '', m.time || '', m.pitch || '', m.home || '', m.away || '',
      refById[m.main]?.name || '', refById[m.a1]?.name || '', refById[m.a2]?.name || '', refById[m.fourth]?.name || '', obsById[m.observer]?.name || ''])]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a'); a.href = url; a.download = `${dashTournaments.find((t) => t.id === tid).name} - appointments.csv`; a.click(); URL.revokeObjectURL(url)
    setToast('Appointments exported as CSV.')
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
        {teams.length > 0 && list.length > 0 && (
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowAI(true)} className="inline-flex items-center gap-1.5 border border-brand text-brand-dark text-sm font-semibold px-4 h-10 rounded-full hover:bg-brand-light transition"><Sparkles size={15} /> Appoint with AI</button>
            <button onClick={() => setShowRevised(true)} className="inline-flex items-center gap-1.5 border border-neutral-200 text-ink text-sm font-semibold px-4 h-10 rounded-full hover:border-brand transition"><RefreshCw size={15} /> Revised schedule</button>
            <button onClick={exportCsv} className="inline-flex items-center gap-1.5 border border-neutral-200 text-ink text-sm font-semibold px-4 h-10 rounded-full hover:border-brand transition"><FileText size={15} /> Export CSV</button>
            <button onClick={() => setAddingMatch(true)} className="inline-flex items-center gap-1.5 border border-neutral-200 text-ink text-sm font-semibold px-4 h-10 rounded-full hover:border-brand transition"><Plus size={15} /> Add match</button>
            <button onClick={() => publishDirty && setConfirmPublish(true)} disabled={!publishDirty}
              className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 h-10 rounded-full transition ${publishDirty ? 'bg-brand text-white hover:bg-brand-dark' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'}`}>
              <Send size={15} /> Publish
            </button>
          </div>
        )}
      </div>

      {teams.length === 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto"><Lock size={22} /></div>
          <p className="mt-3 text-sm font-bold text-ink">Appointing is locked for {dashTournaments.find((t) => t.id === tid).name}</p>
          <p className="mt-1 text-[13px] text-neutral-500 font-medium max-w-md mx-auto">You can only appoint referees once the participating teams are imported. Import the teams on the tournament page (Teams tab), then build the schedule here.</p>
        </div>
      )}

      {teams.length > 0 && conflicts.size > 0 && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-700 text-sm font-semibold px-4 py-2.5 rounded-xl border border-red-100">
          <AlertTriangle size={16} /> A referee is double-booked at the same time. Check the highlighted matches.
        </div>
      )}

      {teams.length > 0 && list.length === 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-10 text-center">
          <p className="text-sm font-semibold text-ink">No matches scheduled yet</p>
          <p className="text-xs text-neutral-500 font-medium mt-1">Add matches to start appointing officials.</p>
          <button onClick={() => setAddingMatch(true)} className="mt-4 inline-flex items-center gap-1.5 bg-brand text-white text-sm font-semibold px-4 h-10 rounded-full"><Plus size={15} /> Add match</button>
        </div>
      )}

      {/* Day blocks */}
      {teams.length > 0 && list.length > 0 && !openDay && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {days.map((day, di) => {
            const dm = list.filter((m) => (m.day || DAY_FALLBACK) === day)
            const appointed = dm.filter((m) => m.main).length
            const hasConf = dm.some((m) => officialsOf(m).some((r) => conflicts.has(`${m.id}::${r}`)))
            const allDone = appointed === dm.length
            return (
              <button key={day} onClick={() => { setOpenDay(day); setOpenId(dm[0]?.id || null) }}
                className="group text-left bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 hover:-translate-y-0.5 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-brand-light text-brand-dark flex items-center justify-center font-extrabold">{di + 1}</span>
                  {hasConf ? <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1"><AlertTriangle size={13} /> conflict</span>
                    : allDone ? <span className="text-[11px] font-semibold text-brand-dark flex items-center gap-1"><Check size={13} /> complete</span>
                    : <span className="text-[11px] font-semibold text-amber-600">{dm.length - appointed} open</span>}
                </div>
                <p className="mt-3 text-lg font-extrabold text-ink">{day}</p>
                <p className="text-[13px] font-semibold text-neutral-500">{dm.length} matches · {appointed}/{dm.length} appointed</p>
                <div className="mt-3 h-1.5 rounded-full bg-neutral-200 overflow-hidden"><span className="block h-full bg-brand" style={{ width: `${Math.round((appointed / dm.length) * 100)}%` }} /></div>
              </button>
            )
          })}
        </div>
      )}

      {/* Matches for the selected day */}
      {teams.length > 0 && openDay && (
        <>
          <button onClick={() => { setOpenDay(null); setOpenId(null) }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-dark mb-3"><ChevronRight size={16} className="rotate-180" /> All days</button>
          <p className="text-sm font-extrabold text-ink mb-2">{openDay} <span className="text-neutral-400 font-medium">· {dayList.length} matches</span></p>
          <div className="space-y-2.5">
            {dayList.map((m, i) => {
              const open = openId === m.id
              const hasConflict = officialsOf(m).some((r) => conflicts.has(`${m.id}::${r}`))
              return (
                <div key={m.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${hasConflict ? 'border-red-200' : 'border-neutral-200'}`}>
                  <button onClick={() => setOpenId(open ? null : m.id)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
                    <span className="text-sm font-bold text-brand-dark w-12 tabular-nums">{m.time}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-ink truncate">{m.home} <span className="text-neutral-400 font-medium">vs</span> {m.away}</span>
                      {!open && (
                        <span className="block text-[12px] font-medium mt-0.5 truncate">
                          {m.main
                            ? <span className="text-neutral-500">{shortName(m.main)}{officialsOf(m).length > 1 ? ` +${officialsOf(m).length - 1}` : ''}</span>
                            : <span className="text-amber-600">No main referee</span>}
                        </span>
                      )}
                    </span>
                    <span className="text-xs font-medium text-neutral-500 hidden sm:block">{m.pitch}</span>
                    {edited.has(m.id) && <span className="w-2 h-2 rounded-full bg-amber-400" title="Unsaved changes" />}
                    <ChevronRight size={18} className={`text-neutral-400 transition-transform ${open ? 'rotate-90' : ''}`} />
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
                                className={`w-full h-9 px-2.5 rounded-lg border text-sm font-medium outline-none focus:border-brand ${conflict ? 'border-red-300 bg-red-50 text-red-700' : val ? 'border-neutral-200' : isMain ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-neutral-200 text-neutral-400'}`}>
                                <option value="">Unassigned</option>
                                {dashReferees.filter((r) => !usedElsewhere.includes(r.id) || r.id === val).map((r) => <option key={r.id} value={r.id}>{r.name} ({r.level})</option>)}
                              </select>
                            </div>
                          )
                        })}
                        <div>
                          <p className="text-[11px] font-semibold text-neutral-500 mb-1">Observer</p>
                          <select value={m.observer || ''} onChange={(e) => setSlot(m.id, 'observer', e.target.value)}
                            className={`w-full h-9 px-2.5 rounded-lg border text-sm font-medium outline-none focus:border-brand ${m.observer ? 'border-neutral-200' : 'border-neutral-200 text-neutral-400'}`}>
                            <option value="">No observer</option>
                            {dashObservers.map((o) => <option key={o.id} value={o.id}>{o.name} ({o.role})</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end mt-4">
                        <button onClick={() => saveMatch(m, i)} className="inline-flex items-center gap-2 h-10 px-6 rounded-full bg-brand text-white font-semibold hover:bg-brand-dark transition"><Check size={16} /> Save</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {addingMatch && <AddMatchModal onClose={() => setAddingMatch(false)} onAdd={addMatch} teams={teams} fields={fields} />}
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
            <p className="mt-1.5 text-sm text-neutral-600 font-medium">The saved changes are communicated to the officials for {dashTournaments.find((t) => t.id === tid).name}, and each appointed official sees their matches in their app.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setConfirmPublish(false)} className="h-11 px-5 rounded-full border border-neutral-200 text-neutral-600 font-semibold">Cancel</button>
              <button onClick={publish} className="flex-1 h-11 rounded-full bg-brand text-white font-semibold flex items-center justify-center gap-2"><Send size={16} /> Publish</button>
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
function BroadcastPanel() {
  const [tournament, setTournament] = useState(dashTournaments[0].name)
  const [msg, setMsg] = useState('')
  const [sent, setSent] = useState(false)
  return (
    <div className="max-w-xl bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
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
  )
}

// Consolidated communication hub: the AI smart inbox, group broadcasts and the
// AI assistant knowledge base all live here as tabs.
export function DashboardCommunication() {
  const [tab, setTab] = useState('conversations')
  return (
    <div>
      <SubTabs tabs={[
        { k: 'conversations', label: 'Conversations' },
        { k: 'broadcast', label: 'Broadcast' },
        { k: 'assistant', label: 'Assistant' },
      ]} active={tab} onChange={setTab} />
      {tab === 'conversations' && <DashboardInbox />}
      {tab === 'broadcast' && <BroadcastPanel />}
      {tab === 'assistant' && <DashboardAssistant />}
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

      <div className="mt-5 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-neutral-500 border-b border-neutral-200 bg-page/60">
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

        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4">
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

        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 lg:col-span-2">
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

/* ---------------- Assistant (FAQ + AI usage) ---------------- */
export function DashboardAssistant() {
  const [items, setItems] = useState(() => faq.map((x, i) => ({ id: 'f' + i, q: x.q, a: x.a })))
  const [editing, setEditing] = useState(null) // id or 'new'
  const [draft, setDraft] = useState({ q: '', a: '' })

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
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-ink"><Coins size={17} className="text-brand" /> AI usage this month</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Messages handled" value="428" sub="+12% vs last month" />
          <StatCard label="Tokens used" value="1.24M" />
          <StatCard label="Estimated cost" value="€42" sub="within €30 to €50 band" />
          <StatCard label="Auto-answered" value="63%" sub="rest drafted for review" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink"><HelpCircle size={17} className="text-brand" /> FAQ knowledge base <span className="text-neutral-400 font-medium">({items.length})</span></div>
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
                  <button onClick={() => remove(it.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-neutral-400 hover:text-red-500"><Trash2 size={15} /></button>
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

export function DashboardSync() {
  const [toast, setToast] = useState('')
  const statusCls = { ok: 'bg-brand-light text-brand-dark', retry: 'bg-amber-100 text-amber-700', error: 'bg-red-50 text-red-600' }
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
          <Clock size={22} className="text-neutral-400" />
          <div><p className="font-bold text-ink text-sm">Last sync</p><p className="text-xs text-neutral-500 font-semibold">2 minutes ago</p></div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">Recent sync activity</p>
        <button onClick={() => setToast('Sync started. WordPress is the source of truth in Phase 1.')} className="inline-flex items-center gap-1.5 border border-neutral-200 text-ink text-sm font-semibold px-4 h-9 rounded-full hover:border-brand transition"><RefreshCw size={15} /> Sync now</button>
      </div>

      <div className="mt-3 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden divide-y divide-neutral-100">
        {syncLog.map((l, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex-none ${statusCls[l.status]}`}>{l.status === 'retry' ? 'Retried' : l.status === 'error' ? 'Error' : 'OK'}</span>
            <span className="flex-1 text-sm font-medium text-ink">{l.event}</span>
            <span className="text-xs text-neutral-400 font-medium flex-none">{l.time}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-neutral-400 font-medium leading-relaxed">Two-way sync with automatic retries and logging. WordPress remains the single source of truth in Phase 1.</p>
      {toast && <Toast text={toast} onDone={() => setToast('')} />}
    </div>
  )
}

/* ---------------- Settings ---------------- */
const roleRows = [
  { name: 'Reemo van Dijk', role: 'Owner', access: 'Full access' },
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
        <div className="flex items-center gap-2 mb-4 text-sm font-bold text-ink"><Users size={17} className="text-brand-dark" /> Team & roles</div>
        <div className="divide-y divide-neutral-100">
          {roleRows.map((r, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5">
              <span className="w-8 h-8 rounded-full bg-brand text-white text-[11px] font-bold flex items-center justify-center flex-none">{r.name.split(' ').map((w) => w[0]).join('')}</span>
              <span className="flex-1 text-sm font-semibold text-ink">{r.name}</span>
              <span className="text-xs font-medium text-neutral-500 hidden sm:block w-56">{r.access}</span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-brand-light text-brand-dark w-28 text-center">{r.role}</span>
            </div>
          ))}
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
