# Specification Quality Checklist

**Feature:** Priority Metrics Intelligence
**Reviewed:** 2026-07-15

- [x] Purpose and primary user are explicit.
- [x] Public-repository and synthetic-data boundaries are explicit.
- [x] In-scope and out-of-scope behavior are separated.
- [x] Every user scenario has observable acceptance criteria.
- [x] Missing data and zero baselines have defined behavior.
- [x] Every rate names its numerator, denominator, and time basis.
- [x] Additive components are aggregated before rates are derived.
- [x] Risk lineage avoids causal claims.
- [x] Candidate leading indicators require configured pairs and evidence.
- [x] Projection language is conservative and deterministic.
- [x] The CSV input allowlist is complete and rejects unknown fields.
- [x] Privacy failures do not echo rejected values.
- [x] JSON and Markdown output responsibilities are defined.
- [x] Error behavior and nonzero failure conditions are defined.
- [x] Golden eval groups cover math, privacy, lineage, patterns, and output.
- [x] No network, model, deployment, or production integration is implied.
- [x] No `TBD`, `TODO`, or unresolved placeholder remains.
