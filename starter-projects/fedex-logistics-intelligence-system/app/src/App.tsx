import { useEffect, useState } from 'react'
import PrototypeBanner from './components/PrototypeBanner'
import ShiftReadiness from './components/ShiftReadiness'
import StationImpact from './components/StationImpact'
import RouteWatch from './components/RouteWatch'
import ManagerDrafts from './components/ManagerDrafts'
import SourceTrail from './components/SourceTrail'
import LiveSignalsPanel from './components/LiveSignalsPanel'
import { STATIONS, DEFAULT_STATION, type StationConfig } from './data/stations'

export default function App() {
  const [health, setHealth] = useState<{ geminiConfigured: boolean; liveSignals?: boolean } | null>(null)
  const [station, setStation] = useState<StationConfig>(DEFAULT_STATION)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => setHealth(d))
      .catch(() => setHealth({ geminiConfigured: false }))
  }, [])

  const now = new Date().toLocaleString('en-US', {
    timeZone: station.timezone,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="app">
      <PrototypeBanner />

      <header className="header">
        <div>
          <h1>Station Ops Intelligence</h1>
          <div className="header-meta">
            {station.region} Decision-Support Prototype &nbsp;•&nbsp;
            {now} {station.timezone.split('/').pop()} &nbsp;•&nbsp;
            Gemini: {health?.geminiConfigured ? 'Connected' : 'Offline'}
          </div>
        </div>
        <div className="station-selector">
          <label htmlFor="station-select" className="sr-only">Select station</label>
          <select
            id="station-select"
            value={station.id}
            onChange={(e) => {
              const s = STATIONS.find((s) => s.id === e.target.value)
              if (s) setStation(s)
            }}
          >
            {STATIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <section className="panels">
        <LiveSignalsPanel station={station} enabled={!!health?.liveSignals} />
        <ShiftReadiness station={station} />
        <StationImpact station={station} />
        <RouteWatch station={station} />
        <ManagerDrafts station={station} />
        <SourceTrail station={station} />
      </section>

      <div className="footer-note">
        All data is public or synthetic demo data. Verify every signal with your local sources before acting.
        Not an official FedEx system. <strong>Safety Above All.</strong>
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
