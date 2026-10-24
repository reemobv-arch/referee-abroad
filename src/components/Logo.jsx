// Referee Abroad logo. Uses the real brand icon (public/ra-icon.png); the
// wordmark text stays as styled spans so it can take the surrounding colour.
export default function Logo({ size = 40, showText = true, textClass = '' }) {
  return (
    <div className="flex items-center gap-2">
      <img src="/ra-icon.png" alt="Referee Abroad" width={size} height={size} className="block select-none" style={{ width: size, height: size }} />
      {showText && (
        <div className={`leading-none font-extrabold ${textClass}`}>
          <span className="text-ink">Referee </span>
          <span className="text-brand">abroad</span>
        </div>
      )}
    </div>
  )
}
