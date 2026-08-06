import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Check, Copy, CreditCard, ImageUp, Loader2, X, Zap } from 'lucide-react'
import { useCart } from '@/stores/cart'
import { useAuth } from '@/stores/auth'
import { useStoreSettings } from '@/hooks/useStoreSettings'
import { supabase } from '@/lib/supabase'
import { calculateTotals } from '@/lib/pricing'
import { formatNaira } from '@/lib/format'
import { STORE } from '@/lib/constants'
import { STATES, citiesFor } from '@/lib/nigeria'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/PageSpinner'
import { playOrderPlaced } from '@/lib/sounds'
import { payWithPaystack } from '@/lib/paystack'

type Step = 1 | 2 | 3
type PaymentMethod = 'paystack' | 'bank_transfer'

interface AddressForm {
  fullName: string
  phone: string
  street: string
  city: string
  state: string
  postalCode: string
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, clear } = useCart()
  const { session, profile } = useAuth()
  const { settings, loading } = useStoreSettings()

  const [step, setStep] = useState<Step>(1)
  const [address, setAddress] = useState<AddressForm>({
    fullName: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    street: '',
    city: citiesFor('Lagos')[0],
    state: 'Lagos',
    postalCode: '',
  })
  const [installation, setInstallation] = useState(false)
  const [method, setMethod] = useState<PaymentMethod>('paystack')
  const [payError, setPayError] = useState('')
  const [note, setNote] = useState('')
  const [bankReference, setBankReference] = useState('')
  const [proofPath, setProofPath] = useState('')
  const [proofName, setProofName] = useState('')
  const [proofUploading, setProofUploading] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!session) return
    supabase
      .from('user_addresses')
      .select('*')
      .eq('is_default', true)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return
        setAddress(prev => ({
          fullName: data.full_name || prev.fullName,
          phone: data.phone || prev.phone,
          street: data.street || prev.street,
          city: data.city || prev.city,
          state: data.state || prev.state,
          postalCode: data.postal_code || prev.postalCode,
        }))
      })
  }, [session])

  if (loading) return <PageSpinner />
  if (items.length === 0) {
    navigate('/cart', { replace: true })
    return null
  }

  const totals = calculateTotals(items, installation, address.state)

  const uploadProof = async (file: File) => {
    if (!session) return
    setProofUploading(true)
    const ext = file.name.split('.').pop() || 'png'
    const path = `${session.user.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('payment-proofs').upload(path, file, {
      upsert: true,
      contentType: file.type,
    })
    setProofUploading(false)
    if (!error) {
      setProofPath(path)
      setProofName(file.name)
    }
  }

  const canPlaceOrder = method === 'paystack' ? true : Boolean(proofPath)

  const copyAccount = async () => {
    if (!settings?.bank_account_number) return
    await navigator.clipboard.writeText(settings.bank_account_number)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const placeOrder = async () => {
    if (!session) return
    setPlacing(true)
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: session.user.id,
        items: items as unknown as never,
        subtotal: totals.subtotal,
        delivery_fee: totals.deliveryFee,
        installation_fee: totals.installationFee,
        total: totals.total,
        delivery_method: 'express',
        delivery_address: address as unknown as never,
        installation_requested: installation,
        payment_method: method,
        bank_reference: method === 'bank_transfer' ? bankReference || null : null,
        payment_proof_url: method === 'bank_transfer' ? proofPath || null : null,
        customer_note: note.trim() || null,
      })
      .select('id, order_number')
      .single()

    if (error || !data) {
      setPlacing(false)
      setPayError('Could not create your order. Please try again.')
      return
    }

    if (method === 'bank_transfer') {
      setPlacing(false)
      playOrderPlaced()
      clear()
      navigate(`/orders/${data.id}?placed=1`, { replace: true })
      return
    }

    try {
      const result = await payWithPaystack({
        email: session.user.email ?? '',
        amountNaira: totals.total,
        reference: data.order_number,
        orderId: data.id,
      })

      if (!result) {
        setPlacing(false)
        setPayError('Payment was cancelled. Your order is saved as pending.')
        return
      }

      const { data: verified } = await supabase.functions.invoke('paystack-verify', {
        body: { reference: result.reference, orderId: data.id },
      })

      setPlacing(false)
      playOrderPlaced()
      clear()
      if (!verified?.ok) {
        setPayError('Payment received but not yet confirmed. We will verify it shortly.')
      }
      navigate(`/orders/${data.id}?placed=1`, { replace: true })
    } catch {
      setPlacing(false)
      setPayError('Payment could not start. Please try again or use bank transfer.')
    }
  }

  return (
    <div className="mx-auto flex max-w-app flex-col gap-5">
      <StepIndicator step={step} />

      {step === 1 && (
        <section className="flex flex-col gap-4">
          <h1 className="text-xl font-bold">Shipping Address</h1>
          <Input
            label="Full Name"
            value={address.fullName}
            onChange={v => setAddress({ ...address, fullName: v })}
          />
          <Input
            label="Phone"
            value={address.phone}
            onChange={v => setAddress({ ...address, phone: v })}
          />
          <Input
            label="Street Address"
            value={address.street}
            onChange={v => setAddress({ ...address, street: v })}
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="input-label">State</span>
              <select
                value={address.state}
                onChange={e =>
                  setAddress({
                    ...address,
                    state: e.target.value,
                    city: citiesFor(e.target.value)[0] ?? '',
                  })
                }
                className="input"
              >
                {STATES.map(state => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="input-label">City / Area</span>
              <select
                value={address.city}
                onChange={e => setAddress({ ...address, city: e.target.value })}
                className="input"
              >
                {citiesFor(address.state).map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <Input
            label="Postal Code (optional)"
            value={address.postalCode}
            onChange={v => setAddress({ ...address, postalCode: v })}
          />
          <label className="flex flex-col gap-1.5">
            <span className="input-label">Additional Note (optional)</span>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder="Landmark, delivery instructions, or anything we should know"
              className="w-full rounded-xl border border-line bg-white p-3 text-body outline-none focus:border-burgundy"
            />
          </label>
          <Button
            size="lg"
            fullWidth
            disabled={
              !address.fullName ||
              !address.phone ||
              !address.street ||
              !address.city ||
              !address.state
            }
            onClick={() => setStep(2)}
          >
            Next
          </Button>
        </section>
      )}

      {step === 2 && (
        <section className="flex flex-col gap-4">
          <h1 className="text-xl font-bold">Delivery & Installation</h1>

          <div className="flex items-center gap-3 rounded-2xl border border-burgundy bg-burgundy-tint p-4">
            <span className="text-burgundy">
              <Zap size={20} />
            </span>
            <div className="flex-1">
              <p className="font-semibold">Express Delivery</p>
              <p className="text-body text-ink-muted">
                Delivered within 24 hours to {address.state}
              </p>
            </div>
            <span className="font-bold text-burgundy">
              {totals.deliveryFee === 0 ? 'Free' : formatNaira(totals.deliveryFee)}
            </span>
          </div>
          {totals.qualifiesForFreeDelivery && (
            <p className="rounded-lg bg-success/10 px-3 py-2 text-body text-success">
              Your order qualifies for free delivery.
            </p>
          )}

          <button
            onClick={() => setInstallation(v => !v)}
            className={cn(
              'flex items-center justify-between rounded-2xl border p-4 text-left transition-colors',
              installation ? 'border-burgundy bg-burgundy-tint' : 'border-line'
            )}
          >
            <div>
              <p className="font-semibold">Professional Installation</p>
              <p className="text-body text-ink-muted">Expert visit to install your system</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-burgundy">{formatNaira(STORE.installationFee)}</span>
              <span
                className={cn(
                  'grid h-6 w-6 place-items-center rounded-md border',
                  installation ? 'border-burgundy bg-burgundy text-white' : 'border-line'
                )}
              >
                {installation && <Check size={14} />}
              </span>
            </div>
          </button>

          <div className="flex gap-3">
            <Button size="lg" variant="secondary" onClick={() => setStep(1)} className="flex-1">
              Back
            </Button>
            <Button size="lg" onClick={() => setStep(3)} className="flex-1">
              Next
            </Button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="flex flex-col gap-4">
          <h1 className="text-xl font-bold">Payment</h1>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setMethod('paystack')}
              className={cn(
                'flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors',
                method === 'paystack' ? 'border-burgundy bg-burgundy-tint' : 'border-line'
              )}
            >
              <span className="text-burgundy">
                <CreditCard size={20} />
              </span>
              <div className="flex-1">
                <p className="font-semibold">Pay Now (Card, Transfer, USSD)</p>
                <p className="text-body text-ink-muted">
                  Secure payment via Paystack. Order confirmed instantly.
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setMethod('bank_transfer')}
              className={cn(
                'flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors',
                method === 'bank_transfer' ? 'border-burgundy bg-burgundy-tint' : 'border-line'
              )}
            >
              <span className="text-burgundy">
                <Building2 size={20} />
              </span>
              <div className="flex-1">
                <p className="font-semibold">Direct Bank Transfer</p>
                <p className="text-body text-ink-muted">
                  Transfer manually and upload your proof of payment.
                </p>
              </div>
            </button>
          </div>

          {method === 'bank_transfer' && (
            <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4">
              <div className="flex items-center gap-2 text-burgundy">
                <Building2 size={20} />
                <span className="font-semibold">Transfer to:</span>
              </div>
              <Detail
                label="Account Name"
                value={settings?.bank_account_name ?? 'Zenthos Energies'}
              />
              <Detail label="Bank" value={settings?.bank_name ?? 'Not yet configured'} />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label text-ink-muted">Account Number</p>
                  <p className="font-semibold">
                    {settings?.bank_account_number ?? 'Not yet configured'}
                  </p>
                </div>
                <button
                  onClick={copyAccount}
                  className="flex items-center gap-1 text-body font-semibold text-burgundy"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <span className="font-semibold">Amount to transfer</span>
                <span className="text-2xl font-bold text-burgundy">
                  {formatNaira(totals.total)}
                </span>
              </div>
            </div>
          )}

          {method === 'bank_transfer' && (
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="mb-1 font-semibold">
                Upload proof of payment <span className="text-danger">*</span>
              </p>
              <p className="mb-3 text-body text-ink-muted">
                A screenshot, photo, or PDF of your transfer is required to place the order.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                aria-label="Proof of payment"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) uploadProof(file)
                }}
              />

              {proofPath ? (
                <div className="mb-3 flex items-center gap-3 rounded-xl border border-success/40 bg-success/10 p-3">
                  <Check size={18} className="shrink-0 text-success" />
                  <span className="min-w-0 flex-1 truncate text-body font-medium">{proofName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setProofPath('')
                      setProofName('')
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    aria-label="Remove screenshot"
                    className="shrink-0 text-ink-muted"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={proofUploading}
                  className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-burgundy/50 bg-burgundy-tint/40 py-4 font-semibold text-burgundy"
                >
                  {proofUploading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Uploading…
                    </>
                  ) : (
                    <>
                      <ImageUp size={18} /> Upload proof of payment
                    </>
                  )}
                </button>
              )}

              <Input
                label="Transfer reference (optional)"
                value={bankReference}
                onChange={setBankReference}
                placeholder="e.g. your name or transaction ID"
              />
            </div>
          )}

          <div className="rounded-xl bg-burgundy-tint px-4 py-3 text-body text-burgundy">
            {method === 'paystack'
              ? 'You will be redirected to a secure Paystack window. Your order is confirmed the moment payment succeeds.'
              : 'Your order will be confirmed once we verify your payment (typically within 5 minutes).'}
          </div>

          <OrderSummary totals={totals} installation={installation} />

          {payError && (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-body text-danger">{payError}</p>
          )}

          <div className="flex gap-3">
            <Button size="lg" variant="secondary" onClick={() => setStep(2)} className="flex-1">
              Back
            </Button>
            <Button
              size="lg"
              onClick={placeOrder}
              loading={placing}
              disabled={!canPlaceOrder}
              className="flex-[2]"
            >
              {method === 'paystack'
                ? `Pay ${formatNaira(totals.total)}`
                : 'I have transferred the funds'}
            </Button>
          </div>
          {!canPlaceOrder && (
            <p className="text-center text-label text-ink-muted">
              Upload your proof of payment to continue.
            </p>
          )}
        </section>
      )}
    </div>
  )
}

function StepIndicator({ step }: { step: Step }) {
  const labels = ['Address', 'Delivery', 'Payment']
  return (
    <div className="flex items-center gap-2">
      {labels.map((label, i) => {
        const n = (i + 1) as Step
        const done = step > n
        const active = step === n
        return (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'grid h-7 w-7 place-items-center rounded-full text-label font-bold',
                active
                  ? 'bg-burgundy text-white'
                  : done
                    ? 'bg-success text-white'
                    : 'bg-line text-ink-muted'
              )}
            >
              {done ? <Check size={14} /> : n}
            </div>
            <span className={cn('text-body font-medium', active ? 'text-ink' : 'text-ink-muted')}>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function OrderSummary({
  totals,
  installation,
}: {
  totals: ReturnType<typeof calculateTotals>
  installation: boolean
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 text-body">
      <Row label="Subtotal" value={formatNaira(totals.subtotal)} />
      <Row
        label="Delivery"
        value={totals.deliveryFee === 0 ? 'Free' : formatNaira(totals.deliveryFee)}
      />
      {installation && <Row label="Installation" value={formatNaira(totals.installationFee)} />}
      <div className="mt-2 flex items-baseline justify-between border-t border-line pt-2">
        <span className="font-semibold">Total</span>
        <span className="text-xl font-bold text-burgundy">{formatNaira(totals.total)}</span>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-ink-muted">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-label text-ink-muted">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="input-label">{label}</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input"
      />
    </label>
  )
}
