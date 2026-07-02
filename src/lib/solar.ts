import type { Product } from './types'

export const LAGOS_PEAK_SUN_HOURS = 4.5
const BATTERY_BUFFER = 1.5
const SYSTEM_VOLTAGE = 48
const BATTERY_DOD = 0.8
const INVERTER_HEADROOM = 1.25
const PANEL_WATT = 550

export interface ApplianceLoad {
  id: string
  name: string
  watts: number
  hours: number
  quantity: number
}

export interface SolarRecommendation {
  dailyLoadWh: number
  peakPowerW: number
  batteryCapacityWh: number
  batteryAh: number
  inverterSizeKva: number
  panelCount: number
  panelArrayW: number
  monthlyGenerationKwh: number
}

export function computeRecommendation(loads: ApplianceLoad[]): SolarRecommendation {
  const dailyLoadWh = loads.reduce((sum, item) => sum + item.watts * item.hours * item.quantity, 0)
  const peakPowerW = loads.reduce((sum, item) => sum + item.watts * item.quantity, 0)

  const batteryCapacityWh = dailyLoadWh * BATTERY_BUFFER
  const batteryAh = batteryCapacityWh / (SYSTEM_VOLTAGE * BATTERY_DOD)

  const inverterSizeKva = Math.max(1, (peakPowerW * INVERTER_HEADROOM) / 1000 / 0.8)

  const panelArrayW = dailyLoadWh > 0 ? (dailyLoadWh / LAGOS_PEAK_SUN_HOURS) * 1.2 : 0
  const panelCount = Math.ceil(panelArrayW / PANEL_WATT)

  const monthlyGenerationKwh = (panelCount * PANEL_WATT * LAGOS_PEAK_SUN_HOURS * 30) / 1000

  return {
    dailyLoadWh,
    peakPowerW,
    batteryCapacityWh,
    batteryAh: Math.ceil(batteryAh),
    inverterSizeKva: Math.ceil(inverterSizeKva * 2) / 2,
    panelCount,
    panelArrayW: Math.round(panelArrayW),
    monthlyGenerationKwh: Math.round(monthlyGenerationKwh),
  }
}

export const DEFAULT_APPLIANCES: Omit<ApplianceLoad, 'id'>[] = [
  { name: 'LED Lights', watts: 15, hours: 6, quantity: 8 },
  { name: 'Refrigerator', watts: 150, hours: 12, quantity: 1 },
  { name: 'Television', watts: 100, hours: 6, quantity: 1 },
  { name: 'Air Conditioner', watts: 900, hours: 6, quantity: 1 },
  { name: 'Ceiling Fan', watts: 75, hours: 8, quantity: 3 },
  { name: 'Laptop', watts: 65, hours: 5, quantity: 1 },
]

export const PRESETS: Record<string, Omit<ApplianceLoad, 'id'>[]> = {
  '3-Bedroom Home': DEFAULT_APPLIANCES,
  'Office Setup': [
    { name: 'LED Lights', watts: 15, hours: 9, quantity: 12 },
    { name: 'Desktop + Monitor', watts: 200, hours: 9, quantity: 4 },
    { name: 'Air Conditioner (1HP)', watts: 900, hours: 8, quantity: 2 },
    { name: 'Printer', watts: 350, hours: 1, quantity: 1 },
    { name: 'Router', watts: 20, hours: 24, quantity: 1 },
  ],
  'Small Shop': [
    { name: 'LED Lights', watts: 15, hours: 10, quantity: 6 },
    { name: 'Chest Freezer', watts: 200, hours: 12, quantity: 2 },
    { name: 'Sound System', watts: 120, hours: 8, quantity: 1 },
    { name: 'Standing Fan', watts: 70, hours: 10, quantity: 2 },
  ],
  Industrial: [
    { name: 'LED Floodlights', watts: 100, hours: 12, quantity: 10 },
    { name: 'Air Conditioner (2HP)', watts: 1800, hours: 10, quantity: 4 },
    { name: 'Industrial Fan', watts: 300, hours: 10, quantity: 6 },
    { name: 'Machinery', watts: 3000, hours: 8, quantity: 2 },
  ],
}

export interface Recommendation {
  product: Product
  quantity: number
  note?: string
}

function smallestCovering(list: Product[], field: 'capacity_kwh' | 'power_kva', need: number) {
  const withField = list
    .filter(p => p[field] != null)
    .sort((a, b) => (a[field] as number) - (b[field] as number))
  return withField.find(p => (p[field] as number) >= need) ?? withField[withField.length - 1]
}

export function recommendProducts(products: Product[], loads: ApplianceLoad[]): Recommendation[] {
  const rec = computeRecommendation(loads)
  const dailyKwh = rec.dailyLoadWh / 1000
  if (dailyKwh <= 0) return []

  const inStock = products.filter(p => p.in_stock)
  const inCategory = (slug: string) => inStock.filter(p => p.category === slug)
  const cable = inStock.find(p => p.cable_pricing != null)
  const result: Recommendation[] = []

  if (dailyKwh <= 1) {
    const tank = smallestCovering(inCategory('powertanks'), 'capacity_kwh', dailyKwh)
    if (tank) result.push({ product: tank, quantity: 1, note: 'All-in-one for your load' })

    const panel = inCategory('solar-panels')
      .filter(p => p.wattage != null)
      .sort((a, b) => (a.wattage as number) - (b.wattage as number))[0]
    if (panel) result.push({ product: panel, quantity: 1 })

    if (cable) result.push({ product: cable, quantity: 1, note: 'Recommended gauge: 4mm' })
    return result
  }

  const storageNeededKwh = dailyKwh * 1.3

  const inverter = smallestCovering(inCategory('inverters'), 'power_kva', rec.inverterSizeKva)
  if (inverter)
    result.push({ product: inverter, quantity: 1, note: `${rec.inverterSizeKva}kVA needed` })

  const battery = inCategory('solar-batteries')
    .filter(p => p.capacity_kwh != null)
    .sort((a, b) => (b.capacity_kwh as number) - (a.capacity_kwh as number))[0]
  if (battery) {
    const qty = Math.max(1, Math.ceil(storageNeededKwh / (battery.capacity_kwh as number)))
    result.push({
      product: battery,
      quantity: qty,
      note: `covers ~${storageNeededKwh.toFixed(1)}kWh storage`,
    })
  }

  const panel = inCategory('solar-panels')
    .filter(p => p.wattage != null)
    .sort((a, b) => (b.wattage as number) - (a.wattage as number))[0]
  if (panel) {
    const qty = Math.max(1, Math.ceil(rec.panelArrayW / (panel.wattage as number)))
    result.push({
      product: panel,
      quantity: qty,
      note: `${qty} panels for ~${(rec.panelArrayW / 1000).toFixed(1)}kW array`,
    })
  }

  if (cable) result.push({ product: cable, quantity: 1, note: 'Recommended gauge: 6mm' })
  return result
}
