# Priority Metrics Intelligence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deterministic offline CLI that turns synthetic or locally
scrubbed monthly metrics into validated JSON evidence and a matching manager
brief.

**Architecture:** A dependency-free Node.js pipeline validates closed CSV/JSON
contracts and privacy boundaries before pure analytics modules calculate
comparisons, risk lineage, configured patterns, and conservative projections.
The CLI atomically publishes one new directory containing canonical JSON and a
Markdown rendering of only that JSON.

**Tech Stack:** Node.js 22 ESM, Node standard library, `node:test`, UTF-8 CSV and
JSON, GitHub Actions.

## Global Constraints

- Every new behavior begins with a deterministic failing eval.
- Tracked fixtures use `SYNTH-` identifiers and synthetic values only.
- Unknown fields, free text, identifiers, and malformed records fail before
  analytics or writes without echoing rejected values.
- Default execution is offline and contains no network or model dependency.
- JSON is canonical; Markdown cannot add calculations or claims.
- Outputs are byte-stable and written atomically after successful analysis.
- No dispatch, personnel action, live integration, deployment, or outward
  message is in scope.
- Use Node.js standard-library code; add no root runtime dependency or lockfile.
- Stage only explicit paths. Run focused and repository-wide verification.

---

**Branch:** `spec/operations-intelligence-program`
**Date:** 2026-07-15
**Spec:** `specs/001-priority-metrics-intelligence/spec.md`

## Summary

Implement the smallest complete monthly evidence layer before the intraday
decision lab. The pipeline accepts a closed monthly CSV and optional closed
analysis-policy JSON, rejects unsafe input, performs deterministic comparisons
and configured analyses, then emits stable evidence for human review. No UI,
database, model API, or shared abstraction is introduced.

## Technical Context

**Language/Version:** Node.js 22, ECMAScript modules

**Primary Dependencies:** Node standard library only

**Storage:** Local CSV/JSON input and one atomically published output directory

**Testing:** `node:test`, golden fixtures, root documentation and application
verification

**Target Platform:** macOS local use and Ubuntu GitHub Actions

**Project Type:** Offline CLI starter project

**Performance Goals:** No wall-clock claim for the prototype; a deterministic
10,000-row smoke eval guards against accidental non-termination or quadratic
explosion without a flaky duration threshold

**Constraints:** Deterministic, offline, synthetic-only tracked data, no rejected
value echo, no runtime dependencies

**Scale/Scope:** 13-60 monthly periods, up to 500 metric definitions and 10,000
rows per run

## Constitution Check

- [x] Each task starts with a named failing eval and expected failure.
- [x] Fixtures are synthetic-only; closed validation precedes analytics/writes.
- [x] The CLI is offline and advisory with no operational action path.
- [x] Units, rate definitions, periods, targets, and provenance are explicit.
- [x] Standard-library modules form the smallest useful slice; no dependency is
  added.
- [x] Focused evals, full verification, explicit staging, and rollback commits
  are specified.

Post-design recheck: **PASS**. The data model and contracts below introduce no
constitution exception.

## Project Structure

### Feature documentation

```text
specs/001-priority-metrics-intelligence/
├── spec.md
├── research.md
├── plan.md
├── data-model.md
├── quickstart.md
├── tasks.md
├── contracts/
│   ├── analysis-output.schema.json
│   └── cli.md
└── checklists/requirements.md
```

### Source and evals

```text
starter-projects/priority-metrics-intelligence/
├── README.md
├── .gitignore
├── fixtures/
│   ├── synthetic-monthly-metrics.csv
│   ├── synthetic-policy.json
│   └── expected-analysis.json
├── src/
│   ├── errors.mjs
│   ├── schema.mjs
│   ├── parse.mjs
│   ├── privacy.mjs
│   ├── compare.mjs
│   ├── risk-lineage.mjs
│   ├── patterns.mjs
│   ├── project.mjs
│   ├── analyze.mjs
│   ├── render.mjs
│   └── cli.mjs
└── test/
    ├── validation.test.mjs
    ├── compare.test.mjs
    ├── lineage-patterns.test.mjs
    ├── projection.test.mjs
    └── workflow.test.mjs
```

**Structure decision:** A focused starter keeps its code, fixtures, and evals
together like existing offline prototypes while splitting pure behavior into
small modules. Nothing is extracted to a shared package because there is only
one current call site.

## Module Interfaces

```js
// errors.mjs
export class SafeInputError extends Error {
  constructor(code, fieldNames = [], rowNumber = null)
}

// parse.mjs
export function parseMetricsCsv(text)
// -> Array<MetricObservation>
export function parsePolicyJson(text)
// -> AnalysisPolicy

// privacy.mjs
export function assertPublicSafe(records)
// -> void; throws SafeInputError without rejected values

// compare.mjs
export function compareMetrics(records)
// -> Array<MetricComparison>

// risk-lineage.mjs
export function traceRiskLineages(comparisons)
// -> Array<RiskLineage>

// patterns.mjs
export function findPatterns(records, comparisons, policy)
// -> { recurrences, candidateAssociations }

// project.mjs
export function projectBaselines(records, policy)
// -> Array<BaselineProjection>

// analyze.mjs
export function analyzeMetrics({ records, policy, analyzerVersion })
// -> AnalysisResult

// render.mjs
export function stableJson(value)
// -> string ending in one newline; floating noise rounded at 12 decimals
export function renderMarkdown(analysis)
// -> string ending in one newline, facts sourced only from AnalysisResult

// cli.mjs
export async function run(argv, io)
// -> numeric exit code
```

All arrays use documented stable sort keys before serialization. Pure modules
receive validated values and do not read files, clocks, environment variables,
or network state.

## Analysis Decisions

### Comparison and target status

- Join by `metric_id` and exact monthly period.
- Use the dataset-wide latest period as the sole analysis period; report a
  metric missing from it as `missing_current_period`.
- Compute absolute change whenever both values exist.
- Compute percentage change only when the baseline is nonzero.
- Preserve absolute change in the source unit; for `percent`, document it as
  percentage points and keep relative percentage change separate.
- `minimum`, `maximum`, and `range` map to higher-is-better,
  lower-is-better, and within-range conditions.
- `warning_margin` expands outward from the target boundary and produces
  `warning`; target breach produces `at_risk`; no target produces `no_target`.

### Risk lineage

Each `at_risk` comparison opens a lineage only if the same metric is not already
in an active lineage. Consecutive months classify `persisted`, `worsened`, or
`recovered`; a missing month closes continuity as `untraceable`. Severity uses
absolute distance beyond the applicable target boundary in the metric's unit.

### Patterns

- Recurrence is a repeated `at_risk` event meeting `minimumRecurrences`.
- Candidate association runs only for configured metric pairs and integer lags.
- It uses Pearson correlation on aligned finite observations, returns the exact
  periods and count, and labels the result `candidate_association`.
- Fewer than `minimumObservations`, zero variance, or period gaps produce an
  explicit limitation rather than a numeric result.

### Projection

Use a deterministic drift baseline: the last observed value plus the median of
the most recent first differences, using at most `projectionWindow` periods.
This is robust to one extreme change, simple to explain, and not marketed as a
calibrated forecast. Missing consecutive history returns a limitation.

### Privacy and numeric stability

- The CSV header must exactly equal the allowlist, with no duplicates.
- Controlled labels permit letters, spaces, and `()/%+-`; reject `@`, control
  characters, digit runs of four or more, and address tokens followed by a
  number.
- Slug fields reject values resembling tracking or direct identifiers.
- Safe errors contain only code, field name, and one-based row number.
- Sort comparisons by metric ID then period and other metric collections by
  metric ID. Round floating noise only at canonical serialization to 12 decimal
  places; non-computable values are `null` plus a reason code.

## File and Commit Boundaries

1. Contract and privacy boundary: errors, schema, parser, privacy, negative
   fixtures, validation evals.
2. Comparison math: comparisons and target status evals.
3. Evidence analysis: lineages, patterns, projections and their evals.
4. Workflow: analyzer, stable renderer, CLI, golden synthetic fixture.
5. Repository integration: README, prompt, generated index, root verification,
   CI gate.

Each boundary is independently testable and revertible. Exact red-green steps
and commit commands are defined in `tasks.md`.

## Complexity Tracking

No constitution violations or complexity exceptions are required.
