import type { StationConfig } from '../data/stations'

interface Props {
  station: StationConfig
}

export default function SourceTrail({ station }: Props) {
  return (
    <div className="panel col-12">
      <h2><span className="icon" aria-hidden="true">🔎</span> Source Trail</h2>
      <p>References for the synthetic station scenario, not evidence of current observations. Verify every item before use. Live feeds, when enabled, appear in their own panel.</p>
      <div style={{ overflowX: 'auto' }}>
        <table className="source-table">
          <thead>
            <tr>
              <th>Signal</th>
              <th>Reference source</th>
              <th>Type</th>
              <th>Needs Verification</th>
            </tr>
          </thead>
          <tbody>
            {station.sources.map((s, idx) => (
              <tr key={idx}>
                <td>{s.signal}</td>
                <td>{s.origin}</td>
                <td><span className="badge badge-synthetic">{s.type === 'Manager note' ? 'Illustrative manager note' : 'Synthetic demo'}</span></td>
                <td><span className="badge badge-verify">Yes — verify internally</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
