import { NavLink } from 'react-router-dom'
import { Home, Store, Calculator, Package, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

const tabs: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/shop', label: 'Shop', icon: Store },
  { to: '/calculator', label: 'Calculator', icon: Calculator },
  { to: '/orders', label: 'Orders', icon: Package },
  { to: '/account', label: 'Account', icon: User },
]

export function BottomNav() {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white md:hidden">
      <div className="mx-auto flex max-w-app items-stretch justify-around">
        {tabs.map(({ to, label, icon: Icon }) => (
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
        ))}
      </div>
    </nav>
  )
}
