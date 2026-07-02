import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/stores/auth'
import { STATES, citiesFor } from '@/lib/nigeria'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/PageSpinner'

export default function AddressPage() {
  const { session } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [addressId, setAddressId] = useState<string | null>(null)
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: citiesFor('Lagos')[0],
    state: 'Lagos',
    postalCode: '',
  })

  useEffect(() => {
    if (!session) return
    supabase
      .from('user_addresses')
      .select('*')
      .eq('is_default', true)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setAddressId(data.id)
          setForm({
            fullName: data.full_name ?? '',
            phone: data.phone ?? '',
            street: data.street ?? '',
            city: data.city ?? 'Lagos',
            state: data.state ?? 'Lagos',
            postalCode: data.postal_code ?? '',
          })
        }
        setLoading(false)
      })
  }, [session])

  const save = async () => {
    if (!session) return
    setSaving(true)
    const payload = {
      user_id: session.user.id,
      full_name: form.fullName,
      phone: form.phone,
      street: form.street,
      city: form.city,
      state: form.state,
      postal_code: form.postalCode || null,
      is_default: true,
    }
    if (addressId) {
      await supabase.from('user_addresses').update(payload).eq('id', addressId)
    } else {
      const { data } = await supabase.from('user_addresses').insert(payload).select('id').single()
      if (data) setAddressId(data.id)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const set = (key: keyof typeof form) => (value: string) => setForm({ ...form, [key]: value })

  if (loading) return <PageSpinner />

  return (
    <div className="mx-auto flex max-w-app flex-col gap-4">
      <Link to="/account" className="flex items-center gap-1 text-body font-semibold text-burgundy">
        <ArrowLeft size={16} /> Account
      </Link>
      <h1 className="text-2xl font-bold">Default Delivery Address</h1>
      <p className="text-body text-ink-muted">
        Saved here and filled in automatically every time you check out.
      </p>

      <Field label="Full Name">
        <input
          value={form.fullName}
          onChange={e => set('fullName')(e.target.value)}
          className="input"
        />
      </Field>
      <Field label="Phone">
        <input value={form.phone} onChange={e => set('phone')(e.target.value)} className="input" />
      </Field>
      <Field label="Street Address">
        <input
          value={form.street}
          onChange={e => set('street')(e.target.value)}
          className="input"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="State">
          <select
            value={form.state}
            onChange={e =>
              setForm({ ...form, state: e.target.value, city: citiesFor(e.target.value)[0] ?? '' })
            }
            className="input"
          >
            {STATES.map(state => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </Field>
        <Field label="City / Area">
          <select value={form.city} onChange={e => set('city')(e.target.value)} className="input">
            {citiesFor(form.state).map(city => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Postal Code (optional)">
        <input
          value={form.postalCode}
          onChange={e => set('postalCode')(e.target.value)}
          className="input"
        />
      </Field>

      <Button
        size="lg"
        fullWidth
        loading={saving}
        disabled={!form.fullName || !form.phone || !form.street || !form.city}
        onClick={save}
      >
        {saved ? (
          <>
            <Check size={18} /> Saved
          </>
        ) : (
          'Save Address'
        )}
      </Button>
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
