# Demo Script — Priority Metrics Intelligence

A five-minute safe walkthrough for an FEC supervisor, manager, or governance
reviewer. Use only the tracked synthetic fixtures.

## Setup

From the repository root, run:

```bash
node starter-projects/priority-metrics-intelligence/src/cli.mjs \
  --input starter-projects/priority-metrics-intelligence/fixtures/synthetic-monthly-metrics.csv \
  --policy starter-projects/priority-metrics-intelligence/fixtures/synthetic-policy.json \
  --output-dir starter-projects/priority-metrics-intelligence/output/demo-001 \
  --data-classification synthetic
```

Before screen-sharing, say: “Every value in this demonstration is synthetic.
The tool is offline, advisory, and takes no operational action.” Open
`output/demo-001/analysis.json` and `output/demo-001/brief.md` side by side.

## 1. Start With The Boundary

- Show the successful validation result and `synthetic` classification.
- Open `inputSummary.metricDefinitions` and show that the metric identity,
  numerator/denominator or measure, and monthly time basis are canonical facts.
- Explain that the CSV schema rejects unknown columns and direct identifiers
  before analytics or output writes.
- Explain that even locally scrubbed inputs must be mapped to exact catalog
  aliases; `scrubbed` is a classification, not a bypass.
- Point out that only synthetic golden fixtures are tracked. Local scrubbed
  input and disposable runtime output stay in ignored directories.

## 2. Compare The Latest Month

- Open `comparisons` and identify the dataset-wide latest period.
- Show month-over-month, year-over-year, and supplied target status for one
  metric.
- Explain that missing history stays missing and a zero baseline never becomes
  an invented percentage change.

Suggested line: “The analyzer preserves the evidence it has and labels what it
cannot compute.”

## 3. Follow Risk And Patterns

- Trace an `at_risk` comparison into `riskLineages` and show whether it
  persisted, worsened, improved, recovered, or became untraceable.
- Open `patterns.recurrences` and show the periods behind a repeated event.
- Open `patterns.candidateAssociations` and show the configured metric pair,
  lag, coefficient, observation count, and period pairs.

Say explicitly: “This is a candidate association for investigation. It is not
a cause, driver, or prediction.”

## 4. Review The Baseline Outlook

- Show one projection's method, exact input periods, target period, and value.
- Describe it as a median-recent-drift baseline, not a forecast guarantee.
- If a limitation is present, show that the numeric result is suppressed.

## 5. Prove JSON And Markdown Stay Aligned

- Move to `brief.md` and show the sections for confirmed observations, risks,
  candidate associations, baseline outlook, missing evidence, and review
  questions.
- Explain that Markdown renders canonical JSON facts and does not perform new
  calculations.
- Close with the human gate: important values must be verified against approved
  source systems before the brief is shared or used.

## Publication Safety Note

The run uses a sibling `<output>.lock` to coordinate publishers using this CLI.
External mutation that does not honor the lock is outside the contract. If a
crash leaves a stale lock, stop: an operator must verify no publisher is active
and inspect the destination and temporary paths before removing the lock.

## Do / Don't

- **Do** use the tracked synthetic fixtures for demonstrations.
- **Do** separate facts, candidate hypotheses, baseline outlook, and missing
  evidence.
- **Do** keep a human owner responsible for every interpretation and action.
- **Don't** paste raw reports or identifying data into this tool or an AI
  prompt.
- **Don't** call correlation causal or the baseline guaranteed.
- **Don't** share runtime artifacts as if they were approved operational facts.
