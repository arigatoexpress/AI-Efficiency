// Decide how to construct the Gemini client from the environment.
// Two supported auth modes, in priority order:
//   1. Vertex AI (the GCP forward path): GOOGLE_GENAI_USE_VERTEXAI=true with
//      GOOGLE_CLOUD_PROJECT (+ optional GOOGLE_CLOUD_LOCATION, default
//      us-central1). Credentials come from Application Default Credentials —
//      the Cloud Run service account in production, `gcloud auth
//      application-default login` locally. No API key involved.
//   2. AI Studio API key (today's prototype path): GEMINI_API_KEY.
// Returns null when neither is configured → the server serves deterministic
// fallback drafts.

export type GeminiClientOptions =
  | { vertexai: true; project: string; location: string }
  | { apiKey: string }

export interface GeminiEnv {
  GOOGLE_GENAI_USE_VERTEXAI?: string
  GOOGLE_CLOUD_PROJECT?: string
  GOOGLE_CLOUD_LOCATION?: string
  GEMINI_API_KEY?: string
}

export function geminiClientOptions(env: GeminiEnv): GeminiClientOptions | null {
  const wantsVertex = (env.GOOGLE_GENAI_USE_VERTEXAI || '').toLowerCase() === 'true'
  if (wantsVertex && env.GOOGLE_CLOUD_PROJECT) {
    return {
      vertexai: true,
      project: env.GOOGLE_CLOUD_PROJECT,
      location: env.GOOGLE_CLOUD_LOCATION || 'us-central1',
    }
  }
  if (env.GEMINI_API_KEY) {
    return { apiKey: env.GEMINI_API_KEY }
  }
  return null
}

export function describeGeminiAuth(options: GeminiClientOptions | null): string {
  if (!options) return 'disabled (set GEMINI_API_KEY, or GOOGLE_GENAI_USE_VERTEXAI=true with GOOGLE_CLOUD_PROJECT)'
  if ('vertexai' in options) return `enabled via Vertex AI (project ${options.project}, ${options.location})`
  return 'enabled via AI Studio API key'
}
