# Forecast Foundation-Model Spike

> **Part of the [FedEx AI Efficiency Hub](../../README.md).** Synthetic data only · research spike · human review required.

The experiment named in [docs/forecasting-model-license-review.md](../../docs/forecasting-model-license-review.md), executed: does a time-series **foundation model** (Amazon Chronos-Bolt, zero-shot) beat the **simple ensemble the Dock Efficiency Signal Lab already uses**, on a walk-forward backtest over synthetic weekly fixtures?

**Result: no — the simple ensemble won.** That is the gate working as designed.

## Measured Results (2026-06-10, seed 42)

Walk-forward (rolling-origin) MASE over 8 synthetic facilities × 8 origins, horizons 1–4 weeks. Lower is better; below 1.0 beats last-value naive.

| Model | Overall | h=1 | h=2 | h=3 | h=4 |
| --- | --- | --- | --- | --- | --- |
| Naive (last value) | 1.151 | 1.151 | 1.096 | 1.219 | 1.137 |
| **Signal Lab ensemble** (faithful port: grid-tuned SES + tuned damped Holt + OLS trend, momentum-gated) | **0.845** | **0.848** | **0.866** | **0.872** | 0.791 |
| Chronos-Bolt-small (zero-shot) | 0.895 | 0.928 | 0.876 | 0.990 | **0.787** |

Cost side: Chronos-Bolt-small loads in 0.6 s and produces a 4-week forecast in **~50 ms on a 4-vCPU CPU** — performance is not the obstacle.

> The baseline is a line-for-line Python port of the Signal Lab's actual
> `ensembleForecast` (grid-fit SES α, grid-fit Holt α/β with φ=0.9, OLS trend,
> and the EMA(3)/EMA(8)-vs-ROC(4) momentum gate that down-weights the trend
> models to 0.4 when momentum disagrees) — not a simplified stand-in. An
> earlier draft used fixed parameters and an equal mean and scored 0.876;
> the real ensemble is stronger still.

Environment: Python 3.11 · chronos-forecasting (torch 2.3.1, CPU) · `amazon/chronos-bolt-small` (Apache-2.0).

## What This Means

- **Keep the Signal Lab's ensemble.** On ~25-point weekly operations series, the tuned, explainable three-model blend won overall and at horizons 1–3 against a 48M-parameter foundation model — and it's auditable by a reviewer in an afternoon.
- **The 4-week horizon is effectively a tie, with Chronos narrowly lower** (0.787 vs 0.791 — well within noise at this sample size). If a future need emerges for 4+ week outlooks, that's the most promising re-test for Chronos.
- **The gate worked.** ROADMAP Phase 5 requires a foundation model to *earn* a pilot by beating the baseline by a margin that survives the caveats. It didn't. No pilot.

## Honest Caveats

- The synthetic fixtures (level + mild trend + noise + occasional shocks) structurally resemble the ensemble's assumptions — friendly terrain for the baseline. A real (locally-held) series could shift the picture; rerun before concluding anything about real data.
- `chronos-bolt-small` is the smallest variant; larger ones may do better at higher compute cost.
- 8 facilities × 8 origins is a small sample; differences of ~0.02 MASE are within noise.

## How To Run It

```bash
pip install chronos-forecasting   # pulls torch — not in CI on purpose
python3 benchmark.py
```

The model weights download from Hugging Face on first run and cache locally; the series are generated in-process from a fixed seed and never leave the machine.

## Do Not Use It For

- Declaring foundation models "better" or "worse" in general — this is one fixture, one small model, one protocol.
- Forecasting real volumes. Synthetic only in this repo, per the standing rules.

## Review And Approval

See [`governance-review.md`](governance-review.md) and the program [project review checklist](../../docs/governance/project-review-checklist.md).

## Status

Spike complete. Phase 5 recommendation: simple baselines remain the production path; re-benchmark Chronos (bolt-base, and on a real local series) only if a 4+ week horizon need emerges.

---
### Part of the AI Efficiency platform
- **Hub / all tools:** [repo README](../../README.md) · [interactive hub page](https://raw.githack.com/arigatoexpress/AI-Efficiency/main/index.html)
- **License gate this executes:** [docs/forecasting-model-license-review.md](../../docs/forecasting-model-license-review.md)
- **The incumbent baseline:** [Dock Efficiency Signal Lab](../dock-efficiency-signal-lab/README.md)
