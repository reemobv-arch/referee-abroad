// Offer + contract content is injected at build time from the OFFER_DATA env
// var (base64 JSON) via Vite's `define` (see vite.config.js). It is kept out of
// the repository — see .env.local locally and the Vercel environment variable.
/* global __OFFER_DATA__ */
let data = null
try {
  const bin = atob(__OFFER_DATA__)
  const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0))
  data = JSON.parse(new TextDecoder().decode(bytes))
} catch {
  data = null
}

export default data
