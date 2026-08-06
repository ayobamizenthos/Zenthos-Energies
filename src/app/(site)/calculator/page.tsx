import type { Metadata } from 'next'
import CalculatorScreen from './CalculatorScreen'

export const metadata: Metadata = {
  title: 'Solar System Calculator',
  description:
    'Size your solar system in seconds. Add your appliances and get the exact battery, inverter and panel recommendations for your home or business.',
  alternates: { canonical: '/calculator' },
}

export default function Page() {
  return <CalculatorScreen />
}
