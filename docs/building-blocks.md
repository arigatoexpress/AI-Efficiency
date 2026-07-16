# Building Blocks — Reusing These Systems in Your Own Build

The starter projects aren't just demos: each one contains small, tested pieces
designed to be lifted into a real system — including the GCP builds this hub is
staged for. This page is the map: what each block does, what its tests
guarantee, and how to lift it.

**The extraction rule (from the [operating charter](../AGENTS.md)):** copy a
block into your project when you have a real use for it; extract it into a
shared module only once **two or more real call-sites** exist. No speculative
frameworks — everything below stays where it is until real reuse pulls it out.

## The Blocks

### 1. Live public-data adapters

- **Where:** `starter-projects/fedex-logistics-intelligence-system/app/lib/live-signals.ts`
- **What:** dependency-free fetchers for Open-Meteo weather, NWS active alerts,
  and USGS earthquakes — 5-second timeouts, unit conversion, a source label on
  every value, and per-source degradation (one dead feed returns an `error`
  field instead of failing the batch).
- **Tests guarantee:** unit conversion is exact, missing fields become `null`
  (never fabricated), errors surface per source, station codes are validated.
- **How to lift:** copy the file. It takes fetch as a parameter (`FetchLike`),
  so it runs anywhere — Node, Cloud Run, a worker — and tests with a fake
  fetch, no network. Add a location by adding one row to `STATION_LOCATIONS`.

### 2. The reviewed-draft pattern (AI with a deterministic floor)

- **Where:** `app/lib/drafts.ts` + the `/api/compile-advice-draft` handler in
  `app/server.ts` (same project).
- **What:** the pattern every AI feature here follows — a deterministic
  fallback that produces a usable, labeled output when the model is
  unconfigured or errors; a system instruction that bans command-console
  language and forces "Needs manager verification."; and a `source:
  gemini|fallback` field so nobody mistakes template output for model output.
- **Tests guarantee:** every risk line carries a verification label; threshold
  boundaries are exact; the guardrail text is present in the system
  instruction.
- **How to lift:** copy the shape, not just the file — *fallback first, model
  second, source field always*. It's what let the deployed demo keep serving
  usable briefs for weeks while its model id was silently retired.

### 3. Env-driven Gemini auth (AI Studio ↔ Vertex AI)

- **Where:** `app/lib/gemini-config.ts` (same project).
- **What:** one function that picks the `@google/genai` constructor options
  from the environment — Vertex AI via Application Default Credentials when
  `GOOGLE_GENAI_USE_VERTEXAI=true` + `GOOGLE_CLOUD_PROJECT`, else an AI Studio
  API key, else null (run the fallback). This is the whole "migrate to GCP"
  auth story for any Gemini service.
- **Tests guarantee:** mode precedence, safe defaults, and that auth
  descriptions never leak key material into logs.
- **How to lift:** copy the file; construct your client with its return value.
  Day-one usage is scripted in the [GCP activation runbook](technology/gcp-activation-runbook.md).

### 4. The machine-readable prompt library

- **Where:** `prompts/prompts.json` (generated; CI keeps it in sync with the
  markdown).
- **What:** all 52 prompts with categories and bracket placeholders — the same
  library people browse, consumable by scripts, agents, and enterprise tools.
- **How to lift:** read the JSON, select by category, fill the brackets.
  An agent that drafts a shift handoff needs exactly one prompt from here and
  zero scraping.

### 5. Deterministic metrics analysis (the numbers layer)

- **Where:** `starter-projects/priority-metrics-intelligence/src/` — stdlib-only
  ES modules, no package.json, no dependencies.
- **What:** `compare.mjs` (targets, month-over-month/year-over-year),
  `risk-lineage.mjs` (`traceRiskLineages` — the started/worsened/recovered
  state machine), `patterns.mjs` (lagged Pearson candidate associations),
  `project.mjs` (median-drift baseline), `render.mjs` (deterministic
  plain-English brief + canonical JSON). 95 tests, byte-deterministic output,
  privacy gate on inputs.
- **How to lift:** the modules take plain arrays and return plain objects — no
  I/O inside. Point the CLI at any monthly-metric CSV with the fixture's
  columns, or import the functions directly for a different cadence. This is
  the "deterministic math makes the facts" layer for any KPI system you build.

### 6. The read-only agent template

- **Where:** `starter-projects/adk-shift-brief-agent/`.
- **What:** a complete Google ADK agent where the tool surface *is* the safety
  model: read-only lookups, a regex data-safety gate, a formatter that keeps
  source labels and the review footer — and an offline test harness
  (`test/run_checks.py`) that proves the tools import no network modules and
  no send/dispatch/write surface exists, on every PR.
- **How to lift:** copy the project, replace the two lookup tools with yours,
  keep `check_data_safety` and `format_brief` and the harness. Registration on
  Vertex AI Agent Engine is Phase 4 of the [runbook](technology/gcp-activation-runbook.md).

### 7. The offline-app guarantee

- **Where:** the Signal Lab and TLH/SPH Explorer single-file apps, plus check 3
  in `scripts/check-docs.mjs`.
- **What:** a Content-Security-Policy of `connect-src 'none'` makes it
  *impossible* for a page to exfiltrate loaded data — and CI fails any PR where
  that header goes missing. The pattern for any "your data never leaves the
  machine" tool.
- **How to lift:** ship one HTML file with that CSP, and add the file to the
  CI check list so the guarantee is enforced, not promised.

## The Habits That Travel With the Blocks

Whatever you build from these, keep the five platform rules
([How It Works](how-it-works/README.md)): deterministic facts under AI prose,
labels on every value, a human owning every decision, guardrails as tests, and
evidence before adoption.
