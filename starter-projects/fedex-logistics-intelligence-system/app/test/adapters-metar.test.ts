// Contract tests for the aviationweather.gov METAR adapter.
// Injected fetch only — these never touch the network. Missing fields stay
// null, unknown visibility never becomes VFR, and a failed fetch degrades
// this source instead of throwing.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fetchMetar } from '../lib/adapters/metar'

const NOW = new Date('2026-08-18T18:00:00.000Z')

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function fakeFetch(body: unknown, status = 200): typeof fetch {
  return async () => jsonResponse(body, status)
}

// Assert helper: "10+" must parse as a positive statute-mile value, never 0/NaN.
function parseVisibilityForAssert(value: string): number {
  if (value.endsWith('+')) return Number(value.slice(0, -1))
  return Number(value)
}

test('parses a realistic METAR response into the typed object', async () => {
  const fetchImpl = fakeFetch([
    {
      icaoId: 'KDEN',
      temp: 27.8,
      dewp: 8.3,
      wspd: 11,
      wdir: 180,
      visib: 10,
      altim: 30.12,
      rawOb: 'KDEN 181855Z 18011KT 10SM FEW120 SCT200 28/08 A3012',
      reportTime: '2026-08-18T18:55:00Z',
    },
  ])
  const result = await fetchMetar({ icaoIds: ['KDEN'], fetchImpl, now: () => NOW })
  assert.equal(result.error, undefined)
  assert.equal(result.fetchedAt, NOW.toISOString())
  assert.equal(result.stations.length, 1)
  const metar = result.stations[0]
  assert.equal(metar.icaoId, 'KDEN')
  assert.equal(metar.tempC, 27.8)
  assert.equal(metar.dewpointC, 8.3)
  assert.equal(metar.windKt, 11)
  assert.equal(metar.windDirDeg, 180)
  assert.equal(metar.visibility, '10')
  assert.equal(metar.altimeter, 30.12)
  assert.equal(metar.raw, 'KDEN 181855Z 18011KT 10SM FEW120 SCT200 28/08 A3012')
  assert.equal(metar.reportTime, '2026-08-18T18:55:00Z')
  assert.equal(metar.flightCategory, 'VFR')
})

test('visib "10+" is handled and does not become 0 or NaN', async () => {
  const fetchImpl = fakeFetch([
    {
      icaoId: 'KGJT',
      temp: 35.6,
      dewp: 4.0,
      wspd: 8,
      wdir: 250,
      visib: '10+',
      altim: 30.05,
      rawOb: 'KGJT 181853Z 25008KT 10SM CLR 36/04 A3005',
      reportTime: '2026-08-18T18:53:00Z',
    },
  ])
  const result = await fetchMetar({ icaoIds: ['KGJT'], fetchImpl, now: () => NOW })
  const metar = result.stations[0]
  assert.equal(metar.visibility, '10+')
  assert.notEqual(metar.visibility, 0)
  assert.ok(metar.visibility !== null && !Number.isNaN(parseVisibilityForAssert(metar.visibility)))
  assert.notEqual(metar.flightCategory, 'LIFR')
  assert.equal(metar.flightCategory, 'VFR')
})

test('a missing temp becomes null, not 0', async () => {
  const fetchImpl = fakeFetch([
    {
      icaoId: 'KMEM',
      dewp: 18.0,
      wspd: 6,
      wdir: 200,
      visib: 10,
      altim: 29.98,
      rawOb: 'KMEM 181854Z 20006KT 10SM FEW050 32/18 A2998',
      reportTime: '2026-08-18T18:54:00Z',
    },
  ])
  const result = await fetchMetar({ icaoIds: ['KMEM'], fetchImpl, now: () => NOW })
  assert.equal(result.stations[0].tempC, null)
  assert.notEqual(result.stations[0].tempC, 0)
})

test('flight category is computed for a clear VFR case and a low-vis LIFR case', async () => {
  const fetchImpl = fakeFetch([
    {
      icaoId: 'KCOS',
      temp: 22.0,
      visib: 10,
      rawOb: 'KCOS 181854Z 18006KT 10SM SKC 22/04 A3018',
      reportTime: '2026-08-18T18:54:00Z',
    },
    {
      icaoId: 'KTEX',
      temp: 4.0,
      visib: 0.25,
      rawOb: 'KTEX 181855Z 00000KT 1/4SM FG OVC002 04/04 A2980',
      reportTime: '2026-08-18T18:55:00Z',
    },
  ])
  const result = await fetchMetar({ icaoIds: ['KCOS', 'KTEX'], fetchImpl, now: () => NOW })
  const byId = Object.fromEntries(result.stations.map((s) => [s.icaoId, s]))
  assert.equal(byId.KCOS.flightCategory, 'VFR')
  assert.equal(byId.KTEX.flightCategory, 'LIFR')
})

test('unknown visibility yields flightCategory null — never a default VFR', async () => {
  const fetchImpl = fakeFetch([
    {
      icaoId: 'KUNK',
      temp: 22.0,
      dewp: 4.0,
      wspd: 4,
      wdir: 180,
      rawOb: 'KUNK 181855Z 18004KT SKC 22/04 A3010',
      reportTime: '2026-08-18T18:55:00Z',
    },
  ])
  const result = await fetchMetar({ icaoIds: ['KUNK'], fetchImpl, now: () => NOW })
  const metar = result.stations[0]
  assert.equal(metar.visibility, null)
  assert.equal(metar.flightCategory, null)
  assert.notEqual(metar.flightCategory, 'VFR')
})

test('an empty id list makes no fetch call', async () => {
  let calls = 0
  const fetchImpl: typeof fetch = async () => {
    calls += 1
    return jsonResponse([])
  }
  const result = await fetchMetar({ icaoIds: [], fetchImpl, now: () => NOW })
  assert.equal(calls, 0)
  assert.deepEqual(result.stations, [])
  assert.equal(result.error, undefined)
  assert.equal(result.fetchedAt, NOW.toISOString())
})

test('a network failure returns an error and does not throw', async () => {
  const fetchImpl: typeof fetch = async () => {
    throw new Error('network down')
  }
  const result = await fetchMetar({ icaoIds: ['KSEA'], fetchImpl, now: () => NOW })
  assert.deepEqual(result.stations, [])
  assert.match(result.error ?? '', /network down/)
  assert.equal(result.fetchedAt, NOW.toISOString())
})

test('ids are uppercased in the request URL', async () => {
  let requestedUrl = ''
  const fetchImpl: typeof fetch = async (input) => {
    requestedUrl = String(input)
    return jsonResponse([])
  }
  await fetchMetar({ icaoIds: ['kden', 'kmem'], fetchImpl, now: () => NOW })
  assert.match(requestedUrl, /ids=KDEN,KMEM/)
  assert.ok(!requestedUrl.includes('kden'))
  assert.ok(!requestedUrl.includes('kmem'))
})
