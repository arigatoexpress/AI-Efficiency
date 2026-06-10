# AI Efficiency Team Roadmap

Last reviewed: 2026-06-09

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

Status: **Complete**

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
- docs are readable by a non-technical FEC supervisor or manager.

## Phase 1 - Logistics Intelligence App Hardening

Status: **Complete**; map-control hotfix deployed

Goal: make the AI Studio and Cloud Run prototype useful for station managers as
a decision-support console.

Deliverables:

- visible prototype-only positioning;
- source labels for every public signal;
- labels for synthetic or approximated values;
- fixed map controls and legend visibility; deployed live on 2026-05-23 with a
  cache-busted v4 stylesheet;
- manager-friendly shift brief, route watch, station impact, and source trail
  panels;
- no live dispatch, reroute, customer, package, employee, or facility-security
  actions.

Verification:

- browser checks at desktop and mobile sizes;
- no broken map controls; verified at `1366x768` and `390x844`;
- no language implying official production authority;
- no API keys or secrets in public files.

## Phase 2 - Prompt Library Expansion

Status: **Active**

Goal: build the richest, most practical prompt library for FedEx FEC supervisors and managers.

Deliverables:

- FedEx-specific prompts for daily operations, safety, peak season, linehaul,
  routing, customer communication, and contractor coordination;
- a printable daily operations playbook that sequences those prompts into a
  full-shift routine (pre-shift, mid-shift, peak, handoff, after-action, weekly);
- FedEx terminology guide for authentic, accurate language;
- FedEx AI literacy guide aligned with the company's enterprise AI Education program;
- pilot program template for proposing small, measurable experiments;
- demo script for presenting the repo to regional leadership.

Verification:

- every prompt includes the safe-prompt rule;
- terminology is accurate and sourced from public FedEx documents;
- prompts are tested by at least one FEC supervisor or manager;
- no proprietary FedEx procedures or internal system details are exposed.

## Phase 3 - Public Data Layer

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

## Phase 4 - Foundry-Ready Export

Status: live Kadima discovery verified; upload dry-run blocked pending dataset
RIDs

Goal: reuse the regional intelligence Foundry export pattern for logistics
signals so the work can move into Palantir Foundry when access is approved.

Current engineering track:

- An internal implementation track (private repo) extends the
  `intel-foundry-export` path with a `--include-logistics-fixture` option for
  public/synthetic station-ops logistics object files.
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

## Phase 5 - Predictive Load Approximation

Status: research — license review complete
([docs/forecasting-model-license-review.md](docs/forecasting-model-license-review.md))
and the beat-the-baseline benchmark executed
([starter-projects/forecast-foundation-model-spike/](starter-projects/forecast-foundation-model-spike/README.md)):
on synthetic fixtures the Signal Lab's tuned, momentum-gated ensemble beat
Chronos-Bolt zero-shot overall and at horizons 1-3 (walk-forward MASE 0.845 vs
0.895 overall; h=4 effectively tied, Chronos narrowly lower), so **simple
baselines remain the path**; re-test only on a real local series or if a
4+ week horizon need emerges (Chronos's best showing).

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
  and reproducibility review — license half passed 2026-06-09 (all candidates
  Apache-2.0); the reproducibility checklist and beat-the-baseline benchmark
  remain the gate.

Verification:

- benchmark against synthetic holdout data first;
- expose confidence and limits;
- never label public-derived estimates as real package volume or real station
  workload.

## Phase 6 - Teams Or Telegram Intake Agent

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

## Phase 7 - FHE And Privacy Research

Status: spike complete — benchmark and recommendation in
[starter-projects/fhe-private-scoring-spike/](starter-projects/fhe-private-scoring-spike/README.md)

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

- working local benchmark; **done 2026-06-09** — encrypted logistic-regression
  scoring at 5.3 ms/sample with a 0.5-point accuracy cost vs clear (synthetic
  data, seed 42, CPU only);
- documented latency and accuracy tradeoffs; **done** — see the spike README;
- security review before any production recommendation. **Still required.**

## Phase 8 - CTO Team Alignment And Rollout

Status: **Active** — review feedback implemented; cadence and rollout pending

Goal: act on the CTO-team review of this repo and build the standing
relationship: cohesive messaging, an agentic AI track, deeper efficiency
tooling, and a monthly call where the bigger decisions get made deliberately.

Delivered from the review feedback:

- cohesive audience messaging — "FEC supervisors and managers" is the standard
  term repo-wide, with the glossary as the single source of truth and
  "Operations Manager" kept only as the Legacy Express reference;
- agentic AI has a clear home — the agency-ladder guide
  (`docs/technology/agentic-ai-for-operations.md`), wired into the hub, README,
  and agent notes, indexing the ADK and intake-agent docs;
- efficiency depth — the TLH/SPH Efficiency Explorer decomposes each
  week-over-week efficiency change into exact throughput (SPH) and hours (TLH)
  effects, so the two productivity levers are first-class instead of hidden in
  one composite number;
- "FEC" expansion confirmed from public FedEx careers material: **Federal
  Express Corporation**, the single operating company since June 1, 2024
  (Express + Ground + Services; Freight separate) — glossary updated, TODO
  resolved.

Still ahead:

- validate the TLH/SPH decomposition against one real, locally-loaded weekly
  export during a pilot;
- stand up the monthly CTO-team call as the decision forum;
- support the possible NW-region survey rollout (senior leadership down to
  frontline FEC supervisors and managers) when it is scoped.

Open question (decide in the monthly CTO call — do not act unilaterally):

- **Public repo vs private FedEx-only repo.** Making the repo private is
  irreversible in practice (forks/clones of the public history exist) and
  policy-bound. It trades community visibility for a wider internal data
  envelope. This is a deliberate decision for the CTO call, not a changeset.

Verification:

- terminology sweep verified (only the glossary and explicit Legacy Express
  references retain the old title);
- the explorer's decomposition is exact (effects sum to the total change to
  1e-9) with startup validation cases;
- no real facility data committed; synthetic demo data clearly badged.

## Standing Rules

- Public source does not automatically mean permitted reuse.
- Every source must have owner, URL, retrieval mode, rights envelope, freshness,
  output policy, caveats, and normalized record hashes.
- No confidential FedEx data in public GitHub.
- No operational claims without human verification.
- Finish and verify one phase before expanding the next.
