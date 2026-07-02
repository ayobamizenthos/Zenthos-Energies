import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [snoozed, setSnoozed] = useState(false)

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!deferred || snoozed) return null

  const install = async () => {
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
  }

  return (
    <div className="fixed inset-x-3 bottom-40 z-50 mx-auto max-w-app animate-slide-up rounded-2xl border border-line bg-white p-4 shadow-pop md:bottom-6">
      <button
        type="button"
        onClick={() => setSnoozed(true)}
        aria-label="Dismiss"
        className="absolute right-3 top-3 text-ink-muted"
      >
        <X size={18} />
      </button>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-burgundy text-white">
          <Download size={20} />
        </span>
        <div className="flex-1">
          <p className="font-semibold">Install Zenthos Energies</p>
          <p className="text-body text-ink-muted">
            Add the app to your home screen for faster, full-screen shopping.
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={install}>
              Install App
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSnoozed(true)}>
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
