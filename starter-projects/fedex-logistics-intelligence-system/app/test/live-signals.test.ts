import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  fetchAlerts,
  fetchLiveSignals,
  fetchQuakes,
  fetchWeather,
  STATION_LOCATIONS,
  type FetchLike,
} from '../lib/live-signals'

const GUC = STATION_LOCATIONS[0]
const NOW = new Date('2026-07-16T12:00:00Z')

function fakeFetch(routes: Record<string, unknown>): FetchLike {
  return async (url) => {
    for (const [needle, body] of Object.entries(routes)) {
      if (url.includes(needle)) {
        if (body instanceof Error) throw body
        return { ok: true, status: 200, json: async () => body }
      }
    }
    return { ok: false, status: 404, json: async () => ({}) }
  }
}

test('weather adapter converts metric responses to operational units', async () => {
  const fetchFn = fakeFetch({
    'open-meteo.com': { current: { temperature_2m: 0, wind_speed_10m: 32.2, snowfall: 2.54 } },
  })
  const w = await fetchWeather(GUC, fetchFn)
  assert.equal(w.tempF, 32)
  assert.equal(w.windMph, 20)
  assert.equal(w.snowfallIn, 1)
  assert.match(w.label, /LIVE public data: Open-Meteo/)
})

test('weather adapter returns nulls, not fabrications, for missing fields', async () => {
  const w = await fetchWeather(GUC, fakeFetch({ 'open-meteo.com': { current: {} } }))
  assert.equal(w.tempF, null)
  assert.equal(w.windMph, null)
  assert.equal(w.snowfallIn, null)
})

test('alerts adapter labels and caps NWS alerts', async () => {
  const feature = { properties: { event: 'Winter Storm Warning', severity: 'Severe', headline: 'Heavy snow' } }
  const alerts = await fetchAlerts(GUC, fakeFetch({ 'api.weather.gov': { features: Array(9).fill(feature) } }))
  assert.equal(alerts.length, 5)
  assert.equal(alerts[0].event, 'Winter Storm Warning')
  assert.match(alerts[0].label, /LIVE public data: NWS/)
})

test('quakes adapter maps USGS geojson and preserves magnitude ordering fields', async () => {
  const quakes = await fetchQuakes(GUC, fakeFetch({
    'earthquake.usgs.gov': { features: [{ properties: { mag: 3.4, place: '12km NW of Ridgway, CO', time: 1784500000000 } }] },
  }))
  assert.equal(quakes.length, 1)
  assert.equal(quakes[0].magnitude, 3.4)
  assert.match(quakes[0].place, /Ridgway/)
  assert.match(quakes[0].label, /LIVE public data: USGS/)
})

test('one dead feed degrades independently instead of failing the response', async () => {
  const signals = await fetchLiveSignals('GUC', fakeFetch({
    'open-meteo.com': { current: { temperature_2m: 20 } },
    'api.weather.gov': new Error('NWS down'),
    'earthquake.usgs.gov': { features: [] },
  }), NOW)
  assert.ok(signals)
  assert.equal((signals.weather as { tempF: number }).tempF, 68)
  assert.match((signals.alerts as { error: string }).error, /alerts unavailable/)
  assert.deepEqual(signals.quakes, [])
  assert.equal(signals.fetchedAt, NOW.toISOString())
})

test('unknown station codes return null rather than guessing coordinates', async () => {
  assert.equal(await fetchLiveSignals('ZZZ', fakeFetch({}), NOW), null)
})

test('station codes are case-insensitive', async () => {
  const signals = await fetchLiveSignals('guc', fakeFetch({
    'open-meteo.com': { current: {} }, 'api.weather.gov': { features: [] }, 'earthquake.usgs.gov': { features: [] },
  }), NOW)
  assert.equal(signals?.station, 'Gunnison, CO')
})

test('HTTP errors surface as per-source errors, never fabricated data', async () => {
  const signals = await fetchLiveSignals('MEM', fakeFetch({}), NOW) // every route 404s
  assert.ok(signals)
  assert.match((signals.weather as { error: string }).error, /HTTP 404/)
  assert.match((signals.alerts as { error: string }).error, /HTTP 404/)
  assert.match((signals.quakes as { error: string }).error, /HTTP 404/)
})
