# TLH / SPH Efficiency Explorer

> **Part of the [FedEx AI Efficiency Hub](../../index.html).** Public + synthetic data only · human review required.

A single-file, fully **offline** companion to the [Dock Efficiency Signal Lab](../dock-efficiency-signal-lab/README.md). The Signal Lab tracks one composite efficiency number over time and tells you whether a move is statistically real. This tool answers the question that composite hides: **which lever moved — throughput (SPH) or labor hours (TLH)?**

## What This Is

Efficiency rides on **SPH** (Shipments/Stops Per Hour = volume ÷ **TLH**, Total Labor Hours) against an engineered goal. That means a facility can "improve" two opposite ways:

- **Throughput up, hours held** — the sustainable kind. Go see what changed and replicate it.
- **Hours cut, volume flat** — SPH rises mechanically. It can be real schedule discipline, or it can be under-staffing borrowing against service and safety. **Verify service and volume held before calling it a win.**

The headline number looks identical in both cases. This tool decomposes each facility's week-over-week SPH change into an exact **SPH effect** and **TLH effect** (they sum to the total change with zero residual — see Method & Caveats in the app), tags the primary driver, and translates effects into a planning-level weekly dollar figure.

## Who It Helps

- FEC supervisors and managers explaining *why* efficiency moved, not just that it moved.
- District/region reviewers deciding which gains to replicate and which to verify.
- The weekly recap workflow — the built-in recap drafts the explanation text locally.

## When To Use It

- The weekly TLH/SPH numbers are out and you need to brief the change.
- A facility "hit goal" and you want to know if it earned it with throughput or with hours.
- Before escalating a decline — to see whether it is a demand story, an hours story, or a throughput story.

## Do Not Use It For

- Individual employee hours or performance — **aggregate facility/shift data only.**
- Declaring an hours-driven gain a productivity win without verifying service, safety, and volume.
- Trend conclusions from a single two-week split — pair it with the Signal Lab's SPC charts.
- Accounting. The dollar figure is a planning translation ($/SPH-point/year ÷ 52), not realized savings.

## Safe Data Rules

- The app makes **zero network calls** — enforced by a Content-Security-Policy (`connect-src 'none'`) baked into the file. Verify in your browser's Network tab.
- Loaded CSVs are read in-browser and live in page memory only; closing the tab discards them.
- Only **synthetic** demo data ships in the repo. Do not commit real facility numbers.
- No LLM, no API — the math is deterministic vanilla JavaScript.

## How To Start

Open [`app/index.html`](app/index.html) in any browser. No install, no server, no internet. It boots on seeded synthetic demo data (clearly badged) with four scripted stories: an SPH-driven gain, a TLH-driven gain, a demand-driven decline, and an hours-creep loss.

To analyze real numbers, click **Load CSV…** and pick a local file:

```
facility,week,tlh,sph
0275-NCRS,05/30/26,3470,12.05
0275-NCRS,06/06/26,3492,13.32
...
```

Optional `region` and `district` columns enable the scope filter. Columns are auto-detected by header keywords; files without a TLH/hours and an SPH column are rejected with a clear message. The app compares each facility's two most recent weeks. See [`app/sample-data.csv`](app/sample-data.csv) for a synthetic example.

## The Math (Summary)

`Volume = TLH × SPH`. The week-over-week change in SPH splits as:

```
SPH effect (throughput, hours held) = (vol1 − vol0) / tlh0
TLH effect (hours, at current volume) = vol1/tlh1 − vol1/tlh0
```

These sum **exactly** to `sph1 − sph0` (a Laspeyres-style split). The app checks this identity to `1e-9` for every facility on every render, and runs three validation cases (pure-SPH, pure-TLH, proportional) at startup. Driver tag: a lever owning ≥65% of the combined effect size is the driver; otherwise "Mixed."

## Files

| File | Purpose |
|------|---------|
| `app/index.html` | The entire app (HTML + CSS + vanilla JS, no dependencies) |
| `app/sample-data.csv` | Synthetic example of the input format |
| `test/run-checks.mjs` | Verification harness (run by CI): math identity, validation cases, CSV intake, offline guarantees |
| `README.md` | This file |
| `demo-script.md` | Safe walkthrough for presenting to a team |
| `governance-review.md` | Data, risk, and approval considerations |

## Review And Approval

See [`governance-review.md`](governance-review.md) and the program [project review checklist](../../docs/governance/project-review-checklist.md). The known sharp edge: **misreading an hours-driven gain as a productivity win** — the recap language and human reviewers must confirm service and volume held.

## Status

Offline prototype on synthetic data. Validated math (exact decomposition + startup self-test); needs validation against one real, locally-loaded weekly TLH/SPH export during a pilot before its outputs inform a real review.

---
### Part of the AI Efficiency platform
- **Hub / all tools:** [../../index.html](../../index.html)
- **Related:** [Dock Efficiency Signal Lab](../dock-efficiency-signal-lab/README.md) (is the move statistically real?) · [Prompts that narrate KPIs: Data & reporting](../../prompts/data-and-reporting.md)
- **Governance:** [Project review checklist](../../docs/governance/project-review-checklist.md)
