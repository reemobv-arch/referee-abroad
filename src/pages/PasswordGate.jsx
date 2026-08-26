import { useState } from 'react'
import { Lock } from 'lucide-react'
import Logo from '../components/Logo.jsx'

const SALT = 'referee-abroad::'
const HASH = '831755d80e67a8a615c88ec76973340bd011b6e2d8b75e13b334c20e5e880854'
const KEY = 'ra_unlocked'

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export default function PasswordGate({ children }) {
  const [ok, setOk] = useState(() => {
    try { return sessionStorage.getItem(KEY) === '1' } catch { return false }
  })
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)

  if (ok) return children

  const submit = async (e) => {
    e.preventDefault()
    const h = await sha256(SALT + pw)
    if (h === HASH) {
      try { sessionStorage.setItem(KEY, '1') } catch { /* ignore */ }
      setOk(true)
    } else {
      setErr(true)
    }
  }

  return (
    <div
      className="min-h-screen text-ink font-sans flex items-center justify-center px-5"
      style={{
        backgroundImage: 'linear-gradient(rgba(244,245,244,0.45), rgba(244,245,244,0.45)), url(img/hub-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <form onSubmit={submit} className="w-full max-w-sm text-center">
        <div className="flex justify-center"><Logo size={64} showText textClass="text-2xl" /></div>
        <div className="mx-auto mt-9 w-12 h-12 rounded-2xl bg-brand-light text-brand-dark flex items-center justify-center">
          <Lock size={22} />
        </div>
        <h1 className="mt-4 text-xl font-extrabold">Protected preview</h1>
        <p className="mt-1 text-sm text-neutral-500 font-medium">Enter the password to continue.</p>
        <input
          type="password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setErr(false) }}
          autoFocus
          placeholder="Password"
          className="mt-6 w-full h-12 px-4 rounded-2xl border border-neutral-200 outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 text-center font-medium"
        />
        {err && <p className="mt-2 text-sm font-semibold text-red-500">Incorrect password. Try again.</p>}
        <button type="submit" className="mt-4 w-full h-12 rounded-full bg-brand text-white font-bold">Unlock</button>
      </form>
    </div>
  )
}
