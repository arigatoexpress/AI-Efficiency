import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fetchAircraft, type Aircraft } from '../lib/adapters/aircraft'

const MS_TO_KT = 1.94384
const NOW = new Date('2026-04-01T12:00:00.000Z')
const now = () => NOW

// OpenSky state vector: positional array, not an object. Indices from the
// live probe: 0 icao24, 1 callsign, 2 origin_country, 5 lon, 6 lat,
// 7 baro_altitude, 8 on_ground, 9 velocity m/s, 10 true_track, 11 vertical_rate.
function state(partial: {
  icao24?: string
  callsign?: string | null
  originCountry?: string | null
  lon?: number | null
  lat?: number | null
  altitudeM?: number | null
  onGround?: boolean
  velocityMs?: number | null
  headingDeg?: number | null
  verticalRateMs?: number | null
} = {}): unknown[] {
  return [
    partial.icao24 ?? 'a1b2c3',
    partial.callsign === undefined ? 'FDX710  ' : partial.callsign,
    partial.originCountry === undefined ? 'United States' : partial.originCountry,
    null,
    null,
    partial.lon === undefined ? -119.08 : partial.lon,
    partial.lat === undefined ? 45.89 : partial.lat,
    partial.altitudeM === undefined ? 11582 : partial.altitudeM,
    partial.onGround ?? false,
    partial.velocityMs === undefined ? 100 : partial.velocityMs,
    partial.headingDeg === undefined ? 270.5 : partial.headingDeg,
    partial.verticalRateMs === undefined ? -5.2 : partial.verticalRateMs,
  ]
}

function jsonFetch(body: unknown, status = 200): { fetchImpl: typeof fetch; calls: string[] } {
  const calls: string[] = []
  const fetchImpl = (async (url: string) => {
    calls.push(String(url))
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }) as typeof fetch
  return { fetchImpl, calls }
}

function bbox(n: number) {
  return { lamin: n, lomin: n + 1, lamax: n + 2, lomax: n + 3 }
}

test('normalises a positional-array state into a typed Aircraft, converting m/s to knots', async () => {
  const { fetchImpl } = jsonFetch({ time: 1787000000, states: [state()] })
  const result = await fetchAircraft({ bbox: bbox(1), fetchImpl, now })
  assert.equal(result.error, undefined)
  assert.equal(result.total, 1)
  assert.equal(result.aircraft.length, 1)
  const ac = result.aircraft[0] as Aircraft
  assert.equal(ac.icao24, 'a1b2c3')
  assert.equal(ac.callsign, 'FDX710')
  assert.equal(ac.originCountry, 'United States')
  assert.equal(ac.lat, 45.89)
  assert.equal(ac.lon, -119.08)
  assert.equal(ac.altitudeM, 11582)
  assert.equal(ac.velocityKt, 100 * MS_TO_KT)
  assert.equal(ac.headingDeg, 270.5)
  assert.equal(ac.verticalRateMs, -5.2)
  assert.equal(ac.onGround, false)
  assert.equal(ac.isFedEx, true)
  assert.equal(result.fetchedAt, NOW.toISOString())
})

test('FDX710 is flagged isFedEx true and SWA3414 is false', async () => {
  const { fetchImpl } = jsonFetch({
    time: 1787000000,
    states: [
      state({ icao24: 'fdx001', callsign: 'FDX710  ' }),
      state({ icao24: 'swa001', callsign: 'SWA3414 ', lat: 33.4, lon: -112.0, velocityMs: 80 }),
    ],
  })
  const result = await fetchAircraft({ bbox: bbox(2), fetchImpl, now })
  assert.equal(result.aircraft[0]?.isFedEx, true)
  assert.equal(result.aircraft[0]?.callsign, 'FDX710')
  assert.equal(result.aircraft[1]?.isFedEx, false)
  assert.equal(result.aircraft[1]?.callsign, 'SWA3414')
})

test('whitespace-only callsign becomes null and is not FedEx', async () => {
  const { fetchImpl } = jsonFetch({
    time: 1787000000,
    states: [state({ callsign: '      ' })],
  })
  const result = await fetchAircraft({ bbox: bbox(3), fetchImpl, now })
  assert.equal(result.aircraft[0]?.callsign, null)
  assert.equal(result.aircraft[0]?.isFedEx, false)
})

test('null latitude stays null and is not coerced to 0', async () => {
  const { fetchImpl } = jsonFetch({
    time: 1787000000,
    states: [state({ lat: null, lon: -119.08 })],
  })
  const result = await fetchAircraft({ bbox: bbox(4), fetchImpl, now })
  assert.equal(result.aircraft.length, 1)
  assert.equal(result.aircraft[0]?.lat, null)
  assert.notEqual(result.aircraft[0]?.lat, 0)
  assert.equal(result.aircraft[0]?.lon, -119.08)
})

test('fedexOnly filters to FedEx but total still reports the pre-filter count', async () => {
  const { fetchImpl } = jsonFetch({
    time: 1787000000,
    states: [
      state({ icao24: 'fdx001', callsign: 'FDX710  ' }),
      state({ icao24: 'swa001', callsign: 'SWA3414 ' }),
      state({ icao24: 'ual001', callsign: 'UAL123  ' }),
    ],
  })
  const result = await fetchAircraft({ bbox: bbox(5), fedexOnly: true, fetchImpl, now })
  assert.equal(result.total, 3)
  assert.equal(result.aircraft.length, 1)
  assert.equal(result.aircraft[0]?.callsign, 'FDX710')
  assert.equal(result.aircraft[0]?.isFedEx, true)
  assert.equal(result.fedexCount, 1)
})

test('empty states array is healthy with no error', async () => {
  const { fetchImpl } = jsonFetch({ time: 1787000000, states: [] })
  const result = await fetchAircraft({ bbox: bbox(6), fetchImpl, now })
  assert.equal(result.error, undefined)
  assert.deepEqual(result.aircraft, [])
  assert.equal(result.total, 0)
  assert.equal(result.fedexCount, 0)
  assert.equal(result.fetchedAt, NOW.toISOString())
})

test('HTTP 503 returns an error string and zero aircraft, and does not throw', async () => {
  const { fetchImpl } = jsonFetch({ error: 'unavailable' }, 503)
  const result = await fetchAircraft({ bbox: bbox(7), fetchImpl, now })
  assert.deepEqual(result.aircraft, [])
  assert.equal(result.total, 0)
  assert.equal(result.fedexCount, 0)
  assert.equal(typeof result.error, 'string')
  assert.match(result.error as string, /503/)
})

test('a second call inside the TTL does not call fetch again', async () => {
  const { fetchImpl, calls } = jsonFetch({
    time: 1787000000,
    states: [state({ callsign: 'FDX710  ' })],
  })
  const t0 = new Date('2026-05-01T00:00:00.000Z')
  const first = await fetchAircraft({
    bbox: bbox(8),
    fetchImpl,
    now: () => t0,
  })
  const second = await fetchAircraft({
    bbox: bbox(8),
    fetchImpl,
    now: () => new Date(t0.getTime() + 30_000),
  })
  assert.equal(calls.length, 1)
  assert.equal(second.fetchedAt, first.fetchedAt)
  assert.equal(second.aircraft[0]?.callsign, 'FDX710')
})

test('omitting bbox produces a URL with no lamin/lomax parameters', async () => {
  const { fetchImpl, calls } = jsonFetch({ time: 1787000000, states: [] })
  await fetchAircraft({
    fetchImpl,
    now: () => new Date('2026-06-01T00:00:00.000Z'),
  })
  assert.equal(calls.length, 1)
  const url = calls[0] as string
  assert.match(url, /^https:\/\/opensky-network\.org\/api\/states\/all/)
  assert.doesNotMatch(url, /lamin/)
  assert.doesNotMatch(url, /lomin/)
  assert.doesNotMatch(url, /lamax/)
  assert.doesNotMatch(url, /lomax/)
})
