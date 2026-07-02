import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Minus, Plus, SlidersHorizontal } from 'lucide-react'
import type { Product } from '@/lib/types'
import { cartItemKey } from '@/lib/types'
import { formatNaira } from '@/lib/format'
import { cn } from '@/lib/cn'
import { StarRating } from '@/components/ui/StarRating'
import { StockBadge, stockLevel } from '@/components/ui/StockBadge'
import { useCart } from '@/stores/cart'
import { useWishlist } from '@/stores/wishlist'

export function ProductCard({ product }: { product: Product }) {
  const items = useCart(s => s.items)
  const addItem = useCart(s => s.addItem)
  const setQuantity = useCart(s => s.setQuantity)
  const { has, toggle } = useWishlist()
  const [imageLoaded, setImageLoaded] = useState(false)

  const level = stockLevel(product)
  const isCable = product.cable_pricing != null
  const soldOut = level === 'out_of_stock'
  const saved = has(product.id)

  const key = `p:${product.id}`
  const inCart = items.find(item => cartItemKey(item) === key)
  const quantity = inCart && inCart.kind === 'product' ? inCart.quantity : 0

  const add = () =>
    addItem({
      kind: 'product',
      productId: product.id,
      name: product.name,
      image: product.images[0] ?? null,
      category: product.category,
      isCombo: product.is_combo,
      unitPrice: product.price,
      quantity: 1,
    })

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-shadow hover:shadow-pop">
      <button
        type="button"
        onClick={() => toggle(product.id)}
        aria-label={saved ? 'Remove from saved' : 'Save for later'}
        className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center transition-transform active:scale-90"
      >
        <Heart
          size={18}
          className={cn(
            'drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]',
            saved ? 'fill-burgundy text-burgundy' : 'fill-white/30 text-white'
          )}
        />
      </button>

      <Link to={`/product/${product.slug}`} className="block">
        <div
          className={cn(
            'aspect-square overflow-hidden p-2 transition-colors',
            imageLoaded ? 'bg-white' : 'animate-pulse bg-line/50'
          )}
        >
          <img
            src={product.images[0] ?? ''}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
            className={cn(
              'h-full w-full object-contain transition-all duration-300 group-hover:scale-105',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {level !== 'in_stock' && <StockBadge level={level} className="self-start" />}
        <Link
          to={`/product/${product.slug}`}
          className="line-clamp-2 min-h-[2.5rem] text-body font-semibold text-ink"
        >
          {product.name}
        </Link>
        <StarRating rating={product.rating} />

        <span className="mt-1 text-lg font-bold text-burgundy">
          {formatNaira(product.price)}
          {isCable ? <span className="text-body font-medium text-ink-muted">/yd</span> : null}
        </span>

        <div className="mt-1.5">
          {isCable ? (
            <Link
              to={`/product/${product.slug}`}
              className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-burgundy text-body font-semibold text-white transition-transform active:scale-95"
            >
              <SlidersHorizontal size={16} /> Configure
            </Link>
          ) : soldOut ? (
            <button
              type="button"
              disabled
              className="h-10 w-full rounded-xl bg-line text-body font-semibold text-ink-muted"
            >
              Out of Stock
            </button>
          ) : quantity === 0 ? (
            <button
              type="button"
              onClick={add}
              className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-burgundy text-body font-semibold text-white transition-transform active:scale-95"
            >
              <Plus size={16} /> Add to Cart
            </button>
          ) : (
            <div className="flex h-10 items-center justify-between rounded-xl border border-burgundy">
              <button
                type="button"
                onClick={() => setQuantity(key, quantity - 1)}
                aria-label="Decrease quantity"
                className="grid h-full w-11 place-items-center text-burgundy active:scale-90"
              >
                <Minus size={16} />
              </button>
              <span className="text-body font-bold text-burgundy">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(key, quantity + 1)}
                aria-label="Increase quantity"
                className="grid h-full w-11 place-items-center text-burgundy active:scale-90"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
