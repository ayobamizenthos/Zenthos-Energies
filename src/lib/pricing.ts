import { STORE } from './constants'
import type { CartItem } from './types'
import { cartItemTotal } from './types'

export interface OrderTotals {
  subtotal: number
  deliveryFee: number
  installationFee: number
  total: number
  qualifiesForFreeDelivery: boolean
}

const HEAVY_CATEGORIES = ['solar-panels', 'inverters', 'solar-batteries']

export function computeDeliveryFee(items: CartItem[], state: string, subtotal: number): number {
  if (items.length === 0) return 0
  if (subtotal >= STORE.freeDeliveryThreshold) return 0
  if (items.some(item => item.isCombo)) return 70_000

  const normalized = state.trim().toLowerCase()
  const withinZone = normalized.includes('lagos') || normalized.includes('ogun')
  const heavy = items.some(item => HEAVY_CATEGORIES.includes(item.category))

  if (withinZone) return heavy ? 35_000 : 15_000
  return heavy ? 60_000 : 45_000
}

export function calculateTotals(
  items: CartItem[],
  installation: boolean,
  state: string
): OrderTotals {
  const subtotal = items.reduce((sum, item) => sum + cartItemTotal(item), 0)
  const qualifiesForFreeDelivery = subtotal >= STORE.freeDeliveryThreshold
  const deliveryFee = computeDeliveryFee(items, state, subtotal)
  const installationFee = installation ? STORE.installationFee : 0

  return {
    subtotal,
    deliveryFee,
    installationFee,
    total: subtotal + deliveryFee + installationFee,
    qualifiesForFreeDelivery,
  }
}
