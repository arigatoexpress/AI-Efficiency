# Operations Decision Intelligence Research

**Date:** 2026-07-15
**Scope:** Recent `AI-Efficiency` additions, stops-per-hour measurement,
Dynamic Route Optimization (DRO), send-time decisions, network-volume
forecasting, prediction-market concepts, and derivatives-inspired sensitivity
analysis.

## Executive Decision

Do not expand the monthly Priority Metrics Intelligence feature into a single
forecasting, routing, dispatch, and optimization application. These are related
but independently testable systems with different data grains, mathematical
assumptions, and failure modes.

Use this delivery sequence:

1. `001-priority-metrics-intelligence`: safe metric definitions, comparisons,
   lineage, provenance, and manager briefs.
2. `002-operations-decision-lab`: synthetic probabilistic volume forecasting,
   scenario generation, current-plan evaluation, DRO/send-time alternatives,
   and operational sensitivities.
3. A later constrained optimizer only after the decision lab proves that its
   forecasts are calibrated and that its recommendations beat current/static
   policies on frozen synthetic evals.
4. An optional forecast-elicitation tournament only after exogenous forecast
   questions can be separated from outcomes managers can influence.

The active product should be an operations decision engine with independently
testable modules, not another dashboard. Existing UIs may consume its derived
outputs later.

## Applied Boundary For 001

The implemented monthly evidence layer deliberately does not accept arbitrary
business labels from this broader research. Its public CSV boundary uses six
source-controlled `synth_` definitions: the three golden-fixture metrics plus
separate stops-per-on-road-hour, packages-per-paid-hour, and packages-per-stop
rate aliases. Rate semantics retain numerator, denominator, and monthly time
basis in canonical evidence. Owner-approved local aggregates must be mapped to
those aliases before invocation.

The input numeric domain is intentionally conservative (zero or absolute
magnitude `1e-12` through `1e12`, at most 15 significant digits), with unsigned
12-22 digit integers privacy-rejected as tracking-shaped before conversion.
Configured associations require observed catalog metrics, at least three
recurrences, and a feasible `minimumObservations + lagMonths <= 60` window. The
latest 13 periods remain the continuity gate, while scaled Pearson may retain
additional aligned history and reports unexpected arithmetic as
`numeric_overflow`. Broader metric catalogs and forecasting inputs belong to a
separately reviewed expansion or to `002`, not an implicit relaxation of 001.

## What the Recent Repository Additions Actually Provide

The latest 20 `origin/main` commits contain dependency, workflow,
documentation, and presentation changes. They do not add DRO, send-time,
network-volume, option-sensitivity, or stops-per-hour optimization.

Useful earlier additions are:

### TLH/SPH Efficiency Explorer

Preserve:

- the exact identity that decomposes a ratio change into volume and labor-hour
  effects;
- deterministic synthetic stories;
- property checks with a near-zero residual; and
- the warning that an hours-driven ratio improvement is not automatically an
  operational win.

Correct before reuse:

- `SPH` is described as “Shipments/Stops Per Hour,” but shipments and stops are
  distinct numerators;
- network aggregation can compare different final weeks for different
  facilities while displaying one date pair;
- CSV parsing uses naive comma splitting;
- user-supplied labels are rendered into HTML without a robust escaping
  boundary; and
- the current tests prove algebra and demo behavior, not business validity.

The shared schema must instead distinguish:

- `stops_completed`;
- `packages_delivered`;
- `on_road_hours`;
- `paid_hours` and total labor hours;
- `stem_minutes`, `travel_minutes`, `service_minutes`, `wait_minutes`, and
  `dwell_minutes`; and
- `stops_per_on_road_hour`, `packages_per_on_road_hour`,
  `packages_per_paid_hour`, and `packages_per_stop` as separate derived metrics.

Ratios are outcomes and guardrails. They must not be the sole optimization
objective.

### Dock Efficiency Signal Lab

Preserve:

- baseline-first forecasting;
- rolling-origin evaluation;
- Statistical Process Control (SPC) concepts; and
- the separation between SPC alerts and trading-style explanatory overlays.

Correct before reuse:

- the displayed forecast is a fixed momentum-gated blend, while the README
  claims walk-forward selection chooses the best model;
- the backtest omits the displayed ensemble;
- the nominal 80% band is a residual heuristic rather than an empirically
  calibrated interval;
- the forecast and SPC math has no focused CI eval;
- SPC limits are estimated from the same full history they monitor, rather
  than a frozen stable Phase-I baseline; and
- the single-file implementation makes reuse and isolated testing difficult.

Keep MACD, RSI, Bollinger bands, and crossover language out of action logic.
They are communication aids at most.

### Forecast Foundation-Model Spike

Preserve the gate: an advanced model must beat simple baselines on a frozen,
walk-forward evaluation before it earns a pilot.

Treat the reported Chronos comparison as historical evidence, not a permanent
product benchmark. The model revision and Python dependencies were not pinned,
the generator uses one seed and a small friendly fixture, the result has no
confidence interval, and the benchmark is outside CI.

### Logistics Intelligence and ADK Starters

Preserve:

- labeled source/provenance concepts;
- human review language;
- read-only tool surfaces; and
- the prohibition on automatic dispatch, reroute, or send actions.

Do not reuse the hardcoded station signals or the unvalidated Gemini request
path as the core optimizer. The current ADK safety check occurs after text has
already reached the model and therefore is not an ingress privacy boundary.

### Delivery Markets

Use the project only as an adjacent probability-communication experiment. Its
dispatch simulator is not a defensible routing optimizer: it lacks geographic
travel matrices, vehicle and route capacity dimensions, service-time
distributions, forecast uncertainty, and industrial routing constraints.

Do not make a prediction market, automated market maker, wager, or options
contract a dependency of the operations engine.

## Evidence-Based Problem Formulation

For a decision `d` at forecast snapshot `t` and operational scenario `omega`,
define a disclosed loss function:

```text
C(d, omega) =
    w_service * service_misses
  + w_left * left_behind
  + w_overtime * overtime_minutes
  + w_travel * travel_minutes
  + w_wait * wait_minutes
  + w_change * route_changes
```

The first decision objective should be:

```text
J_t(d) = E_t[C(d, omega)] + lambda * CVaR_alpha(C(d, omega))
```

subject to:

- hard safety constraints;
- vehicle, sort, and labor capacities;
- return-to-building and applicable time windows;
- a configured minimum service probability; and
- explicit policy boundaries for what the prototype may recommend.

Every cost component and weight must remain visible. Synthetic dollar weights
are allowed only when labeled as supplied planning assumptions. The system must
also report physical units and service outcomes so a composite score cannot
hide a harmful tradeoff.

This expected-loss plus tail-risk formulation is more appropriate than
Black-Scholes pricing. Package volume is not a tradable underlying, managers
cannot continuously hedge it, and no-arbitrage or risk-neutral pricing does not
apply.

## Operational Sensitivities

Use plain-language names internally and optionally display Greek aliases as
educational shorthand.

### Volume sensitivity (`Delta` alias)

Approximate the marginal change in optimized expected loss from a configured
volume bump:

```text
volume_sensitivity_k =
  [J*(x + h e_k) - J*(x - h e_k)] / (2h)
```

Report the bump size, affected time bucket or area, solver status, and any
resource or route change.

### Threshold curvature (`Gamma` alias)

Approximate nonlinear exposure near a capacity cliff:

```text
threshold_curvature_k =
  [J*(x + h e_k) - 2J*(x) + J*(x - h e_k)] / h^2
```

Because route and staffing choices are discrete, analytic derivatives may be
zero or undefined between breakpoints. Always report the first route, vehicle,
labor, or overtime threshold switch alongside the finite difference.

### Uncertainty sensitivity (`Vega` alias)

Compare optimized loss under wider and narrower forecast distributions while
preserving the mean and correlation structure. This is sensitivity to forecast
dispersion, not implied volatility.

### Decision-delay analysis (`Theta` analogy)

Two quantities must remain separate:

1. **Flexibility decay:** delay the route/send lock while holding information
   fixed. Feasible actions can disappear, so cost generally cannot improve.
2. **Net wait value:** delay the lock and allow a newer forecast snapshot.
   Better information may outweigh lost flexibility, so the result is not
   guaranteed to decay monotonically.

Estimate both with rolling-origin simulation over candidate decision times.
Never claim that operational theta behaves like option time decay.

### Cross sensitivity

Measure the finite-difference interaction between volume and send time to show
when a volume shock makes waiting especially costly. Treat it as scenario
sensitivity, not causality.

## Forecasting Architecture

Forecast distributions, not just point estimates, for:

- stops and packages by station, area, route scenario, and time bucket;
- cube or capacity-relevant load when available in the synthetic schema;
- travel and service times; and
- late-arrival or capacity-breach events.

Required behavior:

1. Seasonal-naive, last-value, and simple exponential/trend baselines run first.
2. Evaluation uses rolling forecast origins with no future leakage.
3. Hierarchical forecasts reconcile so network, station, area, and route totals
   remain coherent.
4. Point metrics include bias, MAE, MASE, and a volume-weighted measure only
   when its denominator is safe.
5. Distribution metrics include quantile loss or CRPS, empirical interval
   coverage and width, and calibration by horizon and operating regime.
6. Challenger models require pinned versions, repeated seeds or resamples, a
   frozen fixture, uncertainty around score differences, and a documented
   margin over the baseline.

## DRO, Routing, and Send-Time Architecture

Public FedEx material describes DRO as **Dynamic Route Optimization** and
describes route optimization as supporting route, vehicle-mix, workforce, and
near-real-time planning. The public-safe prototype must not reproduce internal
rules or data.

The synthetic decision lab should evaluate, in order:

1. the current or manually supplied plan under forecast scenarios;
2. discrete feasible send-time alternatives;
3. route-assignment and sequence alternatives with capacity, time-window,
   service-time, break, and return constraints;
4. route-stability and workload-balance penalties; and
5. constrained recommendations only after evaluation against the current-plan
   baseline and hindsight oracle.

Stops per hour is a reported outcome. The objective must balance service,
capacity, safety, labor, travel, waiting, stability, and tail risk.

## Prediction-Market Concepts

The immediately useful idea is probability elicitation and proper scoring, not
financial contracts.

Candidate questions must be bounded and resolvable, for example:

- probability that volume exceeds staffed capacity by a named cutoff;
- probability that a named inbound arrival misses a planning threshold; or
- probability that service falls below a threshold under a fixed policy.

Store the forecast snapshot, policy version, decision cutoff, forecast horizon,
and resolution source. Score probabilities with Brier, logarithmic, quantile,
or CRPS measures as appropriate.

Managers can influence operational outcomes. Therefore, separate exogenous
state forecasts from forecasts conditional on a named policy. A market-scoring
mechanism is a later research option only if participants, incentives,
resolution rules, and performative effects are explicitly designed.

## Synthetic Fixture Program

All fixtures use stable synthetic identifiers and seeded generation. Required
regimes include:

- normal operations;
- low volume;
- peak surge;
- late inbound or feeder;
- weather slowdown;
- dense urban and sparse rural stop patterns;
- bulk-stop shock;
- vehicle unavailable;
- forecast bias and variance spike;
- structural break;
- missing arrival estimate; and
- impossible capacity.

The generator should combine clustered, random, and mixed synthetic locations;
nonhomogeneous arrivals; correlated area shocks; packages per stop; travel-time
multipliers; service-time distributions; capacities; hard and soft time
windows; route-lock times; and return-to-building constraints.

Small fixtures publish the exact oracle result. Larger fixtures publish the
seed, generator version, baseline plan, and solver time/status.

## Golden Evaluation Scorecard

### Forecast quality

- rolling-origin bias, MAE, and MASE by horizon;
- quantile loss or CRPS;
- 50%, 80%, and 95% empirical interval coverage and width;
- calibration by volume and disruption regime;
- hierarchy-coherence error; and
- skill difference with uncertainty versus frozen baselines.

### Decision quality

- hard-constraint feasibility;
- expected cost and P90/P95/CVaR tail cost;
- regret versus hindsight oracle;
- value of the stochastic solution versus an expected-value plan;
- on-time stop and package rates by synthetic service class;
- left-behind load, overtime, and return violations;
- travel, stem, service, wait, and dwell time;
- route changes and a monotone workload-balance measure;
- solver status, optimality gap when available, runtime, and repeatability.

### Send-time quality

- regret curve over candidate decision times;
- break-even time;
- percentage of scenarios where a recommendation beats the baseline;
- flexibility-decay and net-wait-value curves; and
- robustness to forecast bias, dispersion, and correlation misspecification.

### Sensitivity quality

- exact finite-difference golden cases;
- stability across configured bump sizes;
- capacity-switch breakpoint detection;
- no causal language without a separately approved identification design; and
- an `insufficient_evidence` result when scenario support is inadequate.

### Governance quality

- synthetic data and weights visibly labeled;
- provenance and policy version on every result;
- privacy rejection before parsing or model access;
- no dispatch, reroute, schedule, or send tool surface; and
- deterministic JSON and manager-readable Markdown derived from the same facts.

## Recommended `002-operations-decision-lab` Slices

1. Canonical schema, seeded scenarios, privacy gate, and golden fixtures.
2. Probabilistic baseline forecasts, rolling-origin calibration, and hierarchy
   reconciliation.
3. Deterministic current-plan evaluator with physical and service metrics.
4. Stochastic send-time policy comparison with recourse and regret.
5. Operational sensitivity and threshold cards.
6. Optional OR-Tools routing adapter after the evaluator is stable.
7. Optional UI consuming versioned JSON; no calculation logic in the UI.

## Primary Sources

- FedEx on data-driven network optimization and predictive intelligence:
  [FedEx Dataworks](https://www.fedex.com/en-us/dataworks.html).
- FedEx public description of Route Optimization and Decision Support (ROADS):
  [2010 Global Citizenship Update](https://www.fedex.com/content/dam/fedex/us-united-states/sustainability/gcrs/FedEx_GCR101.pdf).
- FedEx public description of Network 2.0:
  [Network 2.0](https://www.fedex.com/en-us/network-2-0.html).
- Vehicle-routing constraints and time windows:
  [Google OR-Tools VRP](https://developers.google.com/optimization/routing/vrp)
  and [VRPTW](https://developers.google.com/optimization/routing/vrptw).
- Rolling-origin evaluation and probabilistic forecast accuracy:
  [Forecasting: Principles and Practice](https://otexts.com/fpp3/tscv.html)
  and [distributional accuracy](https://otexts.com/fpp3/distaccuracy.html).
- Coherent hierarchical forecasts:
  [MinT forecast reconciliation](https://robjhyndman.com/publications/mint/).
- Proper scoring rules:
  [Gneiting and Raftery](https://doi.org/10.1198/016214506000001437).
- Calibration and sharpness:
  [Gneiting, Balabdaoui, and Raftery](https://doi.org/10.1111/j.1467-9868.2007.00587.x).
- CVaR optimization:
  [Rockafellar and Uryasev publication index](https://uryasev.ams.stonybrook.edu/publications/).
- Prediction-market scoring mechanism:
  [Hanson, Logarithmic Market Scoring Rules](https://hanson.gmu.edu/mktscore.pdf).
- Original Black-Scholes assumptions and option-pricing context:
  [Black and Scholes](https://www.cs.princeton.edu/courses/archive/fall09/cos323/papers/black_scholes73.pdf).
- Forecast-to-decision regret:
  [Elmachtoub and Grigas](https://arxiv.org/abs/1710.08005).
- Prescriptive analytics:
  [Bertsimas and Kallus](https://pubsonline.informs.org/doi/10.1287/mnsc.2018.3253).
- FedEx operations-research history:
  [Mason et al.](https://doi.org/10.1287/inte.27.2.17).
