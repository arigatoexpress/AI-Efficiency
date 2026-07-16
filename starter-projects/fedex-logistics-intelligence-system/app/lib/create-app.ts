// Express application factory for the deployable HTTP boundary.
// Everything environmental is injected — environment variables, fetch, clock,
// Gemini client, client build directory, cache duration — so the contract
// tests in test/http-contract.test.ts exercise the real HTTP surface offline,
// with no network, no credentials, and deterministic time. server.ts stays
// thin wiring: build the real dependencies, call createApp, listen.
//
// Safety properties preserved here, pinned by the contract tests:
// - /api/health reports safe boolean flags only, never credential material.
// - Live public feeds are opt-in (LIVE_SIGNALS=on); off means zero upstream
//   requests and labeled synthetic demo data.
// - Unknown stations are a 400, never guessed coordinates.
// - Each public feed degrades independently; one dead feed never breaks the
//   response, and every live value keeps its "LIVE public data:" source label.
// - With no Gemini client, drafts are the deterministic local fallback,
//   labeled source:"fallback", with the manager-review footer intact.

import express, { type Express } from 'express'
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
} from './drafts'
import { fetchLiveSignals, type FetchLike, type LiveSignals } from './live-signals'

// The slice of the Gemini SDK the draft endpoint uses. Structural on purpose:
// the real GoogleGenAI satisfies it, and tests inject a stub (or null to pin
// the deterministic fallback path).
export interface GeminiLike {
  models: {
    generateContent(request: {
      model: string
      contents: Array<{ role: string; parts: Array<{ text: string }> }>
      config?: { systemInstruction: string }
    }): Promise<{ text?: string }>
  }
}

// Environment variables the app reads. The index signature keeps process.env
// assignable while documenting the two keys that actually change behavior.
export interface AppEnvironment {
  LIVE_SIGNALS?: string
  GEMINI_MODEL?: string
  [key: string]: string | undefined
}

export interface CreateAppOptions {
  env?: AppEnvironment
  fetchFn?: FetchLike
  now?: () => Date
  genAI?: GeminiLike | null
  clientDir?: string
  liveCacheMs?: number
}

// Live-signal cache window: polite to the public APIs (Open-Meteo, NWS, USGS).
export const LIVE_CACHE_MS = 5 * 60 * 1000

export function createApp(options: CreateAppOptions = {}): Express {
  const {
    env = {},
    fetchFn = globalThis.fetch as unknown as FetchLike,
    now = () => new Date(),
    genAI = null,
    clientDir,
    liveCacheMs = LIVE_CACHE_MS,
  } = options

  const app = express()
  app.use(express.json())

  // Live public-data adapters are opt-in: the deployed demo stays synthetic
  // unless the operator deliberately sets LIVE_SIGNALS=on.
  const liveSignalsEnabled = env.LIVE_SIGNALS === 'on'

  // Health check: safe configuration flags only — never credential values.
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      geminiConfigured: !!genAI,
      liveSignals: liveSignalsEnabled,
      timestamp: now().toISOString(),
    })
  })

  // Live public signals (Open-Meteo, NWS alerts, USGS quakes) for one station.
  // Cached per station to stay polite to the public APIs.
  const liveCache = new Map<string, { at: number; payload: LiveSignals }>()

  app.get('/api/live-signals', async (req, res) => {
    if (!liveSignalsEnabled) {
      return res.json({ enabled: false, note: 'Live signals are off; the app is serving labeled synthetic demo data. Set LIVE_SIGNALS=on to enable.' })
    }
    const station = String(req.query.station || 'GUC')
    const cached = liveCache.get(station)
    if (cached && now().getTime() - cached.at < liveCacheMs) {
      return res.json({ enabled: true, cached: true, ...cached.payload })
    }
    const signals = await fetchLiveSignals(station, fetchFn, now())
    if (!signals) {
      return res.status(400).json({ enabled: true, error: `unknown station code: ${station}` })
    }
    liveCache.set(station, { at: now().getTime(), payload: signals })
    res.json({ enabled: true, cached: false, ...signals })
  })

  // Compile advisory draft with Gemini, falling back to the deterministic
  // local draft when no client is configured or the model call fails.
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
        const fallbackDraft = generateFallbackDraft(station || 'Gunnison, CO', topicLabel, weather, roadConditions, seismic, now())
        return res.json({ draft: fallbackDraft, source: 'fallback', topic: topicLabel })
      }

      const response = await genAI.models.generateContent({
        model: env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        config: { systemInstruction: SYSTEM_INSTRUCTION },
      })

      const draft = response.text || 'No response generated.'
      res.json({ draft, source: 'gemini', topic: topicLabel })
    } catch (err) {
      console.error('Gemini error:', err)
      const fallbackDraft = generateFallbackDraft(station || 'Gunnison, CO', topicLabel, weather, roadConditions, seismic, now())
      res.json({ draft: fallbackDraft, source: 'fallback', topic: topicLabel, error: 'Gemini unavailable; using local draft.' })
    }
  })

  // Serve the static client build when a directory is provided (production
  // wiring). Tests omit it and exercise the API surface only.
  if (clientDir) {
    app.use(express.static(clientDir))
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(clientDir, 'index.html'))
    })
  }

  return app
}
