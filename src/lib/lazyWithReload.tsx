import { lazy } from 'react'
import type { ComponentType } from 'react'

const RELOAD_KEY = 'zenthos-chunk-reloaded'

async function purgeAndReload() {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map(reg => reg.unregister()))
    }
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map(key => caches.delete(key)))
    }
  } catch {
    void 0
  }
  window.location.reload()
}

export function lazyWithReload<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      const mod = await factory()
      sessionStorage.removeItem(RELOAD_KEY)
      return mod
    } catch (error) {
      if (!sessionStorage.getItem(RELOAD_KEY)) {
        sessionStorage.setItem(RELOAD_KEY, '1')
        await purgeAndReload()
        return new Promise<{ default: T }>(() => {})
      }
      throw error
    }
  })
}
