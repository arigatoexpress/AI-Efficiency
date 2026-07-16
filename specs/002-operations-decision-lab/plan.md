# Operations Decision Lab Implementation Plan

**Branch**: `002-operations-decision-lab` | **Date**: 2026-07-15 | **Spec**: `specs/002-operations-decision-lab/spec.md`

**Input**: Approved feature specification in this directory.

## Summary

Build an offline, evaluator-first decision lab for synthetic network-volume,
candidate-route, and send-time experiments. The lab first establishes
leakage-safe baseline forecasts and an independent hard-constraint feasibility
oracle. It then adds coherent scenario evaluation, expected loss/CVaR, send-time
experiments, operational finite differences, dimensional productivity
attribution, and canonical JSON/Markdown evidence. It evaluates supplied plans;
it does not generate routes or take operational action.

## Delivery Strategy

The feature is divided into independently reviewable vertical slices:

1. **Forecast and feasibility kernel**: closed synthetic inputs, rolling-origin
   last-value/seasonal-naive/level-trend baselines, quantiles, scoring, candidate
   plan validation, and hard-constraint evidence.
2. **Coherent scenario evaluation**: hierarchy reconciliation, residual-block
   scenarios, objective components, expected loss, CVaR, common-scenario plan
   comparison, baseline/oracle regret.
3. **Send-time and sensitivity lab**: fixed-information flexibility decay,
   updated-information wait value, centered/second/cross finite differences,
   and exact discrete breakpoints.
4. **Productivity attribution**: aggregate-first stops/hour and companion rates,
   deterministic change decomposition, and adverse-outcome warnings.
5. **Publication and integration**: atomic canonical JSON/Markdown CLI, public
   synthetic fixtures, docs, prompt/library references, root verification, CI.

Each slice must be useful and testable by itself. A later solver adapter is
ineligible until the independent feasibility and common-scenario evaluators are
complete and a named golden eval demonstrates a benefit.

This branch begins with slice 1 only. Its task list must not mark later slices
complete or expose placeholder results. Slice 1 reports reconciliation,
scenario comparison, send-time, sensitivity, and productivity sections as
outside the emitted schema rather than as empty evidence that could be mistaken
for implemented analysis.

## Technical Context

**Language/Version**: Node.js 22 ESM

**Primary Dependencies**: Node standard library only for the initial feature;
no routing, statistics, ML, database, or model dependency

**Storage**: Closed UTF-8 JSON inputs and one atomically published local output
directory; tracked data is synthetic only

**Testing**: `node:test`, exact golden fixtures, adversarial privacy/schema
tests, invariant/property tables, root documentation/application verification

**Target Platform**: macOS local use and Ubuntu GitHub Actions

**Project Type**: Offline CLI starter project and pure evaluator modules

**Performance Goals**: No wall-clock benchmark claim in the first release;
deterministic boundary fixtures cover 1,000 observations, 100 demand groups, 25
candidate plans, and 500 scenarios without a flaky duration assertion

**Constraints**: Offline, deterministic, seeded scenarios, public-safe,
advisory-only, no dispatch or personnel path, no live coordinates, no network,
no output before full validation, hard constraints never represented as cheap
penalties

**Scale/Scope**: Slice 1 supports one synthetic network/station aggregate,
`packages_tendered`, 35-730 daily observations, one-step forecasts, 1-25
supplied plans, 1-100 demand groups, and explicit minutes/capacity quantities.
Later slices introduce hierarchy, 1-16 week horizons, and scenarios.

## Constitution Check

- [x] Every behavior begins with a deterministic failing eval and names its
      expected failure.
- [x] Tracked fixtures are synthetic-only and privacy validation fails closed
      before analytics or writes.
- [x] The feature is offline and advisory; no live operational or outward action
      path is introduced.
- [x] Units, rate dimensions, snapshot times, constraints, and evidence
      provenance are explicit.
- [x] The design is the smallest independently useful sequence and adds no
      dependency before an eval-backed need exists.
- [x] Focused evals, full repository verification, exact-path staging, and
      rollback points are specified.

Post-design recheck: **PASS**. The data model and contracts introduce no
constitution exception.

## Project Structure

### Documentation

```text
specs/002-operations-decision-lab/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── tasks.md
├── contracts/
│   ├── cli.md
│   ├── input.schema.json
│   └── analysis-output.schema.json
└── checklists/
    └── requirements.md
```

### Source and evals

```text
starter-projects/operations-decision-lab/
├── README.md
├── .gitignore
├── fixtures/
│   ├── synthetic-observations.json
│   ├── synthetic-resources.json
│   ├── synthetic-plans.json
│   ├── synthetic-policy.json
│   └── expected-analysis.json
├── src/
│   ├── errors.mjs
│   ├── schema.mjs
│   ├── privacy.mjs
│   ├── time.mjs
│   ├── forecast.mjs
│   ├── backtest.mjs
│   ├── reconcile.mjs
│   ├── scenario.mjs
│   ├── plan.mjs
│   ├── feasibility.mjs
│   ├── objective.mjs
│   ├── evaluate.mjs
│   ├── send-time.mjs
│   ├── sensitivity.mjs
│   ├── productivity.mjs
│   ├── analyze.mjs
│   ├── render.mjs
│   └── cli.mjs
└── test/
    ├── validation.test.mjs
    ├── forecast-backtest.test.mjs
    ├── feasibility.test.mjs
    ├── scenario-objective.test.mjs
    ├── send-time-sensitivity.test.mjs
    ├── productivity.test.mjs
    └── workflow.test.mjs
```

**Structure Decision**: Keep the complete feature in one starter project so
pure modules share closed domain records without creating a speculative common
package. The evaluator and fixtures stay colocated. `time.mjs` is justified by
four or more current consumers; no other module is extracted without two call
sites.

## Core Interfaces

```js
// schema.mjs / privacy.mjs
export function parseInputJson(text) // -> DecisionLabInput
export function assertPublicSafe(input) // throws SafeInputError, no echo

// forecast.mjs / backtest.mjs
export function forecastBaselines({ observations, targets, policy })
export function rollingOriginBacktest({ observations, policy })

// reconcile.mjs / scenario.mjs
export function reconcileAdditiveForecasts({ forecasts, hierarchy })
export function buildScenarios({ reconciledForecasts, residualBlocks, seed })

// plan.mjs / feasibility.mjs
export function normalizePlans({ plans, snapshot })
export function evaluateFeasibility({ plan, resources, demandGroups, policy })

// objective.mjs / evaluate.mjs
export function scorePlanScenario({ plan, scenario, policy })
export function comparePlans({ plans, scenarios, policy, feasibility })

// send-time.mjs / sensitivity.mjs / productivity.mjs
export function compareSendTimes(experiment)
export function estimateSensitivities(experiment)
export function deriveProductivity(aggregates)

// analyze.mjs / render.mjs / cli.mjs
export function analyzeDecisionLab(input)
export function stableJson(value)
export function renderMarkdown(analysis)
export async function run(argv, io)
```

Pure modules receive validated values and do not read files, clocks,
environment variables, or network state.

## Key Design Decisions

### Forecasts before advanced models

- Evaluate last-value, seasonal-naive, and deterministic level/trend baselines
  first using rolling origins and availability timestamps.
- Publish P10/P25/P50/P75/P90 from empirical fold residuals; disclose quantile
  repair and insufficient samples.
- Score MAE, MASE when the seasonal denominator exists, signed bias, pinball
  loss, and interval coverage. An advanced method is not eligible without
  repeatable out-of-sample decision-value improvement.
- Reconcile additive quantities only. Recompute rates after reconciliation.

### Independent hard-constraint oracle

- Validate assignment uniqueness/completeness, vehicle capacity/availability,
  time ordering, release time, service windows, route/shift duration, and
  nonnegative quantities before simulation.
- Return stable violations with entity ID, constraint code, observed value,
  limit, and unit. Never silently repair a plan.
- Infeasible plans remain visible but cannot enter the recommended set.

### Common-scenario decision value

- Evaluate all comparable plans against identical scenario IDs and policy.
- Preserve raw objective components before weighted totals.
- Compute expected loss and upper-tail CVaR from explicit scenario costs.
- Report regret against a same-scenario hindsight oracle and value versus a
  declared simple baseline plan; suppress ranking when comparability fails.

### Send time and operational sensitivities

- Keep fixed-information flexibility decay distinct from updated-information
  net wait value.
- Treat EV/theta/delta/gamma/vega names only as explanatory analogies. Canonical
  fields are `expected_loss`, `flexibility_decay`, `volume_sensitivity`,
  `threshold_curvature`, and `uncertainty_sensitivity`.
- Reevaluate the decision set for every perturbation and report plan changes
  and discrete breakpoints. Never apply a smooth derivative across an
  infeasible or discontinuous plan without disclosure.

### Dimensional productivity

- Sum additive numerators and denominators before deriving rates.
- Preserve stops, packages, paid/on-road/stem/travel/service/wait/dwell/overtime
  minutes separately.
- A higher stops/hour value never alone implies a better plan; service,
  left-behind, safety, and overtime outcomes remain visible.

## Commit and Verification Boundaries

1. SpecKit plan/research/contracts/tasks.
2. Closed input/privacy/time/provenance boundary.
3. Forecast baselines and rolling-origin scoring.
4. Plan normalization and feasibility oracle.
5. Reconciliation/scenarios/objective/plan comparison.
6. Send-time/sensitivity/productivity evidence.
7. Atomic workflow, docs, root verification, and CI.

Every boundary uses explicit-path staging and is independently revertible.
Focused tests run after each behavior; `npm run verify`, legacy starter checks,
TypeScript/build, documentation/prompt synchronization, `git diff --check`, and
SpecKit consistency analysis run before a pull request.

## Complexity Tracking

No constitution violation or dependency exception is required.
