import { Link, Outlet, useLocation } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { PushOptIn } from './PushOptIn'
import { InstallPrompt } from './InstallPrompt'
import { Footer } from './Footer'
import { useCart } from '@/stores/cart'

export function CustomerLayout() {
  const count = useCart(s => s.count())
  const { pathname } = useLocation()
  const hideCartFab = pathname === '/cart' || pathname.startsWith('/checkout')

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <Header />
      <main className="app-shell flex-1 pb-24 pt-4 md:pb-10">
        <Outlet />
      </main>

      <Footer />

      {!hideCartFab && (
        <Link
          to="/cart"
          aria-label="View cart"
          className="fixed bottom-20 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-burgundy text-white shadow-pop md:bottom-8"
        >
          <ShoppingCart size={22} />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full border-2 border-white bg-ink px-1 text-[11px] font-bold text-white">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </Link>
      )}

      <BottomNav />
      <PushOptIn />
      <InstallPrompt />
    </div>
  )
}
