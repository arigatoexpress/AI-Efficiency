import { useState } from 'react'

interface ImpactItem {
  area: string
  possibleEffect: string
  confidence: 'possible' | 'likely' | 'uncertain'
  verifyWith: string
}

const DEFAULT_IMPACTS: ImpactItem[] = [
  {
    area: 'Dock flow',
    possibleEffect: 'If chain laws go into effect, inbound linehaul could be delayed 30–90 minutes.',
    confidence: 'possible',
    verifyWith: 'Carrier dispatch and live cotrip.org status',
  },
  {
    area: 'Staffing',
    possibleEffect: 'No direct impact from public signals. Monitor for weather-related call-outs.',
    confidence: 'uncertain',
    verifyWith: 'Local attendance sheet and supervisor check-in',
  },
  {
    area: 'Handoff quality',
    possibleEffect: 'Tight transfer windows may require priority sorting of delayed trailers.',
    confidence: 'possible',
    verifyWith: 'Sort manager and outbound feeder schedule',
  },
]

export default function StationImpact() {
  const [impacts] = useState<ImpactItem[]>(DEFAULT_IMPACTS)

  const confidenceBadge = (c: ImpactItem['confidence']) => {
    const labels = { possible: 'Possible impact', likely: 'Likely impact', uncertain: 'Uncertain' }
    const classes = { possible: 'badge-watch', likely: 'badge-verify', uncertain: 'badge-synthetic' }
    return <span className={`badge ${classes[c]}`}>{labels[c]}</span>
  }

  return (
    <div className="panel col-4">
      <h2><span className="icon" aria-hidden="true">🏭</span> Station Impact</h2>
      <p>How public signals could affect operations. These are possibilities, not confirmed impacts.</p>
      <div className="card-list">
        {impacts.map((i, idx) => (
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
