// Live public-data adapters: Open-Meteo (weather), NWS (alerts), USGS (quakes).
// Disabled by default — the server only calls these when LIVE_SIGNALS=on, so
// the deployed demo stays synthetic until the swap is a deliberate, reviewed
// action. Every returned value carries a label naming its source, and every
// source degrades independently: one dead feed never breaks the response.

export interface StationLocation {
  code: string
  name: string
  lat: number
  lon: number
}

// Station coordinates are public facts (city centers, not FedEx facilities).
export const STATION_LOCATIONS: StationLocation[] = [
  { code: 'GUC', name: 'Gunnison, CO', lat: 38.5458, lon: -106.9253 },
  { code: 'MEM', name: 'Memphis, TN', lat: 35.1495, lon: -90.049 },
  { code: 'IND', name: 'Indianapolis, IN', lat: 39.7684, lon: -86.1581 },
  { code: 'PHX', name: 'Phoenix, AZ', lat: 33.4484, lon: -112.074 },
]

export interface LiveWeather {
  tempF: number | null
  windMph: number | null
  snowfallIn: number | null
  label: string
}

export interface LiveAlert {
  event: string
  severity: string
  headline: string
  label: string
}

export interface LiveQuake {
  magnitude: number
  place: string
  time: string
  label: string
}

export interface LiveSignals {
  station: string
  fetchedAt: string
  weather: LiveWeather | { error: string }
  alerts: LiveAlert[] | { error: string }
  quakes: LiveQuake[] | { error: string }
}

export type FetchLike = (url: string, init?: { headers?: Record<string, string>; signal?: AbortSignal }) => Promise<{
  ok: boolean
  status: number
  json(): Promise<unknown>
}>

const TIMEOUT_MS = 5_000

async function getJson(fetchFn: FetchLike, url: string, headers?: Record<string, string>): Promise<unknown> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetchFn(url, { headers, signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

const cToF = (c: number): number => Math.round((c * 9) / 5 + 32)
const kmhToMph = (kmh: number): number => Math.round(kmh / 1.609344)
const cmToIn = (cm: number): number => Math.round((cm / 2.54) * 10) / 10

// Open-Meteo: free, no API key, no registration. https://open-meteo.com/
export async function fetchWeather(loc: StationLocation, fetchFn: FetchLike): Promise<LiveWeather> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,wind_speed_10m,snowfall`
  const data = (await getJson(fetchFn, url)) as {
    current?: { temperature_2m?: number; wind_speed_10m?: number; snowfall?: number }
  }
  const c = data.current
  return {
    tempF: typeof c?.temperature_2m === 'number' ? cToF(c.temperature_2m) : null,
    windMph: typeof c?.wind_speed_10m === 'number' ? kmhToMph(c.wind_speed_10m) : null,
    snowfallIn: typeof c?.snowfall === 'number' ? cmToIn(c.snowfall) : null,
    label: `LIVE public data: Open-Meteo current conditions for ${loc.name}`,
  }
}

// NWS active alerts for a point. https://www.weather.gov/documentation/services-web-api
export async function fetchAlerts(loc: StationLocation, fetchFn: FetchLike): Promise<LiveAlert[]> {
  const url = `https://api.weather.gov/alerts/active?point=${loc.lat},${loc.lon}`
  const data = (await getJson(fetchFn, url, {
    // NWS asks for an identifying User-Agent.
    'User-Agent': 'ai-efficiency-hub (github.com/arigatoexpress/AI-Efficiency)',
    Accept: 'application/geo+json',
  })) as { features?: Array<{ properties?: { event?: string; severity?: string; headline?: string } }> }
  return (data.features ?? []).slice(0, 5).map((f) => ({
    event: f.properties?.event ?? 'Unknown event',
    severity: f.properties?.severity ?? 'Unknown',
    headline: f.properties?.headline ?? '',
    label: `LIVE public data: NWS active alert near ${loc.name}`,
  }))
}

// USGS earthquakes within ~300 km over the past day.
// https://earthquake.usgs.gov/fdsnws/event/1/
export async function fetchQuakes(loc: StationLocation, fetchFn: FetchLike): Promise<LiveQuake[]> {
  const url =
    `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${loc.lat}&longitude=${loc.lon}` +
    `&maxradiuskm=300&minmagnitude=2.5&orderby=magnitude&limit=5`
  const data = (await getJson(fetchFn, url)) as {
    features?: Array<{ properties?: { mag?: number; place?: string; time?: number } }>
  }
  return (data.features ?? []).map((f) => ({
    magnitude: f.properties?.mag ?? 0,
    place: f.properties?.place ?? 'Unknown location',
    time: f.properties?.time ? new Date(f.properties.time).toISOString() : '',
    label: `LIVE public data: USGS earthquake feed near ${loc.name}`,
  }))
}

// Fetch all three sources for a station; each degrades independently.
export async function fetchLiveSignals(
  stationCode: string,
  fetchFn: FetchLike,
  now: Date = new Date()
): Promise<LiveSignals | null> {
  const loc = STATION_LOCATIONS.find((s) => s.code === stationCode.toUpperCase())
  if (!loc) return null

  const [weather, alerts, quakes] = await Promise.all([
    fetchWeather(loc, fetchFn).catch((e: Error) => ({ error: `weather unavailable: ${e.message}` })),
    fetchAlerts(loc, fetchFn).catch((e: Error) => ({ error: `alerts unavailable: ${e.message}` })),
    fetchQuakes(loc, fetchFn).catch((e: Error) => ({ error: `quakes unavailable: ${e.message}` })),
  ])

  return { station: loc.name, fetchedAt: now.toISOString(), weather, alerts, quakes }
}
