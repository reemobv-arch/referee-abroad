import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, LogOut } from 'lucide-react'
import { TopBar, Pill } from '../components/ui.jsx'
import { user } from '../data.js'

function Field({ label, value, onChange }) {
  return (
    <label className="block bg-white rounded-2xl border border-neutral-200 px-3.5 py-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
      <span className="block text-[11px] font-medium text-neutral-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent outline-none text-[14px] font-semibold text-ink"
      />
    </label>
  )
}

export default function Profile() {
  const nav = useNavigate()
  const [f, setF] = useState({ ...user })
  const [saved, setSaved] = useState(false)
  const set = (k) => (v) => { setF((s) => ({ ...s, [k]: v })); setSaved(false) }

  return (
    <div className="pb-6">
      <TopBar
        title="Profile"
        right={<Check size={20} className="text-brand" />}
      />
      <div className="px-4 pt-4 space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-card text-center">
          <div className="w-16 h-16 rounded-full bg-brand text-white text-2xl font-bold flex items-center justify-center mx-auto ring-2 ring-white shadow">
            {user.initials}
          </div>
          <p className="mt-2 text-lg font-bold text-ink">{f.name}</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Pill>{user.level}</Pill>
            <span className="text-xs text-neutral-500 font-medium">{user.flag} {user.country}</span>
          </div>
        </div>

        <p className="text-xs font-bold text-neutral-500">Personal details</p>
        <Field label="Full name" value={f.name} onChange={set('name')} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email" value={f.email} onChange={set('email')} />
          <Field label="Phone" value={f.phone} onChange={set('phone')} />
        </div>

        <p className="text-xs font-bold text-neutral-500 mt-1">Refereeing</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Level" value={f.level} onChange={set('level')} />
          <Field label="Kit size" value={f.kit} onChange={set('kit')} />
        </div>
        <Field label="Languages" value={f.languages} onChange={set('languages')} />

        <p className="text-xs font-bold text-neutral-500 mt-1">Emergency contact</p>
        <Field label="Contact person" value={f.emergency} onChange={set('emergency')} />

        <button
          onClick={() => setSaved(true)}
          className="w-full h-12 rounded-full bg-brand text-white font-bold active:scale-[0.99] transition-transform"
        >
          {saved ? 'Saved ✓' : 'Save changes'}
        </button>

        <button
          onClick={() => nav('/login')}
          className="w-full h-12 rounded-full bg-white border border-neutral-200 text-neutral-600 font-semibold flex items-center justify-center gap-2"
        >
          <LogOut size={17} /> Log out
        </button>
      </div>
    </div>
  )
}
