// Swappable data source for the app.
//
// Default is the built-in mock data (the prototype behaviour). Set the Vercel
// env var VITE_DATA_SOURCE=live to read live data from the WordPress /
// WooCommerce serverless API in /api. Screens call these functions instead of
// importing the mock arrays directly, so we can flip to live data per data set
// without rewriting the UI.
import { tournaments as mockTournaments, user as mockUser, news as mockNews } from '../data.js'
import { dashTournaments as mockDashTournaments, dashEnrolments as mockEnrolments, dashReferees as mockReferees, dashPnl as mockPnl, dashAnalytics as mockAnalytics } from '../dashboard/data.js'

export const LIVE = import.meta.env.VITE_DATA_SOURCE === 'live'

// A 401 from a token-gated endpoint means the session is gone or expired: clear
// it and send the referee back to the login screen. The 'ra_session' key is the
// contract shared with src/lib/auth.js (we clear it directly to avoid a circular
// import). Used for authenticated calls only, never for /api/login.
function onUnauthorized() {
  try { localStorage.removeItem('ra_session') } catch { /* ignore */ }
  if (typeof location !== 'undefined' && !location.hash.startsWith('#/login') && location.hash !== '#/') {
    location.hash = '#/login'
  }
}
async function apiFetch(url, opts) {
  const res = await fetch(url, opts)
  if (res.status === 401) onUnauthorized()
  return res
}

function relativeTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const s = (Date.now() - d.getTime()) / 1000
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`
  if (s < 86400) return `${Math.round(s / 3600)}h ago`
  const days = Math.round(s / 86400)
  if (days < 30) return `${days}d ago`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// News / announcements. Mock returns the prototype items; live reads real
// WordPress posts via /api/news.
export async function getNews() {
  if (!LIVE) return mockNews.map((n) => ({ id: n.id, title: n.title, body: n.body, ago: n.ago, link: null }))
  const res = await fetch('/api/news')
  if (!res.ok) throw new Error(`News request failed (${res.status})`)
  const data = await res.json()
  return (data.news || []).map((n) => ({ id: n.id, title: n.title, body: n.body, ago: relativeTime(n.date), link: n.link }))
}

// Map a live tournament (from /api/tournaments) to the webapp tournament shape.
// The detail-only fields stay empty until we finalise the mapping on staging.
export function toWebappTournament(t) {
  return {
    id: t.slug || String(t.id),
    productId: t.id, // numeric WooCommerce product id, links to the referee's orders
    name: t.name,
    city: t.city || '',
    country: t.country || '',
    img: t.img || 'img/porto.jpg',
    age: t.ageGroup || '',
    sport: 'Football',
    dates: t.dates || '',
    price: t.price || 0,
    spotsLeft: t.placesLeft != null ? t.placesLeft : null,
    referees: t.capacity || null,
    clubs: null,
    matches: null,
    status: t.status || 'open',
    start: t.start || null, // ISO start date, used for document deadlines
    applyUrl: t.permalink || null, // existing WooCommerce checkout for this tournament
    // Extra WooCommerce meta surfaced on the live detail page.
    category: t.categoryLabel || '',
    accommodation: t.accommodation || '',
    deadline: t.deadline || '',
    refereeExperience: t.refereeExperience || '',
    acceptedLevels: Array.isArray(t.acceptedLevels) ? t.acceptedLevels : [],
    description: t.description || '',
    images: Array.isArray(t.images) ? t.images : [],
    applied: false,
    keyTimes: [],
    agenda: [],
    documents: [],
  }
}

export async function getTournaments() {
  if (!LIVE) return mockTournaments
  const res = await fetch('/api/tournaments')
  if (!res.ok) throw new Error(`Tournaments request failed (${res.status})`)
  const data = await res.json()
  return (data.tournaments || []).map(toWebappTournament)
}

// One tournament by id (mock) or slug/id (live), for the detail page.
export async function getTournament(idOrSlug) {
  if (!LIVE) return mockTournaments.find((x) => x.id === idOrSlug) || null
  const res = await fetch('/api/tournaments')
  if (!res.ok) throw new Error(`Tournament request failed (${res.status})`)
  const data = await res.json()
  const raw = (data.tournaments || []).find((t) => (t.slug || String(t.id)) === idOrSlug || String(t.id) === idOrSlug)
  return raw ? toWebappTournament(raw) : null
}

const isConfirmedStatus = (s) => s === 'confirmed' || s === 'approved'

// Read the session token without importing auth.js (avoids a circular import).
// The 'ra_session' key is the contract shared with src/lib/auth.js.
function sessionToken() {
  try { return JSON.parse(localStorage.getItem('ra_session'))?.token || null } catch { return null }
}

// The logged-in referee's own applications, as a map keyed by tournament id
// (mock) or WooCommerce product id (live): { [key]: { paid, status } }.
// Live calls the token-gated /api/my-applications, which only ever returns the
// authenticated referee's own orders (never anyone else's).
export async function getMyApplications() {
  if (!LIVE) {
    const map = {}
    for (const t of mockTournaments) {
      if (t.applied) map[t.id] = { paid: true, approved: isConfirmedStatus(t.status), status: isConfirmedStatus(t.status) ? 'confirmed' : 'applied' }
    }
    return map
  }
  const token = sessionToken()
  const res = await apiFetch('/api/my-applications', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  if (!res.ok) throw new Error(`My applications request failed (${res.status})`)
  const data = await res.json()
  const map = {}
  for (const a of data.applications || []) if (a.tournamentId != null) map[String(a.tournamentId)] = { paid: a.paid, approved: a.approved, status: a.status }
  return map
}

// Merge the referee's application status onto a list of webapp tournaments,
// setting `applied` and `going`. "going" (you're in) means an admin approved the
// application; a paid-but-not-yet-approved application stays "applied".
export function decorateApplied(tournaments, appsMap = {}) {
  return tournaments.map((t) => {
    const a = appsMap[String(t.productId)] ?? appsMap[t.id]
    if (a) return { ...t, applied: true, going: !!a.approved }
    return { ...t, applied: !!t.applied, going: !!t.applied && isConfirmedStatus(t.status) }
  })
}

const initialsOf = (n) => (n || '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

// The logged-in referee's documents (D5), read-only in Phase 1. Mock returns
// null so the prototype screen renders its own rich sample. Live returns what
// WordPress can give today: upload deadlines for the tournaments the referee
// applied to, and payment confirmations from their paid orders. Uploading files
// in the app needs a write endpoint (backlog J14), so it is not included here.
export async function getMyDocuments() {
  if (!LIVE) return null
  const token = sessionToken()
  const [tours, appsRes] = await Promise.all([
    getTournaments(),
    apiFetch('/api/my-applications', { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
  ])
  if (!appsRes.ok) throw new Error(`Documents request failed (${appsRes.status})`)
  const apps = (await appsRes.json()).applications || []
  const byProduct = {}
  for (const t of tours) if (t.productId != null) byProduct[String(t.productId)] = t
  const nameOf = (pid) => byProduct[String(pid)]?.name || `Tournament #${pid}`

  const deadlines = []
  const seen = new Set()
  for (const ap of apps) {
    const t = byProduct[String(ap.tournamentId)]
    if (!t || seen.has(t.id)) continue
    seen.add(t.id)
    const start = t.start ? new Date(t.start) : null
    const deadline = start && !isNaN(start.getTime()) ? new Date(start.getTime() - 56 * 864e5) : null
    deadlines.push({ id: t.id, name: t.name, deadline: deadline ? deadline.toISOString() : null, confirmed: !!ap.paid })
  }
  const receipts = apps.filter((a) => a.paid).map((a) => ({ id: a.orderId, name: nameOf(a.tournamentId), date: a.date }))
  return { deadlines, receipts }
}

// The logged-in referee's own profile. Mock returns the prototype user; live
// calls the token-gated /api/me, which only ever returns the caller's own
// whitelisted profile. Fields WordPress does not expose stay empty.
export async function getMyProfile() {
  if (!LIVE) {
    return {
      name: mockUser.name,
      initials: mockUser.initials,
      email: mockUser.email,
      phone: mockUser.phone,
      country: mockUser.country,
      flag: mockUser.flag,
      level: mockUser.level,
      kit: mockUser.kit,
      languages: mockUser.languages,
      nationality: '',
      federation: '',
    }
  }
  const token = sessionToken()
  const res = await apiFetch('/api/me', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  if (!res.ok) throw new Error(`Profile request failed (${res.status})`)
  const { profile } = await res.json()
  return {
    name: profile.name || '',
    initials: initialsOf(profile.name),
    email: profile.email || '',
    phone: profile.phone || '',
    country: profile.country || '',
    flag: '',
    level: profile.level || '',
    kit: profile.kit || '',
    languages: profile.languages || '',
    nationality: profile.nationality || '',
    federation: profile.federation || '',
    gender: profile.gender || '',
    age: profile.age ?? null,
    dob: profile.dob || '',
    emergencyContact: profile.emergencyContact || '',
    dietary: profile.dietary || '',
  }
}

// A referee saves their own profile changes back to WordPress (D6).
export async function updateProfile(fields) {
  if (!LIVE) return { ok: true }
  const token = sessionToken()
  const res = await apiFetch('/api/update-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(fields),
  })
  if (!res.ok) throw new Error(`Profile update failed (${res.status})`)
  return res.json()
}

// Map a live tournament to the dashboard (Command Centre) shape.
export function toDashTournament(t) {
  const capacity = t.capacity != null ? t.capacity : 0
  const left = t.placesLeft != null ? t.placesLeft : null
  const enrolled = capacity && left != null ? Math.max(0, capacity - left) : 0
  return {
    id: t.slug || String(t.id),
    productId: t.id, // numeric WooCommerce product id, links to orders
    name: t.name,
    city: t.city || '',
    country: t.country || '',
    img: t.img || 'img/porto.jpg',
    dates: t.dates || '',
    sport: 'Football',
    status: left != null && left <= 0 ? 'confirmed' : 'recruiting',
    enrolled,
    capacity,
  }
}

export async function getDashTournaments() {
  if (!LIVE) return mockDashTournaments
  const res = await fetch('/api/tournaments')
  if (!res.ok) throw new Error(`Tournaments request failed (${res.status})`)
  const data = await res.json()
  return (data.tournaments || []).map(toDashTournament)
}

// Enrolment progress for one tournament's readiness.
// Mock keeps the prototype numbers; live counts paid WooCommerce orders
// (processing/completed) and awaiting ones (on-hold) for the product.
export async function getEnrolmentSummary(tournament) {
  if (!LIVE) {
    const enr = mockEnrolments[tournament.id] || []
    return {
      enrolled: tournament.enrolled ?? 0,
      awaiting: enr.filter((e) => e.status === 'applied').length,
      capacity: tournament.capacity ?? null,
    }
  }
  const res = await fetch('/api/applications?status=processing,completed,on-hold')
  if (!res.ok) throw new Error(`Applications request failed (${res.status})`)
  const data = await res.json()
  const apps = (data.applications || []).filter((a) => a.tournamentId === tournament.productId)
  return {
    enrolled: apps.filter((a) => a.paid).length,
    awaiting: apps.filter((a) => a.status === 'on-hold').length,
    capacity: tournament.capacity ?? null,
  }
}

// Participants of one tournament. Mock joins the enrolment table with the mock
// referee pool; live joins paid/awaiting orders with whitelisted referee profiles.
export async function getParticipants(tournament) {
  if (!LIVE) {
    return (mockEnrolments[tournament.id] || []).map((e) => ({ refId: e.refId, status: e.status, date: e.date }))
  }
  const [aRes, rRes] = await Promise.all([
    fetch('/api/applications?status=processing,completed,on-hold'),
    fetch('/api/referees?per_page=100'),
  ])
  if (!aRes.ok) throw new Error(`Applications request failed (${aRes.status})`)
  if (!rRes.ok) throw new Error(`Referees request failed (${rRes.status})`)
  const apps = ((await aRes.json()).applications || []).filter((a) => a.tournamentId === tournament.productId)
  const byId = {}
  for (const r of (await rRes.json()).referees || []) byId[r.id] = r
  const shortSex = (g) => {
    const s = (g || '').trim().toLowerCase()
    if (['male', 'm', 'man', 'boy'].includes(s)) return 'M'
    if (['female', 'f', 'woman', 'girl', 'vrouw'].includes(s)) return 'F'
    return g || ''
  }
  return apps.map((a) => {
    const r = byId[a.refereeId] || {}
    return {
      id: a.refereeId,
      name: r.name || `Referee #${a.refereeId}`,
      country: r.country || '',
      level: r.level || null,
      email: r.email || '',
      sex: shortSex(r.gender),
      nationality: r.nationality || '',
      federation: r.federation || '',
      orderId: a.id,                              // needed to approve/decline this application
      paid: a.paid,
      approved: a.approved,
      fa: a.fa,                                   // persisted FA-referee flag
      role: a.role || 'referee',                  // persisted role
      status: a.approved ? 'confirmed' : 'applied',
      date: a.datePaid || null,
    }
  })
}

// Admin two-way-sync write: persist a participant's FA flag / role to the order.
export async function updateApplication(orderId, fields) {
  if (!LIVE || !orderId) return { ok: true }
  const res = await apiFetch('/api/update-application', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, ...fields }),
  })
  if (!res.ok) throw new Error(`Update failed (${res.status})`)
  return res.json()
}

// Admin two-way-sync action: approve or decline a referee's application. Writes
// the approval flag back to the WooCommerce order via /api/approve-application.
export async function approveApplication(orderId, approved = true) {
  if (!LIVE) return { ok: true, orderId, approved }
  const res = await apiFetch('/api/approve-application', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, approved }),
  })
  if (!res.ok) throw new Error(`Approve request failed (${res.status})`)
  return res.json()
}

// All applications (admin view), to show a referee's applications in the
// People > Referees popup. Live only; returns [] in mock.
export async function getRefereeApplications() {
  if (!LIVE) return []
  const res = await apiFetch('/api/applications?status=processing,completed,on-hold')
  if (!res.ok) throw new Error(`Applications request failed (${res.status})`)
  return (await res.json()).applications || []
}

// Referee directory (People → Referees). Mock returns the rich prototype pool
// (ratings, reports, languages). Live returns the GDPR-whitelisted profiles from
// /api/referees; prototype-only fields stay null so screens can gate them.
export async function getReferees() {
  if (!LIVE) return mockReferees
  const res = await fetch('/api/referees?per_page=100')
  if (!res.ok) throw new Error(`Referees request failed (${res.status})`)
  const data = await res.json()
  return (data.referees || []).map((r) => ({
    id: r.id,
    name: r.name || `Referee #${r.id}`,
    country: r.country || '',
    flag: '',
    level: r.level || null,
    email: r.email || '',
    nationality: r.nationality || '',
    federation: r.federation || '',
    gender: r.gender || '',
    sex: shortSex(r.gender),
    age: r.age ?? null,
    yearsRegistered: r.yearsRegistered || null,
  }))
}

// Gender string -> short M / F / '' for compact table columns.
export function shortSex(g) {
  const s = (g || '').trim().toLowerCase()
  if (['male', 'm', 'man', 'men', 'boy', 'boys'].includes(s)) return 'M'
  if (['female', 'f', 'woman', 'women', 'girl', 'girls', 'vrouw'].includes(s)) return 'F'
  return ''
}

// P&L per tournament (Insights → P&L). Mock keeps the full prototype numbers.
// Live derives revenue and paid-referee counts from WooCommerce orders. Costs
// are not stored in WordPress in Phase 1, so costs/margin are returned as null
// and the screen shows revenue only.
export async function getPnl() {
  if (!LIVE) return mockPnl.map((p) => ({ ...p, hasCosts: true }))
  const [tRes, aRes] = await Promise.all([
    fetch('/api/tournaments'),
    fetch('/api/applications?status=processing,completed'),
  ])
  if (!tRes.ok) throw new Error(`Tournaments request failed (${tRes.status})`)
  if (!aRes.ok) throw new Error(`Applications request failed (${aRes.status})`)
  const tournaments = (await tRes.json()).tournaments || []
  const nameById = {}
  for (const t of tournaments) nameById[t.id] = t.name
  const apps = ((await aRes.json()).applications || []).filter((a) => a.paid)
  const agg = {}
  for (const a of apps) {
    if (a.tournamentId == null) continue
    const g = (agg[a.tournamentId] ||= { revenue: 0, referees: 0 })
    g.revenue += a.total || 0
    g.referees += 1
  }
  return Object.entries(agg)
    .map(([id, g]) => ({
      name: nameById[id] || `Tournament #${id}`,
      revenue: Math.round(g.revenue),
      costs: null,       // not tracked in WordPress in Phase 1
      referees: g.referees,
      hasCosts: false,
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

// Normalise free-text gender values from WordPress to a few display buckets.
function normGender(g) {
  const s = (g || '').trim().toLowerCase()
  if (!s) return null
  if (['male', 'm', 'man', 'men', 'boy', 'boys'].includes(s)) return 'Male'
  if (['female', 'f', 'woman', 'women', 'girl', 'girls', 'vrouw'].includes(s)) return 'Female'
  return g.charAt(0).toUpperCase() + g.slice(1)
}

const countBy = (items, fn) => {
  const m = {}
  for (const it of items) { const k = fn(it); if (k != null && k !== '') m[k] = (m[k] || 0) + 1 }
  return Object.entries(m).map(([key, val]) => ({ key, val })).sort((a, b) => b.val - a.val)
}

// Analytics (Insights → Analytics). Mock keeps the prototype figures. Live
// derives everything WordPress/WooCommerce can give in Phase 1 from the referee
// pool and paid orders: referees per tournament, levels, gender split, top
// countries/nationalities, experience (years registered), totals and averages.
// Age is NOT available (date of birth is excluded for GDPR). Report-based
// metrics (counts, scores, trend over time) are Phase 2, so they stay null/absent.
export async function getAnalytics() {
  if (!LIVE) {
    const lv = mockAnalytics.levels
    const refs = mockReferees
    return {
      tiles: {
        avgReferees: Math.round(mockAnalytics.refereesPerTournament.reduce((a, b) => a + b.value, 0) / mockAnalytics.refereesPerTournament.length),
        totalReferees: refs.length,
        countriesReached: 27,
        womenPct: null,
        reportsSubmitted: 231,
        avgScore: '4.2 / 5',
      },
      refereesPerTournament: mockAnalytics.refereesPerTournament,
      levelList: [
        { key: 'talent', val: lv.talent },
        { key: 'medior', val: lv.medior },
        { key: 'beginner', val: lv.beginner },
      ],
      genderList: countBy(refs, (r) => normGender(r.gender)),
      countriesList: countBy(refs, (r) => r.country).slice(0, 8),
      experienceList: [],
      ageList: [],
      applicationsByMonth: [
        { month: 'May', value: 9 }, { month: 'Jun', value: 14 }, { month: 'Jul', value: 22 },
        { month: 'Aug', value: 31 }, { month: 'Sep', value: 26 }, { month: 'Oct', value: 38 },
      ],
      revenueByMonth: [
        { month: 'May', value: 2700 }, { month: 'Jun', value: 4200 }, { month: 'Jul', value: 6600 },
        { month: 'Aug', value: 9300 }, { month: 'Sep', value: 7800 }, { month: 'Oct', value: 11400 },
      ],
      reportsByMonth: mockAnalytics.reportsByMonth,
    }
  }
  // Live: a single server-side aggregate call. The response contains only group
  // counts and totals, never any per-referee data, so names, emails and dates of
  // birth stay on the server (see api/analytics.js).
  const res = await fetch('/api/analytics')
  if (!res.ok) throw new Error(`Analytics request failed (${res.status})`)
  return res.json()
}

// Sync activity: the WooCommerce webhook receiver records every delivery in the
// shared store. In this clickable prototype (mock mode) there is no live store,
// so this returns null and the Settings panel shows the demo log.
export async function getSyncLog() {
  if (!LIVE) return null
  const res = await fetch('/api/webhook')
  if (!res.ok) return null
  return res.json()
}

// Direct messages between the logged-in referee and the organisation (D8) +
// unread counts (D9). This clickable prototype runs in mock mode, so these are
// no-ops / empty; the real build wires them to /api/dm.
export async function getOrgThread() {
  if (!LIVE) return null
  const token = sessionToken()
  const res = await apiFetch('/api/dm', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  if (!res.ok) return null
  return res.json()
}
export async function sendOrgMessage(text, name) {
  if (!LIVE) return { ok: true }
  const token = sessionToken()
  const res = await apiFetch('/api/dm', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ text, name }) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Send failed (${res.status})`)
  return data
}
export async function markOrgRead() {
  if (!LIVE) return
  const token = sessionToken()
  await apiFetch('/api/dm', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ read: 1 }) }).catch(() => {})
}
export async function getDmThreads() {
  if (!LIVE) return { threads: [], totalUnread: 0 }
  const res = await apiFetch('/api/dm?admin=1')
  if (!res.ok) return { threads: [], totalUnread: 0 }
  return res.json()
}
export async function getDmThread(refId) {
  if (!LIVE) return null
  const res = await apiFetch(`/api/dm?ref=${encodeURIComponent(refId)}`)
  if (!res.ok) return null
  return (await res.json()).thread || null
}
export async function sendDmReply(refId, text) {
  if (!LIVE) return { ok: true }
  const res = await apiFetch('/api/dm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ref: refId, text, from: 'admin' }) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Reply failed (${res.status})`)
  return data
}
export async function markDmReadAdmin(refId) {
  if (!LIVE) return
  await apiFetch('/api/dm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ref: refId, read: 1, from: 'admin' }) }).catch(() => {})
}

/* ---------------- Web Push (H) ---------------- */
// Prototype (mock) build: these are visual-only; the real build wires them to
// /api/push with a VAPID key and a service worker.
const b64ToUint8 = (base64) => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}
export function pushSupported() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}
export async function getPushState() {
  if (!pushSupported()) return 'unsupported'
  if (!LIVE) return 'off'
  if (Notification.permission === 'denied') return 'denied'
  try { const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription(); return sub ? 'subscribed' : 'off' } catch { return 'off' }
}
export async function enablePush() {
  if (!pushSupported()) return 'unsupported'
  if (!LIVE) return 'subscribed'
  const info = await apiFetch('/api/push').then((r) => r.json()).catch(() => null)
  if (!info || !info.configured || !info.publicKey) return 'off'
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return permission === 'denied' ? 'denied' : 'off'
  const reg = await navigator.serviceWorker.ready
  let sub = await reg.pushManager.getSubscription()
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToUint8(info.publicKey) })
  const token = sessionToken()
  await apiFetch('/api/push', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ subscription: sub }) })
  return 'subscribed'
}
export async function disablePush() {
  if (!pushSupported()) return 'unsupported'
  if (!LIVE) return 'off'
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      const token = sessionToken()
      await apiFetch('/api/push', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ unsubscribe: 1, endpoint: sub.endpoint }) }).catch(() => {})
      await sub.unsubscribe().catch(() => {})
    }
  } catch { /* ignore */ }
  return 'off'
}

// Command Centre (admin) auth header. In this clickable prototype (mock) there
// is no real admin session, so this is empty; the real build attaches the
// WordPress-admin token and the server enforces the allowlist.
function ccToken() {
  try { return JSON.parse(localStorage.getItem('ra_cc_session') || 'null')?.token || null } catch { return null }
}
export function ccAuthHeaders() {
  const t = ccToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}
