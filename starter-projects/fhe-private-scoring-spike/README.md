# FHE Private Scoring Spike

> **Part of the [FedEx AI Efficiency Hub](../../README.md).** Synthetic data only · research spike, not a product · human review required.

The ROADMAP Phase 7 research spike from [docs/fhe-zama-research.md](../../docs/fhe-zama-research.md), executed: can **fully homomorphic encryption (FHE)** score a submitted idea **without the scoring service ever seeing the submission in the clear?** Answer: yes, with a measured, surprisingly small cost — for this narrow shape of problem.

## What This Is

A single local benchmark (`benchmark.py`) that:

1. generates a **synthetic** dataset of 600 "AI idea intake" submissions (six numeric form answers: hours saved, team size, data sensitivity, effort, external-tool use, manager endorsement);
2. trains a plain scikit-learn logistic regression triage baseline;
3. trains the same model with **Zama Concrete ML**, quantizes it (8-bit), and compiles it to an FHE circuit;
4. measures accuracy and per-sample latency three ways — clear, FHE-simulated, and **actually encrypted end-to-end** (encrypt → compute on ciphertext → decrypt).

## Measured Results (2026-06-09, seed 42)

| Metric | Clear (sklearn) | FHE (Concrete ML) |
| --- | --- | --- |
| Accuracy (180-sample test set) | **86.1%** | **85.6%** (simulated = executed) |
| Latency per sample | 0.0009 ms | **5.3 ms** encrypted end-to-end |
| Slowdown | 1× | ~5,600× |
| One-time costs | — | compile 0.4 s · keygen <1 ms |

Encrypted predictions on the executed subset **matched the simulation exactly** (n=30).

Environment: Python 3.11.15 · concrete-ml 1.9.0 · scikit-learn 1.5.0 · numpy 1.26.4 · 4-vCPU Intel Xeon @ 2.10 GHz (CPU only).

## The One-Page Recommendation

- **The latency story is better than the slogan suggests.** "~5,600× slower" sounds disqualifying; **5.3 ms per encrypted submission** is not. For low-volume, high-sensitivity workflows — scoring idea submissions, aggregating a small survey — FHE overhead is irrelevant to the user experience.
- **The accuracy cost was half a point** (86.1% → 85.6%), entirely from 8-bit quantization, not from encryption: the encrypted circuit reproduced the quantized model exactly.
- **What FHE protects here:** the scoring service computes on ciphertext — a compromised or curious server never sees the submission's contents. **What it does not protect:** who submitted, when, how often (metadata); the model itself; the decrypted result on the client; or anything access control, redaction, retention, and audit logs are for. It complements those controls; it replaces none of them.
- **Where this does not generalize:** LLM prompting, screenshots, maps, and high-volume real-time paths remain out of FHE's practical reach, exactly as `docs/fhe-zama-research.md` cautions.
- **Recommendation unchanged from the research note:** keep FHE as a research track. If a real private-scoring need emerges (e.g., sensitive idea triage where submitters won't trust a plain service), this spike shows the mechanics are workable today on commodity CPUs — the decision will hinge on key management and governance, not on performance.

## How To Run It

```bash
pip install concrete-ml   # heavy dependency — not in CI on purpose
python3 benchmark.py
```

Prints a JSON results block plus a plain summary. Fully local; no network calls; synthetic data generated in-process from a fixed seed.

## Do Not Use It For

- Claiming "our data is FHE-protected" anywhere in a real workflow — this is a benchmark, not a deployment.
- Real submissions of any kind. Synthetic only, here and in any fork of this spike.
- Skipping governance: a production private-scoring service would need key-management design, a security review, and an approved owner first.

## Review And Approval

See [`governance-review.md`](governance-review.md) and the program [project review checklist](../../docs/governance/project-review-checklist.md).

## Status

Spike complete — all four success criteria from the research note met: runs locally without confidential data; latency/accuracy/limits documented; the protects-vs-doesn't-protect boundary written down; presented as research, not production security.

---
### Part of the AI Efficiency platform
- **Hub / all tools:** [repo README](../../README.md) · [interactive hub page](https://raw.githack.com/arigatoexpress/AI-Efficiency/main/index.html)
- **Research note this executes:** [docs/fhe-zama-research.md](../../docs/fhe-zama-research.md)
