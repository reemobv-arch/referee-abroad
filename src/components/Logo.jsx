export default function Logo({ size = 40, showText = true, textClass = '' }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="22" fill="#E7F4E1" />
        <path d="M14 30c-4-2-6-8-2-12s10-2 12 2c2-5 9-6 13-2s2 12-4 13c3 3 1 9-4 9-4 0-6-3-6-6-3 3-9 2-9-4z" fill="#44A546" />
        <circle cx="20" cy="22" r="5" fill="#1b1b1b" />
        <circle cx="21.5" cy="20.5" r="1.6" fill="#fff" />
        <circle cx="31" cy="27" r="3" fill="#1b1b1b" />
      </svg>
      {showText && (
        <div className={`leading-none font-extrabold ${textClass}`}>
          <span className="text-ink">Referee </span>
          <span className="text-brand">abroad</span>
        </div>
      )}
    </div>
  )
}
