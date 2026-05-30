import express from 'express'
import { GoogleGenAI } from '@google/genai'
import path from 'path'

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
    weather?: { tempF?: number; snowDepthIn?: number; windMph?: number; alert?: string }
    roadConditions?: { i70Status?: string; us50Status?: string; cotripUrl?: string }
    seismic?: { magnitude?: number; location?: string; time?: string }
    topic?: 'pre-shift' | 'handoff' | 'after-action'
  }

  const topicLabel =
    topic === 'handoff' ? 'Shift Handoff Brief' :
    topic === 'after-action' ? 'After-Action Summary' :
    'Pre-Shift Readiness Brief'

  const systemInstruction = `
You are a logistics operations writing assistant. Write in plain English for busy station managers.
Format as a short, bulleted operational memo.
Never use command-console language like "execute", "deploy", "override", or "authorized personnel".
Every recommendation must include "Needs manager verification."
Label any synthetic or estimated values clearly.
Do not claim access to real package, route, or customer data.
`.trim()

  const userPrompt = `
Station: ${station || 'Gunnison, CO'}
Topic: ${topicLabel}

Public weather context (synthetic demo values):
- Temperature: ${weather?.tempF ?? 'N/A'}°F
- Snow depth: ${weather?.snowDepthIn ?? 'N/A'} inches
- Wind: ${weather?.windMph ?? 'N/A'} mph
- Weather alert: ${weather?.alert || 'None'}

Public road context:
- I-70 Vail Pass: ${roadConditions?.i70Status || 'Unknown'}
- US-50 Monarch Summit: ${roadConditions?.us50Status || 'Unknown'}
- Source: ${roadConditions?.cotripUrl || 'https://www.cotrip.org/'}

Public seismic context:
- Magnitude: ${seismic?.magnitude || 'None reported'}
- Location: ${seismic?.location || 'N/A'}
- Time: ${seismic?.time || 'N/A'}

Write a short, practical ${topicLabel} a manager could read in 60 seconds.
Include what to verify internally and what is public data only.
`.trim()

  try {
    if (!genAI) {
      // Graceful fallback when Gemini is not configured
      const fallbackDraft = generateFallbackDraft(station || 'Gunnison, CO', topicLabel, weather, roadConditions, seismic)
      return res.json({ draft: fallbackDraft, source: 'fallback', topic: topicLabel })
    }

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      config: { systemInstruction },
    })

    const draft = response.text || 'No response generated.'
    res.json({ draft, source: 'gemini', topic: topicLabel })
  } catch (err) {
    console.error('Gemini error:', err)
    const fallbackDraft = generateFallbackDraft(station || 'Gunnison, CO', topicLabel, weather, roadConditions, seismic)
    res.json({ draft: fallbackDraft, source: 'fallback', topic: topicLabel, error: 'Gemini unavailable; using local draft.' })
  }
})

function generateFallbackDraft(
  station: string,
  topicLabel: string,
  weather?: { tempF?: number; snowDepthIn?: number; windMph?: number; alert?: string },
  roadConditions?: { i70Status?: string; us50Status?: string },
  seismic?: { magnitude?: number; location?: string; time?: string }
): string {
  const lines: string[] = []
  lines.push(`# ${topicLabel}`)
  lines.push(`Station: ${station}`)
  lines.push(`Generated: ${new Date().toLocaleString('en-US', { timeZone: 'America/Denver' })} MT`)
  lines.push('')
  lines.push('## Public Risk Signals')

  if (weather?.alert && weather.alert !== 'None') {
    lines.push(`- Weather alert active: ${weather.alert} (Needs manager verification.)`)
  }
  if ((weather?.snowDepthIn ?? 0) > 6) {
    lines.push(`- Snow depth at ${weather?.snowDepthIn} inches may affect feeder schedules. (Synthetic demo value; verify with local conditions.)`)
  }
  if ((weather?.windMph ?? 0) > 35) {
    lines.push(`- Wind at ${weather?.windMph} mph could delay linehaul. (Synthetic demo value; verify with carrier updates.)`)
  }
  if (roadConditions?.i70Status && roadConditions.i70Status.toLowerCase().includes('closed')) {
    lines.push('- I-70 Vail Pass: reported closure may impact eastbound linehaul. (Verify with cotrip.org and carrier dispatch.)')
  }
  if (roadConditions?.us50Status && roadConditions.us50Status.toLowerCase().includes('closed')) {
    lines.push('- US-50 Monarch Summit: reported closure may impact alternate routing. (Verify with cotrip.org and carrier dispatch.)')
  }
  if ((seismic?.magnitude ?? 0) > 2.5) {
    lines.push(`- Seismic event M${seismic?.magnitude} near ${seismic?.location}. Monitor USGS for aftershocks. (Public data only.)`)
  }

  if (lines.length === 5) {
    lines.push('- No major public risk signals at this time. Continue normal monitoring.')
  }

  lines.push('')
  lines.push('## Recommended Manager Actions')
  lines.push('- Check live road conditions at https://www.cotrip.org/')
  lines.push('- Confirm feeder pickup times with local carriers.')
  lines.push('- Review sort staffing against possible delay windows.')
  lines.push('')
  lines.push('## Data Notes')
  lines.push('- Weather values are synthetic demo data for prototyping.')
  lines.push('- Road status is illustrative; always verify with cotrip.org.')
  lines.push('- This brief is a draft only. A manager must verify all facts before acting.')

  return lines.join('\n')
}

// Serve static client build in production
app.use(express.static(path.join(SCRIPT_DIR, 'client')))
app.get('*', (_req, res) => {
  res.sendFile(path.join(SCRIPT_DIR, 'client', 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`)
  console.log(`Gemini integration: ${genAI ? 'enabled' : 'disabled (set GEMINI_API_KEY)'}`)
})
