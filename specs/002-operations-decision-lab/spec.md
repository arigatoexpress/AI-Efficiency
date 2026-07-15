# Operations Decision Lab — Feature Specification

**Feature branch:** `spec/operations-intelligence-program`
**Status:** Draft for user review
**Created:** 2026-07-15
**Parent design:** `specs/000-operations-intelligence-program/design.md`
**Data posture:** Public repository; synthetic fixtures and explicitly scrubbed
local inputs only

## Purpose

Create an offline, evaluator-first Dynamic Route Optimization (DRO) decision lab
for operations managers. The lab forecasts uncertain network volumes, tests
explicit route and send-time plans against synthetic operating scenarios, and
explains service, capacity, labor, travel, wait, and plan-change tradeoffs.

The first release does not dispatch, optimize a live network, or recommend
personnel actions. It makes the decision model, constraints, uncertainty, and
regret measurable before any automated candidate generator is introduced.

## Product Boundaries

### In scope

- Synthetic observations at network, station, area, and time-bucket levels.
- Rolling-origin point and quantile forecast baselines.
- Hierarchical reconciliation of additive forecast quantities.
- Coherent synthetic scenario generation from forecast residuals.
- Validation and feasibility scoring for user-supplied candidate plans.
- Expected-loss and CVaR plan comparison with component-level attribution.
- Counterfactual send-time comparison with fixed-information and
  updated-information views.
- Operational finite-difference sensitivities and capacity breakpoints.
- Stops/hour and related productivity attribution using correct dimensions.
- Stable JSON evidence plus a manager-readable Markdown decision brief.
- Golden evals, privacy rejection, documentation, and root CI integration.

### Out of scope

- Real FedEx package, employee, customer, vehicle, route, address, tracking,
  security, manifest, facility, or operational-system data in the repository.
- Live network calls, uploads, external model calls, credentials, telemetry, or
  operational-system writes.
- Automatic route dispatch, staffing changes, employee scoring, alerts, or
  outward messages.
- Candidate-route generation or a routing solver in the first release.
- Production deployment, warehouse integration, or a graphical user interface.
- Black-Scholes pricing, implied volatility, trading, financial contracts, or
  claims that operational sensitivities are financial Greeks.
- Causal claims from correlations, forecasts, or counterfactual simulations.

## Primary User and Decisions

The primary user is an operations manager comparing plans before a route/send
lock or reviewing why a plan performed differently than expected.

The lab supports these questions:

- What range of stops, packages, cube, travel, and service time is plausible at
  the decision snapshot?
- Is this candidate plan feasible under the declared hard constraints?
- Which plan has the best expected service/cost tradeoff, and how fragile is it
  in adverse scenarios?
- What is the cost of sending now, waiting for information, or losing routing
  flexibility?
- Which area, time bucket, constraint, or forecast error explains the change?
- Where is the first vehicle, labor, route, service, or overtime breakpoint?

All outputs are advisory evidence. A human remains accountable for every
operational action.

## Domain Contract

### Time and provenance

Every observation and derived artifact carries:

- `snapshot_time`: when the information was available;
- `target_start` and `target_end`: interval being forecast or evaluated;
- `service_date`: synthetic operating date;
- `policy_version`: weights, constraints, and decision rules;
- `model_version`: deterministic forecast/scenario implementation version; and
- `plan_version`: immutable candidate-plan version.

Forecasts and decisions may use only records whose availability time is at or
before their snapshot time. Golden evals include a future-data trap.

### Synthetic identifiers

All stable entity identifiers use declared synthetic namespaces such as
`SYNTH-STATION-01`, `SYNTH-AREA-03`, and `SYNTH-VEHICLE-02`. The validator rejects
unknown fields, free-text notes, coordinates precise enough to represent real
locations, and values shaped like tracking, employee, customer, route, address,
or source-system identifiers.

### Additive quantities and rates

Canonical additive quantities include:

- `stops_planned`, `stops_attempted`, and `stops_completed`;
- `packages_forecast`, `packages_tendered`, `packages_dispatched`, and
  `packages_delivered`;
- `cube_units`, `vehicle_capacity_units`, and `left_behind_packages`;
- `paid_minutes`, `on_road_minutes`, `stem_minutes`, `travel_minutes`,
  `service_minutes`, `wait_minutes`, `dwell_minutes`, and `overtime_minutes`.

Derived rates are calculated only after their additive components are summed:

```text
stops_per_on_road_hour = stops_completed / (on_road_minutes / 60)
packages_per_paid_hour = packages_delivered / (paid_minutes / 60)
packages_per_stop = packages_delivered / stops_completed
packages_per_total_labor_hour = packages_handled / (paid_minutes / 60)
```

Zero denominators produce `not_computable`; they never produce zero, infinity,
or an invented fallback. A generic field named `sph`, `productivity`, or
`efficiency` is rejected unless mapped to a canonical definition before entry.

### Candidate plan

A plan declares:

- assignments of synthetic demand groups to synthetic routes and vehicles;
- visit sequence and planned time windows;
- route release/send time and any planned hold;
- vehicle capacity and availability references;
- shift and labor bounds;
- permitted service-window exceptions, if any; and
- a reason code for each change from the baseline plan.

The first release evaluates supplied candidates. It does not generate or
silently repair them.

## Objective and Constraints

For candidate plan `d` and coherent scenario `omega`, calculate:

```text
C(d, omega) =
    w_service * service_misses
  + w_left    * left_behind_packages
  + w_ot      * overtime_minutes
  + w_travel  * travel_minutes
  + w_wait    * wait_minutes
  + w_change  * route_plan_changes

J_t(d) = mean[C(d, omega)] + lambda * CVaR_alpha(C(d, omega))
```

The policy file supplies non-negative weights, `lambda`, and `alpha`. Output
must show every raw component, expected loss, tail loss, and total score. The
system may rank plans only when they share the same snapshot, scenarios,
policy, and declared hard constraints.

Hard constraints include, when present:

- vehicle capacity and availability;
- route continuity and one assignment per demand group;
- shift and maximum on-road duration;
- service, pickup, and arrival time windows;
- earliest permissible send/release time;
- declared safety and mandatory-service rules; and
- non-negative, time-consistent quantities.

A hard-constraint violation makes the plan infeasible. It cannot be made
acceptable by a low weighted penalty. Infeasible plans remain visible with
their exact violated constraints and are excluded from the recommended set.

## User Scenarios and Acceptance Criteria

### Scenario 1: Produce a leakage-safe probabilistic forecast

Given synthetic historical observations and a decision snapshot, the lab
produces point and quantile forecasts for additive demand and operating
quantities.

Acceptance criteria:

1. Last-value, seasonal-naive, and exponential level/trend baselines run before
   any advanced model is eligible.
2. Rolling-origin folds use only information available at each fold snapshot.
3. Outputs include at least median, 10th, 25th, 75th, and 90th percentiles.
4. Quantiles are ordered or deterministically repaired with the repair disclosed.
5. Metrics include MAE, MASE where defined, bias, pinball loss, 50% and 80%
   interval coverage, and hierarchy-coherence error.
6. A model is not declared better without repeatable out-of-sample improvement
   over the named baselines and disclosed sample size.

### Scenario 2: Reconcile the operating hierarchy

Given forecasts at multiple hierarchy levels, the lab returns coherent additive
forecasts across network, station, area, and time bucket.

Acceptance criteria:

1. Child forecasts sum to each parent within a documented numeric tolerance.
2. Reconciliation never combines unlike units or non-additive rates.
3. Unreconciled and reconciled accuracy are both reported.
4. Derived rates are recomputed from reconciled numerators and denominators.
5. Missing hierarchy members are disclosed and never imputed as observed zero.

### Scenario 3: Validate a candidate plan

Given a candidate plan and its referenced synthetic resources, the lab checks
schema, temporal consistency, and hard constraints before simulation.

Acceptance criteria:

1. Every demand group is assigned at most once and required groups exactly once.
2. Vehicle, labor, capacity, duration, release, and service-window constraints
   return stable pass/fail evidence.
3. An impossible-capacity fixture is labeled infeasible rather than force-fit.
4. Unknown entities, overlapping assignments, backwards time, and negative
   quantities fail with safe field-level errors.
5. Rejected input is not copied into logs or output artifacts.

### Scenario 4: Compare plans under uncertainty

Given two or more feasible candidate plans and a fixed set of coherent
scenarios, the lab evaluates and ranks them.

Acceptance criteria:

1. Each plan is evaluated against the identical scenario identifiers.
2. Output includes objective components, mean loss, configured CVaR, total
   risk-aware score, service level, left-behind packages, overtime, travel,
   wait, stops per on-road hour, and packages per paid hour.
3. The report includes a simple baseline plan, hindsight oracle, regret versus
   oracle, and value of the evaluated decision model versus baseline.
4. Monte Carlo uncertainty or finite scenario-sample limitations are disclosed.
5. A recommendation cites the exact policy and is suppressed when no candidate
   is feasible or comparisons are not like-for-like.

### Scenario 5: Compare send times

Given the same operating horizon and candidate release times, the lab measures
the effect of sending now versus waiting.

Acceptance criteria:

1. **Flexibility decay** holds the information set fixed and removes actions
   that would no longer be feasible at later locks.
2. **Net wait value** uses the forecast snapshot available at each later lock
   and includes both information gain and lost flexibility.
3. The two quantities are never merged into a generic `theta` result.
4. Output includes a regret curve, service/capacity tradeoffs, and the first
   candidate time at which the preferred plan changes.
5. The result may favor waiting or sending; monotonic decay is not assumed.

### Scenario 6: Measure operational sensitivities

Given a valid baseline, explicit perturbation sizes, and a reproducible scenario
seed, the lab estimates local decision sensitivity.

Acceptance criteria:

1. Volume sensitivity uses a centered finite difference after reevaluating the
   candidate decision set at `x-h` and `x+h`.
2. Threshold curvature uses a second finite difference and reports the first
   exact discrete resource or plan breakpoint.
3. Uncertainty sensitivity widens and narrows dispersion while preserving mean
   and documented dependence.
4. Volume/send-time cross sensitivity reports both perturbations and all four
   evaluated objective values.
5. Every result includes units, bump size, solver/evaluator status, scenario
   seed, policy version, and whether the preferred plan changed.
6. Canonical output names are operational; Greek aliases appear only in
   explanatory labels.

### Scenario 7: Explain productivity changes

Given plan outcomes or historical synthetic aggregates, the lab explains a
change in stops per on-road hour without treating the ratio as the objective.

Acceptance criteria:

1. Stops, packages, paid time, on-road time, travel, service, wait, dwell, and
   route-density effects remain separate.
2. Aggregate rates are derived from aggregate components, not averaged ratios.
3. A deterministic decomposition reconciles to the observed rate change within
   tolerance and exposes an interaction/remainder term where required.
4. Missing components produce a limitation, not an invented driver.
5. The brief warns when a higher rate coincides with worse service, more
   left-behind packages, or another adverse outcome.

### Scenario 8: Render an auditable manager brief

Given valid derived results, the lab emits stable JSON and Markdown.

Acceptance criteria:

1. Markdown contains no fact or calculation absent from JSON.
2. The brief separates observations, forecasts, assumptions, plan comparisons,
   constraints, sensitivities, limitations, and manager review questions.
3. Every recommendation includes snapshot, policy, model, plan, scenario, and
   provenance identifiers.
4. Language remains advisory and never instructs an automatic dispatch,
   staffing, discipline, or personnel action.
5. Re-running identical inputs produces byte-stable output.

### Scenario 9: Reject unsafe or malformed input

Given an unknown field, direct identifier, free text, raw location, or malformed
record, the lab stops before forecasting or plan evaluation.

Acceptance criteria:

1. Schemas fail closed and identify only safe field names and error codes.
2. Rejected values are neither echoed nor persisted.
3. Network access is absent from the default workflow and tested as unavailable.
4. Repository fixtures contain only declared synthetic namespaces.
5. A local-input workflow documents scrubbing responsibility and keeps inputs
   and generated artifacts gitignored.

## Forecast and Scenario Architecture

Forecast distributions cover at least:

- stops and packages by hierarchy and time bucket;
- capacity-relevant load such as synthetic cube units;
- inbound/ready-time uncertainty;
- travel and service minutes; and
- late-arrival, capacity-breach, and service-miss events.

Scenarios preserve declared dependencies across adjacent time buckets and
areas. Independent random draws for every variable are prohibited when they
would destroy peak, weather, arrival, or density relationships. The first
release may use deterministic residual-block sampling or explicit authored
scenarios; the method and seed are part of provenance.

## Reference Architecture

Create `starter-projects/operations-decision-lab/` with focused Node.js modules:

- `src/schema.mjs`: closed schemas, enumerations, and invariant definitions.
- `src/privacy.mjs`: field allowlists and identifier-pattern rejection.
- `src/forecast.mjs`: baseline point/quantile forecasts.
- `src/backtest.mjs`: rolling-origin folds and scoring rules.
- `src/reconcile.mjs`: additive hierarchy reconciliation.
- `src/scenario.mjs`: coherent deterministic scenario construction.
- `src/plan.mjs`: candidate-plan normalization and versioning.
- `src/feasibility.mjs`: independent hard-constraint oracle.
- `src/objective.mjs`: component loss, expected loss, and CVaR.
- `src/evaluate.mjs`: common-scenario plan comparison and regret.
- `src/send-time.mjs`: flexibility-decay and net-wait experiments.
- `src/sensitivity.mjs`: finite differences and discrete breakpoints.
- `src/productivity.mjs`: dimensional rates and change attribution.
- `src/render.mjs`: stable JSON and Markdown serialization.
- `src/cli.mjs`: offline orchestration and stable exit codes.
- `fixtures/`: synthetic inputs and exact expected outputs only.
- `test/`: focused unit, property, privacy, and golden workflow evals.

Use the repository's existing Node.js runtime and standard library where
practical. Do not add a routing or machine-learning dependency in the first
slice. The independent feasibility evaluator must exist before a future solver
adapter is considered.

## Synthetic Regime Catalog

Golden fixtures cover:

1. normal weekday;
2. low volume;
3. peak surge;
4. late inbound;
5. weather travel slowdown;
6. dense urban route;
7. sparse rural route;
8. bulk stop with high packages per stop;
9. vehicle unavailable;
10. persistent forecast bias;
11. variance spike with stable mean;
12. structural break;
13. missing ETA;
14. impossible capacity; and
15. future-data leakage trap.

Each fixture names the behavior it proves. Randomized robustness checks may
supplement, but never replace, deterministic golden cases.

## Evaluation Scorecard

### Forecast gates

- MAE and MASE where scale and history permit;
- signed bias;
- pinball loss at every published quantile;
- 50% and 80% interval coverage and mean interval width;
- hierarchy-coherence error before and after reconciliation; and
- performance by regime, horizon, hierarchy level, and volume band.

### Decision gates

- feasibility rate and exact constraint violations;
- objective component reconciliation;
- expected loss and configured CVaR;
- regret versus a same-scenario hindsight oracle;
- value versus the simple baseline plan;
- service, left-behind, overtime, travel, wait, and plan-change outcomes; and
- stability of the preferred plan across scenario resamples.

### Send-time and sensitivity gates

- send-time regret curve and preferred-plan breakpoint;
- flexibility decay and net wait value reported separately;
- centered-difference agreement on smooth synthetic cases;
- exact discrete breakpoint detection on capacity-cliff cases;
- uncertainty perturbations preserve the declared mean; and
- results are invariant to safe identifier renaming and scenario ordering.

### Governance gates

- offline execution;
- no direct identifiers or forbidden fields in repository fixtures;
- privacy rejection before analytics;
- no rejected values in logs or outputs;
- stable provenance and byte-deterministic golden artifacts; and
- no automatic action, network write, external message, or live dispatch path.

## Error Handling

- Schema/privacy errors exit nonzero before any derived file is written.
- Infeasible plans are valid evaluation results, not process crashes.
- No-feasible-plan returns a stable outcome and suppresses ranking.
- Missing forecast history returns explicit limitations and baseline
  availability; it never triggers a fabricated advanced forecast.
- Numeric invariant failures identify the safe entity namespace and error code,
  without dumping input records.
- JSON and Markdown are written atomically only after validation and evaluation
  succeed.

## Success Measures

The feature is complete when:

- every acceptance criterion has an automated eval;
- one documented offline command runs the full synthetic golden workflow;
- forecasts are leakage-safe, probabilistic, scored, and coherent;
- an independent evaluator detects every golden feasibility violation;
- plan rankings reconcile exactly to objective components and declared policy;
- send-time experiments separate information value from flexibility loss;
- operational sensitivities include units, perturbations, and breakpoints;
- productivity outputs use named numerators and denominators;
- privacy-negative fixtures fail without disclosing rejected values; and
- focused evals, root verification, documentation checks, and CI all pass.

## Rollout and GitHub Scope

Implementation begins only after this written specification is reviewed. The
implementation plan must divide the feature into reversible, evaluator-first
slices. Each slice receives golden evals before production code and one scoped
commit or pull request concern.

Approved tasks may be mirrored to GitHub issues after the implementation plan
passes consistency review. No deployment, live-data integration, external
announcement, or internal FedEx message belongs to this feature.

## Assumptions

- `AI-Efficiency` remains public and synthetic-only.
- A human prepares any local scrubbed input outside tracked directories.
- Initial route candidates are authored in fixtures or by a local user.
- The initial hierarchy is configurable and uses synthetic entity identifiers.
- Policy weights are transparent scenario inputs, not learned truth.
- Advanced forecasting and route-generation dependencies must earn adoption by
  improving predeclared evals over simpler baselines.
