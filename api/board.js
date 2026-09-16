// Shared storage for the Phase 1 sprint board, backed by Upstash Redis (REST).
// Env (set in Vercel, not in the repo): UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
const KEY = 'board:referee-abroad-phase1'

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
      const out = await redis(['GET', KEY])
      let board = null
      try { board = JSON.parse(out.result) } catch { /* empty */ }
      return res.status(200).json({ board })
    }

    if (req.method === 'POST') {
      let body = req.body
      if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = null } }
      const board = body && body.board
      if (!board || typeof board !== 'object') return res.status(400).json({ error: 'Missing board.' })
      await redis(['SET', KEY, JSON.stringify(board)])
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch {
    return res.status(502).json({ error: 'Storage error.' })
  }
}
