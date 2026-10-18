import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, LogOut, FileText, CalendarClock, Bell, ChevronRight, Pencil, Lock, Camera, AlertCircle, HelpCircle } from 'lucide-react'
import { TopBar, Pill, Skel } from '../components/ui.jsx'
import Flag from '../components/Flag.jsx'
import { countryCode } from '../regions.js'
import { getMyProfile, updateProfile, LIVE } from '../lib/dataSource.js'
import { logout } from '../lib/auth.js'
import { getPhoto, setPhoto as savePhoto, subscribePhoto, fileToDataUrl } from '../profilePhoto.js'

function Field({ label, value, onChange }) {
  return (
    <label className="block bg-white rounded-2xl border border-neutral-200 px-4 py-2.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
      <span className="block text-[11px] font-bold uppercase tracking-wide text-neutral-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent outline-none text-[15px] font-semibold text-ink"
      />
    </label>
  )
}

function LinkRow({ icon: Icon, tint, color, title, sub, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3.5 bg-white rounded-2xl border border-neutral-200 p-4 active:scale-[0.99] transition text-left">
      <span className="w-11 h-11 rounded-2xl flex items-center justify-center flex-none" style={{ background: tint, color }}><Icon size={20} /></span>
      <span className="flex-1 min-w-0">
        <span className="block text-[15px] font-bold text-ink leading-tight">{title}</span>
        <span className="block text-[12px] font-medium text-neutral-500">{sub}</span>
      </span>
      <ChevronRight size={20} className="text-neutral-300" />
    </button>
  )
}

// WordPress stores dietary as one string ("None", "Vegetarian",
// "Allergies: peanuts"). Split it back into the form fields for editing.
function parseDietary(str) {
  if (!str) return {}
  if (str === 'None') return { dietaryHas: 'no' }
  const i = str.indexOf(': ')
  if (i === -1) return { dietaryHas: 'yes', dietaryReason: str }
  return { dietaryHas: 'yes', dietaryReason: str.slice(0, i), dietaryDetail: str.slice(i + 2) }
}

export default function Profile() {
  const nav = useNavigate()
  const [p, setP] = useState(null)
  const [f, setF] = useState({})
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [photo, setPhotoState] = useState(getPhoto())
  const fileRef = useRef(null)
  const set = (k) => (v) => { setF((s) => ({ ...s, [k]: v })); setSaved(false) }

  useEffect(() => {
    let alive = true
    getMyProfile()
      .then((prof) => { if (alive) { setP(prof); setF({ ...prof, ...parseDietary(prof.dietary) }) } })
      .catch(() => { if (alive) setP(null) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])
  useEffect(() => subscribePhoto(setPhotoState), [])
  const onPick = async (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const url = await fileToDataUrl(file)
    savePhoto(url)
    e.target.value = ''
  }

  if (loading) return (
    <div>
      <TopBar title="Profile" />
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-4">
          <Skel className="w-20 h-20 rounded-full flex-none" />
          <div className="flex-1 space-y-2"><Skel className="h-4 w-1/2" /><Skel className="h-3 w-2/3" /></div>
        </div>
        {[0, 1, 2, 3].map((i) => <Skel key={i} className="h-14" />)}
      </div>
    </div>
  )
  if (!p) return <div><TopBar title="Profile" /><p className="p-6 text-neutral-500 font-medium">Could not load your profile.</p></div>

  // Dietary (prototype, stored in the edit form state).
  const DIET_SIMPLE = ['Vegetarian', 'Vegan']
  const dietaryInvalid = f.dietaryHas === 'yes' && !!f.dietaryReason && !DIET_SIMPLE.includes(f.dietaryReason) && !(f.dietaryDetail || '').trim()
  const dietaryAnswered = f.dietaryHas === 'no' || (f.dietaryHas === 'yes' && !!f.dietaryReason && !dietaryInvalid)
  const dietaryText = f.dietaryHas === 'no' ? 'None'
    : f.dietaryHas === 'yes' && f.dietaryReason ? `${f.dietaryReason}${f.dietaryDetail ? `: ${f.dietaryDetail}` : ''}` : null

  // Live read view shows what WordPress exposes; mock keeps the full prototype set.
  const readFields = LIVE
    ? [['Email', p.email], ['Country', p.country], ['Nationality', p.nationality], ['Federation', p.federation]]
    : [['Email', f.email], ['Phone', f.phone], ['Date of birth', f.dob], ['Emergency contact', f.emergencyContact], ['Kit size', f.kit], ['Dietary', dietaryText], ['Languages', f.languages]]

  // Profile completeness: 13 items. The ring around the photo shows the %.
  const compFields = [
    f.name || p.name, photo, f.dob || p.dob, p.age, p.gender || p.sex || f.sex,
    p.country, p.nationality, f.email || p.email, f.phone || p.phone,
    dietaryAnswered, f.emergencyContact, f.level || p.level, f.kit || p.kit,
  ]
  const compDone = compFields.filter(Boolean).length
  const compTotal = compFields.length
  const compPct = Math.round((compDone / compTotal) * 100)
  const R = 54, CIRC = 2 * Math.PI * R

  const saveProfile = async () => {
    if (dietaryInvalid) return
    if (!LIVE) { setSaved(true); return }
    setSaving(true)
    try {
      await updateProfile({ phone: f.phone || '', kit: f.kit || '', languages: f.languages || '', dob: f.dob || '', emergencyContact: f.emergencyContact || '', dietary: dietaryText || '' })
      setSaved(true)
    } catch { /* keep the form open so the referee can retry */ }
    finally { setSaving(false) }
  }

  return (
    <div className="pb-6">
      <TopBar title="Profile" />
      <div className="px-4 pt-4 space-y-5">
        <div className="flex flex-col items-center text-center pt-2">
          <input ref={fileRef} type="file" accept="image/*" onChange={onPick} className="hidden" />
          <div className="relative w-28 h-28">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 112 112" aria-hidden="true">
              <circle cx="56" cy="56" r={R} fill="none" stroke="#E5E7EB" strokeWidth="4" />
              <circle cx="56" cy="56" r={R} fill="none" stroke="#44A546" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - compPct / 100)} style={{ transition: 'stroke-dashoffset .5s' }} />
            </svg>
            <button onClick={() => fileRef.current && fileRef.current.click()} className="absolute inset-0 m-auto w-24 h-24 active:scale-95 transition" aria-label="Upload profile photo">
              <span className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-white text-3xl font-extrabold" style={{ background: 'linear-gradient(135deg,#3BB65C,#176B33)' }}>
                {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : p.initials}
              </span>
              <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-neutral-200 shadow flex items-center justify-center text-brand-dark"><Camera size={16} /></span>
            </button>
          </div>
          <p className="mt-2 text-[13px] font-extrabold text-brand-dark">{compPct}% profile complete</p>
          {compPct < 100 && <p className="text-[11px] font-medium text-neutral-500">{compDone} of {compTotal} details filled</p>}
          {!photo && (
            <p className="mt-1.5 text-[12px] font-semibold text-amber-600 flex items-center gap-1"><AlertCircle size={13} /> Profile photo required. Tap to upload.</p>
          )}
          <p className="mt-3 text-2xl font-extrabold text-ink">{f.name || p.name}</p>
          <div className="flex items-center justify-center gap-2 mt-1.5">
            {p.level && <Pill>{p.level}</Pill>}
            <span className="text-[13px] text-neutral-500 font-semibold inline-flex items-center gap-1.5"><Flag code={countryCode(p.country)} emoji={p.flag} size={13} /> {p.country}</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <LinkRow icon={FileText} tint="var(--mint,#E7F4E1)" color="#1F7A3A" title="Documents" sub="Tickets, itinerary, agreement" onClick={() => nav('/documents')} />
          <LinkRow icon={CalendarClock} tint="#E4F0FB" color="#0C447C" title="Availability" sub="Set when you can referee" onClick={() => nav('/availability')} />
          <LinkRow icon={Bell} tint="#FDEFD3" color="#7A5206" title="Notifications" sub="Push and email" onClick={() => nav('/notification-settings')} />
          <LinkRow icon={HelpCircle} tint="#EDE9FB" color="#5B4BA6" title="Help & FAQ" sub="How tournaments, travel and fees work" onClick={() => nav('/faq')} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-sm font-extrabold text-ink">Personal details</p>
            <button onClick={() => setEditing((v) => !v)} className="text-brand-dark text-[13px] font-bold inline-flex items-center gap-1">
              <Pencil size={13} /> {editing ? 'Done' : 'Edit'}
            </button>
          </div>
          {editing ? (
            <div className="space-y-3">
              <Field label="Full name" value={f.name} onChange={set('name')} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email" value={f.email} onChange={set('email')} />
                <Field label="Phone" value={f.phone} onChange={set('phone')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date of birth" value={f.dob} onChange={set('dob')} />
                <Field label="Emergency contact" value={f.emergencyContact} onChange={set('emergencyContact')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Level" value={f.level} onChange={set('level')} />
                <Field label="Kit size" value={f.kit} onChange={set('kit')} />
              </div>
              <Field label="Languages" value={f.languages} onChange={set('languages')} />

              <div className="bg-white rounded-2xl border border-neutral-200 px-4 py-3">
                <span className="block text-[11px] font-bold uppercase tracking-wide text-neutral-500 mb-2">Dietary requirements</span>
                <div className="flex gap-2">
                  {[['no', 'No'], ['yes', 'Yes']].map(([v, l]) => (
                    <button key={v} onClick={() => set('dietaryHas')(v)} className={`flex-1 h-10 rounded-xl text-sm font-bold border transition ${f.dietaryHas === v ? 'bg-brand text-white border-brand' : 'border-neutral-200 text-neutral-500'}`}>{l}</button>
                  ))}
                </div>
                {f.dietaryHas === 'yes' && (
                  <div className="mt-2 space-y-2">
                    <select value={f.dietaryReason || ''} onChange={(e) => set('dietaryReason')(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-sm font-medium outline-none focus:border-brand">
                      <option value="">Select a reason…</option>
                      {['Vegetarian', 'Vegan', 'Religious dietary requirements', 'Intolerances', 'Allergies', 'Other dietary requirements'].map((r) => <option key={r}>{r}</option>)}
                    </select>
                    {f.dietaryReason && !DIET_SIMPLE.includes(f.dietaryReason) && (
                      <>
                        <input value={f.dietaryDetail || ''} onChange={(e) => set('dietaryDetail')(e.target.value)} placeholder="Please specify (required)"
                          className={`w-full h-10 px-3 rounded-xl border text-sm font-medium outline-none ${(f.dietaryDetail || '').trim() ? 'border-neutral-200 focus:border-brand' : 'border-red-400'}`} />
                        {!(f.dietaryDetail || '').trim() && <p className="text-[11px] font-semibold text-red-500">Please specify your dietary requirement to save.</p>}
                      </>
                    )}
                  </div>
                )}
              </div>

              <button onClick={saveProfile} disabled={dietaryInvalid || saving}
                className="w-full h-12 rounded-full bg-brand text-white font-bold active:scale-[0.99] transition inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:active:scale-100">
                {saving ? 'Saving…' : saved ? <><Check size={17} /> Saved</> : 'Save changes'}
              </button>
              {LIVE && (
                <p className="mt-2 text-[12px] text-neutral-500 font-medium flex items-center gap-1.5 px-1">
                  <Lock size={12} className="text-neutral-500" /> Name, email and level are managed in your Referee Abroad account.
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
                {readFields.map(([l, v]) => (
                  <div key={l} className="flex items-center justify-between px-4 py-3">
                    <span className="text-[13px] font-semibold text-neutral-500">{l}</span>
                    <span className="text-[14px] font-semibold text-ink">{v || '—'}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => { logout(); nav('/login') }}
          className="w-full h-12 rounded-full bg-white border border-neutral-200 text-neutral-600 font-bold flex items-center justify-center gap-2"
        >
          <LogOut size={17} /> Log out
        </button>
      </div>
    </div>
  )
}
