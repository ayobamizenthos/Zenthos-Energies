import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.setState({ hasError: true })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="grid min-h-dvh place-items-center bg-white px-6 text-center">
        <div className="flex max-w-sm flex-col items-center gap-3">
          <img
            src="/zenthoslab-logo.png"
            alt="Zenthos Energies"
            className="h-14 w-14 object-contain brightness-0"
          />
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="text-body text-ink-muted">
            Please reload the page. If this keeps happening, close and reopen the app.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-2 h-11 rounded-xl bg-burgundy px-6 font-semibold text-white"
          >
            Reload
          </button>
        </div>
      </div>
    )
  }
}
