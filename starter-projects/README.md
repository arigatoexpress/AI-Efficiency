# Starter Projects

> **Part of the FedEx AI Efficiency Hub.** For the full picture — how these tools connect, the prompt library, and governance — start at the [repo README](../README.md) or the [interactive hub page](https://raw.githack.com/arigatoexpress/AI-Efficiency/main/index.html).

Starter projects are early examples that the team can learn from, improve, and
submit for review.

Each project should include:

- `README.md`: what it does, who uses it, and why it matters;
- `demo-script.md`: how to present it safely;
- `governance-review.md`: data, risk, and approval notes.

Follow [the plain-English documentation standard](../docs/documentation-standard.md)
for every starter project.

## Current Starters

| Project | Status | Notes |
| --- | --- | --- |
| [Dock Efficiency Signal Lab](dock-efficiency-signal-lab/README.md) | Offline single-file app | Process-control (SPC) + technical-analysis indicators + forecasting on weekly dock-efficiency KPIs; ranks top/bottom performers with $ impact and Scorecard focus. Runs offline; no data leaves the machine. |
| [TLH/SPH Efficiency Explorer](tlh-sph-efficiency-explorer/README.md) | Offline single-file app | Splits each facility's week-over-week efficiency change into an exact throughput (SPH) effect and hours (TLH) effect, with driver tags, $ translation, and a local recap generator. Companion to the Signal Lab. |
| [Priority Metrics Intelligence](priority-metrics-intelligence/README.md) | Offline deterministic CLI | Validates closed synthetic monthly metrics, compares exact periods and targets, traces risk lineage, and atomically publishes canonical JSON plus a manager brief. |
| [Operations Decision Lab](operations-decision-lab/README.md) | Offline deterministic evaluator | Produces availability-safe package-volume baselines and independently checks supplied synthetic plans against hard constraints; no route generation or dispatch. |
| [ADK Shift-Brief Agent](adk-shift-brief-agent/README.md) | Runnable starter kit (offline-tested) | The forward-path guide's first agent, built with Google's ADK: drafts shift briefs from labeled synthetic signals with read-only tools and CI-enforced guardrails; the template for future agents and Gemini Enterprise registration. |
| [AI Idea Intake Agent](ai-idea-intake-agent/README.md) | Concept and governance starter | Safe Teams/Copilot or Gemini-channel flow for AI ideas, feedback, and use-case triage. |
| [FedEx Logistics Intelligence System](fedex-logistics-intelligence-system/README.md) | AI Studio and Cloud Run prototype | Public-data station-ops console concept for weather, road, and regional risk briefings. |
| [Delivery Markets Lab](fedex-delivery-markets/README.md) | Prototype reference | Synthetic-data, paper-only app already exists locally. AI Studio link requires sign-in. |
| [Forecast Foundation-Model Spike](forecast-foundation-model-spike/README.md) | Research spike (complete) | Chronos-Bolt zero-shot vs the Signal Lab's simple ensemble, walk-forward MASE on synthetic fixtures — the ensemble won; baselines stay. |
| [FHE Private Scoring Spike](fhe-private-scoring-spike/README.md) | Research spike (complete) | Background research: measured benchmark of encrypted idea-scoring with Zama Concrete ML — synthetic data, local only, with a one-page recommendation. |

## Add A Starter

Create a new folder:

```text
starter-projects/project-name/
```

Then add:

```text
README.md
demo-script.md
governance-review.md
```

Keep all starter projects safe for public review unless the repo visibility and
sharing scope are changed.
