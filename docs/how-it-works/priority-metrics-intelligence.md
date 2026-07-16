# How It Works: Priority Metrics Intelligence

*Part of the [How It Works series](README.md) — real systems, real runs, no mockups.*

## What This Is

A command-line tool that reads a year of monthly priority metrics, checks every
number against its target, traces how each risk developed month by month, and
writes two files: a machine-readable `analysis.json` and a human-readable
`brief.md`. Everything below is a **real run** captured from this repo — you can
reproduce it with one command.

There is deliberately **no AI model in this pipeline**. Every output is exact,
deterministic math — the same input always produces byte-identical output. That
is the point: the numbers layer must be trustworthy before an AI drafts prose on
top of it.

## Who It Helps

Anyone who owns a monthly number and has to answer "is this metric actually in
trouble, and since when?"

## The Pipeline, End to End

```text
 INPUT (2 files)                    PROCESSING (11 small modules)                OUTPUT (2 files)
 ──────────────                     ─────────────────────────────                ────────────────

 synthetic-monthly-metrics.csv      ┌──────────────────────────────┐
 39 rows: period, metric, value,    │ 1. parse.mjs                 │
 unit, target ────────────────────▶ │    CSV + policy JSON in,     │
                                    │    reject malformed rows     │
 synthetic-policy.json              ├──────────────────────────────┤
 metric definitions, risk ────────▶ │ 2. schema.mjs + privacy.mjs  │
 thresholds, review rules           │    validate every field,     │
                                    │    refuse non-synthetic /    │
                                    │    non-scrubbed data         │
                                    ├──────────────────────────────┤
                                    │ 3. compare.mjs               │            analysis.json
                                    │    each metric vs target,    │  ────────▶ canonical, stable-sorted
                                    │    month-over-month and      │            JSON for programs
                                    │    year-over-year deltas     │
                                    ├──────────────────────────────┤
                                    │ 4. risk-lineage.mjs          │            brief.md
                                    │    when did each risk start, │  ────────▶ manager-readable
                                    │    worsen, recover?          │            markdown brief
                                    ├──────────────────────────────┤
                                    │ 5. patterns.mjs              │
                                    │    lagged associations       │
                                    │    between metrics           │
                                    ├──────────────────────────────┤
                                    │ 6. project.mjs               │
                                    │    next-month baseline       │
                                    │    (median recent drift)     │
                                    └──────────────────────────────┘

 No network. No AI call. Same input → byte-identical output, every time.
```

## A Real Run

This exact command works from the repo root today:

```bash
node starter-projects/priority-metrics-intelligence/src/cli.mjs \
  --input starter-projects/priority-metrics-intelligence/fixtures/synthetic-monthly-metrics.csv \
  --policy starter-projects/priority-metrics-intelligence/fixtures/synthetic-policy.json \
  --output-dir /tmp/pmi-out \
  --data-classification synthetic
```

Console output:

```text
OK priority-metrics-analysis: synthetic output written
```

### What went in

The first rows of the input CSV (synthetic demo data — the SYNTH prefix is
enforced by the validator):

```text
period,pillar_id,metric_id,metric_label,value,unit,target_type,target_min,target_max,warning_margin
2025-06,synth_service,synth_on_time_percent,SYNTH On-time percent,97,percent,minimum,95,,1
2025-07,synth_service,synth_on_time_percent,SYNTH On-time percent,96,percent,minimum,95,,1
```

### What came out

From the real `analysis.json` — the tool found that on-time percent slipped
below its 95 target and has been worsening for three straight months:

```json
{
  "metricId": "synth_on_time_percent",
  "period": "2026-06",
  "value": 91,
  "target": { "distance": -4, "status": "at_risk" },
  "mom": { "absoluteChange": -1, "baselinePeriod": "2026-05" },
  "yoy": { "absoluteChange": -6, "baselinePeriod": "2025-06" }
}
```

And the **risk lineage** — not just "it's red," but the whole story of the risk:

```json
{
  "metricId": "synth_on_time_percent",
  "originPeriod": "2026-04",
  "originSeverity": 2,
  "events": [
    { "period": "2026-05", "classification": "worsened", "severity": 3 },
    { "period": "2026-06", "classification": "worsened", "severity": 4 }
  ],
  "outcome": "active"
}
```

It also surfaced a **candidate association** worth a human look: late inbound
count one month correlates strongly (−0.79 over 12 month-pairs) with on-time
percent the next month. The tool explicitly labels this a *candidate* — a lead
for a manager to investigate, never a claimed cause.

## Where the Safety Lives

- `--data-classification` is **required** and only accepts `synthetic` or
  `scrubbed` — the tool refuses to run without an explicit statement about the
  data.
- `privacy.mjs` scans inputs and errors out on anything that looks like real
  operational identifiers.
- Error messages are allowlisted (`errors.mjs`) so a failure can never echo raw
  data back to the console.
- **94 automated tests** pin all of this down: `npm run verify:priority-metrics`
  from the repo root.

## Why It's Built This Way

The deliberate split: **deterministic math produces the facts; an AI (or a
person) writes prose on top of the facts.** If a brief ever says something the
JSON doesn't support, the JSON wins. That review step is the whole governance
model in one file pair.

## Try It Yourself

1. Clone or download the repo.
2. Run the command above (Node 22; no install step, no network needed).
3. Open `/tmp/pmi-out/brief.md` and `analysis.json`.
4. Swap in your own **synthetic or scrubbed** CSV with the same columns.

Full project docs: [starter project page](../../starter-projects/priority-metrics-intelligence/README.md).
