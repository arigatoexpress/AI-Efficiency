# Operations Intelligence Program — Design

**Program branch:** `spec/operations-intelligence-program`
**Status:** Approved design, written for review
**Created:** 2026-07-15
**Data posture:** Public repository; synthetic fixtures and explicitly scrubbed
local inputs only

## Outcome

Build a small, evidence-led decision-support program for operations managers.
It must explain performance, forecast uncertain network demand, compare feasible
send-time and route choices, and show the operational cost of waiting or being
wrong. It remains advisory: a human owns every dispatch, staffing, and service
decision.

The program deliberately separates three questions that have different data,
methods, and evaluation requirements:

1. **What happened?** Monthly priority-metric comparison and risk lineage.
2. **What may happen?** Calibrated, hierarchical volume and operating forecasts.
3. **What should we consider?** Constraint-aware plan comparison under forecast
   uncertainty.

## Feature Map

| Feature | Decision cadence | Purpose | First deliverable |
| --- | --- | --- | --- |
| `001-priority-metrics-intelligence` | Monthly | Explain changes, target variance, recurring risks, and candidate leading indicators | Deterministic analyzer and executive brief |
| `002-operations-decision-lab` | Intraday and next-day | Forecast demand and compare route/send-time plans under constraints and uncertainty | Evaluator-first synthetic decision lab |
| `003-constrained-route-optimizer` | Intraday | Generate candidate plans after the evaluator and feasibility oracle are trusted | Future feature; not yet specified |
| `004-forecast-elicitation` | Planning horizon | Evaluate bounded human forecasts with proper scoring rules | Optional future feature; not a financial market |

`001` must not grow into the intraday optimizer. `002` must first evaluate
explicit candidate plans; candidate generation belongs in `003` so a solver
cannot be mistaken for a validated objective or an operational authority.

## Shared Domain Language

- **Observation:** A synthetic, time-stamped measurement known as of a forecast
  snapshot. Later observations may not leak into earlier forecasts.
- **Forecast:** A point or quantile distribution with a target time, horizon,
  hierarchy, model version, and snapshot time.
- **Scenario:** One coherent realization of demand, travel, service, arrival,
  and resource uncertainty.
- **Plan:** A versioned set of route assignments, sequences, send times, holds,
  and resource choices.
- **Feasibility:** Satisfaction of hard capacity, time-window, labor, vehicle,
  service, and safety constraints.
- **Policy:** The information and decision rules in force at a snapshot time.
- **Outcome:** The simulated or observed result of a plan under a scenario.
- **Regret:** A plan's loss minus the best feasible hindsight loss for the same
  scenario. It is evaluation evidence, not blame.

## Correct Metric Semantics

No generic `SPH` field is permitted. Every rate names its numerator,
denominator, and time basis. At minimum, the synthetic contracts distinguish:

- `stops_completed / on_road_hours`;
- `packages_delivered / paid_hours`;
- `packages_delivered / stops_completed`;
- `packages_handled / total_labor_hours`;
- stem, travel, service, wait, and dwell minutes; and
- planned, forecast, tendered, dispatched, attempted, and completed quantities.

Rates are derived after aggregation from additive numerators and denominators.
The system must never average row-level ratios across areas or periods unless a
named statistical method explicitly requires it.

## Decision Model

For plan `d` and scenario `omega`, the evaluator uses an explainable weighted
loss:

```text
C(d, omega) =
    w_service * service_misses
  + w_left    * left_behind
  + w_ot      * overtime_minutes
  + w_travel  * travel_minutes
  + w_wait    * wait_minutes
  + w_change  * route_plan_changes
```

The risk-aware plan score is:

```text
J_t(d) = E_t[C(d, omega)] + lambda * CVaR_alpha(C(d, omega))
```

Weights, `lambda`, and `alpha` are explicit policy inputs. The evaluator reports
the raw components as well as the combined score so a ranking cannot hide the
tradeoff. Hard constraints are never converted into cheap penalties.

Stops per hour is an outcome and diagnostic, not the sole objective. Optimizing
that ratio alone can reward undesirable choices such as omitting difficult
stops, increasing unpaid or unmeasured time, or degrading service.

## Forecasting Model

The initial model ladder is deliberately modest:

1. seasonal-naive and last-value baselines;
2. exponential level/trend baselines;
3. empirical residual or quantile distributions;
4. hierarchy reconciliation across network, station, area, and time bucket;
5. advanced models only after repeatable rolling-origin gains.

Model selection uses rolling-origin backtests and reports scale-free point
error, bias, quantile loss, interval coverage, and hierarchy coherence. A single
holdout, one seed, or a point-error win is insufficient evidence.

## Operational Sensitivities

Options terminology may appear only as a parenthetical analogy. Canonical names
are operational and computed by explicit scenario perturbations:

- **Volume sensitivity (`Delta` analogy):** centered finite difference of the
  optimized objective after a volume bump.
- **Threshold curvature (`Gamma` analogy):** second finite difference plus the
  first exact route, labor, vehicle, or overtime breakpoint.
- **Uncertainty sensitivity (`Vega` analogy):** change in optimized loss as the
  forecast distribution widens or narrows while mean and dependence are held.
- **Flexibility decay (`Theta` analogy):** cost of losing feasible actions while
  information is held fixed.
- **Net wait value:** effect of both newer information and lost flexibility.
  Unlike option theta, this may be positive or negative.
- **Volume/send-time cross sensitivity:** scenario interaction showing when a
  demand shock changes the cost of waiting.

Black-Scholes and no-arbitrage pricing are excluded: packages are not tradable
assets, the process is not hedge-replicable, and the assumptions do not match
an operating network.

## Safety and Data Boundaries

- The repository contains synthetic data only.
- Local scrubbed input is accepted only through a documented, gitignored path.
- Schemas use allowlisted fields and reject free text and direct identifiers.
- Stable identifiers use the `SYNTH-` namespace and cannot resemble real
  tracking, employee, route, customer, or address identifiers.
- The workflow is offline and deterministic by default.
- No output can dispatch a route, message a person, change staffing, call a
  live API, or write to an operational system.
- Every recommendation carries the forecast snapshot, policy version, plan
  version, constraints, limitations, and evidence trail.

## Evaluation Contract

Tests are the program's specification. Shared release gates are:

1. privacy-negative fixtures fail before analytics and do not echo rejected
   values;
2. time-indexed backtests prevent future-data leakage;
3. additive totals reconcile before any rates are derived;
4. every recommended plan is feasible or explicitly labeled infeasible;
5. forecast baselines, decision baselines, and oracle regret are reported;
6. deterministic fixtures cover normal, surge, late inbound, weather slowdown,
   dense urban, sparse rural, bulk stop, vehicle loss, forecast bias, variance
   spike, structural break, missing ETA, and impossible capacity regimes;
7. JSON and Markdown outputs contain identical facts and provenance; and
8. root verification, focused evals, documentation checks, and CI all agree.

## Spec Kit Execution Profile

As of 2026-07-15, the latest official Spec Kit release is `v0.8.15`. After the
written-spec review gate, initialize that pinned version for Codex skills and
follow the official artifact sequence:

```text
Constitution -> Specification -> Plan -> Tasks -> Implement
```

The project constitution will encode the repository's existing Karpathy
charter: evals before refactors, synthetic-only public data, simplicity,
reversible slices, explicit-path staging, and no outward operational action.
Plans and tasks must pass constitution and consistency review before
implementation. New presets, extensions, and automated workflows are evaluated
only when two real feature call-sites need them; they are not installed merely
because the current Spec Kit supports them.

Official references:

- [Spec Kit repository and workflow](https://github.com/github/spec-kit)
- [Spec Kit v0.8.15 release](https://github.com/github/spec-kit/releases/tag/v0.8.15)
- [Spec Kit CLI overview](https://github.com/github/spec-kit/blob/main/docs/reference/overview.md)

## Delivery Sequence

1. Complete and review the `001` and `002` specifications.
2. Initialize pinned Spec Kit support and encode the project constitution.
3. Write task-level implementation plans with exact files, evals, and rollback
   points.
4. Implement `001` as the monthly evidence layer.
5. Implement the evaluator-first slices of `002`: schema/privacy, forecast
   baselines, scenario evaluation, then send-time/sensitivity analysis.
6. Admit a route optimizer only after the feasibility and objective evals are
   independently trusted.
7. Mirror approved tasks into GitHub and open small pull requests with one
   verified concern per branch.

No production integration, deployment, live FedEx data, or external message is
part of this program design.
