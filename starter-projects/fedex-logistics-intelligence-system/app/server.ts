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

// Resolve client directory relative to the running script (works in ESM and CJS)
const SCRIPT_DIR = path.dirname(process.argv[1] || '.')

const app = express()
app.use(express.json())

const PORT = Number(process.env.PORT || 3000)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const genAI = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!genAI,
    timestamp: new Date().toISOString(),
  })
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
