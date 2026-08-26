// Offer + contract content is injected at build time from the OFFER_DATA env
// var (base64 JSON) via Vite's `define` (see vite.config.js). It is kept out of
// the repository — see .env.local locally and the Vercel environment variable.
/* global __OFFER_DATA__ */
let data = null
try {
  data = JSON.parse(atob(__OFFER_DATA__))
} catch {
  data = null
}

export default data
