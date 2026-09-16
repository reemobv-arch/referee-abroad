import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, MailCheck } from 'lucide-react'
import Logo from '../components/Logo.jsx'

export default function Login() {
  const nav = useNavigate()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('alex@mail.com')
  const [pw, setPw] = useState('referee2026')
  const [err, setErr] = useState('')
  const [resetEmail, setResetEmail] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!email.trim() || !pw.trim()) { setErr('Enter your email and password.'); return }
    if (pw.length < 4) { setErr('That email or password is not correct.'); return }
    nav('/home')
  }

  if (mode === 'sent') {
    return (
      <div className="h-full overflow-y-auto no-scrollbar bg-white">
        <div className="w-full px-7 pt-16 pb-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-brand-light text-brand-dark flex items-center justify-center"><MailCheck size={30} /></div>
          <h1 className="text-2xl font-extrabold text-ink mt-4">Check your email</h1>
          <p className="text-neutral-500 font-medium mt-2 max-w-xs">We sent a password reset link to {resetEmail || 'your email'}. Follow it to set a new password.</p>
          <button onClick={() => setMode('login')} className="mt-8 w-full h-13 rounded-full bg-brand text-white font-bold" style={{ height: 52 }}>Back to sign in</button>
        </div>
      </div>
    )
  }

  if (mode === 'forgot') {
    return (
      <div className="h-full overflow-y-auto no-scrollbar bg-white">
        <div className="w-full px-7 pt-10 pb-10 flex flex-col">
          <button onClick={() => setMode('login')} className="inline-flex items-center gap-1.5 text-brand-dark font-bold text-sm"><ArrowLeft size={17} /> Back</button>
          <h1 className="text-3xl font-extrabold text-ink mt-8">Reset password</h1>
          <p className="text-neutral-500 font-medium mt-2">Enter your email and we will send you a reset link for your Referee Abroad account.</p>
          <form onSubmit={(e) => { e.preventDefault(); if (resetEmail.trim()) setMode('sent') }} className="mt-6 space-y-4">
            <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="name@email.com" className="w-full h-14 px-5 rounded-2xl border border-neutral-200 focus:border-brand focus:ring-2 focus:ring-brand/30 outline-none text-ink font-medium" />
            <button type="submit" className="w-full rounded-full bg-brand text-white text-lg font-bold" style={{ height: 52 }}>Send reset link</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-white">
      <div className="w-full px-7 pt-10 pb-10 flex flex-col">
        <div className="flex flex-col items-center">
          <Logo size={64} showText textClass="text-2xl mt-3" />
          <p className="text-neutral-500 font-medium mt-3">Explore your refereeing world</p>
        </div>

        <h1 className="text-4xl font-extrabold text-ink mt-12">Welcome back</h1>
        <p className="text-neutral-500 font-semibold mt-1">Sign in with your Referee Abroad account.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-ink mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErr('') }}
              className="w-full h-14 px-5 rounded-2xl border border-neutral-200 focus:border-brand focus:ring-2 focus:ring-brand/30 outline-none text-ink font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-ink mb-2">Password</label>
            <input
              type="password"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setErr('') }}
              className="w-full h-14 px-5 rounded-2xl border border-neutral-200 focus:border-brand focus:ring-2 focus:ring-brand/30 outline-none text-ink font-medium"
            />
          </div>

          {err && <p className="text-[14px] font-semibold text-red-500 flex items-center gap-1.5"><AlertCircle size={16} /> {err}</p>}

          <button
            type="submit"
            className="w-full rounded-full bg-brand text-white text-lg font-bold tracking-wide active:scale-[0.99] transition-transform"
            style={{ height: 56 }}
          >
            Sign in
          </button>
        </form>

        <button onClick={() => setMode('forgot')} className="text-brand-dark font-bold text-center mt-6">Forgot password?</button>
        <p className="text-center text-neutral-400 font-medium mt-8 text-[13px] leading-relaxed">
          Your account is created by Referee Abroad and uses your existing login.<br />No account yet? Contact the organisation.
        </p>
      </div>
    </div>
  )
}
