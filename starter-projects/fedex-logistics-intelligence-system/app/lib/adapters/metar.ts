// Aviation weather adapter: aviationweather.gov METAR.
// Missing fields stay null — never a default, never a guess, never 0.
// A failed fetch degrades this source only (empty stations + error) and
// never throws. An empty-but-valid response is healthy. Flight category
// is derived from visibility and ceiling; unknown visibility is null,
// never a default VFR.

export interface Metar {
  icaoId: string
  tempC: number | null
  dewpointC: number | null
  windKt: number | null
  windDirDeg: number | null
  visibility: string | null
  altimeter: number | null
  raw: string | null
  reportTime: string | null
  flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR' | null
}

export interface MetarResult {
  stations: Metar[]
  fetchedAt: string
  error?: string
}

const METAR_URL = 'https://aviationweather.gov/api/data/metar'
const TIMEOUT_MS = 15_000
const CACHE_TTL_MS = 5 * 60 * 1000

const cache = new Map<string, { at: number; result: MetarResult }>()

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value.trim())
    return Number.isFinite(n) ? n : null
  }
  return null
}

function asString(value: unknown): string | null {
  if (typeof value === 'string') return value
  return null
}

function asVisibilityString(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return null
}

// Statute miles. "10+" means at least 10 — never Number("10+") which is NaN.
function parseVisibilityMiles(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string') return null
  const s = value.trim()
  if (!s) return null
  if (s.endsWith('+')) {
    const n = Number(s.slice(0, -1).trim())
    return Number.isFinite(n) ? n : null
  }
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/)
  if (mixed) {
    const den = Number(mixed[3])
    if (den === 0) return null
    const n = Number(mixed[1]) + Number(mixed[2]) / den
    return Number.isFinite(n) ? n : null
  }
  const frac = s.match(/^(\d+)\/(\d+)$/)
  if (frac) {
    const den = Number(frac[2])
    if (den === 0) return null
    const n = Number(frac[1]) / den
    return Number.isFinite(n) ? n : null
  }
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

// Ceiling is the lowest BKN/OVC/VV layer, in feet AGL. FEW/SCT is not a ceiling.
function parseCeilingFt(obs: Record<string, unknown>): number | null {
  const heights: number[] = []
  const vertVis = asFiniteNumber(obs.vertVis)
  if (vertVis != null) heights.push(vertVis)

  if (Array.isArray(obs.clouds)) {
    for (const layer of obs.clouds) {
      if (!layer || typeof layer !== 'object') continue
      const cloud = layer as Record<string, unknown>
      const cover = typeof cloud.cover === 'string' ? cloud.cover.toUpperCase() : ''
      if (cover !== 'BKN' && cover !== 'OVC' && cover !== 'OVX' && cover !== 'VV') continue
      const base = asFiniteNumber(cloud.base)
      if (base != null) heights.push(base)
    }
  }

  const raw = asString(obs.rawOb)
  if (raw) {
    for (const match of raw.matchAll(/\b(?:BKN|OVC|VV)(\d{3})\b/g)) {
      heights.push(Number(match[1]) * 100)
    }
  }

  return heights.length > 0 ? Math.min(...heights) : null
}

function categoryFromVis(visSm: number): Metar['flightCategory'] {
  if (visSm < 1) return 'LIFR'
  if (visSm < 3) return 'IFR'
  if (visSm <= 5) return 'MVFR'
  return 'VFR'
}

function categoryFromCeiling(ceilingFt: number): Metar['flightCategory'] {
  if (ceilingFt < 500) return 'LIFR'
  if (ceilingFt < 1000) return 'IFR'
  if (ceilingFt <= 3000) return 'MVFR'
  return 'VFR'
}

const CATEGORY_RANK: Record<Exclude<Metar['flightCategory'], null>, number> = {
  LIFR: 0,
  IFR: 1,
  MVFR: 2,
  VFR: 3,
}

// Unknown visibility → null. Never default to VFR. When both vis and
// ceiling are known, the more restrictive category wins.
function deriveFlightCategory(visSm: number | null, ceilingFt: number | null): Metar['flightCategory'] {
  if (visSm == null) return null
  const fromVis = categoryFromVis(visSm)
  if (ceilingFt == null) return fromVis
  const fromCeil = categoryFromCeiling(ceilingFt)
  return CATEGORY_RANK[fromVis] <= CATEGORY_RANK[fromCeil] ? fromVis : fromCeil
}

function parseMetar(item: unknown): Metar | null {
  if (!item || typeof item !== 'object') return null
  const obs = item as Record<string, unknown>
  const icaoId = asString(obs.icaoId)
  if (!icaoId) return null

  const visSm = parseVisibilityMiles(obs.visib)
  return {
    icaoId,
    tempC: asFiniteNumber(obs.temp),
    dewpointC: asFiniteNumber(obs.dewp),
    windKt: asFiniteNumber(obs.wspd),
    windDirDeg: asFiniteNumber(obs.wdir),
    visibility: asVisibilityString(obs.visib),
    altimeter: asFiniteNumber(obs.altim),
    raw: asString(obs.rawOb),
    reportTime: asString(obs.reportTime),
    flightCategory: deriveFlightCategory(visSm, parseCeilingFt(obs)),
  }
}

function errorResult(fetchedAt: string, error: unknown): MetarResult {
  const message = error instanceof Error ? error.message : String(error)
  return { stations: [], fetchedAt, error: message }
}

export async function fetchMetar(opts: {
  icaoIds: string[]
  fetchImpl?: typeof fetch
  now?: () => Date
}): Promise<MetarResult> {
  const clock = opts.now ?? (() => new Date())
  const at = clock()
  const fetchedAt = at.toISOString()

  if (opts.icaoIds.length === 0) {
    return { stations: [], fetchedAt }
  }

  const ids = opts.icaoIds.map((id) => id.toUpperCase())
  const cacheKey = [...ids].sort().join(',')
  const cached = cache.get(cacheKey)
  if (cached && at.getTime() - cached.at < CACHE_TTL_MS) {
    return cached.result
  }

  try {
    const fetchFn = opts.fetchImpl ?? fetch
    const url = `${METAR_URL}?ids=${ids.join(',')}&format=json`
    const res = await fetchFn(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
    if (!res.ok) {
      return errorResult(fetchedAt, new Error(`HTTP ${res.status}`))
    }
    const payload: unknown = await res.json()
    if (!Array.isArray(payload)) {
      return errorResult(fetchedAt, new Error('unexpected METAR payload'))
    }
    const stations: Metar[] = []
    for (const item of payload) {
      const parsed = parseMetar(item)
      if (parsed) stations.push(parsed)
    }
    const result: MetarResult = { stations, fetchedAt }
    cache.set(cacheKey, { at: at.getTime(), result })
    return result
  } catch (err) {
    return errorResult(fetchedAt, err)
  }
}
