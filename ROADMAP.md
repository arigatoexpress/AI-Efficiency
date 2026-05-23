# AI Efficiency Team Roadmap

Last reviewed: 2026-05-23

This roadmap keeps the team focused on one useful path at a time: make the
current logistics intelligence app credible, make the data provenance clean,
prepare a Foundry-ready export path, then add chat-based intake only after the
security model is clear.

## North Star

Build an operations-led AI hub that helps station and regional managers turn
public risk signals, scrubbed notes, and reusable prompts into better briefs,
handoffs, pilots, and governance-ready artifacts.

This is not a production FedEx system yet. Until formal approval exists, all
projects stay public-data, synthetic-data, or scrubbed-note only.

## Phase 0 - Public Repo Cleanup

Status: active

Goal: make the repository clean enough to show to IT, AI governance, and senior
leaders without stale starter material.

Deliverables:

- canonical README pointing to the logistics intelligence app;
- removed stale starter projects;
- plain-English docs for non-technical managers;
- public-safe governance boundaries;
- source-rights notes for public data use.

Verification:

- no stale starter links;
- no secrets or private operational data;
- docs are readable by a non-technical operations manager.

## Phase 1 - Logistics Intelligence App Hardening

Status: next

Goal: make the AI Studio and Cloud Run prototype useful for station managers as
a decision-support console.

Deliverables:

- visible prototype-only positioning;
- source labels for every public signal;
- labels for synthetic or approximated values;
- fixed map controls and legend visibility;
- manager-friendly shift brief, route watch, station impact, and source trail
  panels;
- no live dispatch, reroute, customer, package, employee, or facility-security
  actions.

Verification:

- browser checks at desktop and mobile sizes;
- no broken map controls;
- no language implying official production authority;
- no API keys or secrets in public files.

## Phase 2 - Public Data Layer

Status: design started

Goal: integrate as much useful public or licensed data as possible while keeping
the rights envelope honest.

Data classes:

- public weather, alert, road, airport, aviation, freight, and economic context;
- synthetic station and load examples;
- derived public indicators such as risk scores, deltas, and summaries;
- no internal FedEx route, package, customer, employee, pricing, or security
  payloads until governance approves a separate secure environment.

Deliverables:

- source catalog with owner, URL, retrieval mode, rights, TTL, caveats, and
  output policy;
- adapters that store normalized record hashes and retrieval timestamps;
- cache/rate-limit behavior by source;
- source-health panel in the app;
- reproducible public-data fixtures for demos and tests.

Verification:

- every persisted record has provenance;
- vendor-restricted data is never redistributed raw;
- all approximations are labeled as estimates.

## Phase 3 - Foundry-Ready Export

Status: live Kadima discovery verified; upload dry-run blocked pending dataset
RIDs

Goal: reuse the regional intelligence Foundry export pattern for logistics
signals so the work can move into Palantir Foundry when access is approved.

Current engineering track:

- [regional-intel-workbench PR #22](https://github.com/arigatoexpress/regional-intel-workbench/pull/22)
  extends the existing `intel-foundry-export` path with a
  `--include-logistics-fixture` option for public/synthetic station-ops
  logistics object files.
- The regional-intel integration can now check Kadima connectivity, read the
  configured ontology, list visible object and action types, and produce a
  dry-run upload plan without exposing credentials.
- Current blocker: no approved dataset RIDs are configured yet for `Region`,
  `IntelItem`, `IntelSourceHealth`, `LogisticsDataSource`, `LogisticsSignal`,
  or `LogisticsForecastModel`.

Candidate object types:

- `Station`
- `Region`
- `LogisticsDataSource`
- `LogisticsSignal`
- `RouteRiskEstimate`
- `ShiftReadinessBrief`
- `ForecastModelRun`
- `GovernanceReview`

Deliverables:

- NDJSON object files with stable object IDs;
- manifest with file hashes, row hashes, dropped-row reasons, and source health;
- Foundry transform notes for Python transforms and Ontology mapping;
- test fixtures showing public, synthetic, and rejected rows.

Verification:

- deterministic exports;
- provenance guard drops rows without source links;
- internal or sensitive data classifications are rejected.
- upload remains dry-run until Foundry dataset mappings are approved.

## Phase 4 - Predictive Load Approximation

Status: research

Goal: build clearly labeled estimates that help managers ask better questions,
not pretend to know real FedEx load.

Possible inputs:

- public weather and alerts;
- public road disruption and travel-time signals;
- public airport and air-carrier trend data;
- BTS freight flow and aviation history;
- synthetic station baselines;
- manager-entered scrubbed context.

Possible models:

- simple seasonal baselines first;
- gradient boosted or generalized additive models for explainable pilots;
- time-series foundation models such as TimesFM or Chronos only after license
  and reproducibility review.

Verification:

- benchmark against synthetic holdout data first;
- expose confidence and limits;
- never label public-derived estimates as real package volume or real station
  workload.

## Phase 5 - Teams Or Telegram Intake Agent

Status: later phase

Goal: create a safe triage assistant that receives AI ideas, feedback, and
sanitized screenshots or notes, then turns them into reviewable repo issues or
pilot packets.

Default channel:

- Microsoft Teams or Copilot first if that is the approved enterprise path.
- Telegram remains a dry-run or personal prototype until explicitly approved.

Deliverables:

- intake form and bot prompt;
- PII and sensitive-data warnings before submit;
- screenshot intake disabled by default;
- human review queue;
- GitHub issue draft mode;
- audit log with source, submitter, timestamp, and decision status.

Verification:

- no automatic external sends;
- no automatic model training on employee submissions;
- no screenshot storage until governance approves retention, access, and
  redaction rules.

## Phase 6 - FHE And Privacy Research

Status: research

Goal: test whether fully homomorphic encryption can protect sensitive manager
signals for narrow scoring or aggregation workflows.

Likely first experiments:

- encrypted yes/no or numeric scoring with Zama Concrete ML;
- private aggregation of small survey signals;
- performance benchmark against non-encrypted baseline.

Not a good first fit:

- map rendering;
- large language model prompting;
- bulk screenshot processing;
- real-time dispatch decisions.

Verification:

- working local benchmark;
- documented latency and accuracy tradeoffs;
- security review before any production recommendation.

## Standing Rules

- Public source does not automatically mean permitted reuse.
- Every source must have owner, URL, retrieval mode, rights envelope, freshness,
  output policy, caveats, and normalized record hashes.
- No confidential FedEx data in public GitHub.
- No operational claims without human verification.
- Finish and verify one phase before expanding the next.
