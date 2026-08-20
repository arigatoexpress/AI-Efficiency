import { useEffect, useState } from 'react'
import PrototypeBanner from './components/PrototypeBanner'
import ShiftReadiness from './components/ShiftReadiness'
import StationImpact from './components/StationImpact'
import RouteWatch from './components/RouteWatch'
import ManagerDrafts from './components/ManagerDrafts'
import SourceTrail from './components/SourceTrail'
import LiveSignalsPanel from './components/LiveSignalsPanel'
import { STATIONS, DEFAULT_STATION, type StationConfig } from './data/stations'
import './recon.css'

interface HealthState {
  geminiConfigured: boolean
  liveSignals?: boolean
  timestamp?: string
}

export default function App() {
  const [health, setHealth] = useState<HealthState | null>(null)
  const [station, setStation] = useState<StationConfig>(DEFAULT_STATION)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => {
        if (!r.ok) throw new Error(`health check failed: ${r.status}`)
        return r.json()
      })
      .then((d) => setHealth(d))
      .catch(() => setHealth({ geminiConfigured: false, liveSignals: false }))
  }, [])

  const now = new Date().toLocaleString('en-US', {
    timeZone: station.timezone,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const attentionCount = station.risks.filter(
    (risk) => risk.status === 'watch' || risk.status === 'escalate',
  ).length
  const escalateCount = station.risks.filter((risk) => risk.status === 'escalate').length
  const verifyCount = station.risks.filter((risk) => risk.status === 'verify').length

  const postureLabel =
    escalateCount > 0 ? 'Human attention now' :
    attentionCount > 0 ? 'Watch conditions' :
    verifyCount > 0 ? 'Verification needed' :
    'No elevated demo signals'

  return (
    <div className="app">
      <PrototypeBanner />

      <header className="header recon-header">
        <div>
          <div className="recon-kicker">RECON · AI Efficiency manager decision support</div>
          <h1>Station Ops Intelligence</h1>
          <div className="header-meta">
            {station.region} &nbsp;•&nbsp; {now} {station.timezone.split('/').pop()}
          </div>
        </div>
        <div className="station-selector recon-selector">
          <label htmlFor="station-select">Demo station</label>
          <select
            id="station-select"
            value={station.id}
            onChange={(e) => {
              const s = STATIONS.find((s) => s.id === e.target.value)
              if (s) setStation(s)
            }}
          >
            {STATIONS.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </header>

      <section className="recon-hero" aria-label="Shift briefing overview">
        <div className="recon-hero-main">
          <div className="recon-eyebrow">NEXT-SHIFT EXTERNAL RISK PICTURE</div>
          <h2>{station.name}</h2>
          <p>
            Organize public context, surface what deserves attention, and turn it into
            a concise manager-reviewed briefing without pretending to know internal operations.
          </p>
        </div>

        <div className="recon-status-grid">
          <div className={`recon-status ${escalateCount > 0 ? 'alert' : attentionCount > 0 ? 'watch' : ''}`}>
            <span>Signal posture</span>
            <strong>{postureLabel}</strong>
            <small>{attentionCount} watch/escalate · {verifyCount} verify</small>
          </div>
          <div className={`recon-status ${health?.geminiConfigured ? 'good' : 'neutral'}`}>
            <span>Drafting engine</span>
            <strong>{health?.geminiConfigured ? 'Gemini connected' : 'Fallback ready'}</strong>
            <small>{health?.geminiConfigured ? 'AI drafts enabled' : 'Deterministic local draft'}</small>
          </div>
          <div className={`recon-status ${health?.liveSignals ? 'good' : 'neutral'}`}>
            <span>Signal mode</span>
            <strong>{health?.liveSignals ? 'Live public feeds' : 'Demo data mode'}</strong>
            <small>{health?.liveSignals ? 'Open-Meteo · NWS · USGS' : 'Public + labeled synthetic'}</small>
          </div>
        </div>

        <div className="recon-hero-foot">
          No internal package, customer, employee, route-manifest, or facility telemetry is used.
          <strong> Human verification remains the decision gate.</strong>
        </div>
      </section>

      <section className="panels">
        <LiveSignalsPanel station={station} enabled={!!health?.liveSignals} />
        <ShiftReadiness station={station} />
        <ManagerDrafts station={station} />
        <StationImpact station={station} />
        <RouteWatch station={station} />
        <SourceTrail station={station} />
      </section>

      <div className="footer-note">
        All data is public or synthetic demo data. Verify every signal with your local sources before acting.
        Not an official FedEx system. <strong>Safety Above All.</strong>
      </div>

      <button
        className="btn print-btn"
        onClick={() => window.print()}
        aria-label="Print this briefing"
        title="Print this briefing"
      >
        🖨️ Print briefing
      </button>
    </div>
  )
}
