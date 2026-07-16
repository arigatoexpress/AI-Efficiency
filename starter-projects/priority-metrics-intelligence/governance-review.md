# Governance Review — Priority Metrics Intelligence

This review covers the offline monthly analytics prototype. It is advisory and
does not authorize production use, live data integration, communication, or an
operational decision.

## Data Classification And Handling

| Question | Answer |
| --- | --- |
| What data is tracked? | Only reviewed synthetic golden CSV, policy, and expected JSON fixtures under `fixtures/`. |
| What is ignored? | Runtime `output/`, locally prepared `local-input/`, and temporary `*.tmp` paths. |
| Can raw reports be used? | No. Raw reports and customer, employee, package, tracking, route, address, manifest, security, or source-system data are prohibited. |
| Can scrubbed data be used locally? | Only aggregate data that a responsible owner has prepared and approved, kept in the ignored `local-input/` path, and classified with `--data-classification scrubbed`. |
| Does data leave the machine? | No network or model interface is part of the source. The default workflow reads local files and writes local artifacts. |
| What does an error disclose? | A stable safe code and allowlisted field names, not rejected values, raw rows, local contents, or stack traces. |

## Decision Boundaries

The workflow may support a human review of monthly metric changes, supplied
target status, risk continuity, configured associations, and a deterministic
baseline outlook. It must not:

- score employees or recommend personnel action;
- dispatch routes, set staffing, send messages, or call a live operational API;
- invent missing values or thresholds;
- describe a candidate association as causal; or
- present the baseline outlook as a guaranteed forecast or authorized plan.

Every wider communication and operational action remains a human decision made
after verification against approved systems.

## Integrity Controls

- The CSV and optional policy schemas are closed; validation and privacy checks
  complete before analytics or writes.
- CSV interchange fields remain snake_case. Policy JSON uses the implemented
  camelCase keys: `projectionWindow`, `minimumRecurrences`,
  `candidateAssociations`, `sourceMetricId`, `outcomeMetricId`, `lagMonths`,
  and `minimumObservations`.
- JSON is canonical. Markdown renders the same facts without new calculations.
- Missing or non-computable evidence is disclosed with limitations rather than
  replaced with zero or an invented value.
- Candidate associations include configured pairs, lag, observation count,
  coefficient, and exact period pairs.
- Projections identify their deterministic method and exact input periods.

## Publication And Recovery

Successful publication creates a new output directory containing exactly
`analysis.json` and `brief.md`. The CLI uses an exclusive sibling
`<output>.lock` while writing and renaming the pair.

This guarantee assumes coordinated publishers that honor the lock. External,
uncoordinated mutation of the output, lock, or temporary paths is outside the
supported contract. A crash-stale lock intentionally blocks future runs. An
operator must verify that no publisher is active and inspect the target and
temporary paths before removing that lock; automated stale-lock deletion is not
approved.

An existing destination is preserved and causes a safe failure. Operators must
choose a new output directory instead of overwriting evidence.

## Primary Risks And Mitigations

| Risk | Required mitigation |
| --- | --- |
| Sensitive or proprietary input | Use synthetic demonstrations; require owner-approved aggregate scrubbing; keep local input ignored; stop on any uncertain field. |
| Correlation presented as causation | Use “candidate association”; review the exact periods and seek independent evidence. |
| Baseline presented as a commitment | Label it “median recent drift baseline”; preserve input periods and limitations; require human forecast review. |
| Stale or incomplete evidence | Check analysis period, period range, limitations, validation result, and provenance before interpretation. |
| JSON/brief divergence | Treat JSON as canonical and keep the deterministic rendering eval in the verification gate. |
| Concurrent or interrupted publication | Coordinate through `<output>.lock`; fail closed; require operator verification before stale-lock removal. |
| Runtime data committed publicly | Track only synthetic golden fixtures; confirm ignored runtime/local paths remain untracked before review. |

## Approval Checklist

- [ ] Input is synthetic or owner-approved scrubbed aggregate data.
- [ ] No raw report, direct identifier, free-text note, or prohibited source
  field is present.
- [ ] Classification, analysis period, period range, and provenance are correct.
- [ ] Limitations and non-computable results are visible in the review.
- [ ] Candidate associations are described as hypotheses, not causes or
  drivers.
- [ ] Baseline projections are not presented as guarantees or plans.
- [ ] `brief.md` introduces no facts absent from `analysis.json`.
- [ ] Any stale lock removal was preceded by operator verification that no
  publisher was active and the target paths were safe.
- [ ] Focused and repository verification passed with no untracked runtime
  artifacts.
- [ ] A human owner approved any sharing or operational follow-up.

## Status

Governance-reviewable offline prototype with synthetic golden evals. Production
approval, live integration, and use with confidential or person-level data are
out of scope.
