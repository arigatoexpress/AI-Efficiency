# Operations Decision Lab Research

**Date:** 2026-07-15

## Decision

Build a transparent evaluator before a route generator. The first executable
slice pairs leakage-safe baseline forecasts with an independent feasibility
oracle for supplied synthetic plans. Later slices add coherent scenarios,
risk-aware plan comparison, send-time experiments, operational sensitivities,
and productivity attribution. No financial pricing model is imported.

## Why this order

Route quality cannot be evaluated safely until the system can independently
detect infeasible capacity, assignment, time-window, availability, release, and
duration conditions. Forecast sophistication also cannot be justified by a
training metric alone: the downstream decision loss may move differently from
forecast error. The June 2026 decision-focused-learning tutorial explicitly
reviews this prediction/decision mismatch and motivates evaluation against the
actual downstream decision map.

Therefore:

1. simple forecast baselines precede advanced models;
2. the feasibility oracle precedes any optimizer;
3. common-scenario regret precedes decision-focused training;
4. hard constraints stay separate from weighted objectives; and
5. every plan and forecast remains advisory and reproducible.

## Forecast architecture

Use rolling-origin evaluation because each fold must train only on records
available at its snapshot. Baselines are last value, seasonal naive, and a
deterministic level/trend method. Quantiles come from empirical residuals until
a more complex method demonstrates better out-of-sample forecast and decision
scores.

Hierarchical forecasts apply only to additive quantities. A summing matrix
represents network/station/area/time-bucket aggregation. Point forecasts and
sample paths are reconciled; rates are recomputed after their components are
coherent. The distributional reconciliation literature supports reconciling
simulated paths rather than reconciling independently calculated interval
bounds.

## Routing and feasibility model

Current OR-Tools routing guidance models accumulating time and load through
explicit dimensions, uses slack for waiting, and distinguishes invalid,
timeout, failed, and proven-infeasible statuses. The lab mirrors the underlying
domain semantics but does not add OR-Tools in the evaluator-first release:

- capacity is cumulative load with vehicle-specific bounds;
- time is cumulative travel/service/wait with release and service windows;
- waiting is explicit slack, not hidden travel time;
- a hard violation is infeasible, not a cheap objective penalty; and
- evaluator status is stable evidence, not a forced recommendation.

## Expected loss, CVaR, and regret

For common scenarios, store each raw service, left-behind, overtime, travel,
wait, and plan-change component. Policy weights produce scenario cost. Expected
loss is the arithmetic mean. CVaR is the mean of the configured upper tail,
with the finite-sample cutoff and interpolation rule declared in the contract.

Plan ranking is valid only for identical snapshot, scenario set, policy, and
hard constraints. Report regret versus a same-scenario hindsight oracle and
value versus a declared simple baseline plan. A lower MAE model is not called
better unless its out-of-sample decision score also improves.

## Send-time value

Do not collapse send-time value into a generic theta number:

- `flexibility_decay(t)` freezes information at the original snapshot and
  removes actions that become infeasible at later locks;
- `net_wait_value(t)` uses information actually available at the later snapshot
  and therefore combines forecast update value with lost flexibility.

Both may be non-monotonic. Output the full regret curve and the first plan
breakpoint rather than claiming smooth decay.

## Operational sensitivities

Options language is useful only as an analogy for local experiments:

- delta-like: centered volume sensitivity;
- gamma-like: second finite difference and discrete resource breakpoint;
- vega-like: sensitivity to wider/narrower uncertainty at fixed mean;
- theta-like: the separately defined send-time experiments above;
- cross sensitivity: four-corner volume/send-time experiment.

Canonical names remain operational. Each sensitivity records units, bump size,
seed, scenario IDs, feasibility, and whether the preferred plan changed. These
are simulation derivatives, not causal effects or financial Greeks.

## Synthetic and scrubbed data boundary

Tracked fixtures use declared `SYNTH-` entity IDs and no coordinates, names,
addresses, routes, tracking values, employee/customer data, source-system IDs,
or free text. Local scrubbed inputs remain gitignored and must already be
mapped to the closed contract. The CLI never copies local input into fixtures.

## Rejected alternatives

### Add OR-Tools immediately

Rejected for the first slice. It would add a solver before the independent
oracle and common-scenario evals exist. Reconsider only after golden evaluator
cases are stable and route generation has a measurable benefit.

### Train an advanced forecast first

Rejected. Simple baselines, leakage traps, hierarchy coherence, and decision
loss are not yet established. Complexity has no admissible benchmark.

### Use Black-Scholes or literal option prices

Rejected. Operational demand is not a traded underlying; there is no
replication/no-arbitrage contract. Expected loss, CVaR, regret, information
value, flexibility loss, and finite differences carry the useful mathematics
without false financial semantics.

### Average stops/hour across routes

Rejected. Ratios must be derived after summing stops and on-road minutes.
Average-of-ratios can reverse comparisons and hides route mix.

## Primary sources

- Google OR-Tools, [Routing dimensions](https://developers.google.com/optimization/routing/dimensions), updated 2026-03-18.
- Google OR-Tools, [Routing options and statuses](https://developers.google.com/optimization/routing/routing_options), updated 2026-03-18.
- Hyndman and Athanasopoulos, [Time-series cross-validation](https://otexts.com/fpp3/tscv.html).
- Hyndman and Athanasopoulos, [Forecast reconciliation](https://otexts.com/fpp3/reconciliation.html).
- Panagiotelis et al., [Reconciled distributional forecasts](https://otexts.com/fpp3/rec-prob.html), European Journal of Operational Research (2023).
- Gneiting and Raftery, [Strictly proper scoring rules, prediction, and estimation](https://doi.org/10.1198/016214506000001437) (2007).
- Rockafellar and Uryasev, [Optimization of conditional value-at-risk](https://doi.org/10.1023/A:1008965218459) (2000).
- Elmachtoub and Grigas, [Smart Predict-then-Optimize](https://arxiv.org/abs/1710.08005) (2022 journal version).
- Liu, [Decision-Focused Learning: When and Why Traditional Prediction Models Fail](https://arxiv.org/abs/2606.21773) (2026).
- Cortes-Gomez et al., [Decision-Focused Uncertainty Quantification](https://arxiv.org/abs/2410.01767) (2024).
