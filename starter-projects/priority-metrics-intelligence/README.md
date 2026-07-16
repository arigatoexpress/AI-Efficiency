# Priority Metrics Intelligence

> Part of the [AI Efficiency Hub](../../README.md). Offline prototype · synthetic or locally scrubbed aggregate metrics only · human review required.

## What This Is

Priority Metrics Intelligence is a dependency-free Node.js command-line tool
that turns monthly aggregate metrics into deterministic evidence. It validates
the input before analysis, compares the latest month with prior periods, traces
target risks, reports configured candidate associations, and produces a simple
baseline projection.

Each successful run publishes two matching files: canonical `analysis.json`
and a manager-readable `brief.md` rendered only from that JSON. The tool makes
no network or model calls and takes no operational action.

## Who It Helps

- FEC supervisors and managers reviewing a monthly priority-metrics package.
- Analysts preparing a consistent evidence package for manager review.
- Governance reviewers checking privacy, provenance, limitations, and human
  control before a pilot.

## When To Use It

- To compare approved aggregate metrics month over month and year over year.
- To review supplied target status and follow an at-risk metric through later
  periods.
- To identify recurring target breaches or inspect a specifically configured
  lagged relationship.
- To prepare a conservative baseline outlook and questions for a data owner.

## Do Not Use It For

- Raw FedEx reports or customer, employee, package, tracking, route, address,
  manifest, facility-security, or source-system data.
- Employee scoring, staffing or route decisions, dispatch, alerts, messages,
  or any other automated operational action.
- Causal claims. A candidate association is correlation for human
  investigation, not evidence that one metric caused another.
- Forecast guarantees. The outlook is a deterministic recent-drift baseline,
  not a calibrated production forecast.

## Safe Data Rules

The tracked files in `fixtures/` are reviewed synthetic golden fixtures. The
repository does not track runtime output or local input:

- Put a locally prepared, approved scrubbed CSV in the ignored `local-input/`
  directory. The tool never copies it into a tracked location.
- Put disposable run directories under the ignored `output/` directory.
- Never commit real input, runtime output, screenshots of real values, or
  temporary publication artifacts.
- Use `--data-classification synthetic` only for synthetic input. Use
  `--data-classification scrubbed` only after the responsible data owner has
  confirmed the aggregate file is approved and contains no prohibited data.

Validation fails closed on unknown columns, unsafe identifiers, unstructured
free-text fields or notes, malformed values, inconsistent metric definitions,
and unknown policy fields. Errors contain safe field names and codes rather
than rejected values.

## Input Contract

The required UTF-8 CSV header is exact and uses snake_case fields:

```text
period,pillar_id,metric_id,metric_label,value,unit,target_type,target_min,target_max,warning_margin
```

Each row is one aggregate metric for one `YYYY-MM` period. See
[`fixtures/synthetic-monthly-metrics.csv`](fixtures/synthetic-monthly-metrics.csv)
for the synthetic example. The closed schema and metric-definition rules are
documented in the approved [feature specification](../../specs/001-priority-metrics-intelligence/spec.md).

An optional UTF-8 JSON policy uses camelCase keys. Unknown keys are rejected.
Without a policy, the deterministic defaults are a six-period projection
window, three recurrences, and no candidate-association search.

```json
{
  "projectionWindow": 6,
  "minimumRecurrences": 3,
  "candidateAssociations": [
    {
      "sourceMetricId": "synth_late_inbound_count",
      "outcomeMetricId": "synth_on_time_percent",
      "lagMonths": 1,
      "minimumObservations": 6
    }
  ]
}
```

## How To Start

Requirements: Node.js 22 and a local checkout. No install is required.

First run the focused eval:

```bash
node --test starter-projects/priority-metrics-intelligence/test/*.test.mjs
```

Then run the synthetic fixture from the repository root:

```bash
node starter-projects/priority-metrics-intelligence/src/cli.mjs \
  --input starter-projects/priority-metrics-intelligence/fixtures/synthetic-monthly-metrics.csv \
  --policy starter-projects/priority-metrics-intelligence/fixtures/synthetic-policy.json \
  --output-dir starter-projects/priority-metrics-intelligence/output/demo-001 \
  --data-classification synthetic
```

Success prints `OK priority-metrics-analysis: synthetic output written`. The
new output directory contains exactly `analysis.json` and `brief.md`.

### Coordinated publication and recovery

The CLI creates a sibling `<output>.lock` while publishing and removes its own
lock after success or a handled failure. Publishers using this CLI coordinate
through that lock. External, uncoordinated mutation of the destination or its
temporary paths is outside the supported contract.

If a process crashes, its `<output>.lock` can remain and later runs fail closed
with `OUTPUT_LOCKED`. An operator must verify that no publisher is still
running and that the target and temporary paths are safe before removing a
crash-stale lock. Never delete a lock merely to force a run through.

If a run fails, stop and read the safe error code. Do not reuse or overwrite an
existing output directory; choose a new directory after correcting the input.
Disposable output can be removed after review. The tracked fixture remains the
rollback reference.

## How To Interpret The Output

Read `analysis.json` as the source of truth and use `brief.md` as its compact
rendering.

| Section | Meaning | Review caution |
| --- | --- | --- |
| `comparisons` | Latest-period values, month-over-month and year-over-year changes, and supplied target status | A missing or zero baseline is disclosed instead of invented. Percent-metric absolute changes are percentage points. |
| `riskLineages` | At-risk metrics followed through persisted, worsened, improved-at-risk, recovered, or untraceable states | A lineage describes target status, not cause. |
| `patterns.recurrences` | Repeated configured target-breach events | Repetition alone does not explain why the event occurred. |
| `patterns.candidateAssociations` | Configured lagged Pearson correlations with periods and observation counts | Treat only as a hypothesis for investigation, never a driver or causal finding. |
| `projections` | Median-recent-drift baselines and their exact input periods | A baseline is not a guarantee or an authorized plan. |
| `limitations` and `provenance` | Missing evidence, classification, period range, analyzer version, and methods | Resolve limitations and verify source facts before sharing or acting. |

## Example Workflow

1. Run the synthetic command and open `analysis.json`.
2. Confirm `inputSummary.validationResult` is `passed`, the classification is
   `synthetic`, and the period range matches the fixture.
3. Trace one at-risk comparison into `riskLineages`.
4. Inspect the candidate association's coefficient, lag, observation count,
   and exact period pairs without calling it causal.
5. Compare `brief.md` with the JSON and confirm it adds no new facts.
6. Follow the [demo script](demo-script.md) for a safe manager walkthrough.

## Review And Approval

A human owner must verify all important values against approved systems,
resolve limitations, and approve any communication or action. Review the
[governance notes](governance-review.md), the
[project review checklist](../../docs/governance/project-review-checklist.md),
and the [derived-output executive prompt](../../prompts/data-and-reporting.md)
before using a brief in a wider review.

## Known Limitations

- Monthly aggregate evidence only; no intraday, route, staffing, or individual
  analysis.
- Candidate associations run only for explicitly configured metric pairs.
- The recent-drift baseline does not quantify forecast uncertainty.
- The first release has no user interface, database, or live integration.
- Local scrubbed use depends on the human preparer's approval and data hygiene.

## Status

Offline prototype with deterministic synthetic golden evals. It is not
approved for production use. Use synthetic or approved non-sensitive aggregate
data only, and require human review before anything is shared or acted on.
