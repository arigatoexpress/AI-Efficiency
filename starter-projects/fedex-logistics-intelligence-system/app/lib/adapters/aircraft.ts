// OpenSky Network live aircraft adapter (ADS-B).
// Anonymous access is rate-limited; successful responses are cached in-memory
// for 60s, keyed by bbox or "global". Missing fields stay null — never
// defaulted, guessed, or zero-filled. HTTP failures degrade this source only.

export interface Aircraft {
  icao24: string
  callsign: string | null
  originCountry: string | null
  lat: number | null
  lon: number | null
  altitudeM: number | null
  velocityKt: number | null
  headingDeg: number | null
  verticalRateMs: number | null
  onGround: boolean
  isFedEx: boolean
}

export interface AircraftResult {
  aircraft: Aircraft[]
  total: number
  fedexCount: number
  fetchedAt: string
  error?: string
}

const OPENSKY_STATES_URL = 'https://opensky-network.org/api/states/all'
const TIMEOUT_MS = 15_000
const CACHE_TTL_MS = 60_000
const MS_TO_KT = 1.94384

type BBox = { lamin: number; lomin: number; lamax: number; lomax: number }

interface CacheEntry {
  aircraft: Aircraft[]
  total: number
  fetchedAt: string
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()

function cacheKey(bbox?: BBox): string {
  if (!bbox) return 'global'
  return `${bbox.lamin},${bbox.lomin},${bbox.lamax},${bbox.lomax}`
}

function buildUrl(bbox?: BBox): string {
  if (!bbox) return OPENSKY_STATES_URL
  const url = new URL(OPENSKY_STATES_URL)
  url.searchParams.set('lamin', String(bbox.lamin))
  url.searchParams.set('lomin', String(bbox.lomin))
  url.searchParams.set('lamax', String(bbox.lamax))
  url.searchParams.set('lomax', String(bbox.lomax))
  return url.toString()
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function errorResult(error: string, fetchedAt: string): AircraftResult {
  return { aircraft: [], total: 0, fedexCount: 0, fetchedAt, error }
}

function mapState(row: unknown): Aircraft | null {
  if (!Array.isArray(row)) return null
  const icao24 = typeof row[0] === 'string' ? row[0] : null
  if (icao24 === null) return null
  const callsign = asNullableString(row[1])
  const velocityMs = asNumber(row[9])
  return {
    icao24,
    callsign,
    originCountry: asNullableString(row[2]),
    lon: asNumber(row[5]),
    lat: asNumber(row[6]),
    altitudeM: asNumber(row[7]),
    velocityKt: velocityMs === null ? null : velocityMs * MS_TO_KT,
    headingDeg: asNumber(row[10]),
    verticalRateMs: asNumber(row[11]),
    onGround: row[8] === true,
    isFedEx: callsign !== null && callsign.startsWith('FDX'),
  }
}

function present(all: Aircraft[], total: number, fetchedAt: string, fedexOnly: boolean): AircraftResult {
  const fedexCount = all.filter((a) => a.isFedEx).length
  return {
    aircraft: fedexOnly ? all.filter((a) => a.isFedEx) : all.slice(),
    total,
    fedexCount,
    fetchedAt,
  }
}

export async function fetchAircraft(opts: {
  bbox?: BBox
  fedexOnly?: boolean
  fetchImpl?: typeof fetch
  now?: () => Date
} = {}): Promise<AircraftResult> {
  const clock = opts.now ?? (() => new Date())
  const fetchedAtNow = clock()
  const fetchedAt = fetchedAtNow.toISOString()
  const fedexOnly = opts.fedexOnly === true
  const key = cacheKey(opts.bbox)
  const hit = cache.get(key)
  if (hit && fetchedAtNow.getTime() < hit.expiresAt) {
    return present(hit.aircraft, hit.total, hit.fetchedAt, fedexOnly)
  }

  const fetchFn = opts.fetchImpl ?? fetch
  try {
    const res = await fetchFn(buildUrl(opts.bbox), { signal: AbortSignal.timeout(TIMEOUT_MS) })
    if (!res.ok) return errorResult(`HTTP ${res.status}`, fetchedAt)
    const data: unknown = await res.json()
    const rawStates =
      data !== null && typeof data === 'object' && 'states' in data
        ? (data as { states: unknown }).states
        : undefined
    const states = Array.isArray(rawStates) ? rawStates : rawStates == null ? [] : null
    if (states === null) {
      return errorResult('unexpected OpenSky payload: states is not an array', fetchedAt)
    }

    const aircraft: Aircraft[] = []
    for (const row of states) {
      const mapped = mapState(row)
      if (mapped) aircraft.push(mapped)
    }

    cache.set(key, {
      aircraft,
      total: states.length,
      fetchedAt,
      expiresAt: fetchedAtNow.getTime() + CACHE_TTL_MS,
    })
    return present(aircraft, states.length, fetchedAt, fedexOnly)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return errorResult(message, fetchedAt)
  }
}
