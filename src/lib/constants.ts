export const STORE = {
  name: 'Zenthos Energies',
  tagline: 'Premium Solar Solutions',
  freeDeliveryThreshold: 900_000,
  expressDeliveryFee: 35_000,
  installationFee: 50_000,
  whatsappNumber: '2348115383780',
  supportEmail: 'support@zenthosenergies.com',
} as const

export const CABLE_PRICING: Record<string, number> = {
  '4mm': 2_000,
  '6mm': 4_500,
}

export type CableGauge = string

export const ORDER_STATUSES = [
  'pending',
  'processing',
  'out_for_delivery',
  'delivered',
  'completed',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; description: string }> = {
  pending: { label: 'Pending', description: 'Awaiting payment verification' },
  processing: { label: 'Processing', description: 'Your order is being prepared' },
  out_for_delivery: { label: 'Out for Delivery', description: 'In transit to your address' },
  delivered: { label: 'Delivered', description: 'Reached your address' },
  completed: { label: 'Completed', description: 'Order fully finished' },
}

export type PaymentStatus = 'pending' | 'verified' | 'failed'

export type NotificationType =
  | 'payment_verified'
  | 'processing'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'installation'
  | 'new_order'
