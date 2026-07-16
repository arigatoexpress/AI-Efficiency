# Tasks: Priority Metrics Intelligence

**Input:** `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`,
and `quickstart.md` in this directory.

**Execution rule:** Each phase follows red → green → verify → explicit-path
commit. Never stage the repository root.

## Phase 1: Closed input and privacy foundation

### Task 1: Closed input and privacy foundation

**Goal:** Parse valid CSV/policy input and reject unsafe input before analytics.

**Independent test:** `validation.test.mjs` passes without creating an output
artifact or echoing a rejected value.

**Interfaces produced:** `SafeInputError`, `parseMetricsCsv`,
`parsePolicyJson`, and `assertPublicSafe` exactly as declared in `plan.md`.

- [x] T001 Create the starter directories and ignored outputs in `starter-projects/priority-metrics-intelligence/.gitignore`, with exactly `output/`, `local-input/`, and `*.tmp`.
- [x] T002 Write failing closed-schema, quoted-CSV, duplicate-key, malformed-target, unsafe-field, and non-echo assertions in `starter-projects/priority-metrics-intelligence/test/validation.test.mjs`.
- [x] T003 Run `node --test starter-projects/priority-metrics-intelligence/test/validation.test.mjs` and verify it fails with `ERR_MODULE_NOT_FOUND` for `src/parse.mjs`.
- [x] T004 Implement stable safe error codes in `starter-projects/priority-metrics-intelligence/src/errors.mjs`.
- [x] T005 Implement field enums, slug/date checks, target consistency, policy defaults, and stable-record checks in `starter-projects/priority-metrics-intelligence/src/schema.mjs`.
- [x] T006 Implement RFC-4180-style quoted CSV parsing and closed policy JSON parsing in `starter-projects/priority-metrics-intelligence/src/parse.mjs`.
- [x] T007 Implement forbidden-field and direct-identifier pattern rejection without value echo in `starter-projects/priority-metrics-intelligence/src/privacy.mjs`.
- [x] T008 Run `node --test starter-projects/priority-metrics-intelligence/test/validation.test.mjs` and verify all validation tests pass.
- [x] T009 Commit the input boundary with `git add starter-projects/priority-metrics-intelligence/.gitignore starter-projects/priority-metrics-intelligence/test/validation.test.mjs starter-projects/priority-metrics-intelligence/src/errors.mjs starter-projects/priority-metrics-intelligence/src/schema.mjs starter-projects/priority-metrics-intelligence/src/parse.mjs starter-projects/priority-metrics-intelligence/src/privacy.mjs && git commit -m "feat: add safe priority metrics input boundary"`.

Test construction:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { parseMetricsCsv, parsePolicyJson } from "../src/parse.mjs";
import { assertPublicSafe } from "../src/privacy.mjs";

const valid = [
  "period,pillar_id,metric_id,metric_label,value,unit,target_type,target_min,target_max,warning_margin",
  '2026-06,service,on_time,"On-time percent",96.2,percent,minimum,95,,1',
].join("\n");

test("quoted CSV maps to one canonical observation", () => {
  const [row] = parseMetricsCsv(valid);
  assert.equal(row.metricLabel, "On-time percent");
  assert.equal(row.targetMin, 95);
});

test("privacy rejection never echoes the rejected value", () => {
  const rows = [{ ...parseMetricsCsv(valid)[0], employee_id: "SYNTH-UNSAFE-999" }];
  assert.throws(() => assertPublicSafe(rows), (error) => {
    assert.equal(error.code, "PRIVACY_FORBIDDEN_FIELD");
    assert.doesNotMatch(error.message, /SYNTH-UNSAFE-999/);
    return true;
  });
});

test("policy is closed and applies deterministic defaults", () => {
  assert.deepEqual(parsePolicyJson("{}"), {
    projectionWindow: 6,
    minimumRecurrences: 3,
    candidateAssociations: [],
  });
  assert.throws(() => parsePolicyJson('{"notes":"x"}'), {
    code: "SCHEMA_UNKNOWN_POLICY_FIELD",
  });
});
```

## Phase 2: User Story 1 — Monthly comparisons (P1)

### Task 2: Monthly comparisons

**Goal:** Produce correct month-over-month and year-over-year changes.

**Independent test:** Exact values pass for positive, negative, zero-baseline,
missing-period, and incompatible-definition fixtures.

- [x] T010 [US1] Write failing comparison assertions in `starter-projects/priority-metrics-intelligence/test/compare.test.mjs` for MoM, YoY, zero baseline, and missing history.
- [x] T011 [US1] Run `node --test starter-projects/priority-metrics-intelligence/test/compare.test.mjs` and verify it fails with `ERR_MODULE_NOT_FOUND` for `src/compare.mjs`.
- [x] T012 [US1] Implement period indexing, exact changes, null percentage reasons, and stable ordering in `starter-projects/priority-metrics-intelligence/src/compare.mjs`.
- [x] T013 [US1] Run `node --test starter-projects/priority-metrics-intelligence/test/compare.test.mjs` and verify the User Story 1 assertions pass.
- [x] T014 [US1] Commit comparison math with `git add starter-projects/priority-metrics-intelligence/test/compare.test.mjs starter-projects/priority-metrics-intelligence/src/compare.mjs && git commit -m "feat: compare monthly priority metrics"`.

Required comparison example:

```js
const byPeriod = new Map([
  ["2025-06", 80],
  ["2026-05", 90],
  ["2026-06", 99],
]);
const june = compareMetrics(observationsFrom(byPeriod))[2];
assert.deepEqual(june.mom, {
  baselinePeriod: "2026-05",
  baselineValue: 90,
  absoluteChange: 9,
  percentageChange: 10,
  reason: null,
});
assert.equal(june.yoy.percentageChange, 23.75);
```

## Phase 3: User Story 2 — Target evaluation (P1)

### Task 3: Target evaluation

**Goal:** Evaluate minimum, maximum, range, warning, and no-target conditions.

**Independent test:** A table-driven target matrix returns exact status and
signed boundary distance in the metric unit.

- [x] T015 [US2] Add failing minimum, maximum, range, warning-margin, and no-target cases to `starter-projects/priority-metrics-intelligence/test/compare.test.mjs`.
- [x] T016 [US2] Run the focused comparison test and verify the new cases fail because `target.status` is absent or incorrect.
- [x] T017 [US2] Add `evaluateTarget(observation)` and integrate it into `compareMetrics` in `starter-projects/priority-metrics-intelligence/src/compare.mjs`.
- [x] T018 [US2] Run `node --test starter-projects/priority-metrics-intelligence/test/compare.test.mjs` and verify all comparison and target cases pass.
- [x] T019 [US2] Commit target behavior with `git add starter-projects/priority-metrics-intelligence/test/compare.test.mjs starter-projects/priority-metrics-intelligence/src/compare.mjs && git commit -m "feat: evaluate metric target risk"`.

Target matrix:

```js
const cases = [
  [{ value: 96, targetType: "minimum", targetMin: 95, warningMargin: 1 }, "on_target", 1],
  [{ value: 94.5, targetType: "minimum", targetMin: 95, warningMargin: 1 }, "warning", -0.5],
  [{ value: 93, targetType: "minimum", targetMin: 95, warningMargin: 1 }, "at_risk", -2],
  [{ value: 7, targetType: "maximum", targetMax: 5, warningMargin: 1 }, "at_risk", -2],
  [{ value: 12, targetType: "range", targetMin: 10, targetMax: 20, warningMargin: 2 }, "on_target", 2],
  [{ value: 12, targetType: null, targetMin: null, targetMax: null, warningMargin: 0 }, "no_target", null],
];
for (const [input, status, distance] of cases) {
  assert.deepEqual(evaluateTarget(input), { status, distance });
}
```

## Phase 4: User Story 3 — Risk lineage (P2)

### Task 4: Risk lineage

**Goal:** Trace target breaches through persistence, worsening, recovery, and
gaps without causal language.

**Independent test:** Four synthetic lineages return exact origin, event, and
outcome sequences.

- [ ] T020 [US3] Write failing persistence, worsening, improvement-at-risk, recovery, and gap assertions in `starter-projects/priority-metrics-intelligence/test/lineage-patterns.test.mjs`.
- [ ] T021 [US3] Run the focused lineage test and verify it fails with `ERR_MODULE_NOT_FOUND` for `src/risk-lineage.mjs`.
- [ ] T022 [US3] Implement consecutive-month lineage state transitions in `starter-projects/priority-metrics-intelligence/src/risk-lineage.mjs`.
- [ ] T023 [US3] Run the focused lineage test and verify exact event sequences and zero causal vocabulary failures.
- [ ] T024 [US3] Commit lineage behavior with `git add starter-projects/priority-metrics-intelligence/test/lineage-patterns.test.mjs starter-projects/priority-metrics-intelligence/src/risk-lineage.mjs && git commit -m "feat: trace priority metric risk lineage"`.

State-machine assertion:

```js
assert.deepEqual(traceRiskLineages(comparisons), [{
  metricId: "on_time",
  originPeriod: "2026-01",
  originSeverity: 2,
  events: [
    { period: "2026-02", classification: "worsened", severity: 3 },
    { period: "2026-03", classification: "improved_at_risk", severity: 1 },
    { period: "2026-04", classification: "recovered", severity: 0 },
  ],
  outcome: "recovered",
}]);
```

## Phase 5: User Story 4 — Configured patterns (P2)

### Task 5: Configured patterns

**Goal:** Report recurrence and configured lagged association evidence with
exact observations and limitations.

**Independent test:** Qualifying/non-qualifying recurrence, known positive lag,
zero variance, missing period, and insufficient observations all pass.

- [ ] T025 [US4] Add failing recurrence and configured association cases to `starter-projects/priority-metrics-intelligence/test/lineage-patterns.test.mjs`.
- [ ] T026 [US4] Run the focused test and verify it fails with `ERR_MODULE_NOT_FOUND` for `src/patterns.mjs`.
- [ ] T027 [US4] Implement exact-period recurrence and configured Pearson lag analysis in `starter-projects/priority-metrics-intelligence/src/patterns.mjs`.
- [ ] T028 [US4] Run the focused test and verify candidate outputs use `candidate_association` and contain no `cause`, `driver`, or `prediction` label.
- [ ] T029 [US4] Commit patterns with `git add starter-projects/priority-metrics-intelligence/test/lineage-patterns.test.mjs starter-projects/priority-metrics-intelligence/src/patterns.mjs && git commit -m "feat: surface configured metric patterns"`.

Association contract:

```js
assert.deepEqual(result.candidateAssociations[0], {
  type: "candidate_association",
  sourceMetricId: "late_inbound",
  outcomeMetricId: "on_time",
  lagMonths: 1,
  observationCount: 6,
  coefficient: -1,
  periodPairs: [
    { sourcePeriod: "2026-01", outcomePeriod: "2026-02" },
    { sourcePeriod: "2026-02", outcomePeriod: "2026-03" },
    { sourcePeriod: "2026-03", outcomePeriod: "2026-04" },
    { sourcePeriod: "2026-04", outcomePeriod: "2026-05" },
    { sourcePeriod: "2026-05", outcomePeriod: "2026-06" },
    { sourcePeriod: "2026-06", outcomePeriod: "2026-07" },
  ],
  limitation: null,
});
```

## Phase 6: User Story 5 — Baseline outlook and brief (P2)

### Task 6: Baseline outlook and brief

**Goal:** Produce conservative projections and canonical JSON/Markdown output.

**Independent test:** Median-drift math and exact golden JSON/Markdown facts are
stable over two identical runs.

- [ ] T030 [P] [US5] Write failing median-drift, extreme-change, gap, and insufficient-history cases in `starter-projects/priority-metrics-intelligence/test/projection.test.mjs`.
- [ ] T031 [P] [US5] Create at least 13 months of public-safe synthetic observations and a closed policy in `starter-projects/priority-metrics-intelligence/fixtures/synthetic-monthly-metrics.csv` and `starter-projects/priority-metrics-intelligence/fixtures/synthetic-policy.json`.
- [ ] T032 [US5] Run the projection test and verify it fails with `ERR_MODULE_NOT_FOUND` for `src/project.mjs`.
- [ ] T033 [US5] Implement consecutive-window median recent drift in `starter-projects/priority-metrics-intelligence/src/project.mjs`.
- [ ] T034 [US5] Implement orchestration and canonical result ordering in `starter-projects/priority-metrics-intelligence/src/analyze.mjs`.
- [ ] T035 [US5] Write failing stable JSON, Markdown fact-parity, and byte-determinism assertions in `starter-projects/priority-metrics-intelligence/test/workflow.test.mjs`.
- [ ] T036 [US5] Implement recursive key sorting and evidence-only Markdown sections in `starter-projects/priority-metrics-intelligence/src/render.mjs`.
- [ ] T037 [US5] Generate and review the exact golden result in `starter-projects/priority-metrics-intelligence/fixtures/expected-analysis.json`.
- [ ] T038 [US5] Run projection and workflow tests twice and verify both runs pass with byte-identical JSON.
- [ ] T039 [US5] Commit analysis/rendering with `git add starter-projects/priority-metrics-intelligence/test/projection.test.mjs starter-projects/priority-metrics-intelligence/test/workflow.test.mjs starter-projects/priority-metrics-intelligence/fixtures/synthetic-monthly-metrics.csv starter-projects/priority-metrics-intelligence/fixtures/synthetic-policy.json starter-projects/priority-metrics-intelligence/fixtures/expected-analysis.json starter-projects/priority-metrics-intelligence/src/project.mjs starter-projects/priority-metrics-intelligence/src/analyze.mjs starter-projects/priority-metrics-intelligence/src/render.mjs && git commit -m "feat: render deterministic priority metrics evidence"`.

Projection test:

```js
const values = [10, 11, 12, 100, 101, 102];
const result = projectBaselines(monthly("metric_a", values), {
  projectionWindow: 6,
});
// differences [1, 1, 88, 1, 1] -> median 1
assert.equal(result[0].projectedValue, 103);
assert.equal(result[0].method, "median_recent_drift");
```

## Phase 7: User Story 6 — Safe CLI rejection and atomic workflow (P1)

### Task 7: Safe CLI rejection and atomic workflow

**Goal:** Expose the complete analysis through a safe CLI with stable exit codes
and no partial artifacts.

**Independent test:** Valid input writes both artifacts; malformed and privacy
inputs write neither and never echo rejected values.

- [ ] T040 [US6] Add failing argv, exit-code, privacy non-echo, atomic-directory-publication, existing-output rejection, 10,000-row smoke, and offline-source-scan assertions to `starter-projects/priority-metrics-intelligence/test/workflow.test.mjs`.
- [ ] T041 [US6] Run the workflow test and verify it fails with `ERR_MODULE_NOT_FOUND` for `src/cli.mjs`.
- [ ] T042 [US6] Implement closed arguments, safe stderr, file reads, orchestration, temporary output-directory writes, cleanup, and one final directory rename in `starter-projects/priority-metrics-intelligence/src/cli.mjs`.
- [ ] T043 [US6] Run all priority-metrics tests and verify valid workflow, every exit code, no rejected-value echo, no partial artifacts, and offline scan pass.
- [ ] T044 [US6] Commit the CLI with `git add starter-projects/priority-metrics-intelligence/test/workflow.test.mjs starter-projects/priority-metrics-intelligence/src/cli.mjs && git commit -m "feat: add offline priority metrics CLI"`.

CLI test harness:

```js
const stdout = [];
const stderr = [];
const code = await run(args, {
  readFile: fs.readFile,
  writeFile: fs.writeFile,
  rename: fs.rename,
  rm: fs.rm,
  stdout: (line) => stdout.push(line),
  stderr: (line) => stderr.push(line),
});
assert.equal(code, 0);
assert.deepEqual(stderr, []);
assert.match(stdout.join("\n"), /^OK priority-metrics-analysis:/);
```

## Phase 8: Repository integration and full verification

### Task 8: Repository integration and full verification

**Goal:** Document the synthetic workflow, add the prompt-library entry, and
make the focused eval a root/CI gate.

- [ ] T045 Write audience, safety, input, run, interpretation, demo, and governance guidance in `starter-projects/priority-metrics-intelligence/README.md`, `starter-projects/priority-metrics-intelligence/demo-script.md`, and `starter-projects/priority-metrics-intelligence/governance-review.md`.
- [ ] T046 Add a derived-output-only executive review prompt to `prompts/data-and-reporting.md` that forbids raw reports, invented values, and causal claims.
- [ ] T047 Update every exact prompt-count claim found by `rg -n "51 prompts|51 FedEx-specific|across 10 categories" README.md index.html AGENTS.md assets prompts`, then regenerate `prompts/prompts.json` and `prompts/explorer.html` with `node scripts/build-prompt-index.mjs`.
- [ ] T048 Add `verify:priority-metrics` and include it in `verify` in `package.json` without adding a dependency.
- [ ] T049 Add the focused priority-metrics command to `.github/workflows/ci.yml` and update the CI inventory in `AGENTS.md`.
- [ ] T050 Run `node --test starter-projects/priority-metrics-intelligence/test/*.test.mjs` and verify zero failures.
- [ ] T051 Run `node scripts/check-docs.mjs`, `node scripts/build-prompt-index.mjs --check`, the TLH/SPH eval, ADK eval, and `npm test`; record exact results in the pull-request draft.
- [ ] T052 Run `git diff --check` and a repository scan confirming no forbidden identifiers, network interfaces, unresolved placeholders, or untracked output artifacts.
- [ ] T053 Commit integration with `git add starter-projects/priority-metrics-intelligence/README.md starter-projects/priority-metrics-intelligence/demo-script.md starter-projects/priority-metrics-intelligence/governance-review.md prompts/data-and-reporting.md prompts/prompts.json prompts/explorer.html package.json .github/workflows/ci.yml AGENTS.md README.md index.html && git commit -m "docs: integrate priority metrics intelligence"`; add another exact claim-bearing path only if T047's `rg` output proves it changed.

## Dependencies and parallel opportunities

```text
Phase 1 foundation
  -> US1 comparisons -> US2 targets -> US3 lineage
  -> US4 patterns
  -> US5 projection/rendering
  -> US6 CLI
  -> repository integration
```

- T030 and T031 are parallel because they touch independent test and fixture
  files.
- US4 and the projection portion of US5 can run in parallel after the input
  foundation, but `analyze.mjs` waits for comparisons, lineage, and patterns.
- All implementation tasks must observe their named failing eval before code is
  written; parallelism cannot bypass red-green evidence.

## MVP scope

Phases 1-3 produce a safe, independently useful monthly comparison and target
risk analyzer. The full approved feature includes all eight phases; the MVP is
a checkpoint, not a reason to omit lineage, patterns, projection, or governance.

## Format validation

All 53 task lines use checkbox, sequential ID, optional parallel marker, story
label where applicable, and exact file path or exact verification command.
