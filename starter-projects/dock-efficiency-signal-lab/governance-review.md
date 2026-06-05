# Governance Review — Dock Efficiency Signal Lab

Aligns with the AI-Efficiency program principle: *AI should save managers time, not replace their judgment*, and **never expose confidential, customer, or proprietary data to public AI tools.**

## Data handling

| Question | Answer |
|----------|--------|
| Does the tool send data anywhere? | **No.** `index.html` makes zero network calls. All computation is in-browser, offline. Verifiable in the browser Network tab. |
| Where does loaded data live? | In page memory only, for the current tab session. Closing the tab discards it. Nothing is written to disk by the app. |
| Does it use a public/cloud AI model? | **No.** All indicators, control charts, and forecasts are deterministic math implemented in vanilla JavaScript. No LLM, no API. |
| What ships in the repo? | Only **synthetic** demo data (seeded random) and a synthetic sample CSV. No real facility numbers. |

## Rules for use

1. **Real productivity data stays in a controlled environment.** Run the tool locally; do not host the file on a public URL with real data baked in.
2. **Abstract identifiers before sharing outputs.** If a screenshot or export leaves the team, replace facility codes with anonymized labels.
3. **Do not commit real data** (CSV exports, screenshots with live numbers) into the public repository. Add such files to `.gitignore`.
4. **Signals are decision-support, not decisions.** A flagged facility is an investigation prompt. Pair it with the operational playbook and human review before acting or communicating.
5. **Re-baseline on known changes.** When the engineered goal is re-set or peak season shifts the mean, treat prior control limits as stale (see the Method tab).

## Risk notes

- **False precision.** Forecasts beyond ~3 weeks are directional; the widening band communicates this. Present ranges, not point numbers, to leadership.
- **Small sample (~25 weeks).** Control limits are provisional until enough data accrues; multiple-comparison risk is real across many facilities. Require corroboration across ≥2 indicators before escalating.
- **Autocorrelation.** Ops series are serially correlated; the tool surfaces lag-1 autocorrelation so users can discount inflated "trend" signals.

## Approval checklist (pre-share)

- [ ] Confirmed no real data is embedded in any shared copy of `index.html`.
- [ ] Confirmed any exported CSV/screenshot uses abstracted identifiers.
- [ ] Reviewed by a human before any operational action or external communication.
- [ ] If deployed beyond a single machine, reviewed against the program's `governance/project-review-checklist.md`.
