import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, Clock, BedDouble, Plane, Users, MessageCircle, FileText, ChevronLeft, ArrowRight, Check, X, CalendarCheck, ShieldCheck, Shield, Upload } from 'lucide-react'
import { myMatches, user } from '../data.js'
import { getTournament, getMyApplications, LIVE } from '../lib/dataSource.js'
import { Pill, Skel } from '../components/ui.jsx'

// Level + experience gating. A referee may only apply when their level is among
// the tournament's accepted levels and their experience meets the required
// minimum. We only ever block when ineligibility can be determined, so unknown
// or empty values never lock a referee out.
const normKey = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '')
const normLevel = (s) => String(s || '').trim().toLowerCase()
const expRank = (s) => {
  const n = normLevel(s).replace(/\s+/g, ' ')
  if (/(^|[^0-9])<\s*1|less than 1|under 1|0\s*-\s*1/.test(n)) return 0
  if (/1\s*(-|to|–)\s*3/.test(n)) return 1
  if (/>\s*3|more than 3|over 3|3\s*\+|3 years or more/.test(n)) return 2
  return -1
}
function levelEligibility(t, profile) {
  if (!t) return { eligible: true, reasons: [] }
  const reasons = []
  const accepted = (t.acceptedLevels || []).map(normKey).filter(Boolean)
  const myLevel = normKey(profile && profile.level)
  if (accepted.length && myLevel && !accepted.includes(myLevel)) reasons.push('level')
  const reqR = expRank(t.refereeExperience)
  const myR = expRank(profile && profile.yearsRegistered)
  if (reqR >= 0 && myR >= 0 && myR < reqR) reasons.push('experience')
  return { eligible: reasons.length === 0, reasons }
}

function PayModal({ t, onClose, onPaid }) {
  const [paying, setPaying] = useState(false)
  const [done, setDone] = useState(false)
  const service = 15
  const total = t.price + service
  const pay = () => {
    setPaying(true)
    setTimeout(() => { setPaying(false); setDone(true) }, 900)
  }

  // Phase 1 (live): no in-app payment. Send the referee to the existing
  // WooCommerce checkout for this tournament; the order and payment happen
  // there and WordPress stays the source of truth.
  if (LIVE) {
    const canCheckout = !!t.applyUrl
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
        <div className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <p className="text-lg font-extrabold text-ink">Apply &amp; pay</p>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-page flex items-center justify-center"><X size={18} /></button>
          </div>
          <p className="text-sm text-neutral-500 font-medium mt-0.5">{t.name}</p>
          <div className="mt-4 bg-page rounded-xl p-4 text-sm">
            <div className="flex justify-between py-1 font-medium text-neutral-600"><span>Participation fee</span><span>{t.price != null ? '€' + t.price : 'See checkout'}</span></div>
          </div>
          <p className="mt-3 text-[13px] text-neutral-500 font-medium">
            You complete your application and payment on the secure Referee Abroad checkout. Your spot updates here once the payment is in.
          </p>
          {canCheckout ? (
            <a
              href={t.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="mt-4 w-full h-12 rounded-full bg-brand text-white font-bold flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              Continue to checkout <ArrowRight size={17} />
            </a>
          ) : (
            <p className="mt-4 text-sm text-neutral-500 font-medium text-center">Checkout link is not available for this tournament yet.</p>
          )}
          <p className="mt-2.5 text-[11px] text-neutral-500 font-medium flex items-center justify-center gap-1"><ShieldCheck size={13} /> Secure payment via the existing checkout</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-brand-light text-brand-dark flex items-center justify-center mx-auto"><Check size={26} /></div>
            <p className="mt-3 text-lg font-extrabold text-ink">Order placed successfully</p>
            <p className="mt-1 text-sm text-neutral-500 font-medium">You are back in the app. Your payment for {t.name} is in and the team will confirm your spot shortly.</p>
            <button onClick={onPaid} className="mt-5 w-full h-11 rounded-full bg-brand text-white font-semibold flex items-center justify-center gap-2"><ArrowRight size={16} /> Back to the app</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-lg font-extrabold text-ink">Apply & pay</p>
              <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-page flex items-center justify-center"><X size={18} /></button>
            </div>
            <p className="text-sm text-neutral-500 font-medium mt-0.5">{t.name}</p>
            <div className="mt-4 bg-page rounded-xl p-4 text-sm">
              <div className="flex justify-between py-1 font-medium text-neutral-600"><span>Participation fee</span><span>€{t.price}</span></div>
              <div className="flex justify-between py-1 font-medium text-neutral-600"><span>Service fee</span><span>€{service}</span></div>
              <div className="flex justify-between pt-2 mt-1 border-t border-neutral-200 font-bold text-ink"><span>Total</span><span>€{total}</span></div>
            </div>
            <button onClick={pay} disabled={paying} className="mt-4 w-full h-12 rounded-full bg-brand text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60">
              {paying ? 'Processing…' : <>Pay €{total} <ArrowRight size={17} /></>}
            </button>
            <p className="mt-2.5 text-[11px] text-neutral-500 font-medium flex items-center justify-center gap-1"><ShieldCheck size={13} /> Secure payment via the existing checkout</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function TournamentDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [requested, setRequested] = useState(false)
  const [pay, setPay] = useState(false)
  const [docsUploaded, setDocsUploaded] = useState(false)
  const [t, setT] = useState(null)
  const [appStatus, setAppStatus] = useState(null) // the referee's own application status for this tournament
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    Promise.all([getTournament(id), getMyApplications().catch(() => ({}))])
      .then(([x, apps]) => {
        if (!alive) return
        setT(x)
        if (x) setAppStatus(apps[String(x.productId)] ?? apps[x.id] ?? null)
      })
      .catch(() => { if (alive) setT(null) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [id])

  if (loading) return (
    <div>
      <Skel className="h-48 rounded-none" />
      <div className="p-4 space-y-3">
        <Skel className="h-5 w-2/3" />
        <Skel className="h-3 w-1/2" />
        {[0, 1, 2].map((i) => <Skel key={i} className="h-16" />)}
      </div>
    </div>
  )
  if (!t) return <div className="p-6">Not found.</div>
  const showApplied = requested || t.applied || !!appStatus
  const matches = myMatches.filter((m) => m.tournamentId === t.id)
  // Level + experience gating: only relevant before the referee has applied.
  const { eligible, reasons } = levelEligibility(t, user)
  const blocked = !showApplied && !eligible

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-6">
      <div className="relative">
        <img src={t.img} alt={t.name} className="w-full h-56 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
        <button
          onClick={() => nav(-1)}
          aria-label="Back"
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center active:scale-95"
        >
          <ChevronLeft size={22} className="text-ink" />
        </button>
        <span className="absolute top-4 right-4 bg-white text-brand-dark text-[11px] font-semibold px-3 py-1 rounded-full">
          {t.age}
        </span>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h1 className="text-[28px] font-extrabold leading-tight">{t.name}</h1>
          <div className="flex items-center gap-1.5 text-[14px] font-semibold mt-1 text-white/90">
            <MapPin size={15} /> {t.city}, {t.country} · {t.dates}
          </div>
        </div>
      </div>

      <div className="px-4 -mt-1">
        <div className="flex flex-wrap gap-1.5 mt-3">
          <Pill>⚽ {t.sport}</Pill>
          {t.referees != null && <Pill><Users size={12} /> {t.referees} referees</Pill>}
          {t.clubs != null && <Pill><Shield size={12} /> {t.clubs} clubs</Pill>}
          {t.matches != null && <Pill><CalendarCheck size={12} /> {t.matches} matches</Pill>}
        </div>

        {(() => {
          const fmt = (v) => { const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }
          const rows = [
            ['Category', t.category],
            ['Accommodation', t.accommodation],
            ['Referee experience', t.refereeExperience],
            ['Accepted levels', (t.acceptedLevels || []).join(', ')],
            ['Application deadline', t.deadline ? fmt(t.deadline) : ''],
          ].filter(([, v]) => v)
          if (rows.length === 0) return null
          return (
            <section className="mt-4">
              <h2 className="text-sm font-extrabold text-ink mb-2">Good to know</h2>
              <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
                {rows.map(([l, v]) => (
                  <div key={l} className="flex items-start justify-between gap-4 px-4 py-2.5">
                    <span className="text-[13px] font-semibold text-neutral-500 flex-none">{l}</span>
                    <span className="text-[14px] font-semibold text-ink text-right">{v}</span>
                  </div>
                ))}
              </div>
            </section>
          )
        })()}

        {t.description && (
          <section className="mt-4">
            <h2 className="text-sm font-extrabold text-ink mb-2">About this tournament</h2>
            <p className="text-[14px] text-neutral-600 font-medium leading-relaxed whitespace-pre-line">{t.description}</p>
          </section>
        )}

        {(t.images || []).length > 1 && (
          <section className="mt-4 -mx-4 px-4">
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {t.images.map((src, i) => (
                <img key={i} src={src} alt="" className="h-28 w-40 flex-none rounded-2xl object-cover" />
              ))}
            </div>
          </section>
        )}

        {t.applied ? (
          <>
            <section className="mt-4 bg-white rounded-2xl overflow-hidden shadow-card">
              <div className="bg-ink text-white px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2">
                <Clock size={15} /> Key times today
              </div>
              <ul className="px-3.5">
                {t.keyTimes.map((k, i) => (
                  <li key={i} className={`flex items-center gap-3 py-2.5 ${i < t.keyTimes.length - 1 ? 'border-b border-neutral-100' : ''}`}>
                    <span className="w-12 text-sm font-bold text-brand-dark">{k.t}</span>
                    <span className="text-sm text-neutral-500 font-medium">{k.label}</span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-white rounded-2xl p-3.5 shadow-card">
                <span className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center">
                  <BedDouble size={18} className="text-brand-dark" />
                </span>
                <p className="mt-2 text-sm font-bold text-ink">{t.hotel}</p>
                <p className="text-xs text-neutral-500 font-medium">{t.room}</p>
              </div>
              <div className="bg-white rounded-2xl p-3.5 shadow-card">
                <span className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center">
                  <Plane size={18} className="text-brand-dark" />
                </span>
                <p className="mt-2 text-sm font-bold text-ink">Transfer</p>
                <p className="text-xs text-neutral-500 font-medium">{t.transfer}</p>
              </div>
            </div>

            <h2 className="text-xl font-extrabold text-ink mt-6 mb-3">Agenda</h2>
            <div className="bg-white rounded-2xl px-3.5 shadow-card">
              {t.agenda.map((a, i) => (
                <div key={i} className={`flex items-center gap-3 py-2.5 ${i < t.agenda.length - 1 ? 'border-b border-neutral-100' : ''}`}>
                  <Pill className="w-11 justify-center">{a.d}</Pill>
                  <span className="text-sm text-ink font-medium">{a.label}</span>
                </div>
              ))}
            </div>

            <h2 className="text-xl font-extrabold text-ink mt-6 mb-3">Documents</h2>
            <Link to="/documents" className="flex items-center gap-3 bg-white rounded-2xl p-3.5 shadow-card active:scale-[0.99]">
              <span className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center">
                <FileText size={18} className="text-brand-dark" />
              </span>
              <span className="flex-1 text-sm font-bold text-ink">{t.documents.length} files for this trip</span>
              <ArrowRight size={18} className="text-brand" />
            </Link>

            {matches.length > 0 && (
              <>
                <h2 className="text-xl font-extrabold text-ink mt-6 mb-3">My matches</h2>
                <button onClick={() => nav('/matches')} className="w-full text-left flex items-center gap-3 bg-white rounded-2xl p-3.5 shadow-card active:scale-[0.99]">
                  <span className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center">
                    <CalendarCheck size={18} className="text-brand-dark" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-bold text-ink">{matches.length} matches appointed</span>
                    <span className="block text-xs text-neutral-500 font-medium">{matches.filter((m) => m.status === 'pending').length} awaiting your response</span>
                  </span>
                  <ArrowRight size={18} className="text-brand" />
                </button>
              </>
            )}

          </>
        ) : (
          <>
          <div className="mt-4 bg-white rounded-2xl p-4 shadow-card">
            <p className="text-[15px] text-neutral-500 font-medium">
              Apply for this tournament to unlock logistics, agenda, documents and the group chat.
            </p>
            <p className="text-brand-dark text-[30px] font-extrabold mt-3">€{t.price}</p>
          </div>

          {blocked && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-[15px] font-extrabold text-red-700">Your level does not meet the requirements for this tournament</p>
              {reasons.includes('level') && (
                <p className="text-[13px] text-red-600 font-semibold mt-1.5">
                  Accepted levels: {(t.acceptedLevels || []).join(', ')}. Your level: {user.level || 'not set'}.
                </p>
              )}
              {reasons.includes('experience') && (
                <p className="text-[13px] text-red-600 font-semibold mt-1.5">
                  Required experience: {t.refereeExperience}. Your experience: {user.yearsRegistered || 'not set'}.
                </p>
              )}
              <p className="text-[12px] text-red-500 font-medium mt-2">Please contact the organisation if you think this is incorrect.</p>
            </div>
          )}

          {!LIVE && (
            <div className="mt-3 bg-white rounded-2xl p-4 shadow-card">
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center flex-none"><FileText size={18} className="text-brand-dark" /></span>
                <div className="flex-1">
                  <p className="text-[15px] font-bold text-ink">Get a head start on your travel documents</p>
                  <p className="text-[13px] text-neutral-500 font-medium mt-0.5">You can already upload your passport, certificate and travel details before you pay. They stay with your profile.</p>
                </div>
              </div>
              <button
                onClick={() => setDocsUploaded(true)}
                className={`mt-3 w-full h-11 rounded-full font-semibold flex items-center justify-center gap-2 active:scale-[0.99] ${docsUploaded ? 'bg-brand-light text-brand-dark' : 'bg-white border-[1.5px] border-brand text-brand-dark'}`}
              >
                {docsUploaded ? (<><Check size={16} /> Documents uploaded</>) : (<><Upload size={16} /> Upload travel documents</>)}
              </button>
            </div>
          )}
          </>
        )}

        {t.applied && (
          <button
            onClick={() => nav(`/tournament/${t.id}/group`)}
            className="w-full h-11 mt-4 rounded-full bg-brand-light text-brand-dark font-semibold flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Users size={16} /> Open group chat
          </button>
        )}

        <div className="grid grid-cols-2 gap-3 mt-3">
          <button
            onClick={() => { if (!showApplied && !blocked) setPay(true) }}
            disabled={blocked}
            className={`h-12 rounded-full font-semibold flex items-center justify-center gap-2 active:scale-[0.99] ${
              showApplied ? 'bg-brand-dark text-white' : blocked ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed active:scale-100' : 'bg-brand text-white'
            }`}
          >
            {showApplied ? (<><Check size={16} /> Applied</>) : blocked ? (<><X size={16} /> Level too low</>) : (<>Apply now <ArrowRight size={16} /></>)}
          </button>
          <button
            onClick={() => nav('/chat')}
            className="h-12 rounded-full bg-white border-[1.5px] border-brand text-brand-dark font-semibold flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <MessageCircle size={16} /> Message org
          </button>
        </div>
      </div>

      {pay && <PayModal t={t} onClose={() => setPay(false)} onPaid={() => { setRequested(true); setPay(false) }} />}
    </div>
  )
}
