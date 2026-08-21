import { Component, StrictMode, type ErrorInfo, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Bluebell failed to render', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <main className="app-shell error-shell"><section className="welcome-panel"><div className="welcome-sparkle">✦</div><h1>Let's try<br /><em>that again.</em></h1><p className="hero-copy">Something went wrong while opening your planner. Reload the page to try again.</p><button className="add-button" onClick={() => window.location.reload()}>Reload planner <span>↗</span></button></section></main>
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
)
