import type { StationConfig } from '../data/stations'

interface Props {
  station: StationConfig
}

export default function SourceTrail({ station }: Props) {
  const typeBadge = (type: 'Public fact' | 'Model forecast' | 'Synthetic demo' | 'Manager note') => {
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
            {station.sources.map((s, idx) => (
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
