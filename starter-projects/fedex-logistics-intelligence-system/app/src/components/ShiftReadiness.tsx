import { useState } from 'react'

interface RiskItem {
  id: string
  title: string
  description: string
  status: 'normal' | 'watch' | 'verify' | 'escalate'
  source: string
  sourceType: 'public' | 'synthetic' | 'manager-note'
}

const DEFAULT_RISKS: RiskItem[] = [
  {
    id: '1',
    title: 'I-70 Vail Pass — Possible Chain Restrictions',
    description: 'Temperature forecast below 20°F with snow. Check cotrip.org for current chain law status.',
    status: 'watch',
    source: 'NWS forecast / Open-Meteo model',
    sourceType: 'public',
  },
  {
    id: '2',
    title: 'US-50 Monarch Summit — No Closure Reported',
    description: 'Road open with possible icy conditions. Monitor for weather-driven restrictions.',
    status: 'normal',
    source: 'cotrip.org public feed',
    sourceType: 'public',
  },
  {
    id: '3',
    title: 'Sort Capacity — Synthetic Demo Value',
    description: 'Illustrative dock throughput estimate. Verify with actual sort plan and staffing sheet.',
    status: 'verify',
    source: 'Synthetic demo data',
    sourceType: 'synthetic',
  },
]

export default function ShiftReadiness() {
  const [risks] = useState<RiskItem[]>(DEFAULT_RISKS)

  const statusBadge = (status: RiskItem['status']) => {
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
      <p>Top public risk signals for the next shift. Verify every item with your local sources before acting.</p>
      <div className="card-list">
        {risks.map((r) => (
          <div className="card" key={r.id}>
            {statusBadge(r.status)}
            <div className="card-body">
              <div className="card-title">{r.title}</div>
              <div className="card-desc">{r.description}</div>
              <div className="card-source">Source: {r.source} • {r.sourceType === 'synthetic' ? 'Synthetic demo' : 'Public data'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
