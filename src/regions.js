// Tournament regions for the webapp. The region is derived from the country.
export const REGIONS = [
  { key: 'usa', label: 'USA', flag: '🇺🇸', blurb: 'United States, Canada & Mexico' },
  { key: 'europe', label: 'Europe', flag: '🇪🇺', blurb: 'Tournaments across Europe' },
  { key: 'asia', label: 'Asia', flag: '🌏', blurb: 'Tournaments across Asia' },
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
