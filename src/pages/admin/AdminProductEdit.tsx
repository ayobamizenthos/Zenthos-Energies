import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ImageUp, Loader2, Plus, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCategories } from '@/hooks/useCategories'
import { PageSpinner } from '@/components/ui/PageSpinner'
import { Button } from '@/components/ui/Button'

interface SpecRow {
  key: string
  value: string
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export default function AdminProductEdit() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const isNew = !productId

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { categories } = useCategories(true)
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [sku, setSku] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [cost, setCost] = useState('')
  const [stock, setStock] = useState('0')
  const [lowStock, setLowStock] = useState('5')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [specs, setSpecs] = useState<SpecRow[]>([{ key: '', value: '' }])
  const [featured, setFeatured] = useState(false)
  const [inStock, setInStock] = useState(true)
  const [capacityKwh, setCapacityKwh] = useState('')
  const [powerKva, setPowerKva] = useState('')
  const [wattage, setWattage] = useState('')
  const [sellByYard, setSellByYard] = useState(false)
  const [cable4mm, setCable4mm] = useState('2000')
  const [cable6mm, setCable6mm] = useState('4500')
  const [uploading, setUploading] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isNew && !category && categories.length) setCategory(categories[0].slug)
  }, [isNew, category, categories])

  const uploadImages = async (files: FileList) => {
    setUploading(true)
    const uploaded: string[] = []
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file, { contentType: file.type, cacheControl: '31536000' })
      if (!uploadError) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(path)
        uploaded.push(data.publicUrl)
      }
    }
    setImages(prev => [...prev, ...uploaded])
    setUploading(false)
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  useEffect(() => {
    if (isNew) return
    supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()
      .then(({ data }) => {
        if (data) {
          setName(data.name)
          setBrand(data.brand ?? '')
          setSku(data.sku ?? '')
          setCategory(data.category)
          setPrice(String(data.price))
          setCost(data.cost ? String(data.cost) : '')
          setStock(String(data.stock))
          setLowStock(String(data.low_stock_threshold))
          setDescription(data.description ?? '')
          setImages(data.images)
          setFeatured(data.featured)
          setInStock(data.in_stock)
          setCapacityKwh(data.capacity_kwh != null ? String(data.capacity_kwh) : '')
          setPowerKva(data.power_kva != null ? String(data.power_kva) : '')
          setWattage(data.wattage != null ? String(data.wattage) : '')
          const specEntries = Object.entries((data.specs ?? {}) as Record<string, string>)
          setSpecs(
            specEntries.length
              ? specEntries.map(([key, value]) => ({ key, value }))
              : [{ key: '', value: '' }]
          )
          const pricing = data.cable_pricing as { '4mm'?: number; '6mm'?: number } | null
          if (pricing) {
            setSellByYard(true)
            setCable4mm(String(pricing['4mm'] ?? 2000))
            setCable6mm(String(pricing['6mm'] ?? 4500))
          }
        }
        setLoading(false)
      })
  }, [isNew, productId])

  const save = async () => {
    setError('')
    if (!name || !price) {
      setError('Name and price are required.')
      return
    }
    setSaving(true)

    const specObject = Object.fromEntries(
      specs.filter(row => row.key.trim()).map(row => [row.key.trim(), row.value.trim()])
    )

    const payload = {
      name,
      slug: slugify(name) || slugify(`${category}-${Date.now()}`),
      sku: sku || null,
      category,
      brand: brand || null,
      price: Number(price),
      cost: cost ? Number(cost) : null,
      stock: Number(stock),
      low_stock_threshold: Number(lowStock),
      description: description || null,
      images: images.filter(url => url.trim()),
      specs: specObject,
      featured,
      in_stock: inStock,
      capacity_kwh: capacityKwh ? Number(capacityKwh) : null,
      power_kva: powerKva ? Number(powerKva) : null,
      wattage: wattage ? Number(wattage) : null,
      cable_pricing: sellByYard ? { '4mm': Number(cable4mm), '6mm': Number(cable6mm) } : null,
    }

    const result = isNew
      ? await supabase.from('products').insert(payload)
      : await supabase.from('products').update(payload).eq('id', productId)

    setSaving(false)
    if (result.error) {
      setError(result.error.message)
      return
    }
    navigate('/admin/products')
  }

  if (loading) return <PageSpinner />

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Link
        to="/admin/products"
        className="flex items-center gap-1 text-body font-semibold text-burgundy"
      >
        <ArrowLeft size={16} /> Products
      </Link>
      <h1 className="text-2xl font-bold">{isNew ? 'Add Product' : 'Edit Product'}</h1>

      <Field label="Name">
        <input value={name} onChange={e => setName(e.target.value)} className="input" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Brand">
          <input value={brand} onChange={e => setBrand(e.target.value)} className="input" />
        </Field>
        <Field label="SKU">
          <input value={sku} onChange={e => setSku(e.target.value)} className="input" />
        </Field>
      </div>

      <Field label="Category">
        <select value={category} onChange={e => setCategory(e.target.value)} className="input">
          {categories.map(c => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>

      <label className="flex items-center gap-3 rounded-xl border border-line p-3">
        <input
          type="checkbox"
          checked={sellByYard}
          onChange={e => setSellByYard(e.target.checked)}
          className="h-5 w-5 accent-burgundy"
        />
        <span className="font-medium">Sell by the yard (cable pricing with gauge options)</span>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <Field label={sellByYard ? 'Base price / yard (₦)' : 'Selling price (₦)'}>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Cost price (₦)">
          <input
            type="number"
            value={cost}
            onChange={e => setCost(e.target.value)}
            className="input"
          />
        </Field>
      </div>

      {sellByYard ? (
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-line p-3">
          <Field label="4mm price / yard (₦)">
            <input
              type="number"
              value={cable4mm}
              onChange={e => setCable4mm(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="6mm price / yard (₦)">
            <input
              type="number"
              value={cable6mm}
              onChange={e => setCable6mm(e.target.value)}
              className="input"
            />
          </Field>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Stock quantity">
            <input
              type="number"
              value={stock}
              onChange={e => setStock(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Low stock threshold">
            <input
              type="number"
              value={lowStock}
              onChange={e => setLowStock(e.target.value)}
              className="input"
            />
          </Field>
        </div>
      )}

      <Field label="Description">
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-line bg-white p-3 text-body outline-none focus:border-burgundy"
        />
      </Field>

      <div className="flex flex-col gap-2">
        <span className="input-label">Product Images</span>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          aria-label="Upload product images"
          className="hidden"
          onChange={e => e.target.files && uploadImages(e.target.files)}
        />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((url, i) => (
            <div
              key={i}
              className="relative aspect-square overflow-hidden rounded-xl border border-line"
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                aria-label="Remove image"
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-ink shadow-card"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-burgundy/50 bg-burgundy-tint/40 text-burgundy"
          >
            {uploading ? <Loader2 size={20} className="animate-spin" /> : <ImageUp size={20} />}
            <span className="text-label font-semibold">{uploading ? 'Uploading' : 'Upload'}</span>
          </button>
        </div>
        <p className="text-label text-ink-muted">
          First image is the main photo. JPG or PNG, uploaded straight to fast CDN storage.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="input-label">Specifications</span>
        {specs.map((row, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={row.key}
              onChange={e =>
                setSpecs(specs.map((r, idx) => (idx === i ? { ...r, key: e.target.value } : r)))
              }
              placeholder="e.g. Capacity"
              className="input flex-1"
            />
            <input
              value={row.value}
              onChange={e =>
                setSpecs(specs.map((r, idx) => (idx === i ? { ...r, value: e.target.value } : r)))
              }
              placeholder="e.g. 220Ah"
              className="input flex-1"
            />
            <button
              onClick={() => setSpecs(specs.filter((_, idx) => idx !== i))}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line text-ink-muted"
              aria-label="Remove spec"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={() => setSpecs([...specs, { key: '', value: '' }])}
        >
          <Plus size={14} /> Add spec
        </Button>
      </div>

      <div className="rounded-2xl border border-line p-4">
        <p className="input-label">Solar sizing (powers the calculator recommendations)</p>
        <p className="mb-3 text-label text-ink-muted">
          Fill the one that applies. Batteries and power tanks use capacity, inverters use kVA,
          panels use wattage. Leave others blank.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Capacity (kWh)">
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 2.4"
              value={capacityKwh}
              onChange={e => setCapacityKwh(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Inverter (kVA)">
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 4.2"
              value={powerKva}
              onChange={e => setPowerKva(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Panel (W)">
            <input
              type="number"
              placeholder="e.g. 500"
              value={wattage}
              onChange={e => setWattage(e.target.value)}
              className="input"
            />
          </Field>
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-line p-3">
        <input
          type="checkbox"
          checked={featured}
          onChange={e => setFeatured(e.target.checked)}
          className="h-5 w-5 accent-burgundy"
        />
        <span className="font-medium">Featured on home page</span>
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-line p-3">
        <input
          type="checkbox"
          checked={inStock}
          onChange={e => setInStock(e.target.checked)}
          className="h-5 w-5 accent-burgundy"
        />
        <span className="font-medium">In stock (uncheck to mark out of stock)</span>
      </label>

      {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-body text-danger">{error}</p>}

      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="lg"
          className="flex-1"
          onClick={() => navigate('/admin/products')}
        >
          Cancel
        </Button>
        <Button size="lg" className="flex-1" loading={saving} onClick={save}>
          Save Product
        </Button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="input-label">{label}</span>
      {children}
    </label>
  )
}
