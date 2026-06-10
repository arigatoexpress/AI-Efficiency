# Governance Review — Forecast Foundation-Model Spike

## Data handling

| Question | Answer |
|----------|--------|
| What data does the benchmark use? | **Synthetic only** — seeded weekly series generated in-process. No real facility numbers exist in this spike. |
| Does data leave the machine? | **No series data leaves.** The model weights are *downloaded from* Hugging Face on first run (inbound only); inference is local CPU. |
| What ships in the repo? | The benchmark script and documentation with measured numbers. No datasets, no model weights. |
| Model license | `amazon/chronos-bolt-small` is Apache-2.0 (verified in the [license review](../../docs/forecasting-model-license-review.md)). |
| Dependencies | `chronos-forecasting` + PyTorch, installed locally by the runner. Deliberately **not** in CI — heavy dependencies for a research artifact. |

## Reproducibility checklist status (from the license review)

- Fixed seed, fixed protocol (walk-forward MASE), versions documented in the README: **met** for this synthetic run.
- Pinned model *revision* (HF commit hash): **not yet** — required before any run whose numbers are presented beyond this spike.
- Synthetic fixtures first: **this is that run.** Any real-series rerun stays local and follows the same protocol.

## Rules for use

1. **Conclusions are scoped to this fixture.** The honest caveats in the README travel with the numbers.
2. **No real volumes in this repo**, ever; a real-series rerun happens locally in a controlled environment.
3. **The decision stands until re-tested:** simple ensemble in production-path tools; foundation models stay research.

## Approval checklist (pre-share)

- [ ] Numbers presented with the caveats (synthetic fixture, smallest model variant, small sample).
- [ ] No claim that this settles foundation-model utility on real data.
- [ ] Any rerun on real data documented with pinned model revision and kept local.
