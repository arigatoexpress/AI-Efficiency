# Dock Efficiency Signal Lab

> **Part of the [FedEx AI Efficiency Hub](../../index.html).** Public + synthetic data only · human review required.

A single-file, fully **offline** dashboard that applies trading-style **technical-analysis (TA)** indicators, rigorous **Statistical Process Control (SPC)**, and lightweight **forecasting** to weekly operations KPIs — built for the dock-efficiency / TLH-%-of-goal reporting workflow.

> **Thesis:** Traders and quality engineers independently invented the same toolkit — moving averages, bands, momentum, crossovers. On ~25 weekly operations points, the **SPC** version of each tool carries a quantified false-alarm rate and is the one to *alert* on; the **TA** version is the same shape with friendlier labels — great for communicating to managers, but not for driving automated decisions. This tool ships both, clearly separated.

## Why it exists

Each week the team rebuilds rankings and explanation-of-change narratives by hand. This dashboard turns the same weekly productivity series into:

- **Trend & Signals** — SMA(4) month + SMA(13) quarter baselines, a Bollinger(8, 2σ) envelope, and 4/13 crossover ("golden/death cross" analog), with plain-language callouts.
- **Process Control (SPC)** — I-MR individuals chart with 3σ limits (σ̂ = MR̄/1.128), Nelson rules 1/3/5/6 (outlier, trend, emerging shift), EWMA(λ=0.2) drift detection, and tabular CUSUM (k=0.5σ, h=5σ).
- **Momentum (TA)** — ROC (legible MoM/QoQ change) plus MACD and RSI labeled *indicative only*.
- **Forecast** — ensemble of SES + damped-Holt(φ=0.9) + linear trend, momentum-gated, with an 80% prediction band that widens with horizon, and a walk-forward (rolling-origin) MASE backtest that auto-selects the best model with a simplicity prior.
- **Rankings & $ Impact** — top/bottom performers across all loaded series, each with its trend regime, process state, and the dollar value of its gap to goal. Uses the recap's CFO-legible translation (`$/point ÷ 52 weeks`): set the goal to the engineered goal (e.g. 68.8) and `$/point/year` to $50M to reproduce the weekly "≈ −$5.2M vs plan" figure. Each weak facility is heuristically mapped to a Scorecard section (Planning / Scheduling / Execution).
- **Region / District filter** — when the data carries `region`/`district` tags, a scope dropdown lets you focus everything (facility list, rankings, recap) on the whole focus area or drill into one region/district. The demo mirrors the **focus area** — the six districts **Pacific Northwest, Mountain, Western Rockies, Columbia River, Northern California** (NORTHWEST) and **Red River** (MID-AMERICA) — defaulting to "All" with per-district drill-down. The goal line auto-calibrates to the data's scale (≈100 for "% of goal", ≈68.8 for raw efficiency).

## How to run

Just open `index.html` in any browser. No install, no server, no internet. It boots with synthetic demo data.

- **Verify it's offline:** open your browser's Network tab — there are zero requests.
- **Analyze real data:** click **Load CSV…** and pick a local file (see format below). The file is read in-browser and never leaves your machine.

## CSV input format

Two formats are auto-detected:

**Long (recommended):**
```
facility,week,value
0275-NCRS,11/30,82.4
0275-NCRS,12/07,79.1
...
```
Optionally add `region` and `district` columns to enable the scope filter (values below are illustrative/synthetic):
```
facility,region,district,week,value
SYNTH-01,WEST,Summit,05/16/26,96.4
SYNTH-01,WEST,Summit,05/23/26,98.1
```

**Wide** (first column = facility, remaining columns = week labels):
```
facility,11/30,12/07,12/14,...
0275-NCRS,82.4,79.1,80.3,...
```

To get this from the weekly workbooks: copy the per-facility weekly productivity rows (e.g. the *LP Trends* sheet of the NCPC file, or any "Actual Productivity we …" column block) into a CSV. **Use anonymized/abstracted codes if the file will leave a controlled environment** — see `governance-review.md`.

### Optional: Scorecard status (makes the "Likely focus" real)

On the **Rankings** tab, click **Load Scorecard status…** with a second CSV of your Scorecard colors. The "Likely focus" column then reflects your **actual RED sections** instead of a heuristic. Columns map to the real Scorecard layout (LOCATION · Planning · Scheduling · Execution):
```
facility,planning,scheduling,execution
0275-NCRS,RED,GREEN,GREEN
0622-RORS,GREEN,RED,RED
```

## For non-technical users

The app is built for ops supervisors with no stats background:
- A **first-run welcome** (and a **?** button to reopen it) explains the whole thing in three sentences.
- A **quick-start strip** and a plain-language **"What you're looking at / What to do"** callout on every tab.
- Hover any underlined term for a tooltip; a full **plain-language glossary** lives on the Method tab.
- The **Draft recap** button (Rankings tab) writes a shareable plain-text top/bottom summary locally — no AI, no network.
- See `district-subteam-guide.md` for a printable one-pager.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The entire app (HTML + CSS + vanilla JS, no dependencies) |
| `README.md` | This file |
| `governance-review.md` | Data, risk, and approval considerations |
| `demo-script.md` | Safe walkthrough for presenting to a team |
| `district-subteam-guide.md` | Printable one-pager for each district subteam |
| `sample-data.csv` | Synthetic example of the productivity input format |
| `sample-scorecard.csv` | Synthetic example of the Scorecard-status format |

## What this is **not**

It is not a trading system, and ops KPIs are not tradeable prices — there is no "momentum trade," and a facility at "RSI 75" is not "due for a pullback." Every flagged signal is a prompt to investigate (pair it with the relevant lanefull/rehandle playbook), not a conclusion. See the in-app **Method & Caveats** tab for the full honest treatment of small-sample limits, autocorrelation, and multiple comparisons.

---
### Part of the AI Efficiency platform
- **Hub / all tools:** [../../index.html](../../index.html)
- **Related:** [Station Ops Intelligence](../fedex-logistics-intelligence-system/README.md) (the pre-shift, external-risk half) · [Prompts that narrate KPIs: Data & reporting](../../prompts/data-and-reporting.md)
- **Governance:** [Project review checklist](../../docs/governance/project-review-checklist.md)
