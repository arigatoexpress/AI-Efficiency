// HTTP contract tests for the deployable Express boundary.
// Each test boots the real app from lib/create-app.ts on an ephemeral port and
// drives it with the built-in fetch — no supertest, no network, no credentials.
// Upstream public feeds, the clock, and the Gemini client are injected doubles,
// so every assertion is deterministic and offline.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { AddressInfo } from 'node:net'
import { createApp, type CreateAppOptions, type GeminiLike } from '../lib/create-app'
import type { FetchLike } from '../lib/live-signals'

const NOW = new Date('2026-07-16T12:00:00Z')

// Healthy canned responses for the three public feeds (Open-Meteo, NWS, USGS).
const LIVE_ROUTES: Record<string, unknown> = {
  'open-meteo.com': { current: { temperature_2m: 20, wind_speed_10m: 16, snowfall: 0 } },
  'api.weather.gov': { features: [] },
  'earthquake.usgs.gov': { features: [] },
}

// Fetch double that records every URL it is asked for, so tests can prove
// when zero (or no new) upstream requests happened.
function countingFetch(routes: Record<string, unknown>) {
  const calls: string[] = []
  const fetchFn: FetchLike = async (url) => {
    calls.push(url)
    for (const [needle, body] of Object.entries(routes)) {
      if (url.includes(needle)) {
        if (body instanceof Error) throw body
        return { ok: true, status: 200, json: async () => body }
      }
    }
    return { ok: false, status: 404, json: async () => ({}) }
  }
  return { fetchFn, calls }
}

// Stand-in for the Gemini client: proves the gemini code path is honored
// without constructing the real SDK or touching credentials.
const stubGemini: GeminiLike = {
  models: {
    generateContent: async () => ({ text: 'stub model draft' }),
  },
}

async function startApp(options: CreateAppOptions) {
  const server = createApp(options).listen(0)
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const { port } = server.address() as AddressInfo
  const close = async () => {
    server.closeIdleConnections()
    await new Promise<void>((resolve) => server.close(() => resolve()))
  }
  return { base: `http://127.0.0.1:${port}`, close }
}

test('GET /api/health reports safe config flags and never leaks credentials', async (t) => {
  const { fetchFn } = countingFetch({})
  const srv = await startApp({
    env: { GEMINI_API_KEY: 'test-secret-key-value' },
    fetchFn,
    genAI: stubGemini,
    now: () => NOW,
  })
  t.after(srv.close)

  const res = await fetch(`${srv.base}/api/health`)
  assert.equal(res.status, 200)
  const body = (await res.json()) as Record<string, unknown>
  assert.equal(body.status, 'ok')
  assert.equal(body.geminiConfigured, true)
  assert.equal(body.liveSignals, false)
  assert.equal(body.timestamp, NOW.toISOString())
  assert.doesNotMatch(JSON.stringify(body), /test-secret-key-value/)
})

test('live-signals-off performs zero upstream requests', async (t) => {
  const { fetchFn, calls } = countingFetch(LIVE_ROUTES)
  const srv = await startApp({ env: {}, fetchFn })
  t.after(srv.close)

  const res = await fetch(`${srv.base}/api/live-signals?station=GUC`)
  assert.equal(res.status, 200)
  const body = (await res.json()) as { enabled: boolean; note: string }
  assert.equal(body.enabled, false)
  assert.match(body.note, /synthetic demo data/)
  assert.deepEqual(calls, [])
})

test('unknown station returns HTTP 400 and never guesses coordinates', async (t) => {
  const { fetchFn, calls } = countingFetch(LIVE_ROUTES)
  const srv = await startApp({ env: { LIVE_SIGNALS: 'on' }, fetchFn })
  t.after(srv.close)

  const res = await fetch(`${srv.base}/api/live-signals?station=ZZZ`)
  assert.equal(res.status, 400)
  const body = (await res.json()) as Record<string, unknown>
  assert.match(String(body.error), /unknown station code: ZZZ/)
  assert.equal(body.lat, undefined)
  assert.equal(body.lon, undefined)
  assert.equal(body.station, undefined)
  assert.deepEqual(calls, [])
})

test('one failed public feed degrades independently while the response stays useful', async (t) => {
  const { fetchFn } = countingFetch({ ...LIVE_ROUTES, 'api.weather.gov': new Error('NWS down') })
  const srv = await startApp({ env: { LIVE_SIGNALS: 'on' }, fetchFn, now: () => NOW })
  t.after(srv.close)

  const res = await fetch(`${srv.base}/api/live-signals?station=GUC`)
  assert.equal(res.status, 200)
  const body = (await res.json()) as {
    enabled: boolean
    cached: boolean
    station: string
    fetchedAt: string
    weather: { tempF: number; label: string }
    alerts: { error: string }
    quakes: unknown[]
  }
  assert.equal(body.enabled, true)
  assert.equal(body.cached, false)
  assert.equal(body.station, 'Gunnison, CO')
  assert.equal(body.fetchedAt, NOW.toISOString())
  assert.equal(body.weather.tempF, 68)
  assert.match(body.weather.label, /LIVE public data: Open-Meteo/)
  assert.match(body.alerts.error, /alerts unavailable/)
  assert.deepEqual(body.quakes, [])
})

test('second same-station request inside five minutes returns cached:true with no new upstream calls', async (t) => {
  const { fetchFn, calls } = countingFetch(LIVE_ROUTES)
  let nowMs = NOW.getTime()
  const srv = await startApp({ env: { LIVE_SIGNALS: 'on' }, fetchFn, now: () => new Date(nowMs) })
  t.after(srv.close)

  const first = (await (await fetch(`${srv.base}/api/live-signals?station=GUC`)).json()) as {
    cached: boolean
    fetchedAt: string
  }
  assert.equal(first.cached, false)
  const callsAfterFirst = calls.length
  assert.ok(callsAfterFirst > 0)

  nowMs += 60_000 // one minute later — inside the five-minute cache window
  const secondRes = await fetch(`${srv.base}/api/live-signals?station=GUC`)
  assert.equal(secondRes.status, 200)
  const second = (await secondRes.json()) as { enabled: boolean; cached: boolean; fetchedAt: string }
  assert.equal(second.enabled, true)
  assert.equal(second.cached, true)
  assert.equal(second.fetchedAt, first.fetchedAt)
  assert.equal(calls.length, callsAfterFirst)
})

// Shape of the additive per-source health block on /api/live-signals.
interface HealthBody {
  health: {
    state: 'ok' | 'degraded'
    freshness: 'live' | 'cached'
    fetchedAt: string
    sources: Array<{ source: string; label: string; state: 'ok' | 'degraded'; error?: string }>
  }
}

test('live-signals response carries a machine-readable per-source health summary', async (t) => {
  const { fetchFn } = countingFetch(LIVE_ROUTES)
  const srv = await startApp({ env: { LIVE_SIGNALS: 'on' }, fetchFn, now: () => NOW })
  t.after(srv.close)

  const res = await fetch(`${srv.base}/api/live-signals?station=GUC`)
  assert.equal(res.status, 200)
  const body = (await res.json()) as { fetchedAt: string } & HealthBody
  // NWS and USGS fixtures return empty feeds here: empty-but-valid stays ok.
  assert.equal(body.health.state, 'ok')
  assert.equal(body.health.freshness, 'live')
  assert.equal(body.health.fetchedAt, body.fetchedAt)
  assert.deepEqual(
    body.health.sources.map((s) => s.source),
    ['open-meteo', 'nws', 'usgs']
  )
  assert.deepEqual(
    body.health.sources.map((s) => s.label),
    ['Open-Meteo', 'NWS', 'USGS']
  )
  assert.ok(body.health.sources.every((s) => s.state === 'ok'))
})

test('a failed feed is degraded in the health summary with its error preserved, others stay ok', async (t) => {
  const { fetchFn } = countingFetch({ ...LIVE_ROUTES, 'api.weather.gov': new Error('NWS down') })
  const srv = await startApp({ env: { LIVE_SIGNALS: 'on' }, fetchFn, now: () => NOW })
  t.after(srv.close)

  const res = await fetch(`${srv.base}/api/live-signals?station=GUC`)
  assert.equal(res.status, 200)
  const body = (await res.json()) as HealthBody
  assert.equal(body.health.state, 'degraded')
  const bySource = Object.fromEntries(body.health.sources.map((s) => [s.source, s]))
  assert.equal(bySource['open-meteo'].state, 'ok')
  assert.equal(bySource.nws.state, 'degraded')
  assert.match(bySource.nws.error ?? '', /alerts unavailable: NWS down/)
  assert.equal(bySource.usgs.state, 'ok')
})

test('a cached response keeps fetch-time health and reports cached freshness', async (t) => {
  const { fetchFn } = countingFetch({ ...LIVE_ROUTES, 'api.weather.gov': new Error('NWS down') })
  let nowMs = NOW.getTime()
  const srv = await startApp({ env: { LIVE_SIGNALS: 'on' }, fetchFn, now: () => new Date(nowMs) })
  t.after(srv.close)

  const first = (await (await fetch(`${srv.base}/api/live-signals?station=GUC`)).json()) as {
    fetchedAt: string
  } & HealthBody
  assert.equal(first.health.state, 'degraded')
  assert.equal(first.health.freshness, 'live')

  nowMs += 60_000 // one minute later — inside the five-minute cache window
  const second = (await (await fetch(`${srv.base}/api/live-signals?station=GUC`)).json()) as {
    cached: boolean
  } & HealthBody
  assert.equal(second.cached, true)
  assert.equal(second.health.freshness, 'cached')
  assert.equal(second.health.state, 'degraded') // cache never resets health
  assert.equal(second.health.fetchedAt, first.fetchedAt)
  const nws = second.health.sources.find((s) => s.source === 'nws')
  assert.match(nws?.error ?? '', /alerts unavailable: NWS down/)
})

test('draft POST with no Gemini client returns 200, source "fallback", and the manager-review footer', async (t) => {
  const srv = await startApp({ env: {}, genAI: null })
  t.after(srv.close)

  const res = await fetch(`${srv.base}/api/compile-advice-draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ station: 'Gunnison, CO' }),
  })
  assert.equal(res.status, 200)
  const body = (await res.json()) as { source: string; topic: string; draft: string }
  assert.equal(body.source, 'fallback')
  assert.equal(body.topic, 'Pre-Shift Readiness Brief')
  assert.match(body.draft, /A manager must verify all facts before acting\./)
  assert.match(body.draft, /Station: Gunnison, CO/)
  assert.match(body.draft, /synthetic demo data/)
})
