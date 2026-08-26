// Serverless function: emails a signed copy of the agreement to Reemo.
// Requires environment variables (set in Vercel, not in the repo):
//   RESEND_API_KEY   - API key of the Resend email service (resend.com)
//   SIGN_FROM_EMAIL  - verified sender, e.g. "Referee Abroad <agreements@reemo.nl>"
//   SIGN_NOTIFY_EMAIL- recipient, defaults to maarten@reemo.nl
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { body = null }
  }
  const date = body && body.date
  const signers = (body && body.signers) || []

  if (signers.length < 4 || signers.some((s) => !s || !s.img)) {
    return res.status(400).json({ error: 'All four signatures are required.' })
  }

  const key = process.env.RESEND_API_KEY
  if (!key) {
    return res.status(503).json({ error: 'Email is not configured yet. Set RESEND_API_KEY in Vercel.' })
  }
  const to = process.env.SIGN_NOTIFY_EMAIL || 'maarten@reemo.nl'
  const from = process.env.SIGN_FROM_EMAIL || 'Referee Abroad <onboarding@resend.dev>'

  const attachments = signers.map((s, i) => ({
    filename: `signature-${i + 1}-${String(s.name).replace(/[^a-zA-Z0-9]+/g, '-')}.png`,
    content: String(s.img).split(',')[1] || '',
  }))
  const rows = signers.map((s) => `<li><b>${s.name}</b> — ${s.label}</li>`).join('')
  const html = `
    <div style="font-family:Arial,sans-serif;color:#17201A">
      <h2>Referee Abroad — agreement signed</h2>
      <p>Date: ${date || ''}</p>
      <p>Signed by:</p>
      <ul>${rows}</ul>
      <p>The four signatures are attached to this email.</p>
    </div>`

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject: `Signed agreement — Referee Abroad (${date || ''})`, html, attachments }),
    })
    if (!r.ok) {
      return res.status(502).json({ error: 'The email service returned an error.' })
    }
    return res.status(200).json({ ok: true })
  } catch {
    return res.status(502).json({ error: 'Could not reach the email service.' })
  }
}
