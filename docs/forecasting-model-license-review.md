# Forecasting Foundation Models — License And Reproducibility Review

Last reviewed: 2026-06-09

## What This Is

ROADMAP Phase 5 (Predictive Load Approximation) allows time-series foundation
models "such as TimesFM or Chronos only after license and reproducibility
review." This note is that review: the license half is **complete and clear**;
the reproducibility half is a checklist that any pilot must satisfy before a
foundation model's forecast is shown to a manager.

This is a research gate, not a green light. Phase 5's order stands: simple
seasonal baselines first (already live in the Dock Efficiency Signal Lab's
forecast tab), and any foundation model must **beat that baseline on a
walk-forward backtest over synthetic fixtures** before it earns a pilot.

## License Findings (verified 2026-06-09)

All three candidate model families are **Apache-2.0** — verified directly from
the Hugging Face model-card metadata, not from blog summaries:

| Model | Params | License | Last updated | Notes |
| --- | --- | --- | --- | --- |
| [TimesFM 2.5](https://huggingface.co/google/timesfm-2.5-200m-pytorch) (`google/timesfm-2.5-200m-pytorch`) | 231M | Apache-2.0 | 2025-10-02 | Google Research; covariate (XReg) support; the PyPI `timesfm` package lags GitHub — install from the repo for 2.5. |
| [Chronos-2](https://huggingface.co/amazon/chronos-2) (`amazon/chronos-2`) | 120M | Apache-2.0 | 2026-06-05 | Amazon; `chronos-forecasting` library; very wide adoption (tens of millions of downloads). |
| [Chronos-Bolt](https://huggingface.co/amazon/chronos-bolt-base) (`amazon/chronos-bolt-base`, plus small/mini) | 205M (base) | Apache-2.0 | 2025-11-21 | T5-based, faster variant; also distributed via Amazon SageMaker JumpStart. |

What Apache-2.0 means for us, in plain English:

- **Commercial use, modification, and internal deployment are permitted.**
- Obligations are light: keep the license text and any NOTICE attribution with
  redistributed copies; state significant changes if we modify the models.
- It includes an express patent grant from the contributors.
- **A permissive license is not enterprise approval.** FedEx IT / AI governance
  approval, and the repo's public/synthetic-data-only boundary, still gate any
  use — the license simply isn't the blocker.

## Reproducibility Checklist (the remaining gate)

Before any foundation-model forecast appears in a pilot, the run must be
reproducible by a second person. Concretely:

1. **Pin the model revision** — reference the exact Hugging Face commit hash,
   not a floating tag; record it in the run log.
2. **Pin the library versions** — lockfile or `pip freeze` committed alongside
   the experiment (`timesfm` from a pinned git SHA; `chronos-forecasting` from
   a pinned release).
3. **Fixed evaluation protocol** — walk-forward (rolling-origin) backtest with
   MASE, the same protocol the Signal Lab already uses, so results are
   comparable to the incumbent baseline ensemble.
4. **Synthetic fixtures first** — benchmark on the repo's seeded synthetic
   station series before any locally-held real series; record dataset hashes.
5. **Inference is local-only** — these models run zero-shot on-device; no
   series leaves the machine. No real FedEx operational data until governance
   approves a secured environment (the boundary that never moves).
6. **Report ranges, not points** — quantile/band outputs only, consistent with
   the Signal Lab's honest-widening-band rule.
7. **Document hardware and runtime** — CPU-only feasibility matters; managers
   won't have GPUs.

## Recommendation

- **License review: passed.** Apache-2.0 across TimesFM 2.5, Chronos-2, and
  Chronos-Bolt; no redistribution or field-of-use restrictions that affect a
  governed internal pilot.
- **Order of work unchanged:** the Signal Lab's simple ensemble is the
  benchmark to beat. A foundation-model spike is justified only if it beats
  that ensemble's walk-forward MASE on the synthetic fixtures by a margin that
  survives the multiple-comparisons caveats in the Signal Lab's method notes.
- **Candidate for a first spike:** Chronos-Bolt small/mini (CPU-friendly,
  zero-shot, one-line inference API) against the Signal Lab fixtures — a
  one-day experiment when Phase 5 moves from research to active.

## Sources

- [google/timesfm-2.5-200m-pytorch — Hugging Face model card](https://huggingface.co/google/timesfm-2.5-200m-pytorch) (license metadata: apache-2.0)
- [amazon/chronos-2 — Hugging Face model card](https://huggingface.co/amazon/chronos-2) (license metadata: apache-2.0)
- [amazon/chronos-bolt-base — Hugging Face model card](https://huggingface.co/amazon/chronos-bolt-base) (license metadata: apache-2.0)
- [google-research/timesfm — GitHub](https://github.com/google-research/timesfm)
- [amazon-science/chronos-forecasting — GitHub](https://github.com/amazon-science/chronos-forecasting)
- [Apache License 2.0 text](https://www.apache.org/licenses/LICENSE-2.0)
