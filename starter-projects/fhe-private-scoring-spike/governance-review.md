# Governance Review — FHE Private Scoring Spike

Aligns with the program principles: synthetic data only, human review on every output, and **research is never presented as production security.**

## Data handling

| Question | Answer |
|----------|--------|
| What data does the benchmark use? | **Synthetic only** — 600 fake "idea intake" rows generated in-process from a fixed seed. No real submissions, employees, or operational data exist anywhere in this spike. |
| Does it send data anywhere? | **No.** `benchmark.py` makes zero network calls; everything runs locally. |
| What ships in the repo? | The benchmark script and documentation with measured numbers. No datasets, no model files, no keys. |
| Dependencies | `concrete-ml` (Zama, open source) and scikit-learn, installed locally by the person running it. Deliberately **not** added to CI — it is a heavy dependency for a research artifact. |

## What this spike does and does not establish

- **Does:** demonstrates that encrypted inference for a small tabular scoring model is mechanically workable on a commodity CPU (5.3 ms/sample, −0.5 accuracy points), with encrypted output matching simulation exactly.
- **Does not:** establish a production security posture. FHE here protects submission contents from the scoring service; it does not protect metadata (who/when/how often), the model, or the decrypted result, and it does not substitute for access control, redaction, retention, or audit logging.

## Rules for use

1. **Never run this on real submissions.** The spike is for measurement, not service.
2. **No production claims.** Any presentation of these results must label them a research benchmark.
3. **Escalation path:** if a real private-scoring use case emerges, it requires a key-management design, a security review, and an approved owner *before* any pilot — performance is already shown not to be the blocker.

## Approval checklist (pre-share)

- [ ] Presentation describes the data as synthetic and the spike as research.
- [ ] The protects-vs-doesn't-protect boundary is stated alongside any latency/accuracy numbers.
- [ ] No suggestion that any current workflow is "FHE-protected."
