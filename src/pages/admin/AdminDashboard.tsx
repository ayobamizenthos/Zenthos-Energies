import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts'
import { TrendingUp, ShoppingBag, Package, Users } from 'lucide-react'
import { useAdminOrders, useAdminProducts, useAdminCustomers } from '@/hooks/useAdmin'
import { ORDER_STATUS_META } from '@/lib/constants'
import type { OrderStatus } from '@/lib/constants'
import { formatNaira, formatDate } from '@/lib/format'
import { PageSpinner } from '@/components/ui/PageSpinner'
import { cn } from '@/lib/cn'

export default function AdminDashboard() {
  const { orders, loading } = useAdminOrders('all')
  const { products } = useAdminProducts()
  const { customers } = useAdminCustomers()

  const stats = useMemo(() => {
    const now = new Date()
    const monthOrders = orders.filter(o => {
      const d = new Date(o.created_at)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const verified = orders.filter(o => o.payment_status === 'verified')
    const revenue = verified.reduce((sum, o) => sum + o.total, 0)
    return {
      revenue,
      monthOrders: monthOrders.length,
      newCustomers: customers.filter(c => {
        const d = new Date(c.created_at)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }).length,
    }
  }, [orders, customers])

  const revenueByDay = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      const key = date.toISOString().slice(0, 10)
      const total = orders
        .filter(o => o.payment_status === 'verified' && o.created_at.slice(0, 10) === key)
        .reduce((sum, o) => sum + o.total, 0)
      return { label: date.toLocaleDateString('en-NG', { weekday: 'short' }), total }
    })
    return days
  }, [orders])

  if (loading) return <PageSpinner />

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<TrendingUp size={20} />}
          label="Revenue (verified)"
          value={formatNaira(stats.revenue)}
        />
        <StatCard
          icon={<ShoppingBag size={20} />}
          label="Orders this month"
          value={String(stats.monthOrders)}
        />
        <StatCard icon={<Package size={20} />} label="Products" value={String(products.length)} />
        <StatCard
          icon={<Users size={20} />}
          label="New customers"
          value={String(stats.newCustomers)}
        />
      </div>

      <section className="rounded-2xl border border-line bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">Revenue (last 7 days)</h2>
          <span className="text-body text-ink-muted">{orders.length} total orders</span>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByDay}>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                stroke="#666666"
              />
              <Tooltip cursor={{ fill: '#F7EEF1' }} content={<ChartTooltip />} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {revenueByDay.map((_, i) => (
                  <Cell key={i} fill="#8B1C3F" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="font-bold">Recent Orders</h2>
          <Link to="/admin/orders" className="text-body font-semibold text-burgundy">
            View all
          </Link>
        </div>
        <div className="divide-y divide-line">
          {orders.slice(0, 8).map(order => (
            <Link
              key={order.id}
              to={`/admin/orders/${order.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-burgundy-tint/30"
            >
              <div>
                <p className="font-semibold">{order.order_number}</p>
                <p className="text-label text-ink-muted">{formatDate(order.created_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusPill status={order.status} />
                <span className="font-bold text-burgundy">{formatNaira(order.total)}</span>
              </div>
            </Link>
          ))}
          {orders.length === 0 && (
            <p className="px-4 py-6 text-center text-body text-ink-muted">No orders yet.</p>
          )}
        </div>
      </section>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-burgundy-tint text-burgundy">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-label text-ink-muted">{label}</p>
        <p className="truncate text-base font-bold">{value}</p>
      </div>
    </div>
  )
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-ink px-3 py-2 text-white shadow-pop">
      <p className="text-[11px] uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-body font-bold">{formatNaira(payload[0].value)}</p>
    </div>
  )
}

export function StatusPill({ status }: { status: OrderStatus }) {
  const done = status === 'delivered' || status === 'completed'
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-0.5 text-label font-semibold',
        status === 'pending'
          ? 'bg-line text-ink-muted'
          : done
            ? 'bg-success/10 text-success'
            : 'bg-burgundy-tint text-burgundy'
      )}
    >
      {ORDER_STATUS_META[status].label}
    </span>
  )
}
