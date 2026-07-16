# Tasks: Operations Decision Lab — Milestone 002-A

**Input:** `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`,
and `quickstart.md` in this directory.

**Boundary:** This task set implements only leakage-safe single-series volume
baselines and supplied-plan hard-constraint evaluation. Later 002 milestones
remain explicitly unimplemented.

**Execution rule:** Every behavior follows failing eval → observed failure →
minimal implementation → passing eval → explicit-path commit.

## Phase 1: Closed input, privacy, and time foundation

**Goal:** Accept only bounded synthetic/scrubbed forecast and plan bundles and
reject unsafe content before analytics or writes.

- [x] T001 Create `starter-projects/operations-decision-lab/{src,test,fixtures}` and `.gitignore` containing exactly `output/`, `local-input/`, and `*.tmp`.
- [x] T002 Write failing closed-object, namespace, timestamp, availability, magnitude, count-bound, unknown-field, free-text, direct-identifier, and non-echo cases in `test/validation.test.mjs`.
- [x] T003 Run the validation test and record the expected `ERR_MODULE_NOT_FOUND` for `src/schema.mjs`.
- [x] T004 Implement safe error codes and allowlisted field paths in `src/errors.mjs`.
- [x] T005 Implement shared RFC 3339/date ordering and snapshot eligibility helpers in `src/time.mjs`.
- [x] T006 Implement raw privacy inspection before normalization in `src/privacy.mjs`.
- [x] T007 Implement the closed bounded 002-A input contract in `src/schema.mjs`, including exact `SYNTH-` namespaces and additive units.
- [x] T008 Create `contracts/input.schema.json` as the exact implemented closed schema and add adversarial tuple/reference tests; no open-object placeholder is permitted.
- [x] T009 Run `node --test starter-projects/operations-decision-lab/test/validation.test.mjs` and verify all cases pass without rejected-value echo.
- [x] T010 Commit the input boundary by staging only the files named in T001-T009.

## Phase 2: Leakage-safe forecast baselines

**Goal:** Produce all three named one-step additive-volume baselines without
future information or a false model-winner claim.

- [x] T011 Write failing exact last-value, seven-day seasonal-naive, fixed-policy level/trend, nonnegative-clamp, insufficient-history, and stable-order cases in `test/forecast-backtest.test.mjs`.
- [x] T012 Run the focused test and record the expected missing `src/forecast.mjs` failure.
- [x] T013 Implement all three pure deterministic baselines in `src/forecast.mjs`.
- [x] T014 Run the baseline cases and verify exact point outputs and limitations.
- [x] T015 Write a failing future-data trap: two inputs identical at the snapshot but radically different afterward, including a prior service date with post-snapshot availability, must emit byte-identical evidence.
- [x] T016 Implement snapshot filtering and expanding rolling origins in `src/backtest.mjs`.
- [x] T017 Run the leakage case and verify identical outputs and zero post-snapshot record IDs in evidence.
- [x] T018 Commit the forecast baseline boundary by staging only `forecast.mjs`, `backtest.mjs`, and their test changes.

## Phase 3: Sequential probabilistic scoring

**Goal:** Calibrate quantiles only from residuals available before each fold and
publish transparent out-of-sample metrics.

- [x] T019 Add failing hand-calculated MAE, bias, MASE, pinball, 50%/80% coverage, interval width, quantile order/repair, and insufficient-calibration cases to `test/forecast-backtest.test.mjs`.
- [x] T020 Add a failing sequential-residual trap proving a fold cannot use its own or later residual.
- [x] T021 Implement empirical residual quantiles, sequential calibration, metric formulas, and stable limitation codes in `src/backtest.mjs`.
- [x] T022 Verify P10/P25/P50/P75/P90 order, nonnegative additive forecasts, disclosed repair, and exact hand calculations.
- [x] T023 Verify output reports all baselines and `not_applicable_single_series` coherence without selecting a winner.
- [x] T024 Commit probabilistic forecast evidence with explicit paths.

## Phase 4: Independent hard-constraint oracle

**Goal:** Validate supplied plans without objective weights, route generation,
or silent repair.

- [x] T025 Write a failing exact feasible-plan fixture and expected empty violation list in `test/feasibility.test.mjs`.
- [x] T026 Add failing cases for missing/duplicate assignment, unknown resource, vehicle unavailable, capacity exceeded, early release, backwards time, service-window miss, on-road limit, and negative quantity.
- [x] T027 Run the focused test and record the expected missing `src/feasibility.mjs` failure.
- [x] T028 Implement normalized immutable plan records in `src/plan.mjs`.
- [x] T029 Implement the pure hard-constraint oracle in `src/feasibility.mjs` with no objective or solver import.
- [x] T030 Verify violations contain only closed code/entity/observed/limit/unit fields and sort by code then entity ID.
- [x] T031 Add a metamorphic case proving objective-weight changes cannot make an infeasible plan feasible.
- [x] T032 Commit the feasibility boundary with explicit paths.

## Phase 5: Canonical 002-A analysis and workflow

**Goal:** Publish stable forecast and feasibility evidence while making deferred
002 capabilities impossible to mistake for implemented output.

- [x] T033 Write failing canonical order, 15-significant-digit, non-finite, JSON/Markdown parity, no-deferred-section, and byte-determinism cases in `test/workflow.test.mjs`.
- [x] T034 Implement 002-A orchestration in `src/analyze.mjs`.
- [x] T035 Implement canonical JSON and evidence-only Markdown in `src/render.mjs`.
- [x] T036 Create `contracts/analysis-output.schema.json` as a fully closed exact 002-A schema with adversarial nested mutation tests; no open-object placeholder is permitted.
- [x] T037 Create reviewed synthetic normal, low-volume, surge, unavailable-vehicle, impossible-capacity, and future-data-trap fixtures plus exact `expected-analysis.json`.
- [x] T038 Write failing CLI argv, exit-code, non-echo, existing-output, lock, cleanup, atomic-pair, and offline-source-scan cases.
- [x] T039 Implement closed CLI orchestration and coordinated atomic publication in `src/cli.mjs`.
- [x] T040 Run the complete focused suite twice and verify byte-identical JSON/Markdown.
- [x] T041 Commit workflow/publication with explicit paths.

## Phase 6: Documentation, CI, and consistency

- [x] T042 Write `starter-projects/operations-decision-lab/README.md` with safety, input, methods, limitations, interpretation, and demo guidance.
- [x] T043 Add `verify:decision-lab` to root `package.json` and include the focused suite in `.github/workflows/ci.yml`.
- [x] T044 Add the starter to `starter-projects/README.md`, root `README.md`, and `index.html` without changing claims unrelated to the new tool.
- [x] T045 Run the focused suite, docs check, prompt-index check, TLH/SPH checks, ADK checks, root verification, TypeScript check, and app build; record exact results.
- [x] T046 Run `git diff --check`, offline/identifier scans, generated-artifact scan, and SpecKit consistency analysis.
- [ ] T047 Request an independent read-only final review and add adversarial evals before any fix.
- [ ] T048 Push, open, observe CI, and merge only when every gate is green; do not deploy or connect live data.

## Dependencies

```text
closed input/time/privacy
  -> baseline forecasts -> rolling-origin/sequential scoring
  -> plan normalization -> feasibility oracle
  -> canonical analysis/rendering -> CLI publication
  -> docs/CI/review
```

Forecast work and feasibility work may proceed in parallel only after the input
boundary is green. Workflow waits for both. No task in 002-A may import a
solver, network client, model API, or later-slice placeholder.

## Deferred requirements map

- Spec scenarios 2, 4, 5, 6, and 7 are later slices: reconciliation/scenarios,
  plan objective/ranking, send-time, sensitivities, and productivity.
- Scenario 8 is partially satisfied by 002-A only for forecast/feasibility
  evidence; later evidence sections require their own golden evals.
- Scenarios 1, 3, and 9 are the complete behavioral scope of 002-A.
