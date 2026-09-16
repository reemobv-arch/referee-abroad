import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, LogOut, FileText, CalendarClock, Bell, ChevronRight, Pencil } from 'lucide-react'
import { TopBar, Pill } from '../components/ui.jsx'
import { user } from '../data.js'

function Field({ label, value, onChange }) {
  return (
    <label className="block bg-white rounded-2xl border border-neutral-200 px-4 py-2.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
      <span className="block text-[11px] font-bold uppercase tracking-wide text-neutral-400">{label}</span>
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

export default function Profile() {
  const nav = useNavigate()
  const [f, setF] = useState({ ...user })
  const [saved, setSaved] = useState(false)
  const [editing, setEditing] = useState(false)
  const set = (k) => (v) => { setF((s) => ({ ...s, [k]: v })); setSaved(false) }

  return (
    <div className="pb-6">
      <TopBar title="Profile" />
      <div className="px-4 pt-4 space-y-5">
        <div className="flex flex-col items-center text-center pt-2">
          <div className="w-20 h-20 rounded-3xl text-white text-3xl font-extrabold flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#3BB65C,#176B33)' }}>
            {user.initials}
          </div>
          <p className="mt-3 text-2xl font-extrabold text-ink">{f.name}</p>
          <div className="flex items-center justify-center gap-2 mt-1.5">
            <Pill>{user.level}</Pill>
            <span className="text-[13px] text-neutral-500 font-semibold">{user.flag} {user.country}</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <LinkRow icon={FileText} tint="var(--mint,#E7F4E1)" color="#1F7A3A" title="Documents" sub="Tickets, itinerary, agreement" onClick={() => nav('/documents')} />
          <LinkRow icon={CalendarClock} tint="#E4F0FB" color="#0C447C" title="Availability" sub="Set when you can referee" onClick={() => nav('/availability')} />
          <LinkRow icon={Bell} tint="#FDEFD3" color="#7A5206" title="Notifications" sub="Push and email" onClick={() => nav('/notification-settings')} />
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
                <Field label="Level" value={f.level} onChange={set('level')} />
                <Field label="Kit size" value={f.kit} onChange={set('kit')} />
              </div>
              <Field label="Languages" value={f.languages} onChange={set('languages')} />
              <button onClick={() => setSaved(true)} className="w-full h-12 rounded-full bg-brand text-white font-bold active:scale-[0.99] transition inline-flex items-center justify-center gap-2">
                {saved ? <><Check size={17} /> Saved</> : 'Save changes'}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
              {[['Email', f.email], ['Phone', f.phone], ['Kit size', f.kit], ['Languages', f.languages]].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between px-4 py-3">
                  <span className="text-[13px] font-semibold text-neutral-500">{l}</span>
                  <span className="text-[14px] font-semibold text-ink">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => nav('/login')}
          className="w-full h-12 rounded-full bg-white border border-neutral-200 text-neutral-600 font-bold flex items-center justify-center gap-2"
        >
          <LogOut size={17} /> Log out
        </button>
      </div>
    </div>
  )
}
