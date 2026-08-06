import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle2, MessageCircle } from 'lucide-react'
import { useOrder } from '@/hooks/useOrders'
import { useSupportSheet } from '@/stores/support'
import { formatNaira } from '@/lib/format'
import { PageSpinner } from '@/components/ui/PageSpinner'
import { Button } from '@/components/ui/Button'
import { StatusTimeline } from '@/components/order/StatusTimeline'
import type { CartItem } from '@/lib/types'
import { cartItemTotal } from '@/lib/types'

export default function OrderTrackingPage() {
  const { orderId } = useParams()
  const [params] = useSearchParams()
  const justPlaced = params.get('placed') === '1'
  const { order, log, loading, confirmReceipt } = useOrder(orderId)
  const showSupport = useSupportSheet(s => s.show)
  const [confirming, setConfirming] = useState(false)

  if (loading) return <PageSpinner />
  if (!order) return <p className="py-16 text-center">Order not found.</p>

  const items = order.items as unknown as CartItem[]
  const address = order.delivery_address as {
    fullName?: string
    street?: string
    city?: string
    state?: string
    phone?: string
  }

  const handleConfirm = async () => {
    setConfirming(true)
    await confirmReceipt()
    setConfirming(false)
  }

  return (
    <div className="mx-auto flex max-w-app flex-col gap-5">
      {justPlaced && (
        <div className="flex items-start gap-3 rounded-2xl bg-success/10 p-4 text-success">
          <CheckCircle2 size={22} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Order placed successfully</p>
            <p className="text-body">We'll notify you once your payment is confirmed.</p>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold">{order.order_number}</h1>
        <p className="text-body text-ink-muted">
          Payment: {order.payment_status === 'verified' ? 'Verified ✓' : 'Awaiting verification'}
        </p>
      </div>

      <section className="rounded-2xl border border-line bg-white p-4">
        <h2 className="mb-4 font-bold">Order Status</h2>
        <StatusTimeline
          current={order.status}
          log={log}
          showInstallation={order.installation_requested}
        />
      </section>

      {order.status === 'out_for_delivery' && !order.receipt_confirmed && (
        <div className="rounded-2xl border border-burgundy bg-burgundy-tint p-4">
          <p className="mb-3 font-semibold text-burgundy">Has your order arrived?</p>
          <Button fullWidth loading={confirming} onClick={handleConfirm}>
            Confirm Receipt
          </Button>
        </div>
      )}
      {order.receipt_confirmed && order.status === 'out_for_delivery' && (
        <p className="rounded-xl bg-success/10 px-4 py-3 text-body text-success">
          Receipt confirmed. Awaiting final delivery confirmation from Zenthos.
        </p>
      )}

      <section className="rounded-2xl border border-line bg-white p-4">
        <h2 className="mb-3 font-bold">Items</h2>
        <div className="flex flex-col gap-2">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-body">
              <span className="text-ink-muted">
                {item.name}
                {item.kind === 'product' ? ` × ${item.quantity}` : ` × ${item.yards}yd`}
              </span>
              <span className="font-semibold">{formatNaira(cartItemTotal(item))}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1 border-t border-line pt-3 text-body">
          <div className="flex justify-between">
            <span className="text-ink-muted">Subtotal</span>
            <span>{formatNaira(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Delivery</span>
            <span>{order.delivery_fee === 0 ? 'Free' : formatNaira(order.delivery_fee)}</span>
          </div>
          {order.installation_fee > 0 && (
            <div className="flex justify-between">
              <span className="text-ink-muted">Installation</span>
              <span>{formatNaira(order.installation_fee)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-line pt-2 text-lg font-bold text-burgundy">
            <span>Total</span>
            <span>{formatNaira(order.total)}</span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-4 text-body">
        <h2 className="mb-2 font-bold">Delivery Address</h2>
        <p className="text-ink-muted">
          {address.fullName}
          <br />
          {address.street}, {address.city}
          {address.state ? `, ${address.state}` : ''}
          <br />
          {address.phone}
        </p>
        <p className="mt-2 text-label text-ink-muted">Express delivery within 24 hours.</p>
      </section>

      <button
        type="button"
        onClick={showSupport}
        className="flex items-center justify-center gap-2 rounded-xl border border-line py-3 font-semibold text-ink"
      >
        <MessageCircle size={18} className="text-burgundy" />
        Need help? Contact support
      </button>

      <Link to="/orders" className="text-center text-body font-semibold text-burgundy">
        ← All orders
      </Link>
    </div>
  )
}
