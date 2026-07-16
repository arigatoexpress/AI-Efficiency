# GCP One-Click Deploy Packet — Logistics Intelligence System (PREPARED, NOT EXECUTED)

**Audience:** Ari (`@arigatoexpress`) — the human gate. Whoever executes must have
FedEx governance sign-off.
**Companion doc:** [GCP Activation Runbook](gcp-activation-runbook.md) (the phased
why/when). This packet is the concrete **what**: pinned values, captured green
output, and the exact gated commands, all re-verified on **2026-07-16**.

> **This packet has NOT been executed.** No deploy, traffic change, environment
> mutation, IAM change, DNS change, Agent Engine registration, or data connection
> was performed. Every command in sections 5–8 is staged for a one-click human
> decision and remains gated.

> **Product safety (survives every step):** this is not an official or production
> FedEx system. It uses public, synthetic, or safely scrubbed data only. Every
> AI-generated recommendation is a **draft requiring manager verification**. No
> step here grants operational authority, dispatch control, or FedEx endorsement.
> Labels for public data, synthetic data, forecasts, approximations, cache state,
> and fallback behavior must stay intact after any deploy.

---

## 1. Pinned commit

```text
57ebaae53f444ae6c3e93af70a6a19e9ec9a1a5b
```

`origin/main` HEAD at packet preparation (merge of PR #65, Operations Decision
Lab 002-A). All verification below ran at this exact SHA.

> **Re-pin rule:** if `origin/main` moves before this packet is approved, re-run
> section 2 at the new HEAD, replace this SHA and the captured output, and treat
> the old packet as stale.

## 2. Green local verification (captured 2026-07-16, at the pinned SHA)

Environment: node v24.4.0, npm 11.6.2, macOS. `npm ci` was run in
`starter-projects/fedex-logistics-intelligence-system/app` first (the repo root
has no lockfile by design — never `npm ci` at root). All exits `0`.

App-focused gates (`starter-projects/fedex-logistics-intelligence-system/app`):

```text
$ npm test
ℹ tests 28
ℹ pass 28
ℹ fail 0

$ npx tsc --noEmit
(exit 0, no output)

$ npm run build
dist/client/index.html                   0.75 kB │ gzip:  0.48 kB
dist/client/assets/index-Pp0p1v4M.css    5.43 kB │ gzip:  1.84 kB
dist/client/assets/index-CHGl_yZc.js   213.00 kB │ gzip: 66.15 kB
✓ built in 327ms
  dist/server.cjs  1.6mb ⚠️
⚡ Done in 36ms
```

Unified repo gate (repo root), `npm run verify`, exit `0`:

```text
check-docs: OK — 136 doc files checked, 52 prompts counted, claims consistent
build-prompt-index: OK — 52 prompts across 10 categories, outputs in sync
Priority Metrics Intelligence:  tests 95, pass 95, fail 0
Operations Decision Lab:        tests 56, pass 56, fail 0
Logistics application:          tests 28, pass 28, fail 0
TLH/SPH Explorer: ALL CHECKS PASSED (max decomposition residual 1.17e-15)
ADK tools/guardrails: ALL CHECKS PASSED
  (agent wiring SKIP — google-adk not installed locally; tools-only mode)
Final Vite client + bundled Express server production build: passed
```

## 3. Local runtime validation (captured 2026-07-16)

Server: `PORT=3000 npm run dev` (Express API on port 3000; Vite's 5173 dev server
is a separate command and is not needed). Server was stopped after each run.

Fallback mode — no model environment set:

```text
$ curl -fsS http://localhost:3000/api/health | jq
{
  "status": "ok",
  "geminiConfigured": false,
  "liveSignals": false,
  "timestamp": "2026-07-16T21:04:56.757Z"
}

$ curl -fsS -X POST http://localhost:3000/api/compile-advice-draft \
    -H 'Content-Type: application/json' -d '{"station":"Gunnison, CO"}' \
    | jq '{source,topic,error}'
{
  "source": "fallback",
  "topic": "Pre-Shift Readiness Brief",
  "error": null
}
```

ADC existence check — `gcloud auth application-default print-access-token >/dev/null`:
**exit 0 (ADC exists)**. No token was printed or stored.

Vertex AI smoke (network + model call, no deploy, no cloud mutation):

```text
$ GOOGLE_GENAI_USE_VERTEXAI=true GOOGLE_CLOUD_PROJECT=sapphire-479610 \
    GOOGLE_CLOUD_LOCATION=us-central1 PORT=3000 npm run dev

/api/health        → {"status":"ok","geminiConfigured":true,"liveSignals":false,...}
draft POST (above) → {"source":"gemini","topic":"Pre-Shift Readiness Brief","error":null}
```

The env-selected Vertex + ADC path works end-to-end locally at the pinned SHA.
On Cloud Run, the attached runtime service account provides the same ADC
credentials automatically — no API key exists in that mode.

## 4. Live cloud state — re-verified read-only 2026-07-16

Read-only `gcloud`/`curl` checks against the personal project `sapphire-479610`.
**No mutation of any kind was made.**

| Claim (handoff §9) | Re-verified result | Match? |
|---|---|---|
| Service in `sapphire-479610`, region `us-east1` | `fedex-logistics-intelligence-system`, `https://fedex-logistics-intelligence-system-267358751314.us-east1.run.app` | ✅ |
| Latest ready revision `…-00007-8rt`, 100% traffic | `fedex-logistics-intelligence-system-00007-8rt`, `percent: 100`, `latestRevision: true` | ✅ |
| Public health: `geminiConfigured:true`, `liveSignals` omitted | `{"status":"ok","geminiConfigured":true,"timestamp":"2026-07-16T21:06:18.902Z"}` — `liveSignals` key absent | ✅ |
| Live draft POST returns `source:fallback` | `{"source":"fallback","topic":"Pre-Shift Readiness Brief","error":"Gemini unavailable; using local draft."}` | ✅ |
| Logs show `API_KEY_INVALID` as the model failure | 5 recent entries, latest 2026-07-16T21:06:19Z: `reason:"API_KEY_INVALID"`, `service:"generativelanguage.googleapis.com"` | ✅ |

Additional observed state (all read-only):

- **Revisions:** 00001-frb → 00007-8rt exist; 00006-52v is not active (failed
  candidate); 00007-8rt deployed 2026-05-30.
- **Invocation:** `roles/run.invoker` granted to `allUsers` — the service is
  publicly callable (that is how the unauthenticated curls above succeed).
- **Enabled APIs (relevant):** `run`, `aiplatform`, `artifactregistry`,
  `cloudbuild`, `generativelanguage`, `secretmanager` — all enabled.
- **Runtime service account (current):** `267358751314-compute@developer.gserviceaccount.com`
  (the project default compute SA) with project roles: `aiplatform.user`,
  `artifactregistry.writer`, `datastore.user`, `datastore.viewer`,
  `logging.logWriter`, `pubsub.publisher`, `pubsub.subscriber`,
  `run.sourceDeveloper`, `secretmanager.secretAccessor`, `storage.objectViewer`.
- **Current env on the service:** `GEMINI_API_KEY` (plaintext value present —
  see finding S1), `APP_URL`, `NODE_ENV=production`, `UI_FIX_VERSION`. No
  `LIVE_SIGNALS`, no Vertex env vars.

### Security findings (review items — no action taken)

- **S1 — Plaintext API key as a Cloud Run env var, and it is invalid.**
  `GEMINI_API_KEY` is stored in cleartext on the service and logs show it fails
  with `API_KEY_INVALID`. The deployed service is in AI Studio key mode. The
  merged Vertex auth mode (§3) removes this key class entirely; if a key mode is
  ever kept, the value must live in Secret Manager (`--set-secrets`), never in
  `--set-env-vars`, and the exposed key should be rotated/revoked by the human
  operator. The value is deliberately not reproduced in this packet.
- **S2 — Public invoker.** `allUsers` can call the service. Acceptable for a
  public-data demo prototype, but it is a deliberate choice — revisit if the
  audience narrows.
- **S3 — Runtime identity is the shared default compute SA** with roles far
  beyond this app's needs (§6). Proposal: dedicated least-privilege SA.

### What the deployed revision predates

00007-8rt (2026-05-30) runs pre-PR-#57–#65 code: no source-owned `liveSignals`
flag in `/api/health`, no Vertex auth mode, no pinned HTTP contract. A deploy of
the pinned SHA ships: env-selected Vertex/AI-Studio auth (tested), flag-gated
live public adapters with per-source degradation + 5-minute cache (tested), and
the 28-test HTTP contract.

## 5. Proposed one-click deploy (GATED — do not run without explicit approval)

Prerequisite gate: the dedicated runtime SA in §6 must exist first. Then:

```bash
# GATED: Cloud Run deployment — human approval required
cd starter-projects/fedex-logistics-intelligence-system/app
gcloud run deploy fedex-logistics-intelligence-system \
  --project=sapphire-479610 --region=us-east1 --source=. \
  --service-account=fedex-logistics-runtime@sapphire-479610.iam.gserviceaccount.com \
  --set-env-vars=GOOGLE_GENAI_USE_VERTEXAI=true,GOOGLE_CLOUD_PROJECT=sapphire-479610,GOOGLE_CLOUD_LOCATION=us-central1,NODE_ENV=production \
  --allow-unauthenticated
```

Proposed environment variables (**no secret values anywhere in this packet**):

| Variable | Proposed value | Why |
|---|---|---|
| `GOOGLE_GENAI_USE_VERTEXAI` | `true` | Vertex AI auth via the runtime SA (ADC) — no API key exists |
| `GOOGLE_CLOUD_PROJECT` | `sapphire-479610` | Vertex project |
| `GOOGLE_CLOUD_LOCATION` | `us-central1` | Vertex Gemini region (matches verified local smoke) |
| `NODE_ENV` | `production` | Production server behavior (unchanged) |
| `APP_URL` | current service URL | Kept as-is from current service config |
| `LIVE_SIGNALS` | **absent (off)** | Live public feeds stay OFF at deploy; the `on` flip is a separate gate (§9) |

Deliberately **not** carried forward: `GEMINI_API_KEY` (invalid, plaintext —
finding S1), `UI_FIX_VERSION` (stale deploy marker from May).

## 6. Proposed runtime service account and least-privilege roles (GATED review item)

Proposed dedicated SA (creation is itself a gated IAM mutation):

```text
fedex-logistics-runtime@sapphire-479610.iam.gserviceaccount.com
```

Proposed minimal role set — the app calls exactly one GCP API (Vertex AI) and
reads/writes no GCP data:

| Role | Needed for |
|---|---|
| `roles/aiplatform.user` | Gemini draft generation via Vertex AI |
| `roles/logging.logWriter` | Explicit application log writes (conventional; stdout logging works regardless) |

Not granted (present today on the shared default compute SA, unneeded at this
app's runtime): `artifactregistry.writer`, `datastore.user`, `datastore.viewer`,
`pubsub.publisher`, `pubsub.subscriber`, `run.sourceDeveloper`,
`secretmanager.secretAccessor`, `storage.objectViewer`.

> **Review note:** the current runtime identity is the project **default**
> compute SA, shared by anything else in the project. Do not revoke roles from
> it as part of this packet — that blast radius is wider than this service. The
> proposal is a new dedicated SA attached at deploy time; retiring the shared
> SA's extra roles is a separate human review.

## 7. Post-deploy verification curls (read-only, safe to run any time)

```bash
SERVICE_URL=https://fedex-logistics-intelligence-system-267358751314.us-east1.run.app

# 1. Health — expect liveSignals:false and geminiConfigured:true
curl -fsS $SERVICE_URL/api/health | jq
# expect: {"status":"ok","geminiConfigured":true,"liveSignals":false,"timestamp":"..."}
#   (liveSignals key PRESENT and false — the deployed 00007-8rt omits it entirely;
#    its appearance confirms the new build is serving)

# 2. Draft model path — expect source:"gemini" via Vertex
curl -fsS -X POST $SERVICE_URL/api/compile-advice-draft \
  -H 'Content-Type: application/json' -d '{"station":"Gunnison, CO"}' \
  | jq '{source,topic,error}'
# expect: {"source":"gemini",...}
#   if "fallback": read service logs FIRST (gated nothing — logs are read-only);
#   on 00007-8rt fallback is expected (invalid key), on the new build it is not.

# 3. Live signals — OFF by default after this deploy
curl -fsS "$SERVICE_URL/api/live-signals?station=GUC" | jq '{enabled,station}'
# expect: {"enabled":false,...} — the LIVE_SIGNALS=on flip is a separate gate.
# After that separate approval, expect enabled:true, every value carrying a
# "LIVE public data:" label, and a second in-window call returning cached:true.
```

Every response remains a **draft for manager review** — the fallback footer and
source labels are part of the tested contract, not decoration.

## 8. Rollback (GATED — with mandatory fresh re-verification)

Rollback target: the revision serving **before** the gated deploy — today that
is `fedex-logistics-intelligence-system-00007-8rt`. Cloud state changes:
revision lists and traffic are point-in-time observations.

```bash
# STEP 1 — MANDATORY, read-only: freshly re-verify the rollback target
# immediately before executing anything. Do not rely on this packet's snapshot.
gcloud run revisions describe fedex-logistics-intelligence-system-00007-8rt \
  --project=sapphire-479610 --region=us-east1 \
  --format "value(status.conditions[?type='Ready'].status)"
# Proceed ONLY if this prints True. If the revision is gone or not ready,
# STOP — pick the current known-good revision from a fresh
# `gcloud run revisions list` and update the target.

# STEP 2 — GATED: re-route 100% traffic to the freshly re-verified revision
gcloud run services update-traffic fedex-logistics-intelligence-system \
  --project=sapphire-479610 --region=us-east1 \
  --to-revisions=fedex-logistics-intelligence-system-00007-8rt=100

# STEP 3 — read-only confirm
curl -fsS $SERVICE_URL/api/health | jq
```

## 9. Human-gate checklist — none of this was or will be done by the agent

Each item requires Ari's explicit approval, one decision at a time:

- [ ] **Cloud Run deployment** (§5) and any **traffic change** (§8).
- [ ] **Production environment mutation** — including the separate
      `LIVE_SIGNALS=on` flip.
- [ ] **Service-account creation, role grant/revocation, or any IAM mutation** (§6).
- [ ] **Secret rotation/revocation** for the exposed invalid key (finding S1).
- [ ] **Agent Engine deployment or Gemini Enterprise registration** of the ADK
      shift-brief agent.
- [ ] **DNS changes** of any kind.
- [ ] **Foundry / internal-data connections** — outside this packet entirely;
      requires the full FedEx governance path.
- [ ] **Enterprise data-source connections** of any kind.
- [ ] **Any send/action tool or screenshot retention** — the repo's agents stay
      read-only and draft-only; that property is CI-tested, not configurable.

## 10. Enterprise boundary

Personal GCP access in `sapphire-479610` is **not** FedEx Gemini Enterprise
approval. Enterprise edition, seat/admin access, Agent Engine registration,
data-protection terms, internal data, and Foundry dataset RIDs remain unapproved
or unknown. This packet authorizes nothing; it makes the approval a one-click
decision instead of a project.
