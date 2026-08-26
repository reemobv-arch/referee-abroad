// Shared storage for agreement signatures, backed by Upstash Redis (REST).
// Env (set in Vercel, not in the repo): UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
const HKEY = 'sig:referee-abroad-phase1'

async function redis(cmd) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  })
  return r.json()
}

export default async function handler(req, res) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return res.status(503).json({ error: 'Storage not configured.' })
  }

  try {
    if (req.method === 'GET') {
      const out = await redis(['HGETALL', HKEY])
      const arr = out.result || []
      const data = {}
      for (let i = 0; i < arr.length; i += 2) {
        try { data[arr[i]] = JSON.parse(arr[i + 1]) } catch { /* skip */ }
      }
      return res.status(200).json({ signatures: data })
    }

    if (req.method === 'POST') {
      let body = req.body
      if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = null } }
      const { key, name, img, date } = body || {}
      if (!key || !img) return res.status(400).json({ error: 'Missing signature.' })
      const val = JSON.stringify({ name, img, date })
      const out = await redis(['HSETNX', HKEY, key, val])
      if (out.result === 0) {
        const ex = await redis(['HGET', HKEY, key])
        let existing = null
        try { existing = JSON.parse(ex.result) } catch { /* ignore */ }
        return res.status(409).json({ error: 'Already signed.', existing })
      }
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch {
    return res.status(502).json({ error: 'Storage error.' })
  }
}
