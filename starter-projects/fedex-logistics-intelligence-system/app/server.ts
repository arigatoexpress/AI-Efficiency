import express from 'express'
import { GoogleGenAI } from '@google/genai'
import path from 'path'
import {
  buildUserPrompt,
  generateFallbackDraft,
  SYSTEM_INSTRUCTION,
  topicLabelFor,
  type BriefTopic,
  type RoadContext,
  type SeismicContext,
  type WeatherContext,
} from './lib/drafts'
import { fetchLiveSignals, type FetchLike, type LiveSignals } from './lib/live-signals'

// Resolve client directory relative to the running script (works in ESM and CJS)
const SCRIPT_DIR = path.dirname(process.argv[1] || '.')

const app = express()
app.use(express.json())

const PORT = Number(process.env.PORT || 3000)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const genAI = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null

// Live public-data adapters are opt-in: the deployed demo stays synthetic
// unless the operator deliberately sets LIVE_SIGNALS=on.
const LIVE_SIGNALS_ENABLED = process.env.LIVE_SIGNALS === 'on'

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!genAI,
    liveSignals: LIVE_SIGNALS_ENABLED,
    timestamp: new Date().toISOString(),
  })
})

// Live public signals (Open-Meteo, NWS alerts, USGS quakes) for one station.
// Cached for 5 minutes per station to stay polite to the public APIs.
const liveCache = new Map<string, { at: number; payload: LiveSignals }>()
const LIVE_CACHE_MS = 5 * 60 * 1000

app.get('/api/live-signals', async (req, res) => {
  if (!LIVE_SIGNALS_ENABLED) {
    return res.json({ enabled: false, note: 'Live signals are off; the app is serving labeled synthetic demo data. Set LIVE_SIGNALS=on to enable.' })
  }
  const station = String(req.query.station || 'GUC')
  const cached = liveCache.get(station)
  if (cached && Date.now() - cached.at < LIVE_CACHE_MS) {
    return res.json({ enabled: true, cached: true, ...cached.payload })
  }
  const signals = await fetchLiveSignals(station, fetch as unknown as FetchLike)
  if (!signals) {
    return res.status(400).json({ enabled: true, error: `unknown station code: ${station}` })
  }
  liveCache.set(station, { at: Date.now(), payload: signals })
  res.json({ enabled: true, cached: false, ...signals })
})

// Compile advisory draft with Gemini
app.post('/api/compile-advice-draft', async (req, res) => {
  const { station, weather, roadConditions, seismic, topic } = req.body as {
    station?: string
    weather?: WeatherContext
    roadConditions?: RoadContext
    seismic?: SeismicContext
    topic?: BriefTopic
  }

  const topicLabel = topicLabelFor(topic)
  const userPrompt = buildUserPrompt(station, topicLabel, weather, roadConditions, seismic)

  try {
    if (!genAI) {
      // Graceful fallback when Gemini is not configured
      const fallbackDraft = generateFallbackDraft(station || 'Gunnison, CO', topicLabel, weather, roadConditions, seismic)
      return res.json({ draft: fallbackDraft, source: 'fallback', topic: topicLabel })
    }

    const response = await genAI.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      config: { systemInstruction: SYSTEM_INSTRUCTION },
    })

    const draft = response.text || 'No response generated.'
    res.json({ draft, source: 'gemini', topic: topicLabel })
  } catch (err) {
    console.error('Gemini error:', err)
    const fallbackDraft = generateFallbackDraft(station || 'Gunnison, CO', topicLabel, weather, roadConditions, seismic)
    res.json({ draft: fallbackDraft, source: 'fallback', topic: topicLabel, error: 'Gemini unavailable; using local draft.' })
  }
})

// Serve static client build in production
app.use(express.static(path.join(SCRIPT_DIR, 'client')))
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(SCRIPT_DIR, 'client', 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`)
  console.log(`Gemini integration: ${genAI ? 'enabled' : 'disabled (set GEMINI_API_KEY)'}`)
})
