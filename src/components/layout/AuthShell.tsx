import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <div className="app-shell flex flex-1 flex-col justify-center py-10">
        <div className="mx-auto w-full max-w-app">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2">
            <img
              src="/zenthoslab-logo.png"
              alt="Zenthos Energies"
              className="h-11 w-11 object-contain brightness-0"
            />
            <span className="text-xl font-bold tracking-tight">Zenthos Energies</span>
          </Link>

          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mb-6 mt-1 text-body text-ink-muted">{subtitle}</p>

          {children}
        </div>
      </div>
    </div>
  )
}
