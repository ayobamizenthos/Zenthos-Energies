import { Link, NavLink } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/stores/auth'
import { cn } from '@/lib/cn'

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/calculator', label: 'Calculator' },
  { to: '/orders', label: 'Orders' },
  { to: '/account', label: 'Account' },
]

export function Header() {
  const { session } = useAuth()
  const { unreadCount } = useNotifications()

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
      <div className="app-shell flex h-14 items-center justify-between gap-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <img
            src="/zenthoslab-logo.png"
            alt="Zenthos Energies"
            className="h-9 w-9 shrink-0 object-contain brightness-0"
          />
          <span className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight text-ink">Zenthos</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-burgundy">
              Energies
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-body font-medium transition-colors',
                  isActive ? 'bg-burgundy-tint text-burgundy' : 'text-ink hover:bg-line/60'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 md:ml-2">
          {session && (
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-line/60"
            >
              <Bell size={20} className="text-ink" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-burgundy px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
