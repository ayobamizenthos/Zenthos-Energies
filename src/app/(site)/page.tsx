import type { Metadata } from 'next'
import HomeScreen from './HomeScreen'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default function Page() {
  return (
    <>
      <h1 className="sr-only">
        Zenthos Energies — solar inverters, lithium batteries, panels and solar generators in Lagos
      </h1>
      <HomeScreen />
    </>
  )
}
