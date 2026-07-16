import { test } from 'node:test'
import assert from 'node:assert/strict'
import { describeGeminiAuth, geminiClientOptions } from '../lib/gemini-config'

test('vertex mode wins when enabled with a project', () => {
  const opts = geminiClientOptions({
    GOOGLE_GENAI_USE_VERTEXAI: 'true',
    GOOGLE_CLOUD_PROJECT: 'my-project',
    GEMINI_API_KEY: 'also-set',
  })
  assert.deepEqual(opts, { vertexai: true, project: 'my-project', location: 'us-central1' })
})

test('vertex location is overridable', () => {
  const opts = geminiClientOptions({
    GOOGLE_GENAI_USE_VERTEXAI: 'TRUE',
    GOOGLE_CLOUD_PROJECT: 'p',
    GOOGLE_CLOUD_LOCATION: 'us-east1',
  })
  assert.deepEqual(opts, { vertexai: true, project: 'p', location: 'us-east1' })
})

test('vertex flag without a project falls back to the API key', () => {
  const opts = geminiClientOptions({ GOOGLE_GENAI_USE_VERTEXAI: 'true', GEMINI_API_KEY: 'k' })
  assert.deepEqual(opts, { apiKey: 'k' })
})

test('api key alone selects AI Studio mode', () => {
  assert.deepEqual(geminiClientOptions({ GEMINI_API_KEY: 'k' }), { apiKey: 'k' })
})

test('nothing configured returns null (fallback drafts)', () => {
  assert.equal(geminiClientOptions({}), null)
  assert.equal(geminiClientOptions({ GOOGLE_GENAI_USE_VERTEXAI: 'false' }), null)
})

test('auth descriptions never leak the key value', () => {
  assert.match(describeGeminiAuth({ apiKey: 'super-secret' }), /AI Studio API key/)
  assert.doesNotMatch(describeGeminiAuth({ apiKey: 'super-secret' }), /super-secret/)
  assert.match(describeGeminiAuth({ vertexai: true, project: 'p', location: 'l' }), /Vertex AI \(project p, l\)/)
  assert.match(describeGeminiAuth(null), /disabled/)
})
