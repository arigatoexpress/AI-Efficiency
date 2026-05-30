import type { StationConfig } from '../data/stations'

interface Props {
  station: StationConfig
}

export default function ShiftReadiness({ station }: Props) {
  const statusBadge = (status: 'normal' | 'watch' | 'verify' | 'escalate') => {
    const map: Record<string, { cls: string; label: string }> = {
      normal: { cls: 'badge-normal', label: 'Normal' },
      watch: { cls: 'badge-watch', label: 'Watch' },
      verify: { cls: 'badge-verify', label: 'Verify' },
      escalate: { cls: 'badge-escalate', label: 'Escalate' },
    }
    const s = map[status] || map.normal
    return <span className={`badge ${s.cls}`}>{s.label}</span>
  }

  return (
    <div className="panel col-8">
      <h2><span className="icon" aria-hidden="true">📋</span> Shift Readiness</h2>
      <p>Top public risk signals for {station.name}. Verify every item with your local sources before acting.</p>
      <div className="card-list">
        {station.risks.map((r) => (
          <div className="card" key={r.id}>
            {statusBadge(r.status)}
            <div className="card-body">
              <div className="card-title">{r.title}</div>
              <div className="card-desc">{r.description}</div>
              <div className="card-source">Source: {r.source} • {r.sourceType === 'synthetic' ? 'Synthetic demo' : r.sourceType === 'manager-note' ? 'Manager note' : 'Public data'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
