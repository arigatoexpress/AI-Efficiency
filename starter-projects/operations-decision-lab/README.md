# Operations Decision Lab

> Part of the [AI Efficiency Hub](../../README.md). Offline evaluator · reviewed synthetic or approved scrubbed aggregate data only · no route generation or dispatch.

## What This Is

Operations Decision Lab is a dependency-free Node.js command-line evaluator
for a deliberately small first milestone. It produces three transparent
one-day package-volume baselines, evaluates them with availability-aware
rolling origins, and independently checks supplied synthetic candidate plans
against hard constraints.

A successful run atomically publishes canonical `analysis.json` and a matching
`brief.md`. It makes no network or model calls and never recommends, generates,
or dispatches a route.

## Who It Helps

- Operations managers exploring how forecast evidence and plan feasibility can
  be reviewed together.
- Analysts building a leakage-safe baseline before testing more complex
  network-volume models.
- Governance reviewers defining the data and action boundary for later routing,
  send-time, scenario-risk, and productivity experiments.

## Safe Data Boundary

Use the tracked files in `fixtures/` or a locally prepared, owner-approved
scrubbed aggregate JSON file that already matches the closed contract. Never
use raw reports, tracking numbers, customer or employee data, names, addresses,
coordinates, route manifests, source-system identifiers, credentials, or
free-text notes.

- Put local input under ignored `local-input/`.
- Put disposable output under ignored `output/`.
- Do not direct scrubbed output elsewhere in the repository; an arbitrary
  output path could be staged accidentally.
- `--data-classification scrubbed` labels provenance only. It does not widen
  the schema or identifier rules.
- Synthetic identifiers have opaque numeric suffixes such as
  `SYNTH-STATION-01`; descriptive location or person-like suffixes fail closed.

Errors report stable codes and allowlisted field paths without echoing rejected
values, local paths, records, or stack traces.

## Implemented Methods

### Forecast evidence

The single additive series is `packages_tendered` in `packages`. Three models
always appear in this order:

1. last value;
2. fixed-policy Holt level/trend (`alpha=0.5`, `beta=0.25`); and
3. seven-day seasonal naive.

The evaluator uses expanding one-step rolling origins. A record may train a
fold only when its `availableAt` timestamp is at or before that fold snapshot.
Forecast P10/P25/P50/P75/P90 values use nearest-rank empirical residuals that
were available before the forecast; additive quantiles are repaired to
nonnegative ordered values with disclosure.

Published out-of-sample evidence includes MAE, signed bias, seven-day MASE,
pinball loss, 50%/80% interval coverage, and interval width. The seasonal MASE
scale is calculated over the snapshot-eligible evaluation series and is
explicitly unavailable for insufficient or zero scale. Every model remains
visible and `winner` is always `null` in this milestone.

### Supplied-plan feasibility

The independent oracle checks supplied plans for:

- required, duplicate, and unknown assignments;
- vehicle and labor availability and overlap;
- vehicle capacity;
- release time, visit sequence, chronology, and service windows;
- declared service duration, route duration, and labor on-road minutes; and
- nonnegative quantities.

Hard constraints are separate from objective weights. An infeasible plan
cannot become feasible through weighting, and visits are never inserted,
deleted, reordered, or silently repaired. The current input has one plan-level
release time; route-specific releases are a later contract change.

## Run The Synthetic Fixture

Requirements: Node.js 22 and a local checkout. No install is required.

```bash
node --test starter-projects/operations-decision-lab/test/*.test.mjs

node starter-projects/operations-decision-lab/src/cli.mjs \
  --input starter-projects/operations-decision-lab/fixtures/synthetic-input.json \
  --output-dir starter-projects/operations-decision-lab/output/demo-002 \
  --data-classification synthetic
```

The output directory must not exist. Success prints
`OK operations-decision-analysis: synthetic output written` and creates exactly
`analysis.json` and `brief.md` with private filesystem modes.

The reviewed scenario manifest covers normal, low-volume, surge,
unavailable-vehicle, impossible-capacity, and future-information rejection
cases. The normal fixture must match `fixtures/expected-analysis.json` byte for
byte.

## Interpret The Output

Treat `analysis.json` as canonical and `brief.md` as a compact rendering of the
same evidence.

| Section | Meaning | Review caution |
| --- | --- | --- |
| `provenance` | Classification, snapshot, target, policy, and model versions | Confirm all versions and times against the approved preparation process. |
| `forecasts.models[].forecast` | One forward point and empirical quantile evidence | A baseline distribution is not a service guarantee. |
| `forecasts.models[].evaluation` | Rolling-origin error and calibration evidence | Lower forecast error alone does not prove a better operating decision. |
| `feasibility` | Exact hard-constraint evidence for supplied plans | Feasible means “passed declared checks,” not “approved to dispatch.” |
| `limitations` | Capabilities intentionally absent from 002-A | Do not infer rankings or recommendations from omitted methods. |

## Deliberately Deferred

002-A does not implement hierarchy reconciliation, coherent network scenarios,
expected loss, CVaR, regret, plan ranking, route optimization, send-time value,
operational sensitivities, or stops-per-hour attribution. The research plan
defines those later milestones without presenting option prices or financial
Greeks as an operating model.

## Recovery And Human Control

The CLI preflights an existing output or temporary path, acquires an exclusive
sibling lock, writes both artifacts to a new private temporary directory, and
publishes them with one directory rename. It removes only the temporary path
and lock owned by that run. A crash-stale lock requires a human to verify no
publisher is active before removal.

Every communication, plan change, staffing decision, route action, or live-data
connection remains outside this tool and requires approved systems plus human
review. See the [demo script](demo-script.md),
[governance review](governance-review.md), and
[002 specification](../../specs/002-operations-decision-lab/spec.md).

## Status

Offline, synthetic-first evaluator milestone. Not approved for production,
live operational data, personnel decisions, route generation, or dispatch.
