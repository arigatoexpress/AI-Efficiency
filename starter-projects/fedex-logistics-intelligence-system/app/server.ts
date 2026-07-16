// Production wiring only: build the real dependencies, create the app, listen.
// All endpoint behavior lives in lib/create-app.ts and is pinned by
// test/http-contract.test.ts.

import path from 'path'
import { GoogleGenAI } from '@google/genai'
import { createApp } from './lib/create-app'
import { describeGeminiAuth, geminiClientOptions } from './lib/gemini-config'

// Resolve client directory relative to the running script (works in ESM and CJS)
const SCRIPT_DIR = path.dirname(process.argv[1] || '.')

const PORT = Number(process.env.PORT || 3000)

// Auth: Vertex AI (GCP forward path) when GOOGLE_GENAI_USE_VERTEXAI=true,
// otherwise an AI Studio API key, otherwise deterministic fallback drafts.
const geminiOptions = geminiClientOptions(process.env)
const genAI = geminiOptions ? new GoogleGenAI(geminiOptions) : null

const app = createApp({
  env: process.env,
  genAI,
  clientDir: path.join(SCRIPT_DIR, 'client'),
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`)
  console.log(`Gemini integration: ${describeGeminiAuth(geminiOptions)}`)
})
