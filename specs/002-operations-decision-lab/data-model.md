# Operations Decision Lab Data Model

All records are closed, synthetic/public-safe, and use integers for minutes and
additive quantities where practical. Decimal rates never enter as source facts;
they are derived from additive components.

## ProvenanceEnvelope

| Field | Type | Rule |
| --- | --- | --- |
| `snapshotTime` | RFC 3339 UTC string | Information availability cutoff |
| `targetStart` | RFC 3339 UTC string | Inclusive evaluation start |
| `targetEnd` | RFC 3339 UTC string | Exclusive evaluation end; after start |
| `serviceDate` | `YYYY-MM-DD` | Declared synthetic service date |
| `policyVersion` | safe slug | Immutable policy identifier |
| `modelVersion` | safe slug | Deterministic method identifier |
| `planVersion` | safe slug/null | Required for plan evidence |

Every observation has `availableAt <= snapshotTime` for the forecast or plan
evaluation that consumes it.

## Observation

| Field | Type | Rule |
| --- | --- | --- |
| `observationId` | `SYNTH-OBS-*` | Unique stable synthetic ID |
| `entityId` | declared `SYNTH-*` | Network/station/area/time-bucket member |
| `parentEntityId` | declared `SYNTH-*`/null | Exact hierarchy parent |
| `bucketStart` | RFC 3339 UTC string | 15-minute aligned |
| `availableAt` | RFC 3339 UTC string | No later than consuming snapshot |
| `measure` | enum | Additive quantity only |
| `value` | nonnegative safe integer | Explicit measure unit |
| `unit` | enum | `stops`, `packages`, `cube_units`, `minutes` |

Allowed observation measures are `stops_planned`, `stops_completed`,
`packages_forecast`, `packages_tendered`, `packages_delivered`, `cube_units`,
`paid_minutes`, `on_road_minutes`, `stem_minutes`, `travel_minutes`,
`service_minutes`, `wait_minutes`, `dwell_minutes`, and `overtime_minutes`.

## HierarchyNode

| Field | Type | Rule |
| --- | --- | --- |
| `entityId` | synthetic ID | Unique |
| `level` | enum | `network`, `station`, `area`, `time_bucket` |
| `parentEntityId` | synthetic ID/null | Network alone has null |

The graph is acyclic, every non-root has exactly one parent, and all referenced
entities exist. Reconciliation is restricted to identical additive measures,
units, and target intervals.

## ForecastPoint and ForecastEvaluation

`ForecastPoint` contains target entity/measure/bucket, model name, fold
snapshot, point/P10/P25/P50/P75/P90 values, quantile-repair flag, and training
period range. Quantiles are nonnegative and ordered.

`ForecastEvaluation` contains fold count, observation count, MAE, MASE or a
reason code, signed bias, pinball loss by quantile, 50%/80% interval coverage,
mean interval width, and hierarchy-coherence error. It never reports training
fit as out-of-sample evidence.

## DemandGroup

| Field | Type | Rule |
| --- | --- | --- |
| `demandGroupId` | `SYNTH-DEMAND-*` | Unique |
| `areaId` | declared synthetic area | Existing hierarchy member |
| `stops` | nonnegative integer | Additive |
| `packages` | nonnegative integer | Additive |
| `cubeUnits` | nonnegative integer | Additive |
| `serviceMinutes` | nonnegative integer | Additive |
| `windowStart`/`windowEnd` | RFC 3339 UTC | Ordered service window |
| `required` | boolean | Exactly once when true |

## Vehicle and LaborResource

`Vehicle` contains synthetic ID, capacity units, available start/end, and
maximum route minutes. `LaborResource` contains a synthetic pool ID, available
paid minutes, earliest start, latest end, and maximum overtime minutes. No
person-level record exists.

## CandidatePlan

| Field | Type | Rule |
| --- | --- | --- |
| `planId` | `SYNTH-PLAN-*` | Unique immutable candidate |
| `planVersion` | safe slug | Required provenance |
| `snapshotTime` | RFC 3339 UTC | Comparable plans share it |
| `baselinePlanId` | synthetic ID/null | Declared comparison baseline |
| `routes` | Route[] | At least one |

Each route supplies vehicle/resource references, release time, ordered visits,
planned arrival/departure, travel/stem/wait minutes, and a reason code for
changes from baseline. The evaluator does not insert, delete, reorder, or
otherwise repair visits.

## FeasibilityEvidence

```text
status: feasible | infeasible
violations[]:
  constraintCode
  entityId
  observed
  limit
  unit
```

Constraint codes are closed: `duplicate_assignment`, `missing_assignment`,
`unknown_reference`, `vehicle_unavailable`, `labor_unavailable`, `capacity_exceeded`,
`release_before_allowed`, `sequence_invalid`, `backwards_time`, `service_window_miss`,
`route_duration_exceeded`, `labor_minutes_exceeded`, and
`negative_quantity`. Violations sort by code then entity ID.

## Scenario

A scenario has a stable `SYNTH-SCENARIO-*` ID, seed, residual-block IDs, and
coherent realized additive quantities for every evaluated entity/bucket.
Dependencies are preserved through common residual blocks; independent draws
are not the default.

## ScenarioCost and PlanEvaluation

`ScenarioCost` stores raw service misses, left-behind packages, overtime,
travel, wait, and plan-change counts plus their weighted contributions and
total. `PlanEvaluation` stores feasibility, scenario costs, expected loss,
configured CVaR, service level, aggregate-first productivity rates, regret,
and limitations.

## SendTimeExperiment

Contains original snapshot, candidate lock times, fixed-information feasible
sets, updated snapshots, plan scores, `flexibilityDecay`, `netWaitValue`, regret
curve, and first preferred-plan breakpoint. The two value series are never
merged.

## SensitivityEvidence

Contains operational name, baseline value, units, bump size, evaluated corner
values, centered/second/cross difference where defined, scenario seed, policy,
feasibility statuses, preferred-plan changes, exact breakpoint, and limitation.

## ProductivityEvidence

Stores summed additive components followed by derived
`stopsPerOnRoadHour`, `packagesPerPaidHour`, and `packagesPerStop`. Zero
denominators yield `null` plus `not_computable`. Change attribution contains
named component effects and an interaction/remainder that reconciles exactly
within declared tolerance.

## AnalysisResult

Canonical result order is provenance, validation, forecasts, reconciliation,
feasibility, plan comparisons, send-time, sensitivities, productivity,
limitations, and methods. Arrays use stable ID/time ordering. JSON is the
source of truth; Markdown renders only canonical facts.
