# Priority Metrics Intelligence — Feature Specification

**Feature branch:** `001-priority-metrics-intelligence`
**Status:** Implemented; review fixes verified
**Created:** 2026-07-15
**Source request:** AI Meeting Notes received 2026-07-15
**Parent design:** `specs/000-operations-intelligence-program/design.md`

## Purpose

Create a public-safe, offline workflow that helps FedEx FEC supervisors and
managers analyze synthetic or explicitly scrubbed priority metrics across
reporting periods. The workflow must compare performance, trace risks through
later periods, surface recurring and leading patterns, and draft an executive
summary without exposing internal FedEx data or presenting speculation as fact.

The first release is a deterministic analytics starter project plus a prompt
that reviews its derived output. It is not a production dashboard, an internal
FedEx data integration, or an autonomous decision system.

## Product Boundaries

### In scope

- A documented, allowlisted metric input format.
- Synthetic history spanning at least 13 consecutive monthly periods,
  including a synthetic June baseline and comparison period.
- Month-over-month and year-over-year comparisons.
- Target variance and direction-aware risk classification.
- Risk persistence and recovery tracking across later periods.
- Recurring-pattern and candidate leading-indicator analysis.
- Conservative baseline projections with explicit evidence and limitations.
- Machine-readable JSON and manager-readable Markdown output.
- A prompt-library entry that consumes derived, scrubbed output.
- Golden evals, privacy rejection tests, documentation checks, and CI wiring.

### Out of scope

- Real FedEx reports, employee data, customer data, package data, tracking
  numbers, route manifests, facility-security details, or proprietary system
  exports in Git history or fixtures.
- Uploads, network calls, external model calls, live APIs, or credentials.
- Automated operational decisions, personnel recommendations, or alerts.
- Claims of causal relationships from correlation.
- Production deployment or integration with an enterprise data warehouse.
- Refactoring `fedex-delivery-markets` or the Logistics Intelligence System.
- Intraday volume forecasting, route/send-time evaluation, or DRO; those belong
  to `002-operations-decision-lab`.
- A new user interface in the first release.

## Users and Decisions

### Primary user

An FEC supervisor or manager reviewing a monthly priority-metrics package.

### Supported decisions

- Which metrics changed materially from the prior month and prior year?
- Which metrics are above or below their stated targets?
- Which previously identified risks persisted, worsened, recovered, or lack
  enough follow-up evidence?
- Which recurring sequences deserve human investigation?
- What should an executive brief state as confirmed fact, hypothesis, or
  missing evidence?

The workflow informs review and follow-up. A human remains responsible for
interpretation, escalation, and every operational action.

## User Scenarios and Acceptance Criteria

### Scenario 1: Compare monthly performance (P1)

Given valid synthetic monthly metrics with comparable periods, the workflow
calculates absolute and percentage changes for the latest month versus the
previous month and the same month one year earlier.

Acceptance criteria:

1. A metric present in all comparison periods has correct month-over-month and
   year-over-year values.
2. A missing comparison period produces `insufficient_history`; it never
   substitutes zero or invents a comparison.
3. Percentage change from a zero baseline is marked `not_computable` while the
   absolute change remains available.
4. Metric units are preserved and incompatible units are rejected.
5. `latest month` means the dataset-wide latest period. A metric absent from
   that period is disclosed as `missing_current_period` and is not silently
   analyzed at an older date.

### Scenario 2: Evaluate target performance (P1)

Given a metric and target type, the workflow calculates target variance and
assigns a deterministic status.

Acceptance criteria:

1. `minimum`, `maximum`, and `range` targets are evaluated correctly as
   higher-is-better, lower-is-better, and within-range conditions.
2. Thresholds are supplied in the input definition rather than invented by the
   analyzer.
3. A metric without a target is labeled `no_target`; it is not classified as a
   risk solely because its value changed.

### Scenario 3: Trace a risk forward (P2)

Given a metric classified as at risk in one month, the workflow evaluates each
subsequent available month and reports when the risk persisted, worsened,
recovered, or became untraceable because data is missing.

Acceptance criteria:

1. Every risk lineage references the original metric and period.
2. A recovery is reported only after the metric returns to its supplied target
   condition.
3. Missing months break continuity and are disclosed.
4. The output does not claim that one metric caused another metric's outcome.

### Scenario 4: Surface recurring and leading patterns (P2)

Given at least 13 consecutive months of comparable data, the workflow searches
for repeated threshold breaches and lagged associations between metrics.

Acceptance criteria:

1. Recurrence requires at least three observations of the same defined event.
2. A candidate leading indicator requires a configured source metric, outcome
   metric, lag, and minimum observation count.
3. Results include observation count, lag, association strength, and the exact
   periods used.
4. Results use the label `candidate association`, never `cause`, `driver`, or
   `prediction`, unless an external approved methodology later establishes it.
5. Insufficient or non-consecutive history produces an explicit limitation.
6. The 13-consecutive-period requirement is evaluated per configured metric,
   ending at the dataset-wide latest period.

### Scenario 5: Produce a conservative outlook and executive brief (P2)

Given valid derived analytics, the workflow produces a baseline projection and
an executive Markdown brief.

Acceptance criteria:

1. The baseline projection method is deterministic, documented, and tested.
2. Every projection reports its input window and is labeled `baseline`, not a
   forecast guarantee.
3. The brief separates confirmed observations, risks, candidate associations,
   baseline outlook, missing evidence, and suggested review questions.
4. Suggested actions are review steps, not autonomous operational directives.

### Scenario 6: Reject unsafe or malformed input (P1)

Given a file with unknown columns, free-text notes, or identifiers outside the
allowlist, the workflow stops before analysis.

Acceptance criteria:

1. The parser accepts only the documented schema.
2. Unknown columns fail closed with safe allowlisted field guidance.
3. Direct-identifier-like values in metric identifiers or labels trigger the
   privacy gate.
4. Invalid dates, duplicate metric-period keys, non-finite values, incompatible
   units, and malformed targets produce actionable validation errors.
5. Rejected input is not copied into logs or output artifacts.

## Input Contract

The canonical interchange format is UTF-8 CSV. Each row represents one metric
for one monthly period.

Allowed fields:

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| `period` | `YYYY-MM` | Yes | Monthly reporting period; year `0001`-`9998` |
| `pillar_id` | catalog value | Yes | Source-controlled synthetic performance pillar |
| `metric_id` | catalog value | Yes | Source-controlled `synth_` metric alias |
| `metric_label` | catalog value | Yes | Exact controlled synthetic display label |
| `value` | safe decimal | Yes | Observed aggregate value in the documented numeric domain |
| `unit` | enum | Yes | `count`, `percent`, `minutes`, `hours`, `index`, or `ratio` |
| `target_type` | enum | No | `minimum`, `maximum`, or `range` |
| `target_min` | finite number | Conditional | Minimum acceptable value |
| `target_max` | finite number | Conditional | Maximum acceptable value |
| `warning_margin` | non-negative number | No | Explicit near-target warning band |

An optional UTF-8 JSON configuration file supplies analysis policy rather than
observations. Its closed schema permits `projectionWindow`,
`minimumRecurrences`, and `candidateAssociations`, an array containing only
`sourceMetricId`, `outcomeMetricId`, `lagMonths`, and
`minimumObservations`. `minimumRecurrences` is 3-12. Association lags are 1-12,
minimum observations are 6-60, and `lagMonths + minimumObservations` cannot
exceed the supported 60-period input scope. Every configured metric reference
must occur in the observations. Unknown configuration fields fail closed. If no
configuration file is supplied, deterministic documented defaults apply and no
candidate association search runs.

No names, email addresses, tracking numbers, addresses, employee identifiers,
customer identifiers, route identifiers, free-text notes, or raw source-system
fields are permitted.

The public boundary accepts only the source-controlled synthetic catalog below.
Locally scrubbed source columns must be mapped to one of these exact aliases
before invocation; arbitrary identifiers, labels, pillars, and generic `sph`,
`productivity`, or `efficiency` keys fail closed. This mapping is a human data-
preparation step and does not authorize the tool to ingest a raw source export.

| Metric alias | Pillar | Label | Unit | Closed semantic definition |
| --- | --- | --- | --- | --- |
| `synth_damage_percent` | `synth_quality` | `SYNTH Damage percent` | `percent` | `damaged_packages / packages_handled`, monthly aggregate |
| `synth_late_inbound_count` | `synth_flow` | `SYNTH Late inbound count` | `count` | `late_inbound_packages`, monthly aggregate |
| `synth_on_time_percent` | `synth_service` | `SYNTH On-time percent` | `percent` | `packages_delivered_on_time / eligible_packages`, monthly aggregate |
| `synth_stops_per_on_road_hour` | `synth_route` | `SYNTH Stops per on-road hour` | `ratio` | `stops_completed / on_road_hours`, monthly aggregate |
| `synth_packages_per_paid_hour` | `synth_flow` | `SYNTH Packages per paid hour` | `ratio` | `packages_delivered / paid_hours`, monthly aggregate |
| `synth_packages_per_stop` | `synth_route` | `SYNTH Packages per stop` | `ratio` | `packages_delivered / stops_completed`, monthly aggregate |

The rate definitions name numerator, denominator, and time basis and remain
distinct. Upstream preparers aggregate additive components before calculating a
catalog rate; the analyzer does not average row-level ratios across facilities
or periods.

`metric_label` is a controlled display label, not a notes field. It permits
letters, spaces, digits, and the limited punctuation `()/%+-`; email-like
values, digit runs of four or more, address-like text, and control characters
fail the privacy gate. All other string fields are enums, dates, or slugs.

The repository includes only synthetic fixtures. A gitignored `local-input/`
directory may be documented for locally prepared scrubbed files, but the tool
must not automatically copy those inputs into tracked locations. A scrubbed
file that has not been mapped to exact catalog aliases is rejected.

Decimal tokens use at most 15 significant digits. Accepted numeric values are
zero or have absolute magnitude from `1e-12` through `1e12`; all values must be
finite. Unsigned 12-22 digit integer tokens are treated as tracking-shaped and
privacy-rejected before numeric conversion. These conservative limits prevent
unsafe-integer ambiguity, precision collapse, and derived overflow at the
public boundary.

## Derived Output Contract

The JSON output contains:

- input metadata, validation result, and the exact closed semantic definitions
  for every observed catalog metric;
- per-metric MoM, YoY, and target comparisons;
- risk lineages with originating and follow-up periods;
- recurring events;
- configured candidate lagged associations;
- baseline projections and input windows;
- limitations and missing-data disclosures; and
- a provenance block naming the analyzer version and deterministic methods.

The dataset-wide latest period is the analysis period. Comparisons are sorted
by `metric_id` then `period`; lineage and projection arrays are sorted by
`metric_id`. Absolute changes remain in the metric unit. For `percent` metrics,
absolute and target distances are percentage points while `percentage_change`
is the relative percent change from the prior value. Non-computable numeric
values are JSON `null` with a reason code. Calculations use full precision and
canonical serialization normalizes finite values to 15 significant digits,
matching the accepted input precision without rounding a nonzero status-bearing
value to zero. Pearson calculation anchors each aligned series before scaling
and centering. An unexpected
non-finite correlation result is suppressed as `null` with
`numeric_overflow`; it never aborts canonical publication.

The exact latest 13 periods for each configured metric must be consecutive and
end at the dataset-wide latest period. Association evidence may retain a longer
trailing window, up to the 60-period input scope, when needed to satisfy
`minimumObservations + lagMonths`; gaps older than the latest 13-period gate do
not masquerade as failures of the current continuity gate.

The Markdown brief renders the same facts without adding new calculations.
Runtime-generated artifacts are disposable outputs and are not committed. The
repository commits only reviewed synthetic golden inputs and expected outputs
under `fixtures/` so deterministic behavior can be evaluated.

## Architecture

Create `starter-projects/priority-metrics-intelligence/` with focused modules:

- `src/schema.mjs`: schema constants, source-controlled metric catalog, numeric
  domain, and validation rules.
- `src/parse.mjs`: CSV parsing into canonical metric records.
- `src/privacy.mjs`: allowlist and identifier-pattern rejection.
- `src/compare.mjs`: MoM, YoY, and target calculations.
- `src/risk-lineage.mjs`: persistence, worsening, recovery, and gaps.
- `src/patterns.mjs`: recurrence and configured lagged associations.
- `src/project.mjs`: documented deterministic baseline projection.
- `src/render.mjs`: JSON and Markdown serialization.
- `src/cli.mjs`: local command-line orchestration and exit codes.
- `test/`: focused unit checks plus golden end-to-end fixtures.
- `fixtures/`: synthetic input and expected output only.

Use Node.js already required by the repository and standard-library code where
practical. No runtime dependency may be added unless the implementation plan
demonstrates that equivalent correct behavior would otherwise be unreasonable.

## Error Handling

- Validation errors exit nonzero and identify safe field-level corrections.
- Privacy errors exit nonzero before analytics and do not echo rejected values.
- Missing history is represented in output as a limitation, not a process
  failure, when the remaining input is valid.
- Internal invariant failures exit nonzero with a stable error code and no raw
  input dump.
- JSON and Markdown are published together by atomically renaming a newly
  created temporary output directory after validation and analysis succeed.
  The final output directory must not already exist.

## Prompt-Library Integration

Add one prompt to `prompts/data-and-reporting.md` that asks an approved AI tool
to review the analyzer's derived, scrubbed output. The prompt must:

- forbid invention of missing values and causal claims;
- preserve the fact/hypothesis/limitation separation;
- produce an executive summary and questions for the data owner;
- remind the user to verify against approved internal systems; and
- explicitly reject raw reports or identifying data as prompt input.

The generated prompt index and offline Prompt Explorer must remain synchronized.

## Evaluation Strategy

Golden evals are the specification for implementation.

Required eval groups:

1. Schema and privacy rejection: unknown columns, identifier fields, malformed
   dates, duplicates, unapproved catalog definitions, tracking-shaped numeric
   tokens, unsafe magnitudes/significant digits, and non-finite numbers.
2. Comparison math: positive, negative, zero-baseline, missing-history, and
   direction-aware target cases.
3. Risk lineage: persistence, worsening, recovery, and discontinuous periods.
4. Pattern analysis: qualifying recurrence, non-qualifying recurrence,
   configured lag association through lag 12, retained evidence windows,
   scaled numeric stability, insufficient observations, and gaps.
5. Projection: fixed synthetic series with exact expected baseline output.
6. Golden workflow: synthetic CSV to stable JSON and Markdown outputs.
7. Repository integration: prompt-index check, documentation check, and root
   verification include the new starter-project evals.

Tests must run offline and deterministically. Timestamps, random identifiers,
model output, and network access are prohibited in golden results.

## Success Measures

The feature is complete when:

- all acceptance criteria have automated coverage;
- a manager can run one documented command against the synthetic fixture and
  receive the expected JSON and Markdown brief;
- privacy-negative fixtures fail before analysis without echoing sensitive
  values;
- the full existing CI suite plus the new evals passes;
- documentation states exactly what is synthetic, scrubbed, inferred, and
  unavailable; and
- no existing starter project or prompt workflow regresses.

## Rollout and GitHub Scope

Implementation will remain on a feature branch from `origin/main` and use one
reviewable concern per commit. The specification, implementation plan, and task
list will remain in `specs/001-priority-metrics-intelligence/`. After the task
list passes SpecKit consistency analysis, implementation tasks may be mirrored
to GitHub issues and the completed branch opened as a scoped pull request.

No deployment, external announcement, or internal FedEx message is part of this
feature.

## Assumptions

- `AI-Efficiency` remains public and therefore stores synthetic fixtures only.
- A human prepares any locally used scrubbed file before invoking the tool.
- Monthly periods are the `001` cadence; intraday and next-day decisions are
  isolated in `002-operations-decision-lab`.
- Candidate leading indicators are configured comparisons, not an unrestricted
  search across every metric pair.
- The first release prioritizes correctness, explainability, and privacy over a
  graphical interface or advanced forecasting model.
