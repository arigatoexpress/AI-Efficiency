import { useEffect, useState } from 'react'
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
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setDraft('')
    setSource('')
    setCopied(false)
  }, [station.id])

  const generateDraft = async () => {
    setLoading(true)
    setDraft('')
    setSource('')
    setCopied(false)
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
      if (!res.ok) throw new Error(`draft request failed: ${res.status}`)
      const data = await res.json()
      setDraft(data.draft || 'No draft returned.')
      setSource(data.source || 'unknown')
    } catch {
      setDraft('Unable to reach the drafting service. Please try again.')
      setSource('error')
    } finally {
      setLoading(false)
    }
  }

  const copyDraft = async () => {
    if (!draft) return
    try {
      await navigator.clipboard.writeText(draft)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  const topicLabel = (t: DraftTopic) =>
    t === 'handoff' ? 'Shift Handoff Brief' :
    t === 'after-action' ? 'After-Action Summary' :
    'Pre-Shift Readiness Brief'

  const sourceLabel =
    source === 'gemini' ? 'Gemini AI draft' :
    source === 'fallback' ? 'Deterministic fallback' :
    source === 'error' ? 'Draft service unavailable' :
    source

  return (
    <div className="panel col-6 recon-drafts">
      <h2><span className="icon" aria-hidden="true">✍️</span> Manager Drafts</h2>
      <p>Turn the current station context into a manager-ready starting point. The draft never becomes an operational decision on its own.</p>

      <div className="recon-review-gate">
        <strong>Human review gate:</strong> verify facts and internal context before sharing or acting.
      </div>

      <div className="btn-group">
        {(['pre-shift', 'handoff', 'after-action'] as DraftTopic[]).map((t) => (
          <button key={t} className={`btn ${topic === t ? '' : 'btn-secondary'}`} onClick={() => setTopic(t)} aria-pressed={topic === t}>
            {topicLabel(t)}
          </button>
        ))}
      </div>

      <button className="btn recon-draft-action" onClick={generateDraft} disabled={loading}>
        {loading ? 'Drafting manager brief…' : `Generate ${topicLabel(topic)}`}
      </button>

      {draft && (
        <div className="recon-draft-shell">
          <div className="recon-draft-toolbar">
            <div><strong>{topicLabel(topic)}</strong><small>{station.name}</small></div>
            <button className="btn btn-secondary" onClick={copyDraft} disabled={source === 'error'}>{copied ? '✓ Copied' : 'Copy draft'}</button>
          </div>
          <div className="draft-output" role="region" aria-label="Generated draft">{draft}</div>
          <div className={`recon-draft-source ${source}`}>
            <strong>{sourceLabel}</strong>
            {source === 'gemini' ? ' · AI prose; manager verification required.' : source === 'fallback' ? ' · Local safety net keeps the demo usable without model access.' : source === 'error' ? ' · Check service health before using this section.' : ''}
          </div>
        </div>
      )}
    </div>
  )
}
