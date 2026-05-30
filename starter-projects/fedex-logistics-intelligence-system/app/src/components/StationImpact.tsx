import type { StationConfig } from '../data/stations'

interface Props {
  station: StationConfig
}

export default function StationImpact({ station }: Props) {
  const confidenceBadge = (c: 'possible' | 'likely' | 'uncertain') => {
    const labels = { possible: 'Possible impact', likely: 'Likely impact', uncertain: 'Uncertain' }
    const classes = { possible: 'badge-watch', likely: 'badge-verify', uncertain: 'badge-synthetic' }
    return <span className={`badge ${classes[c]}`}>{labels[c]}</span>
  }

  return (
    <div className="panel col-4">
      <h2><span className="icon" aria-hidden="true">🏭</span> Station Impact</h2>
      <p>How public signals could affect {station.name} operations. These are possibilities, not confirmed impacts.</p>
      <div className="card-list">
        {station.impacts.map((i, idx) => (
          <div className="card" key={idx}>
            {confidenceBadge(i.confidence)}
            <div className="card-body">
              <div className="card-title">{i.area}</div>
              <div className="card-desc">{i.possibleEffect}</div>
              <div className="card-source">Verify with: {i.verifyWith}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
