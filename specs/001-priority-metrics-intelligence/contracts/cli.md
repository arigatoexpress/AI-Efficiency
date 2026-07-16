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

Exit `4` also covers a CSV definition that does not exactly match the
source-controlled `synth_` metric catalog and an unsigned 12-22 digit integer
token that is tracking-shaped. These checks occur before numeric conversion and
before analytics. Exit `3` covers numeric tokens outside the safe domain (more
than 15 significant digits, nonzero absolute magnitude below `1e-12` or above
`1e12`, or non-finite), a recurrence threshold below 3, an infeasible
`minimumObservations + lagMonths > 60`, and configured metric references absent
from the observations.

`--data-classification scrubbed` does not widen the input contract. A local
preparer must map approved aggregate source columns to exact catalog aliases
before invocation; arbitrary names, facilities, labels, and metric IDs remain
rejected.

The output directory contains exactly `analysis.json` and `brief.md`.

## Coordinated atomic output

The CLI requires the final output directory not to exist. It renders both
artifacts in memory, acquires an exclusive sibling `<name>.lock`, creates a
sibling `<name>.tmp` directory, writes `analysis.json` and `brief.md`, checks
the destination again, then renames the directory into place. Any handled
failure removes the publisher's temporary directory and lock and exits `6`; no
partial pair is published.

The publication guarantee assumes coordinated publishers that honor the lock.
External, uncoordinated mutation of the destination, lock, or temporary paths
is outside the contract. A process crash can leave a stale lock that blocks
later runs. An operator must verify no publisher is active and inspect the
destination and temporary paths before removing a crash-stale lock.

## Offline contract

Source files must not import HTTP clients or call `fetch`, `XMLHttpRequest`,
`WebSocket`, `sendBeacon`, `child_process`, or external model/runtime commands.
The focused workflow eval scans for these interfaces.
