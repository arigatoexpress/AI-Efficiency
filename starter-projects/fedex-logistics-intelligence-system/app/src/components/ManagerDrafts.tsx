import { useEffect, useRef, useState } from 'react'
import type { StationConfig } from '../data/stations'

type DraftTopic = 'pre-shift' | 'handoff' | 'after-action'

interface Props {
  station: StationConfig
}

const topicLabel = (topic: DraftTopic) =>
  topic === 'handoff' ? 'Shift Handoff Brief' :
  topic === 'after-action' ? 'After-Action Summary' :
  'Pre-Shift Readiness Brief'

export default function ManagerDrafts({ station }: Props) {
  const [topic, setTopic] = useState<DraftTopic>('pre-shift')

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

      {/* Keep the topic controls mounted for focus, but give each context its
          own request, draft, loading state, and clipboard feedback. */}
      <DraftPanel key={`${station.id}:${topic}`} station={station} topic={topic} />
    </div>
  )
}

function DraftPanel({ station, topic }: Props & { topic: DraftTopic }) {
  const [loading, setLoading] = useState(false)
  const [draft, setDraft] = useState<string>('')
  const [source, setSource] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const request = useRef<AbortController | null>(null)

  useEffect(() => () => request.current?.abort(), [])

  const generateDraft = async () => {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setLoading(true)
    setDraft('')
    setSource('')
    setCopied(false)
    try {
      const res = await fetch('/api/compile-advice-draft', {
        method: 'POST',
        signal: controller.signal,
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
      if (controller.signal.aborted) return
      setDraft(data.draft || 'No draft returned.')
      setSource(data.source || 'unknown')
    } catch {
      if (controller.signal.aborted) return
      setDraft('Unable to reach the drafting service. Please try again.')
      setSource('error')
    } finally {
      if (!controller.signal.aborted) setLoading(false)
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

  const sourceLabel =
    source === 'gemini' ? 'Gemini AI draft' :
    source === 'fallback' ? 'Deterministic fallback' :
    source === 'error' ? 'Draft service unavailable' :
    source

  return (
    <>
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
    </>
  )
}
