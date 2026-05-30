import { useState } from 'react'
import type { StationConfig } from '../data/stations'

type DraftTopic = 'pre-shift' | 'handoff' | 'after-action'

interface Props {
  station: StationConfig
}

export default function ManagerDrafts({ station }: Props) {
  const [topic, setTopic] = useState<DraftTopic>('pre-shift')
  const [loading, setLoading] = useState(false)
  const [draft, setDraft] = useState<string>('')
  const [source, setSource] = useState<string>('')

  const generateDraft = async () => {
    setLoading(true)
    setDraft('')
    setSource('')
    try {
      const res = await fetch('/api/compile-advice-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          station: station.name,
          topic,
          weather: station.weather,
          roadConditions: {
            i70Status: station.roadConditions.primaryStatus,
            us50Status: station.roadConditions.secondaryStatus,
            cotripUrl: station.roadConditions.cotripUrl,
          },
          seismic: { magnitude: 0, location: 'N/A', time: 'N/A' },
        }),
      })
      const data = await res.json()
      setDraft(data.draft || 'No draft returned.')
      setSource(data.source || 'unknown')
    } catch (err) {
      setDraft('Unable to reach the drafting service. Please try again.')
      setSource('error')
    } finally {
      setLoading(false)
    }
  }

  const topicLabel = (t: DraftTopic) =>
    t === 'handoff' ? 'Shift Handoff Brief' :
    t === 'after-action' ? 'After-Action Summary' :
    'Pre-Shift Readiness Brief'

  return (
    <div className="panel col-6">
      <h2><span className="icon" aria-hidden="true">✍️</span> Manager Drafts</h2>
      <p>Generate a draft brief for {station.name} using public data. Always review and verify before sharing.</p>

      <div className="btn-group">
        {(['pre-shift', 'handoff', 'after-action'] as DraftTopic[]).map((t) => (
          <button
            key={t}
            className={`btn ${topic === t ? '' : 'btn-secondary'}`}
            onClick={() => setTopic(t)}
            aria-pressed={topic === t}
          >
            {topicLabel(t)}
          </button>
        ))}
      </div>

      <button className="btn" onClick={generateDraft} disabled={loading}>
        {loading ? 'Drafting…' : `Draft ${topicLabel(topic)}`}
      </button>

      {draft && (
        <div style={{ marginTop: 14 }}>
          <div className="draft-output" role="region" aria-label="Generated draft">
            {draft}
          </div>
          <div className="card-source" style={{ marginTop: 8 }}>
            Source: {source === 'gemini' ? 'Gemini AI draft (human review required)' : source === 'fallback' ? 'Local fallback draft (human review required)' : source}
          </div>
        </div>
      )}
    </div>
  )
}
