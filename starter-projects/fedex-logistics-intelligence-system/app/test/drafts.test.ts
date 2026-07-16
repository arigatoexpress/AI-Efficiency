import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildUserPrompt,
  generateFallbackDraft,
  SYSTEM_INSTRUCTION,
  topicLabelFor,
} from '../lib/drafts'

const NOW = new Date('2026-07-16T12:00:00-06:00')

test('topic labels map every brief type, defaulting to pre-shift', () => {
  assert.equal(topicLabelFor('pre-shift'), 'Pre-Shift Readiness Brief')
  assert.equal(topicLabelFor('handoff'), 'Shift Handoff Brief')
  assert.equal(topicLabelFor('after-action'), 'After-Action Summary')
  assert.equal(topicLabelFor(undefined), 'Pre-Shift Readiness Brief')
})

test('system instruction carries the non-negotiable guardrails', () => {
  assert.match(SYSTEM_INSTRUCTION, /Needs manager verification\./)
  assert.match(SYSTEM_INSTRUCTION, /Label any synthetic or estimated values/)
  assert.match(SYSTEM_INSTRUCTION, /Do not claim access to real package, route, or customer data/)
})

test('user prompt includes provided values and safe defaults', () => {
  const prompt = buildUserPrompt('Memphis, TN', 'Shift Handoff Brief',
    { tempF: 90, windMph: 12 }, { i70Status: 'Open' })
  assert.match(prompt, /Station: Memphis, TN/)
  assert.match(prompt, /Temperature: 90°F/)
  assert.match(prompt, /I-70 Vail Pass: Open/)
  assert.match(prompt, /US-50 Monarch Summit: Unknown/)
  assert.match(prompt, /Source: https:\/\/www\.cotrip\.org\//)
  assert.match(prompt, /Magnitude: None reported/)

  const defaulted = buildUserPrompt(undefined, 'Pre-Shift Readiness Brief')
  assert.match(defaulted, /Station: Gunnison, CO/)
  assert.match(defaulted, /Temperature: N\/A°F/)
  assert.match(defaulted, /Weather alert: None/)
})

test('fallback flags every signal in a storm scenario', () => {
  const draft = generateFallbackDraft('Gunnison, CO', 'Pre-Shift Readiness Brief',
    { snowDepthIn: 9, windMph: 42, alert: 'Winter Storm Warning' },
    { i70Status: 'Closed at Vail Pass', us50Status: 'CLOSED - chains required' },
    { magnitude: 3.1, location: 'Ridgway, CO' },
    NOW)
  assert.match(draft, /Weather alert active: Winter Storm Warning/)
  assert.match(draft, /Snow depth at 9 inches/)
  assert.match(draft, /Wind at 42 mph/)
  assert.match(draft, /I-70 Vail Pass: reported closure/)
  assert.match(draft, /US-50 Monarch Summit: reported closure/)
  assert.match(draft, /Seismic event M3\.1 near Ridgway, CO/)
  assert.doesNotMatch(draft, /No major public risk signals/)
})

test('fallback thresholds are exclusive: boundary values do not fire', () => {
  const quietAtBoundary = generateFallbackDraft('Gunnison, CO', 'Pre-Shift Readiness Brief',
    { snowDepthIn: 6, windMph: 35, alert: 'None' },
    { i70Status: 'Open', us50Status: 'Wet' },
    { magnitude: 2.5 },
    NOW)
  assert.match(quietAtBoundary, /No major public risk signals/)

  const justOver = generateFallbackDraft('Gunnison, CO', 'Pre-Shift Readiness Brief',
    { snowDepthIn: 7, windMph: 36 }, undefined, { magnitude: 2.6, location: 'X' }, NOW)
  assert.match(justOver, /Snow depth at 7 inches/)
  assert.match(justOver, /Wind at 36 mph/)
  assert.match(justOver, /Seismic event M2\.6/)
})

test('road closure matching is case-insensitive substring', () => {
  const draft = generateFallbackDraft('Gunnison, CO', 'Pre-Shift Readiness Brief',
    undefined, { i70Status: 'cLoSeD for avalanche control' }, undefined, NOW)
  assert.match(draft, /I-70 Vail Pass: reported closure/)
})

test('quiet scenario still produces a complete, labeled brief', () => {
  const draft = generateFallbackDraft('Phoenix, AZ', 'After-Action Summary', {}, {}, {}, NOW)
  assert.match(draft, /^# After-Action Summary/)
  assert.match(draft, /Station: Phoenix, AZ/)
  assert.match(draft, /No major public risk signals at this time/)
  assert.match(draft, /## Recommended Manager Actions/)
  assert.match(draft, /## Data Notes/)
  assert.match(draft, /synthetic demo data/)
  assert.match(draft, /A manager must verify all facts before acting\./)
})

test('every flagged risk line carries a verification or public-data label', () => {
  const draft = generateFallbackDraft('Gunnison, CO', 'Pre-Shift Readiness Brief',
    { snowDepthIn: 9, windMph: 42, alert: 'Winter Storm Warning' },
    { i70Status: 'Closed', us50Status: 'Closed' },
    { magnitude: 3.1, location: 'Ridgway, CO' },
    NOW)
  const riskSection = draft.split('## Recommended Manager Actions')[0]
  const riskLines = riskSection.split('\n').filter((l) => l.startsWith('- '))
  assert.ok(riskLines.length >= 6)
  for (const line of riskLines) {
    assert.match(line, /verif|Public data only/i)
  }
})
