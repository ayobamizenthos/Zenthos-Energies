/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>
}

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
  ({ url }) => url.pathname.includes('/storage/') || url.hostname.includes('unsplash'),
  new StaleWhileRevalidate({
    cacheName: 'product-images',
    plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 })],
  })
)

self.addEventListener('push', (event: PushEvent) => {
  const payload = (() => {
    try {
      return event.data?.json() ?? {}
    } catch {
      return { title: 'Zenthos Energies', body: event.data?.text() ?? '' }
    }
  })() as { title?: string; body?: string; url?: string; tag?: string }

  event.waitUntil(
    self.registration.showNotification(payload.title ?? 'Zenthos Energies', {
      body: payload.body ?? '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: payload.tag,
      data: { url: payload.url ?? '/orders' },
    })
  )
})

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  const target = (event.notification.data as { url?: string })?.url ?? '/orders'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(client => 'focus' in client)
      if (existing) {
        ;(existing as WindowClient).navigate(target)
        return (existing as WindowClient).focus()
      }
      return self.clients.openWindow(target)
    })
  )
})

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})
