import { NavLink } from 'react-router-dom'
import { Home, Trophy, MessageCircle, User } from 'lucide-react'

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
  { to: '/profile', label: 'Profile', Icon: User },
]

export default function BottomNav() {
  return (
    <nav className="shrink-0 bg-white border-t border-neutral-200">
      <div className="flex justify-around px-1 pt-2 pb-5">
        {tabs.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end} className="flex flex-col items-center gap-1 flex-1 py-1">
            {({ isActive }) => (
              <>
                <span className={`flex items-center justify-center h-8 w-12 rounded-2xl transition ${isActive ? 'bg-brand-light text-brand-dark' : 'text-neutral-400'}`}>
                  <Icon size={22} strokeWidth={2.2} />
                </span>
                <span className={`text-[11px] font-bold ${isActive ? 'text-brand-dark' : 'text-neutral-400'}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
