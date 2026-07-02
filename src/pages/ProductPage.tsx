import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Heart, Minus, Plus, ChevronDown } from 'lucide-react'
import { useProduct, useProducts } from '@/hooks/useProducts'
import { formatNaira } from '@/lib/format'
import { CABLE_PRICING } from '@/lib/constants'
import type { CableGauge } from '@/lib/constants'
import type { CablePricing } from '@/lib/types'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { StarRating } from '@/components/ui/StarRating'
import { StockBadge, stockLevel } from '@/components/ui/StockBadge'
import { ProductCard } from '@/components/product/ProductCard'
import { PageSpinner } from '@/components/ui/PageSpinner'
import { useCart } from '@/stores/cart'
import { useWishlist } from '@/stores/wishlist'

export default function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { product, loading } = useProduct(slug)
  const { products: sameCategory } = useProducts({ category: product?.category, sort: 'rating' })
  const { products: cables } = useProducts({ category: 'solar-cables' })
  const addItem = useCart(s => s.addItem)
  const { has, toggle } = useWishlist()

  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [gauge, setGauge] = useState<CableGauge>('4mm')
  const [yards, setYards] = useState('5')
  const [descOpen, setDescOpen] = useState(false)
  const [added, setAdded] = useState(false)

  if (loading) return <PageSpinner />
  if (!product) return <p className="py-16 text-center">Product not found.</p>

  const isCable = product.cable_pricing != null
  const cablePricing = (product.cable_pricing as CablePricing | null) ?? CABLE_PRICING
  const level = stockLevel(product)
  const specs = (product.specs ?? {}) as Record<string, string>
  const saved = has(product.id)

  const relatedBase = sameCategory.filter(p => p.id !== product.id)
  const cable = cables.find(c => c.id !== product.id)
  const related =
    !isCable && cable && !relatedBase.some(p => p.id === cable.id)
      ? [...relatedBase, cable]
      : relatedBase

  const yardsNum = Math.max(0, Number(yards) || 0)
  const cableTotal = cablePricing[gauge] * yardsNum

  const handleAdd = () => {
    if (isCable) {
      if (yardsNum <= 0) return
      addItem({
        kind: 'cable',
        productId: product.id,
        name: `${product.name} (${gauge})`,
        image: product.images[0] ?? null,
        category: product.category,
        isCombo: product.is_combo,
        gauge,
        pricePerYard: cablePricing[gauge],
        yards: yardsNum,
      })
    } else {
      addItem({
        kind: 'product',
        productId: product.id,
        name: product.name,
        image: product.images[0] ?? null,
        category: product.category,
        isCombo: product.is_combo,
        unitPrice: product.price,
        quantity,
      })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="aspect-square overflow-hidden rounded-2xl border border-line bg-burgundy-tint/30">
            <img
              src={product.images[activeImage] ?? ''}
              alt={product.name}
              className="h-full w-full object-contain p-3"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2',
                    i === activeImage ? 'border-burgundy' : 'border-line'
                  )}
                >
                  <img src={img} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {product.brand && (
            <span className="text-body font-medium text-ink-muted">{product.brand}</span>
          )}
          <h1 className="text-2xl font-bold leading-tight">{product.name}</h1>
          <div className="flex items-center gap-3">
            <StarRating rating={product.rating} size={16} />
            <StockBadge level={level} />
          </div>

          <p className="text-3xl font-bold text-burgundy">
            {isCable ? `${formatNaira(cablePricing[gauge])} / yard` : formatNaira(product.price)}
          </p>

          {product.description && (
            <div>
              <p className={cn('text-body text-ink-muted', !descOpen && 'line-clamp-2')}>
                {product.description}
              </p>
              <button
                onClick={() => setDescOpen(v => !v)}
                className="mt-1 flex items-center gap-1 text-body font-semibold text-burgundy"
              >
                {descOpen ? 'Show less' : 'Read more'}
                <ChevronDown
                  size={15}
                  className={cn('transition-transform', descOpen && 'rotate-180')}
                />
              </button>
            </div>
          )}

          {isCable ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-line p-4">
              <div>
                <label className="mb-1 block text-body font-semibold">Gauge / Size</label>
                <div className="flex gap-2">
                  {(Object.keys(cablePricing) as CableGauge[]).map(g => (
                    <button
                      key={g}
                      onClick={() => setGauge(g)}
                      className={cn(
                        'flex-1 rounded-xl border py-2 font-semibold transition-colors',
                        gauge === g ? 'border-burgundy bg-burgundy text-white' : 'border-line'
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-body font-semibold">Yards Needed</label>
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={yards}
                  onChange={e => setYards(e.target.value)}
                  className="h-11 w-full rounded-xl border border-line px-3 outline-none focus:border-burgundy"
                />
              </div>
              <div className="flex items-center justify-between border-t border-line pt-3">
                <span className="text-body text-ink-muted">Total</span>
                <span className="text-xl font-bold text-burgundy">{formatNaira(cableTotal)}</span>
              </div>
              <p className="text-label text-ink-muted">
                Need help calculating cable length? Contact support.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-body font-semibold">Quantity</span>
              <div className="flex items-center rounded-xl border border-line">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="grid h-10 w-10 place-items-center"
                  aria-label="Decrease"
                >
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="grid h-10 w-10 place-items-center"
                  aria-label="Increase"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}

          <div className="mt-2 flex gap-3">
            <Button
              size="lg"
              fullWidth
              onClick={handleAdd}
              disabled={!isCable && level === 'out_of_stock'}
            >
              {added
                ? 'Added ✓'
                : level === 'out_of_stock' && !isCable
                  ? 'Out of Stock'
                  : 'Add to Cart'}
            </Button>
            <button
              type="button"
              onClick={() => toggle(product.id)}
              aria-label={saved ? 'Remove from saved' : 'Save for later'}
              className="grid h-[52px] w-[52px] shrink-0 place-items-center transition-transform active:scale-90"
            >
              <Heart
                size={34}
                strokeWidth={2}
                className={cn('text-burgundy', saved && 'fill-burgundy')}
              />
            </button>
          </div>
        </div>
      </div>

      {Object.keys(specs).length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-bold">Specifications</h2>
          <dl className="overflow-hidden rounded-2xl border border-line">
            {Object.entries(specs).map(([key, value], i) => (
              <div
                key={key}
                className={cn(
                  'flex justify-between px-4 py-3 text-body',
                  i % 2 === 0 && 'bg-burgundy-tint/20'
                )}
              >
                <dt className="font-medium capitalize text-ink-muted">{key}</dt>
                <dd className="font-semibold text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {related.filter(p => p.id !== product.id).length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-bold">People also bought</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {related
              .filter(p => p.id !== product.id)
              .slice(0, 6)
              .map(p => (
                <div key={p.id} className="w-40 shrink-0 sm:w-48">
                  <ProductCard product={p} />
                </div>
              ))}
          </div>
        </section>
      )}

      <button onClick={() => navigate(-1)} className="text-body font-semibold text-burgundy">
        ← Back
      </button>
    </div>
  )
}
