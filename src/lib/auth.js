// Referee authentication for the webapp.
//
// Mock mode (default): accepts any well-formed credentials so the prototype is
// clickable. Live mode (VITE_DATA_SOURCE=live): calls the /api/login serverless
// proxy, which checks the credentials against WordPress. The session (a token +
// a minimal identity) is kept in localStorage so it survives an app restart
// (ticket B2); logout clears it (B5).
import { LIVE } from './dataSource.js'

const KEY = 'ra_session'

export function getSession() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function setSession(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* ignore storage errors */ }
}

export function clearSession() {
  try { localStorage.removeItem(KEY) } catch { /* ignore storage errors */ }
}

export function isAuthenticated() {
  return !!getSession()
}

export function currentUser() {
  const s = getSession()
  return s ? s.user : null
}

// Attempt a sign in. Returns { ok: true } or { ok: false, error }.
export async function login(email, password) {
  const e = (email || '').trim()
  if (!e || !password) return { ok: false, error: 'Enter your email and password.' }

  if (!LIVE) {
    if (password.length < 4) return { ok: false, error: 'That email or password is not correct.' }
    setSession({ token: 'mock', user: { id: 'me', name: e.split('@')[0], email: e } })
    return { ok: true }
  }

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: e, password }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { ok: false, error: data.error || 'That email or password is not correct.' }
    setSession({ token: data.token, user: data.user })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}

export function logout() { clearSession() }
