# Priority Metrics Intelligence Quickstart

## Audience and boundary

This quickstart is for an FEC supervisor, manager, or reviewer evaluating the
offline prototype. The repository fixture is synthetic. Do not copy a real
report into the repository; a local scrubbed file remains the user's
responsibility and must stay under the ignored `local-input/` directory.
Runtime output under `output/` is also ignored. Only reviewed synthetic golden
fixtures under `fixtures/` are tracked.

## Run the focused evals

```bash
node --test starter-projects/priority-metrics-intelligence/test/*.test.mjs
```

Expected final summary:

```text
# pass 0 or more
# fail 0
```

The exact pass count grows as task slices land; any nonzero failure blocks use.

## Run the synthetic workflow

```bash
node starter-projects/priority-metrics-intelligence/src/cli.mjs \
  --input starter-projects/priority-metrics-intelligence/fixtures/synthetic-monthly-metrics.csv \
  --policy starter-projects/priority-metrics-intelligence/fixtures/synthetic-policy.json \
  --output-dir starter-projects/priority-metrics-intelligence/output/run-001 \
  --data-classification synthetic
```

Expected result:

```text
OK priority-metrics-analysis: synthetic output written
```

The output directory is disposable and ignored by Git.

The CLI coordinates publishers with a sibling `<output>.lock`. External,
uncoordinated mutation of the output, lock, or temporary paths is outside the
supported contract. If a crash leaves a stale lock, an operator must first
verify that no publisher is active and inspect the destination and temporary
paths before removing the lock.

## Confirm deterministic output

Run the workflow a second time with `--output-dir .../output/run-002`, then
compare both JSON files to the tracked golden artifact:

```bash
cmp starter-projects/priority-metrics-intelligence/output/run-001/analysis.json \
  starter-projects/priority-metrics-intelligence/fixtures/expected-analysis.json
cmp starter-projects/priority-metrics-intelligence/output/run-002/analysis.json \
  starter-projects/priority-metrics-intelligence/fixtures/expected-analysis.json
```

Expected: exit code `0` and no output.

## Confirm privacy rejection

The validation eval supplies an unknown identifier field and confirms:

- exit code `4`;
- no final or temporary output directory;
- the rejected value is absent from stdout and stderr.

Do not perform this check with a real identifier. The eval's unsafe-looking
value is synthetic and intentionally non-operational.

## Run repository verification

```bash
node scripts/check-docs.mjs
node scripts/build-prompt-index.mjs --check
node starter-projects/tlh-sph-efficiency-explorer/test/run-checks.mjs
python3 starter-projects/adk-shift-brief-agent/test/run_checks.py
npm test
```

All commands must pass before the feature is proposed for merge.
