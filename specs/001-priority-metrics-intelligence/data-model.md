# Priority Metrics Intelligence Data Model

## MetricObservation

One synthetic/public-safe metric value for one monthly period.

| Field | Type | Rules |
| --- | --- | --- |
| `period` | string | Exact `YYYY-MM`; valid calendar month |
| `pillarId` | string | Lowercase slug, 1-48 characters |
| `metricId` | string | Lowercase slug, 1-64 characters; stable definition |
| `metricLabel` | string | Controlled label, 1-80 characters; letters, spaces, digits, `()/%+-`; no 4+ digit run |
| `value` | number | Finite |
| `unit` | enum | `count`, `percent`, `minutes`, `hours`, `index`, `ratio` |
| `targetType` | enum/null | `minimum`, `maximum`, `range`, or null |
| `targetMin` | number/null | Required for `minimum` and `range` |
| `targetMax` | number/null | Required for `maximum` and `range` |
| `warningMargin` | number | Finite and non-negative; defaults to zero |

The `(period, metricId)` key is unique. For a given `metricId`, `pillarId`,
`metricLabel`, `unit`, and target definition remain stable across periods.
`range` requires `targetMin <= targetMax`.

## AnalysisPolicy

Closed, optional JSON configuration.

| Field | Type | Default | Rules |
| --- | --- | --- | --- |
| `projectionWindow` | integer | `6` | 3-24 periods |
| `minimumRecurrences` | integer | `3` | 2-12 events |
| `candidateAssociations` | array | `[]` | Maximum 50 unique definitions |

### CandidateAssociationDefinition

| Field | Type | Rules |
| --- | --- | --- |
| `sourceMetricId` | slug | Must exist in observations |
| `outcomeMetricId` | slug | Must exist and differ from source |
| `lagMonths` | integer | 1-12 |
| `minimumObservations` | integer | 6-60 |

## MetricComparison

| Field | Type | Meaning |
| --- | --- | --- |
| `metricId` | string | Stable metric key |
| `period` | string | Evaluated month |
| `value` | number | Current value |
| `mom` | Change/null | Previous-month comparison or null |
| `yoy` | Change/null | Same-month-prior-year comparison or null |
| `target` | TargetEvaluation | Target distance and status |

`Change` contains `baselinePeriod`, `baselineValue`, `absoluteChange`, and
`percentageChange`. Percentage is null with reason `zero_baseline` or
`insufficient_history` rather than infinity or zero.

`TargetEvaluation.status` is one of `on_target`, `warning`, `at_risk`, or
`no_target`. It contains `distance` in the metric unit; positive distance means
inside the acceptable condition and negative means outside.

For a minimum, `distance = value - targetMin`; for a maximum,
`distance = targetMax - value`; for a range, distance is the smaller inside
distance or the negative distance to the nearest boundary when outside.
`warning` means distance is negative but no smaller than `-warningMargin`.

## RiskLineage

| Field | Type | Meaning |
| --- | --- | --- |
| `metricId` | string | Metric being traced |
| `originPeriod` | string | First target breach in this lineage |
| `originSeverity` | number | Absolute distance beyond boundary |
| `events` | array | Ordered follow-up classifications |
| `outcome` | enum | `active`, `recovered`, `untraceable` |

Event classifications are `persisted`, `worsened`, `improved_at_risk`,
`recovered`, or `gap`.

## PatternResult

`recurrences` contain metric ID, event count, and exact periods.
`candidateAssociations` contain configured pair, lag, observation count,
aligned period pairs, coefficient or null, and limitation code. No field uses
causal language.

## BaselineProjection

| Field | Type | Meaning |
| --- | --- | --- |
| `metricId` | string | Metric projected |
| `targetPeriod` | string | One month after the last observation |
| `method` | literal | `median_recent_drift` |
| `inputPeriods` | string[] | Exact ordered window |
| `projectedValue` | number/null | Baseline result |
| `limitation` | string/null | Missing/gapped history reason |

## AnalysisResult

Canonical output object with keys in this semantic order:

1. `schemaVersion`
2. `analyzerVersion`
3. `inputSummary`
4. `comparisons`
5. `riskLineages`
6. `patterns`
7. `projections`
8. `limitations`
9. `provenance`

`provenance` lists only deterministic method names, the input period range, and
the synthetic/scrubbed declaration. It contains no wall-clock time or host path.

The result's `inputSummary.analysisPeriod` is the dataset-wide latest period.
Canonical serialization sorts comparisons by metric ID then period, other
metric-keyed arrays by metric ID, and rounds floating noise beyond 12 decimal
places. A missing numeric value is `null` paired with a stable reason code.

## State Transitions

```text
raw text
  -> parsed
  -> schema valid
  -> privacy valid
  -> analytics complete
  -> canonical JSON
  -> Markdown rendering
  -> temporary output directory
  -> atomic output-directory rename
```

Any failure before `analytics complete` produces no output file. An infeasible
comparison such as a missing prior period is data evidence represented as a
limitation, not a pipeline failure.
