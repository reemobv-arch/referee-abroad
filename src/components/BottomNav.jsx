import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Trophy, MessageCircle, ShoppingBag, ExternalLink } from 'lucide-react'

const SHOP_URL = 'https://refereeabroad.com/referee-abroad-shop/'

function Football({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5l4 2.9-1.5 4.6h-5L8 10.4z" />
      <path d="M12 3v4.5M4.7 9.2l3.3 1.2M19.3 9.2 16 10.4M7.5 20 9 15M16.5 20 15 15" />
    </svg>
  )
}

const tabs = [
  { to: '/home', label: 'Home', Icon: Home, end: true },
  { to: '/tournaments', label: 'Tournaments', Icon: Trophy },
  { to: '/matches', label: 'Matches', Icon: Football },
  { to: '/chats', label: 'Chat', Icon: MessageCircle },
]

export default function BottomNav() {
  // Leaving to the external webshop asks first, so the referee does not leave
  // the app by accident. "No, go back" just closes and keeps the current page.
  const [askShop, setAskShop] = useState(false)

  return (
    <>
      <nav aria-label="Main" className="shrink-0 bg-white border-t border-neutral-200">
        <div className="flex justify-around px-1 pt-2 pb-5">
          {tabs.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="flex flex-col items-center gap-1 flex-1 py-1">
              {({ isActive }) => (
                <>
                  <span className={`flex items-center justify-center h-8 w-12 rounded-2xl transition ${isActive ? 'bg-brand-light text-brand-dark' : 'text-neutral-500'}`}>
                    <Icon size={22} strokeWidth={2.2} />
                  </span>
                  <span className={`text-[11px] font-bold ${isActive ? 'text-brand-dark' : 'text-neutral-500'}`}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
          {/* External: Referee Abroad webshop (merchandise) — confirm before leaving. */}
          <button onClick={() => setAskShop(true)} aria-label="Shop (opens the Referee Abroad webshop)" className="flex flex-col items-center gap-1 flex-1 py-1">
            <span className="flex items-center justify-center h-8 w-12 rounded-2xl text-neutral-500">
              <ShoppingBag size={22} strokeWidth={2.2} aria-hidden="true" />
            </span>
            <span className="text-[11px] font-bold text-neutral-500">Shop</span>
          </button>
        </div>
      </nav>

      {askShop && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-6 sm:pb-4" onClick={() => setAskShop(false)}>
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-11 h-11 rounded-2xl bg-brand-light text-brand-dark flex items-center justify-center"><ExternalLink size={20} /></div>
            <h3 className="mt-3 text-lg font-extrabold text-ink">Leaving the app</h3>
            <p className="mt-1.5 text-sm text-neutral-600 font-medium leading-relaxed">You're being redirected to the Referee Abroad webshop and will leave the app. Do you want to continue?</p>
            <div className="flex flex-col gap-2.5 mt-5">
              <a href={SHOP_URL} className="h-12 rounded-full bg-brand text-white font-bold flex items-center justify-center gap-2 active:scale-[0.99]">Yes, continue</a>
              <button onClick={() => setAskShop(false)} className="h-12 rounded-full border border-neutral-200 text-neutral-700 font-bold">No, go back</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
