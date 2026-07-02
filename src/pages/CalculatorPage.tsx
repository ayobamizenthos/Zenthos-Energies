import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Minus, Plus, Trash2, Zap } from 'lucide-react'
import { computeRecommendation, recommendProducts, type ApplianceLoad } from '@/lib/solar'
import { APPLIANCES } from '@/lib/appliances'
import { STORE } from '@/lib/constants'
import { useProducts } from '@/hooks/useProducts'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/product/ProductCard'
import { SolarFaq } from '@/components/home/SolarFaq'

interface ApplianceRow {
  id: string
  name: string
  icon: string | null
  watts: string
  hours: string
  quantity: string
}

let idCounter = 0
const num = (value: string) => Math.max(0, Number(value) || 0)

export default function CalculatorPage() {
  const [rows, setRows] = useState<ApplianceRow[]>([])
  const [showResults, setShowResults] = useState(false)
  const { products } = useProducts()
  const resultsRef = useRef<HTMLDivElement>(null)

  const loads: ApplianceLoad[] = useMemo(
    () =>
      rows.map(row => ({
        id: row.id,
        name: row.name,
        watts: num(row.watts),
        hours: num(row.hours),
        quantity: num(row.quantity),
      })),
    [rows]
  )

  const recommendation = useMemo(() => computeRecommendation(loads), [loads])
  const recommended = useMemo(() => recommendProducts(products, loads), [products, loads])
  const hasLoad = recommendation.dailyLoadWh > 0

  const countFor = (name: string) =>
    rows.filter(row => row.name === name).reduce((sum, row) => sum + num(row.quantity), 0)

  const addAppliance = (name: string) => {
    const preset = APPLIANCES.find(item => item.name === name)
    setRows(prev => {
      const existing = prev.find(row => row.name === name)
      if (existing) {
        return prev.map(row =>
          row.id === existing.id ? { ...row, quantity: String(num(row.quantity) + 1) } : row
        )
      }
      return [
        ...prev,
        {
          id: `load-${idCounter++}`,
          name,
          icon: preset?.icon ?? null,
          watts: String(preset?.watts ?? 100),
          hours: String(preset?.hours ?? 4),
          quantity: '1',
        },
      ]
    })
  }

  const decrement = (name: string) =>
    setRows(prev =>
      prev.flatMap(row => {
        if (row.name !== name) return [row]
        const next = num(row.quantity) - 1
        return next <= 0 ? [] : [{ ...row, quantity: String(next) }]
      })
    )

  const update = (id: string, patch: Partial<ApplianceRow>) =>
    setRows(prev => prev.map(row => (row.id === id ? { ...row, ...patch } : row)))

  const remove = (id: string) => setRows(prev => prev.filter(row => row.id !== id))

  const addCustom = () =>
    setRows(prev => [
      ...prev,
      {
        id: `load-${idCounter++}`,
        name: 'Other Appliance',
        icon: null,
        watts: '100',
        hours: '4',
        quantity: '1',
      },
    ])

  const viewRecommended = () => {
    setShowResults(true)
    requestAnimationFrame(() =>
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold">Solar System Calculator</h1>
        <p className="text-body text-ink-muted">
          Tap the appliances you use, then fine-tune the details.
        </p>
      </header>

      <section className="rounded-2xl border border-line bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-body font-semibold">
            <span className="mr-2 rounded-md bg-burgundy px-2 py-0.5 text-label text-white">
              STEP 1
            </span>
            Tap to add
          </p>
          {rows.length > 0 && (
            <button
              type="button"
              onClick={() => setRows([])}
              className="text-label font-semibold text-ink-muted hover:text-danger"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {APPLIANCES.map(item => {
            const count = countFor(item.name)
            return (
              <div key={item.name} className="relative">
                <button
                  type="button"
                  onClick={() => addAppliance(item.name)}
                  className={cn(
                    'flex w-full flex-col items-center gap-1 rounded-xl border p-2 transition-colors active:scale-95',
                    count > 0
                      ? 'border-burgundy bg-burgundy-tint'
                      : 'border-line bg-white hover:border-burgundy/50'
                  )}
                >
                  <img
                    src={item.icon}
                    alt={item.name}
                    loading="lazy"
                    className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                  />
                  <span className="text-center text-[11px] font-medium leading-tight text-ink">
                    {item.name}
                  </span>
                </button>
                {count > 0 && (
                  <button
                    type="button"
                    onClick={() => decrement(item.name)}
                    aria-label={`Reduce ${item.name}`}
                    className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-burgundy text-[11px] font-bold text-white shadow-card"
                  >
                    {count}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <Button variant="secondary" size="sm" onClick={addCustom} className="mt-3">
          <Plus size={16} /> Add other appliance
        </Button>
      </section>

      {rows.length > 0 && (
        <section className="flex flex-col gap-3">
          <p className="text-body font-semibold">
            <span className="mr-2 rounded-md bg-burgundy px-2 py-0.5 text-label text-white">
              STEP 2
            </span>
            Verify your load
          </p>

          {rows.map(row => (
            <div key={row.id} className="rounded-2xl border border-line bg-white p-3">
              <div className="mb-2 flex items-center gap-2">
                {row.icon && (
                  <img src={row.icon} alt="" className="h-8 w-8 shrink-0 object-contain" />
                )}
                <input
                  value={row.name}
                  onChange={e => update(row.id, { name: e.target.value })}
                  aria-label="Appliance name"
                  className="min-w-0 flex-1 border-b border-transparent bg-transparent font-semibold outline-none focus:border-burgundy"
                />
                <button
                  type="button"
                  onClick={() => remove(row.id)}
                  aria-label="Remove"
                  className="shrink-0 text-ink-muted hover:text-danger"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <NumberField
                  label="Qty"
                  value={row.quantity}
                  onChange={v => update(row.id, { quantity: v })}
                />
                <NumberField
                  label="Watts"
                  value={row.watts}
                  onChange={v => update(row.id, { watts: v })}
                />
                <NumberField
                  label="Hrs/day"
                  value={row.hours}
                  onChange={v => update(row.id, { hours: v })}
                />
              </div>
            </div>
          ))}
        </section>
      )}

      {hasLoad && (
        <section className="flex flex-col gap-3 rounded-2xl bg-burgundy p-5 text-white">
          <div className="flex items-center gap-2">
            <Zap size={20} />
            <h2 className="font-bold text-white">Your Solar Recommendation</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Result
              label="Total Daily Load"
              value={`${(recommendation.dailyLoadWh / 1000).toFixed(1)} kWh`}
            />
            <Result
              label="Peak Power Draw"
              value={`${(recommendation.peakPowerW / 1000).toFixed(1)} kW`}
            />
            <Result label="Battery Capacity" value={`${recommendation.batteryAh} Ah @ 48V`} />
            <Result label="Inverter Size" value={`${recommendation.inverterSizeKva} kVA`} />
            <Result label="Solar Panels" value={`~${recommendation.panelCount} panels`} />
            <Result
              label="Est. Monthly Output"
              value={`${recommendation.monthlyGenerationKwh} kWh`}
            />
          </div>
        </section>
      )}

      {!hasLoad && (
        <p className="rounded-2xl border border-dashed border-line bg-white p-6 text-center text-body text-ink-muted">
          Tap an appliance above to build your system.
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          fullWidth
          size="lg"
          onClick={viewRecommended}
          disabled={!hasLoad}
          className="flex-1"
        >
          View Recommended Products
        </Button>
        <a
          href={`https://wa.me/${STORE.whatsappNumber}`}
          target="_blank"
          rel="noreferrer"
          className="flex-1"
        >
          <Button fullWidth size="lg" variant="secondary">
            <MessageCircle size={18} /> Get Expert Advice
          </Button>
        </a>
      </div>

      {showResults && hasLoad && (
        <section ref={resultsRef} className="flex scroll-mt-20 flex-col gap-3">
          <h2 className="text-xl font-bold">Recommended Products</h2>
          {recommended.length === 0 ? (
            <p className="rounded-2xl border border-line bg-white p-6 text-center text-body text-ink-muted">
              No matching products yet. Contact us for a custom quote.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {recommended.map(({ product, quantity, note }) => (
                <div key={product.id} className="flex min-w-0 flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-burgundy px-2 py-0.5 text-label font-semibold text-white">
                      {quantity > 1 ? `Qty ${quantity}` : 'Recommended'}
                    </span>
                    {note && <span className="text-label text-ink-muted">{note}</span>}
                  </div>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
          <Link to="/shop" className="text-center text-body font-semibold text-burgundy">
            Browse the full shop
          </Link>
        </section>
      )}

      <SolarFaq />
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const step = (delta: number) => onChange(String(Math.max(0, (Number(value) || 0) + delta)))
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-label text-ink-muted">{label}</span>
      <div className="flex items-center rounded-lg border border-line">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label={`Decrease ${label}`}
          className="grid h-10 w-8 shrink-0 place-items-center text-ink-muted active:scale-90"
        >
          <Minus size={14} />
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={e => onChange(e.target.value.replace(/[^0-9.]/g, ''))}
          className="min-w-0 flex-1 bg-transparent py-2 text-center text-body outline-none"
        />
        <button
          type="button"
          onClick={() => step(1)}
          aria-label={`Increase ${label}`}
          className="grid h-10 w-8 shrink-0 place-items-center text-ink-muted active:scale-90"
        >
          <Plus size={14} />
        </button>
      </div>
    </label>
  )
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-label opacity-80">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  )
}
