// Keyless FAQ answering for the in-app assistant. Used when the LLM endpoint is
// not configured or unreachable, so the assistant keeps working offline. Kept in
// its own module (no React) so the matching logic can be unit tested.
import { FAQ_ITEMS } from '../faqContent.js'

// A few referee-topic synonyms so everyday wording still finds the right FAQ
// item (the FAQ text itself does not always contain the word people type).
export const SYNONYMS = {
  kit: ['kit', 'uniform', 'shirt', 'merch', 'merchandise', 'clothing', 'pack'],
  fee: ['fee', 'cost', 'price', 'included', 'include', 'pay', 'paid', 'salary', 'money'],
  travel: ['travel', 'flight', 'flights', 'hotel', 'accommodation', 'transfer', 'transport', 'arrive', 'arrival'],
  visa: ['visa', 'entry', 'passport', 'invitation'],
  age: ['age', 'old', 'minimum', 'young', 'under'],
  guarantee: ['guarantee', 'credit card', 'deposit', 'card'],
  register: ['register', 'registered', 'association', 'federation', 'fifa', 'qualify', 'qualified'],
  observer: ['observer', 'assessor'],
  apply: ['apply', 'join', 'sign up', 'selected', 'selection'],
}
export const STOP = new Set(['what', 'when', 'where', 'which', 'does', 'need', 'have', 'with', 'this', 'that', 'your', 'about', 'there', 'they', 'from', 'will', 'should', 'would', 'take', 'much', 'many', 'into'])

export const HANDOFF_TEXT = "I'm not sure about that one yet. I can help with how refereeing abroad works, age and registration, the tournament fee, travel, kit, visas, the credit card guarantee, and observers. For anything else, the Referee Abroad team is happy to help."

// Returns { text, fallback }. fallback = true means we could not match the FAQ
// and the user should be handed off to the team.
export function localAnswer(question, items = FAQ_ITEMS) {
  const q = ' ' + String(question || '').toLowerCase() + ' '
  const qWords = new Set(q.split(/\W+/).filter((w) => w.length > 3 && !STOP.has(w)))
  let best = null
  let bestScore = 0
  for (const item of items) {
    let score = 0
    // Synonym groups: hitting the user's words and the FAQ item's text both.
    for (const words of Object.values(SYNONYMS)) {
      const inQ = words.some((w) => q.includes(w))
      const inItem = words.some((w) => (item.q + ' ' + item.a).toLowerCase().includes(w))
      if (inQ && inItem) score += 3
    }
    for (const w of item.q.toLowerCase().split(/\W+/)) if (w.length > 3 && qWords.has(w)) score += 2
    for (const w of item.a.toLowerCase().split(/\W+/)) if (w.length > 4 && qWords.has(w)) score += 0.5
    if (score > bestScore) { bestScore = score; best = item }
  }
  if (best && bestScore >= 3) return { text: best.a, fallback: false }
  return { text: HANDOFF_TEXT, fallback: true }
}
