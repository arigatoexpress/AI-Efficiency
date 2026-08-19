import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fetchFaaStatus } from '../lib/adapters/faa'

const NOW = new Date('2026-08-18T14:22:00Z')
const now = () => NOW

const FAA_URL = 'https://nasstatus.faa.gov/api/airport-status-information'

const CLOSURE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<AIRPORT_STATUS_INFORMATION>
<Update_Time>Mon Aug 18 2026 14:22:00 GMT</Update_Time>
<Delay_type>
<Name>Airport Closures</Name>
<Airport_Closure_List>
<Airport>
<ARPT>MEM</ARPT>
<Reason>WEATHER / THUNDERSTORMS</Reason>
<Start>08/18/2026 12:00 PM</Start>
<Reopen>08/18/2026 6:00 PM</Reopen>
</Airport>
</Airport_Closure_List>
</Delay_type>
</AIRPORT_STATUS_INFORMATION>`

const EMPTY_XML = `<?xml version="1.0" encoding="UTF-8"?>
<AIRPORT_STATUS_INFORMATION>
<Update_Time>Mon Aug 18 2026 14:22:00 GMT</Update_Time>
</AIRPORT_STATUS_INFORMATION>`

const TRUNCATED_XML = `<?xml version="1.0" encoding="UTF-8"?>
<AIRPORT_STATUS_INFORMATION>
<Update_Time>Mon Aug 18 2026 14:22:00 GMT</Update_Time>
<Delay_type>
<Name>Airport Closures</Name>
<Airport>
<ARPT>MEM</ARPT>`

const HTML_BODY = `<!DOCTYPE html>
<html>
<head><title>Login required</title></head>
<body><h1>Captive portal</h1></body>
</html>`

function asFetch(
  bodyOrImpl: string | (() => Promise<Response> | Response),
  opts: { status?: number } = {}
): typeof fetch {
  if (typeof bodyOrImpl === 'function') {
    return (async () => bodyOrImpl()) as typeof fetch
  }
  return (async () =>
    new Response(bodyOrImpl, {
      status: opts.status ?? 200,
      headers: { 'content-type': 'application/xml' },
    })) as typeof fetch
}

test('parses a realistic XML payload with one closure into the typed object', async () => {
  const result = await fetchFaaStatus({ fetchImpl: asFetch(CLOSURE_XML), now })
  assert.equal(result.delays.length, 1)
  assert.equal(result.delays[0].airport, 'MEM')
  assert.equal(result.delays[0].delayType, 'Airport Closures')
  assert.equal(result.delays[0].reason, 'WEATHER / THUNDERSTORMS')
  assert.equal(result.delays[0].avgDelay, null)
  assert.equal(
    result.delays[0].raw,
    `<Airport>
<ARPT>MEM</ARPT>
<Reason>WEATHER / THUNDERSTORMS</Reason>
<Start>08/18/2026 12:00 PM</Start>
<Reopen>08/18/2026 6:00 PM</Reopen>
</Airport>`
  )
  assert.equal(result.fetchedAt, NOW.toISOString())
  assert.equal(result.error, undefined)
})

test('extracts updateTime', async () => {
  const result = await fetchFaaStatus({ fetchImpl: asFetch(CLOSURE_XML), now })
  assert.equal(result.updateTime, 'Mon Aug 18 2026 14:22:00 GMT')
  assert.equal(result.error, undefined)
})

test('an empty-but-valid XML document is healthy with zero delays and no error', async () => {
  const result = await fetchFaaStatus({ fetchImpl: asFetch(EMPTY_XML), now })
  assert.deepEqual(result.delays, [])
  assert.equal(result.updateTime, 'Mon Aug 18 2026 14:22:00 GMT')
  assert.equal(result.fetchedAt, NOW.toISOString())
  assert.equal(result.error, undefined)
})

test('truncated or non-XML input returns an error and zero delays', async () => {
  const truncated = await fetchFaaStatus({ fetchImpl: asFetch(TRUNCATED_XML), now })
  assert.deepEqual(truncated.delays, [])
  assert.ok(truncated.error)

  const nonXml = await fetchFaaStatus({ fetchImpl: asFetch('{"not":"xml"}'), now })
  assert.deepEqual(nonXml.delays, [])
  assert.ok(nonXml.error)
})

test('HTML returned instead of XML returns an error and zero delays', async () => {
  const result = await fetchFaaStatus({ fetchImpl: asFetch(HTML_BODY), now })
  assert.deepEqual(result.delays, [])
  assert.ok(result.error)
  assert.match(result.error ?? '', /html/i)
})

test('a network failure returns an error and does not throw', async () => {
  const fetchImpl = asFetch(() => {
    throw new Error('ECONNRESET')
  })
  const result = await fetchFaaStatus({ fetchImpl, now })
  assert.deepEqual(result.delays, [])
  assert.match(result.error ?? '', /ECONNRESET/)
  assert.equal(result.updateTime, null)
  assert.equal(result.fetchedAt, NOW.toISOString())
})

test('a second call inside the TTL does not re-fetch', async () => {
  let calls = 0
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls += 1
    assert.equal(String(input), FAA_URL)
    assert.ok(init?.signal, 'request must carry an AbortSignal')
    return new Response(CLOSURE_XML, { status: 200 })
  }) as typeof fetch

  const first = await fetchFaaStatus({ fetchImpl, now })
  const second = await fetchFaaStatus({ fetchImpl, now })

  assert.equal(calls, 1)
  assert.equal(second.delays.length, 1)
  assert.equal(second.delays[0].airport, 'MEM')
  assert.equal(second.fetchedAt, first.fetchedAt)
  assert.equal(second.updateTime, first.updateTime)
})
