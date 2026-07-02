import { Link } from 'react-router-dom'
import { Calculator, Truck, Wrench, Zap } from 'lucide-react'
import { STORE } from '@/lib/constants'
import { formatNaira } from '@/lib/format'

export function StorePromos() {
  return (
    <>
      <section className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-ink to-[#2a2a2a] p-6 text-white shadow-pop sm:p-8">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-burgundy/30 blur-2xl" />
        <div className="relative flex flex-col items-start gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-burgundy text-white">
            <Calculator size={24} />
          </span>
          <h2 className="text-xl font-bold text-white sm:text-2xl">Not sure what you need?</h2>
          <p className="max-w-md text-body text-white opacity-80">
            Use our Solar Calculator to size your system in seconds. Enter your appliances and get
            the exact battery, inverter, and panels recommended for your home.
          </p>
          <Link
            to="/calculator"
            className="mt-1 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-6 font-semibold text-ink transition-transform active:scale-95"
          >
            <Zap size={18} className="text-burgundy" /> Calculate My System
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl bg-burgundy px-5 py-5 text-white">
          <Truck size={26} />
          <div>
            <p className="font-bold">Free Delivery</p>
            <p className="text-body opacity-90">
              On orders over {formatNaira(STORE.freeDeliveryThreshold)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-white px-5 py-5 shadow-card">
          <Wrench size={26} className="text-burgundy" />
          <div>
            <p className="font-bold text-ink">Professional Installation</p>
            <p className="text-body text-ink-muted">
              Expert setup available for {formatNaira(STORE.installationFee)}
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
