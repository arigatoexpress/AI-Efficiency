import { useEffect, useState } from 'react'
import type { StationConfig } from '../data/stations'

// Maps dashboard station ids to the server's live-signal station codes.
const STATION_CODES: Record<string, string> = {
  gunnison: 'GUC',
  memphis: 'MEM',
  indianapolis: 'IND',
  phoenix: 'PHX',
}

interface LiveWeather { tempF: number | null; windMph: number | null; snowfallIn: number | null; label: string }
interface LiveAlert { event: string; severity: string; headline: string; label: string }
interface LiveQuake { magnitude: number; place: string; time: string; label: string }
interface SourceHealth { source: string; label: string; state: 'ok' | 'degraded'; error?: string }
interface LiveSignalsHealth {
  state: 'ok' | 'degraded'
  freshness: 'live' | 'cached'
  fetchedAt: string
  sources: SourceHealth[]
}
interface LiveResponse {
  enabled: boolean
  cached?: boolean
  station?: string
  fetchedAt?: string
  weather?: LiveWeather | { error: string }
  alerts?: LiveAlert[] | { error: string }
  quakes?: LiveQuake[] | { error: string }
  health?: LiveSignalsHealth
}

interface Props {
  station: StationConfig
  enabled: boolean
}

// Renders only when the server has LIVE_SIGNALS=on. Every value shown here
// came from a public API moments ago and carries its source label.
export default function LiveSignalsPanel({ station, enabled }: Props) {
  const [data, setData] = useState<LiveResponse | null>(null)

  useEffect(() => {
    if (!enabled) return
    const code = STATION_CODES[station.id]
    if (!code) return
    let cancelled = false
    setData(null)
    fetch(`/api/live-signals?station=${code}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setData(d) })
      .catch(() => { if (!cancelled) setData({ enabled: true, weather: { error: 'request failed' } }) })
    return () => { cancelled = true }
  }, [station.id, enabled])

  if (!enabled) return null

  const weather = data?.weather && !('error' in data.weather) ? data.weather : null
  const alerts = Array.isArray(data?.alerts) ? data.alerts : null
  const quakes = Array.isArray(data?.quakes) ? data.quakes : null

  return (
    <div className="panel col-12">
      <h2>
        <span className="icon" aria-hidden="true">📡</span> Live Public Signals{' '}
        <span className="badge badge-normal">LIVE public data</span>
      </h2>
      <p>
        Fetched directly from public APIs (Open-Meteo, National Weather Service,
        USGS){data?.fetchedAt ? ` at ${new Date(data.fetchedAt).toLocaleTimeString()}` : ''}
        {data?.cached ? ' (cached, refreshes every 5 minutes)' : ''}. Live data
        still needs manager verification before any operational decision.
      </p>
      {!data && <p>Loading live signals…</p>}
      {data?.health && (
        <p>
          <strong>Source health:</strong>{' '}
          {data.health.state === 'ok'
            ? 'all public sources responding'
            : 'degraded — a public source is unreachable; verify live values before relying on them'}
          {' '}({data.health.sources.map((s) => `${s.label} ${s.state}`).join(' · ')})
          {data.health.freshness === 'cached' ? ' — cached snapshot, health as of fetch time' : ''}.
        </p>
      )}
      {data && (
        <ul>
          <li>
            <strong>Weather:</strong>{' '}
            {weather
              ? `${weather.tempF ?? '—'}°F, wind ${weather.windMph ?? '—'} mph, snowfall ${weather.snowfallIn ?? '—'} in`
              : `unavailable — ${(data.weather as { error: string })?.error ?? 'no data'}`}
          </li>
          <li>
            <strong>NWS alerts:</strong>{' '}
            {alerts
              ? alerts.length === 0
                ? 'none active near this station'
                : alerts.map((a) => `${a.event} (${a.severity})`).join('; ')
              : `unavailable — ${(data.alerts as { error: string })?.error ?? 'no data'}`}
          </li>
          <li>
            <strong>USGS quakes (300 km, 7 days, M≥2.5):</strong>{' '}
            {quakes
              ? quakes.length === 0
                ? 'none reported'
                : quakes.slice(0, 3).map((q) => `M${q.magnitude} ${q.place}`).join('; ')
              : `unavailable — ${(data.quakes as { error: string })?.error ?? 'no data'}`}
          </li>
        </ul>
      )}
    </div>
  )
}
