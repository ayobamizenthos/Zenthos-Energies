import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { ProductCard } from '@/components/product/ProductCard'
import { HeroCarousel } from '@/components/home/HeroCarousel'
import { StorePromos } from '@/components/home/StorePromos'

export default function HomePage() {
  const { products: featured, loading } = useProducts({ featuredOnly: true, sort: 'rating' })
  const { products: bestSellers } = useProducts({ sort: 'rating' })
  const { categories } = useCategories()

  if (loading && featured.length === 0) return <HomeSkeleton />

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <HeroCarousel products={featured} />

      <section>
        <h2 className="mb-3 text-lg font-bold">Shop by Category</h2>
        <div className="no-scrollbar -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
          {categories.map(category => (
            <Link
              key={category.slug}
              to={`/shop?category=${category.slug}`}
              className="flex h-14 min-w-[128px] shrink-0 items-center justify-center rounded-xl border border-line bg-white px-4 text-center text-body font-semibold text-ink shadow-card transition-colors hover:border-burgundy hover:text-burgundy"
            >
              {category.label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Best Sellers</h2>
          <Link
            to="/shop"
            className="flex items-center gap-1 text-body font-semibold text-burgundy"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {[bestSellers.slice(0, 8), bestSellers.slice(8, 16)].map(
            (row, index) =>
              row.length > 0 && (
                <div key={index} className="no-scrollbar flex snap-x gap-3 overflow-x-auto pb-1">
                  {row.map(product => (
                    <div key={product.id} className="w-40 shrink-0 snap-start sm:w-48">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )
          )}
        </div>
      </section>

      <StorePromos />
    </div>
  )
}

function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-64 animate-pulse rounded-3xl bg-line/60 sm:h-80" />
      <div className="flex gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 w-32 animate-pulse rounded-xl bg-line/60" />
        ))}
      </div>
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-60 w-40 animate-pulse rounded-2xl bg-line/60 sm:w-48" />
        ))}
      </div>
    </div>
  )
}
