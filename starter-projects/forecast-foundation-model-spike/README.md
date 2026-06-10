# Forecast Foundation-Model Spike

> **Part of the [FedEx AI Efficiency Hub](../../README.md).** Synthetic data only · research spike · human review required.

The experiment named in [docs/forecasting-model-license-review.md](../../docs/forecasting-model-license-review.md), executed: does a time-series **foundation model** (Amazon Chronos-Bolt, zero-shot) beat the **simple ensemble the Dock Efficiency Signal Lab already uses**, on a walk-forward backtest over synthetic weekly fixtures?

**Result: no — the simple ensemble won.** That is the gate working as designed.

## Measured Results (2026-06-10, seed 42)

Walk-forward (rolling-origin) MASE over 8 synthetic facilities × 8 origins, horizons 1–4 weeks. Lower is better; below 1.0 beats last-value naive.

| Model | Overall | h=1 | h=2 | h=3 | h=4 |
| --- | --- | --- | --- | --- | --- |
| Naive (last value) | 1.151 | 1.151 | 1.096 | 1.219 | 1.137 |
| **Signal Lab-style ensemble** (SES + damped Holt + linear trend) | **0.876** | **0.865** | 0.886 | **0.904** | 0.847 |
| Chronos-Bolt-small (zero-shot) | 0.895 | 0.928 | **0.876** | 0.990 | **0.787** |

Cost side: Chronos-Bolt-small loads in 0.6 s and produces a 4-week forecast in **12.9 ms on a 4-vCPU CPU** — performance is not the obstacle.

Environment: Python 3.11 · chronos-forecasting (torch 2.3.1, CPU) · `amazon/chronos-bolt-small` (Apache-2.0).

## What This Means

- **Keep the Signal Lab's ensemble.** On ~25-point weekly operations series, three simple, explainable models beat a 48M-parameter foundation model overall — and they're auditable by a reviewer in an afternoon.
- **The one real signal for Chronos: longer horizons.** It clearly won at h=4 (0.787 vs 0.847). If a future need emerges for 4+ week outlooks, that's the re-test to run — not a reason to switch today.
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
