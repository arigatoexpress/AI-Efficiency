# Operations Decision Lab CLI Contract

## Invocation

```bash
node starter-projects/operations-decision-lab/src/cli.mjs \
  --input <closed-input.json> \
  --output-dir <new-directory> \
  --data-classification synthetic|scrubbed
```

Flags are closed, required once, and reject positional arguments. The final
directory must not exist.

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Validation, analysis, and atomic publication succeeded |
| `2` | CLI usage error |
| `3` | Closed schema, chronology, or dimensional validation error |
| `4` | Privacy/direct-identifier rejection |
| `5` | Analysis invariant failure |
| `6` | File read/write or coordinated publication failure |

Errors contain only a stable code and allowlisted field names. They never echo
rejected values, raw records, paths, or stack traces.

## Atomic output

The CLI validates and analyzes in memory, acquires an exclusive sibling lock,
writes both artifacts into a new sibling temporary directory, rechecks the
destination, and publishes with one directory rename. Handled failures remove
the owned temporary directory and lock. Existing destinations are untouched.

## Offline and advisory guarantee

Runtime source may not import network clients, spawn external commands, call a
model API, dispatch routes, mutate staffing, score people, or send messages.
The focused workflow eval scans for prohibited interfaces. Output describes
synthetic evidence for human review only.
