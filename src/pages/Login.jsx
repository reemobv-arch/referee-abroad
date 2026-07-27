import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('alex@mail.com')
  const [pw, setPw] = useState('referee2026')

  function submit(e) {
    e.preventDefault()
    nav('/home')
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-white">
      <div className="w-full px-7 pt-10 pb-10 flex flex-col">
        <div className="flex flex-col items-center">
          <Logo size={64} showText textClass="text-2xl mt-3" />
          <p className="text-neutral-500 font-medium mt-3">Explore Your Refereeing World</p>
        </div>

        <h1 className="text-4xl font-extrabold text-ink mt-12">Welcome Back</h1>

        <form onSubmit={submit} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 px-5 rounded-2xl border border-neutral-200 focus:border-brand focus:ring-2 focus:ring-brand/30 outline-none text-ink font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">Password</label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full h-14 px-5 rounded-2xl border border-neutral-200 focus:border-brand focus:ring-2 focus:ring-brand/30 outline-none text-ink font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full h-14 rounded-full bg-brand text-white text-lg font-bold tracking-wide active:scale-[0.99] transition-transform"
          >
            SIGN IN
          </button>
        </form>

        <button className="text-brand font-semibold text-center mt-6">Forgot password?</button>
        <p className="text-center text-neutral-500 font-medium mt-6">
          Don&apos;t have an account? <span className="text-brand font-bold underline">Sign Up</span>
        </p>
      </div>
    </div>
  )
}
