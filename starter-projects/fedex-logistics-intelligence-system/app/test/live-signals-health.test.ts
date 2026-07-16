// Pure-logic contract tests for the per-source health summary.
// The summary is machine-readable monitoring surface over the same LiveSignals
// payload the API already returns: every source reports ok or degraded, cache
// freshness is stated explicitly, and an empty-but-valid feed ("no active
// alerts") counts as healthy — never as an outage.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  summarizeLiveSignalsHealth,
  type LiveAlert,
  type LiveQuake,
  type LiveSignals,
  type LiveWeather,
} from '../lib/live-signals'

const FETCHED_AT = '2026-07-16T12:00:00.000Z'

const okWeather: LiveWeather = {
  tempF: 68,
  windMph: 10,
  snowfallIn: 0,
  label: 'LIVE public data: Open-Meteo current conditions for Gunnison, CO',
}
const okAlert: LiveAlert = {
  event: 'Winter Storm Warning',
  severity: 'Severe',
  headline: 'Heavy snow',
  label: 'LIVE public data: NWS active alert near Gunnison, CO',
}
const okQuake: LiveQuake = {
  magnitude: 3.4,
  place: '12km NW of Ridgway, CO',
  time: '2026-07-15T00:00:00.000Z',
  label: 'LIVE public data: USGS earthquake feed near Gunnison, CO',
}

function signals(overrides: Partial<LiveSignals> = {}): LiveSignals {
  return {
    station: 'Gunnison, CO',
    fetchedAt: FETCHED_AT,
    weather: okWeather,
    alerts: [okAlert],
    quakes: [okQuake],
    ...overrides,
  }
}

test('all-healthy sources summarize to state ok with live freshness', () => {
  const health = summarizeLiveSignalsHealth(signals(), { cached: false })
  assert.equal(health.state, 'ok')
  assert.equal(health.freshness, 'live')
  assert.equal(health.fetchedAt, FETCHED_AT)
  assert.deepEqual(
    health.sources.map((s) => s.source),
    ['open-meteo', 'nws', 'usgs']
  )
  assert.deepEqual(
    health.sources.map((s) => s.label),
    ['Open-Meteo', 'NWS', 'USGS']
  )
  assert.ok(health.sources.every((s) => s.state === 'ok'))
  assert.ok(health.sources.every((s) => s.error === undefined))
})

test('empty-but-valid feeds stay healthy — no alerts is not an outage', () => {
  const health = summarizeLiveSignalsHealth(signals({ alerts: [], quakes: [] }), { cached: false })
  assert.equal(health.state, 'ok')
  assert.ok(health.sources.every((s) => s.state === 'ok'))
})

test('one failed source degrades the summary and preserves its error', () => {
  const health = summarizeLiveSignalsHealth(
    signals({ alerts: { error: 'alerts unavailable: NWS down' } }),
    { cached: false }
  )
  assert.equal(health.state, 'degraded')
  const bySource = Object.fromEntries(health.sources.map((s) => [s.source, s]))
  assert.equal(bySource['open-meteo'].state, 'ok')
  assert.equal(bySource.nws.state, 'degraded')
  assert.match(bySource.nws.error ?? '', /alerts unavailable: NWS down/)
  assert.equal(bySource.usgs.state, 'ok')
})

test('all sources failed degrades every entry with its own error preserved', () => {
  const health = summarizeLiveSignalsHealth(
    signals({
      weather: { error: 'weather unavailable: HTTP 503' },
      alerts: { error: 'alerts unavailable: HTTP 503' },
      quakes: { error: 'quakes unavailable: HTTP 503' },
    }),
    { cached: false }
  )
  assert.equal(health.state, 'degraded')
  assert.ok(health.sources.every((s) => s.state === 'degraded'))
  assert.match(health.sources[0].error ?? '', /weather unavailable/)
  assert.match(health.sources[1].error ?? '', /alerts unavailable/)
  assert.match(health.sources[2].error ?? '', /quakes unavailable/)
})

test('cache hits report cached freshness and keep fetch-time health and timestamp', () => {
  const health = summarizeLiveSignalsHealth(
    signals({ alerts: { error: 'alerts unavailable: NWS down' } }),
    { cached: true }
  )
  assert.equal(health.freshness, 'cached')
  assert.equal(health.state, 'degraded')
  assert.equal(health.fetchedAt, FETCHED_AT)
})
