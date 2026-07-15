# Priority Metrics Intelligence CLI Contract

## Invocation

```bash
node starter-projects/priority-metrics-intelligence/src/cli.mjs \
  --input <metrics.csv> \
  [--policy <policy.json>] \
  --output-dir <new-directory> \
  --data-classification synthetic|scrubbed
```

All four named output/input flags and the classification flag are closed;
unknown flags and positional arguments are rejected.

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Validation, analysis, and both atomic writes succeeded |
| `2` | CLI usage error or missing required flag |
| `3` | Input schema error |
| `4` | Privacy rejection |
| `5` | Analysis invariant error |
| `6` | File read/write error |

Errors go to stderr as `ERROR <safe-code>: <safe-field-list>`. Error output may
name allowlisted field names and stable error codes but never rejected values,
raw rows, local file contents, or stack traces.

The output directory contains exactly `analysis.json` and `brief.md`.

## Atomic output

The CLI requires the final output directory not to exist. It renders both
artifacts in memory, creates a sibling `<name>.tmp` directory, writes
`analysis.json` and `brief.md`, then renames the directory into place. Any
failure removes the temporary directory and exits `6`; no final directory or
partial pair is published.

## Offline contract

Source files must not import HTTP clients or call `fetch`, `XMLHttpRequest`,
`WebSocket`, `sendBeacon`, `child_process`, or external model/runtime commands.
The focused workflow eval scans for these interfaces.
