import type { Metadata } from 'next'
import { Suspense } from 'react'
import ShopScreen from './ShopScreen'

export const metadata: Metadata = {
  title: 'Shop Solar Equipment in Lagos',
  description:
    'Browse Cworth, itel, Luminous and HAISIC inverters, lithium batteries, solar panels, solar generators and cables. Same-day delivery across Lagos.',
  alternates: { canonical: '/shop' },
}

export default function Page() {
  return (
    <Suspense>
      <ShopScreen />
    </Suspense>
  )
}
