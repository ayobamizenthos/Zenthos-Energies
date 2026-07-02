import { Suspense } from 'react'
import { lazyWithReload as lazy } from '@/lib/lazyWithReload'
import { Route, Routes } from 'react-router-dom'
import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { RequireAdmin, RequireAuth } from '@/components/layout/Guards'
import { PageSpinner } from '@/components/ui/PageSpinner'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { NotificationWatcher } from '@/components/NotificationWatcher'
import { ToastHost } from '@/components/ToastHost'
import { SupportSheet } from '@/components/SupportSheet'

const HomePage = lazy(() => import('@/pages/HomePage'))
const ShopPage = lazy(() => import('@/pages/ShopPage'))
const ProductPage = lazy(() => import('@/pages/ProductPage'))
const CalculatorPage = lazy(() => import('@/pages/CalculatorPage'))
const CartPage = lazy(() => import('@/pages/CartPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const OrdersPage = lazy(() => import('@/pages/OrdersPage'))
const OrderTrackingPage = lazy(() => import('@/pages/OrderTrackingPage'))
const AccountPage = lazy(() => import('@/pages/AccountPage'))
const AddressPage = lazy(() => import('@/pages/AddressPage'))
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const SignupPage = lazy(() => import('@/pages/SignupPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts'))
const AdminProductEdit = lazy(() => import('@/pages/admin/AdminProductEdit'))
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories'))
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders'))
const AdminOrderDetail = lazy(() => import('@/pages/admin/AdminOrderDetail'))
const AdminCustomers = lazy(() => import('@/pages/admin/AdminCustomers'))
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'))

export function App() {
  return (
    <ErrorBoundary>
      <NotificationWatcher />
      <ToastHost />
      <SupportSheet />
      <Suspense fallback={<PageSpinner />}>
        <Routes>
          <Route element={<CustomerLayout />}>
            <Route index element={<HomePage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="product/:slug" element={<ProductPage />} />
            <Route path="calculator" element={<CalculatorPage />} />
            <Route path="cart" element={<CartPage />} />

            <Route element={<RequireAuth />}>
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:orderId" element={<OrderTrackingPage />} />
              <Route path="account" element={<AccountPage />} />
              <Route path="account/address" element={<AddressPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>
          </Route>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route path="/admin" element={<RequireAdmin />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductEdit />} />
              <Route path="products/:productId" element={<AdminProductEdit />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:orderId" element={<AdminOrderDetail />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
