import { NavLink } from 'react-router-dom'
import { Home, Trophy, FileText, MessageCircle, User } from 'lucide-react'

const tabs = [
  { to: '/home', label: 'Home', Icon: Home, end: true },
  { to: '/tournaments', label: 'Tournaments', Icon: Trophy },
  { to: '/documents', label: 'Documents', Icon: FileText },
  { to: '/chats', label: 'Chat', Icon: MessageCircle },
  { to: '/profile', label: 'Profile', Icon: User },
]

export default function BottomNav() {
  return (
    <nav className="shrink-0 bg-white border-t border-neutral-200">
      <div className="flex justify-around px-1 pt-1.5 pb-4">
        {tabs.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="flex flex-col items-center gap-0.5 w-1/5 py-1"
          >
            {({ isActive }) => (
              <>
                <Icon size={22} className={isActive ? 'text-brand' : 'text-neutral-400'} strokeWidth={2} />
                <span className={`text-[10px] font-medium truncate max-w-full ${isActive ? 'text-brand' : 'text-neutral-400'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
