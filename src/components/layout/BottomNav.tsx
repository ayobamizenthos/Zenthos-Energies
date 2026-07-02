import { NavLink } from 'react-router-dom'
import { Home, Store, Calculator, Package, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

const tabs: { to: string; label: string; icon: LucideIcon; highlight?: boolean }[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/shop', label: 'Shop', icon: Store },
  { to: '/calculator', label: 'Calculator', icon: Calculator, highlight: true },
  { to: '/orders', label: 'Orders', icon: Package },
  { to: '/account', label: 'Account', icon: User },
]

export function BottomNav() {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white md:hidden">
      <div className="mx-auto flex max-w-app items-stretch justify-around">
        {tabs.map(({ to, label, icon: Icon, highlight }) =>
          highlight ? (
            <NavLink
              key={to}
              to={to}
              className="flex flex-1 flex-col items-center gap-1 py-1.5 text-[11px] font-semibold text-burgundy"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-burgundy text-white shadow-pop">
                <Icon size={20} />
              </span>
              {label}
            </NavLink>
          ) : (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors',
                  isActive ? 'text-burgundy' : 'text-ink-muted'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} className={cn(isActive && 'fill-burgundy/10')} />
                  {label}
                </>
              )}
            </NavLink>
          )
        )}
      </div>
    </nav>
  )
}
