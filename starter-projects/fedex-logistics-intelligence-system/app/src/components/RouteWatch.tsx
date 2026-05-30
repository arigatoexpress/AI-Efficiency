import type { StationConfig } from '../data/stations'

interface Props {
  station: StationConfig
}

export default function RouteWatch({ station }: Props) {
  const statusDot = (status: 'open' | 'restricted' | 'closed' | 'unknown') => {
    const map: Record<string, string> = {
      open: 'dot-normal',
      restricted: 'dot-watch',
      closed: 'dot-escalate',
      unknown: 'dot-verify',
    }
    return <span className={`status-dot ${map[status]}`} aria-hidden="true" />
  }

  const statusLabel = (status: 'open' | 'restricted' | 'closed' | 'unknown') => {
    const map: Record<string, string> = { open: 'Open', restricted: 'Restricted', closed: 'Closed', unknown: 'Unknown' }
    return map[status]
  }

  return (
    <div className="panel col-6">
      <h2><span className="icon" aria-hidden="true">🛣️</span> Route Watch</h2>
      <p>Public road conditions near {station.name}. Always verify with official sources before routing decisions.</p>
      <div className="card-list">
        {station.routes.map((r, idx) => (
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
