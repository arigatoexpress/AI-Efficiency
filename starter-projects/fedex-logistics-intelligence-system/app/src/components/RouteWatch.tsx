import { useState } from 'react'

interface RouteItem {
  route: string
  status: 'open' | 'restricted' | 'closed' | 'unknown'
  note: string
  sourceUrl: string
  sourceLabel: string
}

const DEFAULT_ROUTES: RouteItem[] = [
  {
    route: 'I-70 Vail Pass',
    status: 'restricted',
    note: 'Chain laws possible. Monitor for traction restrictions.',
    sourceUrl: 'https://www.cotrip.org/',
    sourceLabel: 'COtrip public feed',
  },
  {
    route: 'US-50 Monarch Summit',
    status: 'open',
    note: 'Open with possible icy conditions. No closures reported.',
    sourceUrl: 'https://www.cotrip.org/',
    sourceLabel: 'COtrip public feed',
  },
  {
    route: 'CO-131 (Alternate)',
    status: 'open',
    note: 'Potential alternate if I-70 restrictions worsen. Verify suitability for vehicle type.',
    sourceUrl: 'https://www.cotrip.org/',
    sourceLabel: 'COtrip public feed',
  },
]

export default function RouteWatch() {
  const [routes] = useState<RouteItem[]>(DEFAULT_ROUTES)

  const statusDot = (status: RouteItem['status']) => {
    const map: Record<string, string> = {
      open: 'dot-normal',
      restricted: 'dot-watch',
      closed: 'dot-escalate',
      unknown: 'dot-verify',
    }
    return <span className={`status-dot ${map[status]}`} aria-hidden="true" />
  }

  const statusLabel = (status: RouteItem['status']) => {
    const map: Record<string, string> = { open: 'Open', restricted: 'Restricted', closed: 'Closed', unknown: 'Unknown' }
    return map[status]
  }

  return (
    <div className="panel col-6">
      <h2><span className="icon" aria-hidden="true">🛣️</span> Route Watch</h2>
      <p>Public road conditions near Gunnison. Always verify with cotrip.org before routing decisions.</p>
      <div className="card-list">
        {routes.map((r, idx) => (
          <div className="card" key={idx}>
            <div className="card-body">
              <div className="card-title">
                {statusDot(r.status)} {r.route} — {statusLabel(r.status)}
              </div>
              <div className="card-desc">{r.note}</div>
              <div className="card-source">
                Source: <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer">{r.sourceLabel}</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
