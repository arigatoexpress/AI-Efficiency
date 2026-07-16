// Draft-brief logic shared by the server and the test suite.
// Everything here is pure: no Express, no Gemini SDK, no I/O.

export interface WeatherContext {
  tempF?: number
  snowDepthIn?: number
  windMph?: number
  alert?: string
}

export interface RoadContext {
  i70Status?: string
  us50Status?: string
  cotripUrl?: string
}

export interface SeismicContext {
  magnitude?: number
  location?: string
  time?: string
}

export type BriefTopic = 'pre-shift' | 'handoff' | 'after-action'

export const SYSTEM_INSTRUCTION = `
You are a logistics operations writing assistant. Write in plain English for busy station managers.
Format as a short, bulleted operational memo.
Never use command-console language like "execute", "deploy", "override", or "authorized personnel".
Every recommendation must include "Needs manager verification."
Label any synthetic or estimated values clearly.
Do not claim access to real package, route, or customer data.
`.trim()

export function topicLabelFor(topic?: BriefTopic): string {
  return topic === 'handoff' ? 'Shift Handoff Brief' :
    topic === 'after-action' ? 'After-Action Summary' :
    'Pre-Shift Readiness Brief'
}

export function buildUserPrompt(
  station: string | undefined,
  topicLabel: string,
  weather?: WeatherContext,
  roadConditions?: RoadContext,
  seismic?: SeismicContext
): string {
  return `
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
}

// Deterministic draft used whenever Gemini is unconfigured or errors.
// Thresholds: snow > 6 in, wind > 35 mph, road status containing "closed",
// seismic magnitude > 2.5.
export function generateFallbackDraft(
  station: string,
  topicLabel: string,
  weather?: WeatherContext,
  roadConditions?: RoadContext,
  seismic?: SeismicContext,
  now: Date = new Date()
): string {
  const lines: string[] = []
  lines.push(`# ${topicLabel}`)
  lines.push(`Station: ${station}`)
  lines.push(`Generated: ${now.toLocaleString('en-US', { timeZone: 'America/Denver' })} MT`)
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
