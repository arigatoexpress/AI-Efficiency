import { useState } from 'react'

interface SourceRow {
  signal: string
  origin: string
  type: 'Public fact' | 'Model forecast' | 'Synthetic demo' | 'Manager note'
  lastChecked: string
  needsVerification: boolean
}

const DEFAULT_SOURCES: SourceRow[] = [
  { signal: 'Temperature / wind forecast', origin: 'Open-Meteo API', type: 'Model forecast', lastChecked: 'Demo load', needsVerification: true },
  { signal: 'Weather alerts', origin: 'National Weather Service', type: 'Public fact', lastChecked: 'Demo load', needsVerification: true },
  { signal: 'Road status (I-70, US-50)', origin: 'cotrip.org', type: 'Public fact', lastChecked: 'Demo load', needsVerification: true },
  { signal: 'Sort throughput estimate', origin: 'Local synthetic demo', type: 'Synthetic demo', lastChecked: 'Demo load', needsVerification: true },
  { signal: 'Staffing impact assessment', origin: 'Manager interpretation', type: 'Manager note', lastChecked: 'Demo load', needsVerification: true },
  { signal: 'Seismic events', origin: 'USGS earthquake API', type: 'Public fact', lastChecked: 'Demo load', needsVerification: false },
]

export default function SourceTrail() {
  const [sources] = useState<SourceRow[]>(DEFAULT_SOURCES)

  const typeBadge = (type: SourceRow['type']) => {
    const cls: Record<string, string> = {
      'Public fact': 'badge-normal',
      'Model forecast': 'badge-verify',
      'Synthetic demo': 'badge-synthetic',
      'Manager note': 'badge-watch',
    }
    return <span className={`badge ${cls[type]}`}>{type}</span>
  }

  return (
    <div className="panel col-12">
      <h2><span className="icon" aria-hidden="true">🔎</span> Source Trail</h2>
      <p>Every signal in this dashboard and where it came from. Synthetic and forecast values always need human verification.</p>
      <div style={{ overflowX: 'auto' }}>
        <table className="source-table">
          <thead>
            <tr>
              <th>Signal</th>
              <th>Origin</th>
              <th>Type</th>
              <th>Needs Verification</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s, idx) => (
              <tr key={idx}>
                <td>{s.signal}</td>
                <td>{s.origin}</td>
                <td>{typeBadge(s.type)}</td>
                <td>{s.needsVerification ? <span className="badge badge-verify">Yes — verify internally</span> : <span className="badge badge-normal">No</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
