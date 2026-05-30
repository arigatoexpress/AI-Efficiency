import { useEffect, useState } from 'react'
import PrototypeBanner from './components/PrototypeBanner'
import ShiftReadiness from './components/ShiftReadiness'
import StationImpact from './components/StationImpact'
import RouteWatch from './components/RouteWatch'
import ManagerDrafts from './components/ManagerDrafts'
import SourceTrail from './components/SourceTrail'

export default function App() {
  const [health, setHealth] = useState<{ geminiConfigured: boolean } | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => setHealth(d))
      .catch(() => setHealth({ geminiConfigured: false }))
  }, [])

  return (
    <div className="app">
      <PrototypeBanner />

      <header className="header">
        <h1>Station Ops Intelligence</h1>
        <div className="header-meta">
          Mountain Division Decision-Support Prototype &nbsp;•&nbsp;
          {new Date().toLocaleString('en-US', { timeZone: 'America/Denver', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} MT &nbsp;•&nbsp;
          Gemini: {health?.geminiConfigured ? 'Connected' : 'Offline'}
        </div>
      </header>

      <section className="panels">
        <ShiftReadiness />
        <StationImpact />
        <RouteWatch />
        <ManagerDrafts />
        <SourceTrail />
      </section>

      <div className="footer-note">
        All data is public or synthetic demo data. Verify every signal with your local sources before acting.
        Not an official FedEx system.
      </div>

      <button
        className="btn print-btn"
        onClick={() => window.print()}
        aria-label="Print this page"
        title="Print this page"
      >
        🖨️ Print
      </button>
    </div>
  )
}
