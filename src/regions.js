// Tournament regions for the webapp. The region is derived from the country.
export const REGIONS = [
  { key: 'usa', label: 'USA', flag: '🇺🇸', code: 'us', blurb: 'United States, Canada & Mexico' },
  { key: 'europe', label: 'Europe', flag: '🇪🇺', code: 'eu', blurb: 'Tournaments across Europe' },
  { key: 'asia', label: 'Asia', flag: '🌏', code: null, blurb: 'Tournaments across Asia' },
]

const MAP = {
  'united states': 'usa', usa: 'usa', canada: 'usa', mexico: 'usa',
  portugal: 'europe', spain: 'europe', denmark: 'europe', netherlands: 'europe', malta: 'europe',
  austria: 'europe', germany: 'europe', france: 'europe', italy: 'europe', sweden: 'europe',
  england: 'europe', 'united kingdom': 'europe', belgium: 'europe', switzerland: 'europe',
  poland: 'europe', czechia: 'europe', norway: 'europe', ireland: 'europe', croatia: 'europe',
  japan: 'asia', china: 'asia', thailand: 'asia', singapore: 'asia', 'south korea': 'asia',
  indonesia: 'asia', malaysia: 'asia', 'united arab emirates': 'asia', uae: 'asia', qatar: 'asia',
  vietnam: 'asia', india: 'asia', philippines: 'asia',
}

export function regionOf(country) {
  return MAP[(country || '').trim().toLowerCase()] || 'europe'
}

export function regionMeta(key) {
  return REGIONS.find((r) => r.key === key) || REGIONS[1]
}

// Country name -> flag emoji, for the tournament cards.
const FLAGS = {
  portugal: '🇵🇹', spain: '🇪🇸', denmark: '🇩🇰', netherlands: '🇳🇱', malta: '🇲🇹',
  austria: '🇦🇹', germany: '🇩🇪', france: '🇫🇷', italy: '🇮🇹', sweden: '🇸🇪',
  england: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'united kingdom': '🇬🇧', belgium: '🇧🇪', switzerland: '🇨🇭',
  poland: '🇵🇱', czechia: '🇨🇿', norway: '🇳🇴', ireland: '🇮🇪', croatia: '🇭🇷',
  'united states': '🇺🇸', usa: '🇺🇸', canada: '🇨🇦', mexico: '🇲🇽',
  japan: '🇯🇵', china: '🇨🇳', thailand: '🇹🇭', singapore: '🇸🇬', 'south korea': '🇰🇷',
  indonesia: '🇮🇩', malaysia: '🇲🇾', 'united arab emirates': '🇦🇪', uae: '🇦🇪',
  qatar: '🇶🇦', vietnam: '🇻🇳', india: '🇮🇳', philippines: '🇵🇭',
}

export function countryFlag(country) {
  return FLAGS[(country || '').trim().toLowerCase()] || '🏳️'
}

// Country name OR ISO-2 code -> ISO-2 code for flag-icons (live referee data is
// already a code like "GB"; tournament data is a full name like "France").
const CODE = {
  portugal: 'pt', spain: 'es', denmark: 'dk', netherlands: 'nl', malta: 'mt', austria: 'at',
  germany: 'de', france: 'fr', italy: 'it', sweden: 'se', england: 'gb-eng', scotland: 'gb-sct',
  'united kingdom': 'gb', belgium: 'be', switzerland: 'ch', poland: 'pl', czechia: 'cz',
  'czech republic': 'cz', norway: 'no', ireland: 'ie', croatia: 'hr', finland: 'fi', greece: 'gr',
  'united states': 'us', 'united states of america': 'us', usa: 'us', canada: 'ca', mexico: 'mx',
  japan: 'jp', china: 'cn', thailand: 'th', singapore: 'sg', 'south korea': 'kr', korea: 'kr',
  indonesia: 'id', malaysia: 'my', 'united arab emirates': 'ae', uae: 'ae', qatar: 'qa',
  vietnam: 'vn', india: 'in', philippines: 'ph', taiwan: 'tw', nigeria: 'ng', hungary: 'hu',
  australia: 'au', brazil: 'br', argentina: 'ar', turkey: 'tr', 'north macedonia': 'mk',
}
export function countryCode(country) {
  const s = (country || '').trim().toLowerCase()
  if (!s) return null
  if (/^[a-z]{2}$/.test(s)) return s           // already an ISO-2 code (e.g. "GB")
  return CODE[s] || null
}
