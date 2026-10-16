// A flag that renders consistently across browsers (flag-icons SVG sprites,
// unlike flag emoji which do not render on Windows / Firefox / Edge).
// Pass an ISO-2 `code` (preferred) and an `emoji` fallback for when there is no
// code (e.g. the Asia region uses a globe).
export default function Flag({ code, emoji, size = 15, className = '', rounded = true }) {
  if (code) {
    return (
      <span
        className={`fi fi-${code} ${rounded ? 'rounded-[3px]' : ''} ${className}`}
        style={{ fontSize: typeof size === 'number' ? `${size}px` : size, lineHeight: 1, boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)' }}
        aria-hidden="true"
      />
    )
  }
  return (
    <span className={className} style={{ fontSize: typeof size === 'number' ? `${size}px` : size, lineHeight: 1 }} aria-hidden="true">
      {emoji || '🏳️'}
    </span>
  )
}
