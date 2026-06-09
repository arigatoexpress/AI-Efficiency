# Governance Review — TLH / SPH Efficiency Explorer

Aligns with the AI-Efficiency program principle: *AI should save managers time, not replace their judgment*, and **never expose confidential, customer, or proprietary data to public AI tools.**

## Data handling

| Question | Answer |
|----------|--------|
| Does the tool send data anywhere? | **No.** `app/index.html` makes zero network calls, enforced by a Content-Security-Policy `<meta>` with `connect-src 'none'`. Verifiable in the browser Network tab (zero requests). |
| Where does loaded data live? | In page memory only, for the current tab session. Closing the tab discards it. Nothing is written to disk by the app. |
| Does it use a public/cloud AI model? | **No.** The decomposition and the recap generator are deterministic vanilla JavaScript. No LLM, no API. |
| What ships in the repo? | Only **synthetic** demo data (seeded random with scripted teaching stories) and a synthetic sample CSV. No real facility numbers. |
| What granularity of data does it accept? | **Aggregate facility/shift data only — never individual employee hours or performance.** Loading person-level data is out of scope and not approved. |

## Rules for use

1. **Real TLH/SPH data stays in a controlled environment.** Run the tool locally; do not host the file on a public URL with real data baked in.
2. **Aggregates only.** Facility/shift totals. Individual employee hours or productivity must never be loaded, even locally.
3. **Abstract identifiers before sharing outputs.** If a screenshot or recap leaves the team, replace facility codes with anonymized labels.
4. **Do not commit real data** (CSV exports, screenshots with live numbers) into the public repository.
5. **Splits are decision-support, not decisions.** Every driver tag is an investigation prompt that requires human review before acting or communicating.

## Risk notes — the key one first

- **Misreading an hours-driven gain as a productivity win.** This is the central risk this tool both surfaces and could amplify. A TLH-driven SPH gain means hours fell while volume held — which is only a win if service, safety, and demand actually held. The recap text labels these "verify first," and reviewers must confirm service and volume held before any such gain is communicated as an improvement.
- **Two-week window noise.** A single week-over-week split is directional. Pair it with the [Dock Efficiency Signal Lab](../dock-efficiency-signal-lab/README.md)'s SPC view, which quantifies whether the underlying move is statistically real, before escalating.
- **False dollar precision.** The $/SPH-point translation is a planning heuristic (annual rate ÷ 52), not accounting. Present it as "≈, at the planning rate."
- **Demand vs performance.** Volume drops depress SPH even in a well-run operation; a negative SPH effect can be a demand story. The method notes say this explicitly.

## Approval checklist (pre-share)

- [ ] Confirmed no real data is embedded in any shared copy of `app/index.html`.
- [ ] Confirmed the loaded data is facility/shift aggregate — no individual employee data.
- [ ] Any exported recap/screenshot uses abstracted identifiers.
- [ ] TLH-driven gains in the communication carry the service/volume verification caveat.
- [ ] Reviewed by a human before any operational action or external communication.
- [ ] If deployed beyond a single machine, reviewed against `docs/governance/project-review-checklist.md`.
