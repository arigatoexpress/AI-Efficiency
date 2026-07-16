# Operations Decision Lab Quickstart

## Safety boundary

Use only the tracked synthetic fixtures or a locally prepared scrubbed JSON
file that already matches the closed contract. Never supply raw reports,
tracking/package details, names, addresses, employee/customer records, precise
coordinates, route manifests, security details, credentials, or free-text
notes. `--data-classification scrubbed` does not widen the schema.

## Planned invocation

```bash
node starter-projects/operations-decision-lab/src/cli.mjs \
  --input starter-projects/operations-decision-lab/fixtures/synthetic-input.json \
  --output-dir starter-projects/operations-decision-lab/output/demo \
  --data-classification synthetic
```

The output directory must not exist. A successful run atomically publishes
exactly `analysis.json` and `brief.md`. The default workflow is offline and
does not generate or dispatch a route.

## First executable slice

The forecast/feasibility kernel will:

1. reject unknown or unsafe fields before analytics;
2. enforce information availability at every rolling-origin fold;
3. score last-value, seasonal-naive, and level/trend baselines;
4. publish point/quantile forecast evidence and limitations;
5. validate supplied candidate plans against assignments, capacity,
   availability, release, time-window, duration, and labor constraints; and
6. suppress plan ranking because scenario/objective evaluation belongs to the
   next completed slice.

## Interpretation

- Forecast quantiles describe evaluated synthetic uncertainty, not a service
  guarantee.
- A feasible result means the supplied synthetic plan passed declared checks;
  it is not authorization to dispatch.
- An infeasible result remains evidence and is never repaired silently.
- A lower forecast error alone does not prove a better operating decision.
- Greek-like labels are explanatory only; canonical fields use operational
  sensitivity and send-time names.

## Verification commands

```bash
node --test starter-projects/operations-decision-lab/test/*.test.mjs
node scripts/check-docs.mjs
node scripts/build-prompt-index.mjs --check
npm run verify
git diff --check
```

Run SpecKit consistency analysis before implementation and again before a pull
request. Record exact results; do not infer unrun evidence.
