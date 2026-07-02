import type { Database } from './database.types'
import type { CableGauge } from './constants'

type Tables = Database['public']['Tables']

export type Product = Tables['products']['Row']
export type Order = Tables['orders']['Row']
export type OrderStatusLog = Tables['order_status_log']['Row']
export type Profile = Tables['profiles']['Row']
export type UserAddress = Tables['user_addresses']['Row']
export type AppNotification = Tables['notifications']['Row']
export type StoreSettings = Tables['store_settings']['Row']

export interface ProductSpecs {
  [key: string]: string
}

export type CablePricing = Record<string, number>

export interface ProductCartItem {
  kind: 'product'
  productId: string
  name: string
  image: string | null
  category: string
  isCombo: boolean
  unitPrice: number
  quantity: number
}

export interface CableCartItem {
  kind: 'cable'
  productId: string
  name: string
  image: string | null
  category: string
  isCombo: boolean
  gauge: CableGauge
  pricePerYard: number
  yards: number
}

export type CartItem = ProductCartItem | CableCartItem

export const cartItemTotal = (item: CartItem): number =>
  item.kind === 'product' ? item.unitPrice * item.quantity : item.pricePerYard * item.yards

export const cartItemKey = (item: CartItem): string =>
  item.kind === 'product' ? `p:${item.productId}` : `c:${item.productId}:${item.gauge}`
