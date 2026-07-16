# GCP Activation Runbook — Day One

The exact sequence to run when GCP / Gemini Enterprise access lands. Everything
in this repo was built so this day is a **configuration change, not a
rebuild**: the code paths already exist, are flag-gated, and are tested. Each
phase below states what changes, the commands, and the gate that applies.

**Audience:** whoever operates the GCP project (with FedEx governance sign-off).
**Prerequisite reading:** [Google Cloud + ADK integration](google-cloud-adk-integration.md) ·
[Gemini Enterprise readiness](gemini-enterprise-readiness.md).

## The One-Page Picture

```text
 TODAY (no GCP org access)                DAY ONE (access granted)
 ─────────────────────────                ───────────────────────────
 Gemini via AI Studio API key      ──▶    Gemini via Vertex AI + ADC
   (GEMINI_API_KEY)                         (GOOGLE_GENAI_USE_VERTEXAI=true)
 Synthetic demo signals            ──▶    Live public feeds, flag flip
   (labeled, hardcoded)                     (LIVE_SIGNALS=on — already built)
 ADK agent runs locally            ──▶    Registered on Agent Engine /
   (adk run, read-only tools)               Gemini Enterprise (same code)
 Internal data: none               ──▶    Internal data: STILL none —
                                            that stays behind FedEx
                                            governance, not this runbook
```

## Phase 0 — Project Setup (once)

1. Create or receive the GCP project; confirm billing and org policy.
2. Enable APIs: `run.googleapis.com`, `aiplatform.googleapis.com`,
   `artifactregistry.googleapis.com`, `cloudbuild.googleapis.com`.
3. Create a runtime service account for the app with the minimum roles:
   `roles/aiplatform.user` (Gemini via Vertex) — nothing else. The app reads
   no GCP data and writes none.
4. Local operator auth: `gcloud auth application-default login`, and set the
   active project explicitly on every command (`--project=<PROJECT_ID>`) —
   never rely on a default project.

*Gate: none of this touches users; it is reversible setup.*

## Phase 1 — Switch Gemini to Vertex AI (code already merged)

The server chooses its auth mode from the environment
(`app/lib/gemini-config.ts`, tested):

```bash
# Instead of GEMINI_API_KEY, set:
GOOGLE_GENAI_USE_VERTEXAI=true
GOOGLE_CLOUD_PROJECT=<PROJECT_ID>
GOOGLE_CLOUD_LOCATION=us-central1   # optional, this is the default
```

Credentials come from Application Default Credentials — the Cloud Run service
account in production, your `gcloud` login locally. No API key exists anywhere
once this flips, which is the point: key rotation incidents (like the retired
key/model that broke drafts in July 2026) disappear as a failure class.

Verify locally before deploying:

```bash
cd starter-projects/fedex-logistics-intelligence-system/app
npm install && npm test          # 22 tests must pass
GOOGLE_GENAI_USE_VERTEXAI=true GOOGLE_CLOUD_PROJECT=<PROJECT_ID> npm run dev
# then: curl -s -X POST localhost:5173/api/compile-advice-draft \
#   -H 'Content-Type: application/json' -d '{"station":"Gunnison, CO"}'
# expect: "source":"gemini"
```

*Gate: local verification is free. The production rollout is Phase 2.*

## Phase 2 — Deploy the App (GATED — human approval required)

Deployment to Cloud Run is an outward-facing action. Prepare, then stop for
approval:

```bash
# Build and deploy (run only with explicit approval):
cd starter-projects/fedex-logistics-intelligence-system/app
gcloud run deploy fedex-logistics-intelligence-system \
  --project=<PROJECT_ID> --region=us-east1 --source=. \
  --set-env-vars=GOOGLE_GENAI_USE_VERTEXAI=true,GOOGLE_CLOUD_PROJECT=<PROJECT_ID> \
  --allow-unauthenticated
```

Post-deploy verification (read-only, always safe):

```bash
curl -s <SERVICE_URL>/api/health
# expect: {"status":"ok","geminiConfigured":true,"liveSignals":false,...}
curl -s -X POST <SERVICE_URL>/api/compile-advice-draft \
  -H 'Content-Type: application/json' -d '{"station":"Gunnison, CO"}'
# expect: "source":"gemini" — if "fallback", read the service logs before anything else
```

*Gate: the deploy command itself. One approval, one command, verified by the
two curls above. Roll back by re-routing traffic to the previous revision.*

## Phase 3 — Flip Live Public Signals (GATED — one env var)

The live adapters (Open-Meteo, NWS alerts, USGS quakes) are merged, tested,
and **off by default**. Turning them on in production is a deliberate change:

```bash
gcloud run services update fedex-logistics-intelligence-system \
  --project=<PROJECT_ID> --region=us-east1 --update-env-vars=LIVE_SIGNALS=on
```

Verify: `curl -s '<SERVICE_URL>/api/live-signals?station=GUC'` — every value
must carry a `LIVE public data:` label, and a second call within five minutes
must return `"cached":true`.

*Gate: the env-var update. Roll back by setting `LIVE_SIGNALS=off` (or
removing the var).*

## Phase 4 — Register the ADK Agent (GATED — makes the agent reachable)

The [shift-brief agent](../../starter-projects/adk-shift-brief-agent/README.md)
runs unchanged on Vertex AI; its guardrails (read-only tools, no
send/dispatch/write surface) are CI-enforced, not configuration.

1. Run the offline guardrail checks first — they need no key:
   `python3 starter-projects/adk-shift-brief-agent/test/run_checks.py`
2. Point it at Vertex AI (same env pattern as the app: the ADK reads
   `GOOGLE_GENAI_USE_VERTEXAI=true` + project/location).
3. Deploy to **Vertex AI Agent Engine** with `adk deploy agent_engine`
   (approval required — this makes the agent reachable by others), or register
   it into **Gemini Enterprise** per the
   [readiness plan](gemini-enterprise-readiness.md).

*Gate: the deploy/registration step. The agent's tools remain read-only
either way — that property is tested in CI, not promised.*

## What This Runbook Never Does

- **No internal FedEx data.** Connecting any internal source (Foundry, package
  or route systems, employee data) is outside this runbook and requires the
  full FedEx governance path — see the
  [Foundry integration roadmap](../foundry-integration-roadmap.md).
- **No customer-facing sends.** Nothing here emails, messages, or posts.
- **No DNS or domain changes.**
- Every gated step above is one command with a stated verification and a
  stated rollback — prepared so approval is a decision, not a project.
