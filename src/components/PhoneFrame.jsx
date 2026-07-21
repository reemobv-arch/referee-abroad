import { useState, useEffect } from 'react'
import { Wifi } from 'lucide-react'

const W = 414
const H = 882

function useViewport() {
  const [v, setV] = useState({ w: window.innerWidth, h: window.innerHeight })
  useEffect(() => {
    const onResize = () => setV({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return v
}

function SignalBars() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true">
      <rect x="0" y="8" width="3" height="4" rx="1" />
      <rect x="5" y="5" width="3" height="7" rx="1" />
      <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
      <rect x="15" y="0" width="3" height="12" rx="1" />
    </svg>
  )
}

function Battery() {
  return (
    <svg width="26" height="13" viewBox="0 0 26 13" aria-hidden="true">
      <rect x="0.5" y="0.5" width="21" height="12" rx="3.5" fill="none" stroke="currentColor" strokeOpacity="0.4" />
      <rect x="2" y="2" width="16" height="9" rx="2" fill="currentColor" />
      <rect x="23" y="4" width="1.8" height="5" rx="0.9" fill="currentColor" fillOpacity="0.4" />
    </svg>
  )
}

function StatusBar() {
  return (
    <div className="relative h-12 shrink-0 flex items-end justify-between px-7 pb-1.5 z-40 text-ink">
      <span className="text-[15px] font-semibold tracking-tight">9:41</span>
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[118px] h-[34px] bg-black rounded-full" />
      <span className="flex items-center gap-1.5">
        <SignalBars />
        <Wifi size={16} strokeWidth={2.5} />
        <Battery />
      </span>
    </div>
  )
}

export default function PhoneFrame({ children }) {
  const { w, h } = useViewport()
  const framed = w >= 520 && h >= 640

  if (!framed) {
    return (
      <div className="w-full h-[100dvh] bg-page overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col">{children}</div>
      </div>
    )
  }

  const scale = Math.min(1, (w - 48) / W, (h - 48) / H)

  return (
    <div className="fixed inset-0 bg-neutral-800 flex items-center justify-center overflow-hidden">
      <div style={{ transform: `scale(${scale})` }} className="origin-center">
        <div className="w-[414px] h-[882px] bg-black rounded-[58px] p-[13px] shadow-[0_40px_90px_-20px_rgba(0,0,0,0.7)] ring-1 ring-neutral-700/60">
          <div className="relative w-[388px] h-[856px] rounded-[46px] overflow-hidden bg-page flex flex-col">
            <StatusBar />
            <div className="flex-1 min-h-0 flex flex-col">{children}</div>
            <div className="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[134px] h-[5px] rounded-full bg-ink/25 z-50" />
          </div>
        </div>
      </div>
    </div>
  )
}
