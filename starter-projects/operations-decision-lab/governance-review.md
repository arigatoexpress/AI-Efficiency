# Governance Review — Operations Decision Lab 002-A

This review covers the offline synthetic-first forecast and supplied-plan
evaluator. It does not authorize production use, live data integration,
personnel action, route generation, dispatch, or communication.

## Data And Privacy

| Question | Answer |
| --- | --- |
| What is tracked? | Reviewed synthetic input, scenario manifest, and golden analysis fixtures. |
| What is ignored? | `output/`, `local-input/`, and `*.tmp`. |
| Does data leave the machine? | No. Runtime source has no network, process, model, or message interface. |
| Can scrubbed input be used? | Only owner-approved aggregate JSON already mapped to the exact closed schema and opaque synthetic namespaces. |
| What remains prohibited? | Raw reports; customer, employee, package, tracking, address, coordinate, route-manifest, security, credential, source-system, and free-text data. |

## Decision Boundary

The workflow may provide baseline forecast evidence and validate supplied
synthetic plans against declared hard constraints. It must not:

- select or recommend a model or plan;
- generate, repair, optimize, or dispatch a route;
- score people or recommend staffing/personnel action;
- send alerts, emails, messages, or API requests;
- claim a forecast interval is a guarantee;
- treat an operational sensitivity as causal or as a financial derivative; or
- connect to live FedEx systems without a separately approved milestone.

## Integrity Controls

- Raw parsed input is privacy-inspected before analytics or writes.
- Input and output objects are closed and bounded; identifiers use opaque
  numeric `SYNTH-` namespaces.
- Daily observations are unique, consecutive, chronologically ordered, and
  eligible by `availableAt` at the declared snapshot.
- Rolling-origin forecasts use only fold-available history and residuals.
- All three baselines are published in fixed order with no winner.
- Plan normalization is immutable and preserves supplied visit order.
- The feasibility oracle is independent of objective weights and reports
  totally ordered exact evidence.
- Canonical JSON uses finite 15-significant-digit numbers; Markdown performs no
  new calculation.
- Atomic publication preserves existing output and deletes only paths owned by
  the current run.

## Primary Risks And Mitigations

| Risk | Required mitigation |
| --- | --- |
| Sensitive or proprietary input | Demonstrate with tracked synthetic fixtures; require owner-approved aggregate preparation and keep local input ignored. |
| Future-information leakage | Enforce global and fold availability timestamps; retain metamorphic leakage evals. |
| Forecast metric mistaken for decision value | Publish every baseline and no winner; evaluate decision loss only in a later common-scenario milestone. |
| Feasible result mistaken for authorization | Label output advisory; require manager verification and approved operational systems. |
| Incomplete hard-constraint model | Keep route-specific release, geography, safety rules, and optimizer claims explicitly deferred. |
| Financial analogy overclaimed | Use operational names; reject literal Black-Scholes prices and imported AMM/trading logic. |
| Runtime evidence committed | Keep input/output in ignored directories and inspect git status before every commit. |

## Approval Checklist

- [ ] Input is the tracked synthetic fixture or owner-approved scrubbed
  aggregate data.
- [ ] No prohibited identifier, record, note, path, or source field is present.
- [ ] Snapshot, target interval, policy version, and model version are correct.
- [ ] Quantile and evaluation limitations are visible.
- [ ] Every infeasible plan remains visible with exact violations.
- [ ] No model winner, plan ranking, recommendation, or dispatch instruction is
  inferred.
- [ ] JSON and Markdown are byte-deterministic and consistent.
- [ ] Focused and repository verification are green.
- [ ] A human owner approves any sharing or operational follow-up.

## Status

Governance-reviewable 002-A evaluator with synthetic golden tests. Production,
live integration, route optimization, and action-taking remain out of scope.
