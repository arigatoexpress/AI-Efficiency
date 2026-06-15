# FedEx AI Efficiency Hub

<p align="center">
  <img src="assets/hero-banner.svg" alt="FedEx AI Efficiency Hub banner" width="100%">
</p>

> **One platform for safe, useful AI in operations.** Operations-led tools, prompts, and guides that turn real operational friction into reusable, governance-ready AI — built by ops people, for ops people. No coding required to use it.

## What's New Since the June 4 Meeting

One week, sixteen merged pull requests — every CTO-review item closed, two new tools shipped, and two research questions answered with measurements instead of opinions:

- **Dock Efficiency Signal Lab shipped** ([open it](https://raw.githack.com/arigatoexpress/AI-Efficiency/main/starter-projects/dock-efficiency-signal-lab/app/index.html)) — offline statistical process control + trend indicators + forecasting on weekly dock KPIs, with a region/district scope filter for the six Western focus districts. No data leaves the machine.
- **TLH/SPH Efficiency Explorer shipped** ([open it](https://raw.githack.com/arigatoexpress/AI-Efficiency/main/starter-projects/tlh-sph-efficiency-explorer/app/index.html)) — splits every week-over-week efficiency change into its exact throughput (SPH) and hours (TLH) effects, so an hours-cut gain is never mistaken for a productivity win.
- **All CTO review feedback implemented** — the "FEC supervisors and managers" audience standard repo-wide (glossary as source of truth, FEC = Federal Express Corporation confirmed), the [agentic AI agency-ladder guide](docs/technology/agentic-ai-for-operations.md), and the efficiency-decomposition tooling above.
- **We benchmarked before adopting** — a zero-shot forecasting foundation model (Chronos-Bolt) was tested against the Signal Lab's simple, explainable ensemble in a walk-forward benchmark: [the ensemble won](starter-projects/forecast-foundation-model-spike/README.md), so the baseline stays and no pilot was spent. Privacy-preserving (encrypted) scoring was also measured as [background research](starter-projects/fhe-private-scoring-spike/README.md).
- **Engineering hygiene** — CI now runs docs/link/claim checks and the full app build on every PR; GitHub Actions are SHA-pinned with Dependabot enabled; the [operating charter](AGENTS.md) keeps changes small, verified, and reversible; model licenses for the forecasting track all confirmed Apache-2.0.
- **The platform is one hub** — unified [interactive hub page](https://raw.githack.com/arigatoexpress/AI-Efficiency/main/index.html), refreshed [presentation deck](https://raw.githack.com/arigatoexpress/AI-Efficiency/main/assets/presentation-deck.html) (15 slides, current as of today), and the printable [Daily Ops Playbook](docs/daily-ops-playbook.md).
- **Gemini Enterprise prep started** — access requested from the org team; the [day-one readiness plan](docs/technology/gemini-enterprise-readiness.md) and the first registrable agent — the [ADK shift-brief agent starter kit](starter-projects/adk-shift-brief-agent/README.md) (read-only tools, synthetic signals, CI-enforced guardrails, tested offline) — are ready and waiting.
- **The prompt library became programmable** — the new [Prompt Explorer](https://raw.githack.com/arigatoexpress/AI-Efficiency/main/prompts/explorer.html) (search, fill in the brackets, copy — offline) plus a machine-readable [`prompts.json`](prompts/prompts.json) index generated from the markdown and kept in sync by CI, so scripts, agents, and enterprise tools can consume the same 51 prompts as people do.
- **Research-driven Microsoft alignment** — three deep-research passes (Copilot/Teams landscape, public FedEx role ladder, prompt methodology) produced the [Copilot + Teams playbook](docs/technology/copilot-teams-playbook.md) (which Copilot you have, Microsoft's four prompt elements, role-by-role guidance from handler to managing director, the skills ladder) and explorer upgrades: a ⭐ Day 1 starter pack, per-category audience labels, and an Expectations builder that adds Microsoft's most-skipped prompt element with three dropdowns.

*In review (deliberately deferred): four major-version dependency updates from Dependabot — they get tested properly after the meeting, not rushed before it.*

---


## New Here? Three Ways To Get Value In Five Minutes

No setup, no installs, no technical background:

1. **Copy a prompt.** Open the [prompt library](prompts/README.md), pick a prompt, paste it into Gemini or ChatGPT, and fill in the brackets. 51 prompts for shift briefs, safety huddles, handoffs, peak planning, and more — each with its safety rule built in.
2. **Read the starter guide.** The [AI workplace user guide](docs/ai-workplace-user-guide.md) is the plain-English explanation of what AI can (and can't) safely do for your day — written for the least technical teammate.
3. **Try the live dashboard.** The [Station Ops Intelligence demo](https://fedex-logistics-intelligence-system-267358751314.us-east1.run.app) shows public weather and road risk before a shift and drafts briefs you can edit. Public data only; every output says "needs manager verification."

Prefer a visual overview? **[View the interactive hub page](https://raw.githack.com/arigatoexpress/AI-Efficiency/main/index.html)** — it shows how all the tools, prompts, and guides connect on one page. (It's this repo's `index.html`. If you have the repo downloaded on your computer, that file also opens directly in any browser and works fully offline — but on the GitHub website, use the link above.)

---

## Why This Matters for FedEx

FedEx moves millions of packages daily across Express, Ground, and Freight networks, generating over **2 petabytes of operational data every day**. In December 2025, FedEx launched a global **AI Education and Literacy program** to prepare team members for an AI-powered enterprise. This repo is our regional contribution to that mission — built by operations people, for operations people. Public source links for these claims are collected in [presentation proof points](docs/presentation-proof-points.md).

**What we believe:**
- AI should save managers time, not replace their judgment.
- The safest way to start is with public data, synthetic scenarios, and copy-paste prompts.
- Small pilots with clear metrics beat big promises with vague outcomes.
- Every AI output needs a human review step before it becomes a decision.

### How it all connects

Ideas come in the front door and become projects. Daily **prompts** power managers' routine drafts. Before a shift, **Station Ops Intelligence** turns public risk signals into reviewed briefs; after the week, the **Dock Efficiency Signal Lab** flags which dock-KPI moves are real and the **TLH/SPH Efficiency Explorer** shows which lever moved them. **Governance** gates everything, and a shared data model is the future state. See the diagram on the [interactive hub page](https://raw.githack.com/arigatoexpress/AI-Efficiency/main/index.html).

---

## Start Here — Pick By What You Need

| I want to… | Start with | Best for |
| --- | --- | --- |
| Understand AI basics, safely | [AI workplace user guide](docs/ai-workplace-user-guide.md) | Anyone new to AI |
| See how this fits FedEx's AI program | [FedEx AI literacy guide](docs/fedex-ai-literacy-guide.md) | Everyone |
| Get oriented in this repo | [Getting started](docs/getting-started.md) | New team members |
| Save time on today's work | [Prompt library](prompts/README.md) | Managers who want quick wins |
| Run a whole shift with AI support | [Daily operations playbook](docs/daily-ops-playbook.md) | FEC supervisors and managers running a daily shift |
| Check if a weekly KPI move is real | [Dock Efficiency Signal Lab](starter-projects/dock-efficiency-signal-lab/README.md) | Anyone who owns a weekly dock-efficiency number |
| See which lever moved efficiency | [TLH/SPH Efficiency Explorer](starter-projects/tlh-sph-efficiency-explorer/README.md) | Anyone explaining a week-over-week change |
| Write better prompts | [Prompting basics](prompts/prompt-engineering-basics.md) | Anyone using ChatGPT or Gemini |
| Use Gemini well at work | [Gemini guide](docs/technology/gemini-for-ops-managers.md) | Gemini users |
| Use Copilot and Teams well | [Copilot + Teams playbook](docs/technology/copilot-teams-playbook.md) | Our Microsoft-first org — every level |
| Understand "AI agents" | [Agentic AI for operations](docs/technology/agentic-ai-for-operations.md) | Everyone — managers first |
| See the engineering forward path | [Google Cloud + ADK integration](docs/technology/google-cloud-adk-integration.md) | Engineers and technically-curious managers |
| Get ready for Gemini Enterprise | [Day-one readiness plan](docs/technology/gemini-enterprise-readiness.md) | Everyone — access request is pending |
| Review a project before sharing | [Governance checklist](docs/governance/project-review-checklist.md) | Team leads and reviewers |
| Propose a small experiment | [Pilot template](docs/pilot-program-template.md) | Managers ready to experiment |

---

## 🚀 Featured Project: Logistics Intelligence System

Our most mature starter project is a live, public-data decision-support dashboard for station-level FEC supervisors and managers.

<p align="center">
  <img src="assets/dashboard-screenshot.png" alt="Live dashboard screenshot showing Shift Readiness, Station Impact, Route Watch, and Manager Drafts panels" width="90%">
</p>

**What it does:**
- Shows public weather and road risk signals before a shift.
- Generates draft briefs (pre-shift huddle, handoff, after-action) with Gemini AI.
- Labels every data point as public fact, forecast, or synthetic demo.
- Never touches internal FedEx package, route, or customer data.

**Tech details:** React 19 + Vite frontend, Express + TypeScript backend, optional Gemini AI drafts.

**Live demo:** [https://fedex-logistics-intelligence-system-267358751314.us-east1.run.app](https://fedex-logistics-intelligence-system-267358751314.us-east1.run.app)  
**Try it locally:** See the [starter project page](starter-projects/fedex-logistics-intelligence-system/README.md) for screenshots, architecture, and a quick-start guide.

---

## Prompt Library at a Glance

**51 copy-paste prompts** across 10 categories — plus a [prompt-engineering basics](prompts/prompt-engineering-basics.md) guide — organized by what FedEx managers actually do.

**Easiest way in: the [Prompt Explorer](https://raw.githack.com/arigatoexpress/AI-Efficiency/main/prompts/explorer.html)** — search the whole library, fill in the brackets on screen, and copy the finished prompt. Fully offline like the other tools, works in any browser on any machine, and the prompts are plain text that works with any model (Gemini, Copilot, ChatGPT, Claude). Programs and agents can read the same library from [`prompts/prompts.json`](prompts/prompts.json).

| Category | Examples |
|----------|----------|
| **Daily Operations** | Shift briefs, handoffs, escalations, after-action reviews, volume anomaly checks |
| **Safety & Compliance** | Pre-shift huddles, near-miss reports, seasonal alerts, safety meeting agendas |
| **Peak Season & Surge** | Pre-peak contingency, surge checklists, ISP coordination, sort hub staffing scenarios |
| **Meeting & Communication** | Agendas, action items, emails, executive updates |
| **Customer & Contractor** | Service alerts, escalation responses, ISP briefings, team recognition |
| **Linehaul & Routing** | Feeder delays, alternate routing, P&D density, yard management, cross-dock timing |
| **Process Improvement** | Root cause analysis, improvement proposals, workflow documentation |
| **Data & Reporting** | Metrics summaries, dashboard explanations, trend analysis |
| **Bid & Opportunity Support** | Opportunity intake, capability summaries, risk assessments |
| **Governance-Safe Use** | Is this use case safe? Documenting AI use, review prep |

All prompts include the **Safe Prompt Rule**: remove sensitive data first, review output before sharing, and keep a human in charge of every decision.

New: the [Daily Operations Playbook](docs/daily-ops-playbook.md) stitches these prompts into a printable, phase-by-phase routine — pre-shift, mid-shift, peak/surge, handoff, after-action, and a weekly cadence — with a tape-it-up one-pager at the end.

---

## Forward Path: Google Cloud + Gemini + ADK

Today the Logistics Intelligence app runs on **Cloud Run** with **Google AI Studio**-prototyped, direct **Gemini** drafts. The [Google Cloud + ADK integration guide](docs/technology/google-cloud-adk-integration.md) lays out the credible next steps — Gemini via **Vertex AI**, agents built with the **Agent Development Kit (ADK)**, hosted on **Vertex AI Agent Engine** — while internal data and any action-taking stay gated behind FedEx governance until approved.

<p align="center">
  <img src="assets/architecture-diagram-adk.svg" alt="Forward-path architecture: public data → Cloud Run app → Gemini via Vertex AI / ADK agent → human review → governance-gated Foundry" width="90%">
</p>

---

## Presentation Deck

A browser-based slide deck for the regional standup: **[view it online](https://raw.githack.com/arigatoexpress/AI-Efficiency/main/assets/presentation-deck.html)** (navigate with arrow keys; print to PDF if needed). If you have the repo downloaded, the same deck is the file `assets/presentation-deck.html`.

Start with the [`presentation kit`](docs/presentation-kit.md) to open the deck,
runbook, Q&A proof points, leadership brief, and pilot shortlist from one place.
For the day-before checklist, demo flow, and backup plan, use the
[`presentation day runbook`](docs/presentation-day-runbook.md).
For Q&A about official public sources and claims, keep
[`presentation proof points`](docs/presentation-proof-points.md) nearby.
For a one-page leave-behind, use the
[`leadership brief`](docs/presentation-leadership-brief.md).
For a concrete next-step menu, use the
[`pilot candidate shortlist`](docs/pilot-candidate-shortlist.md).

## Starter Projects

Early examples the team can learn from, improve, and submit for review.

| Project | Status | What it does |
| --- | --- | --- |
| [FedEx Logistics Intelligence System](starter-projects/fedex-logistics-intelligence-system/README.md) | **Deployed public-data prototype + source-owned rebuild** | Public-data station-ops console for weather, road, and regional risk briefings. |
| [Dock Efficiency Signal Lab](starter-projects/dock-efficiency-signal-lab/README.md) | **Offline single-file app** | Process-control (SPC) + technical-analysis indicators + forecasting on weekly dock-efficiency KPIs; ranks top/bottom performers with $ impact and Scorecard focus. Fully offline — no data leaves the machine. |
| [TLH/SPH Efficiency Explorer](starter-projects/tlh-sph-efficiency-explorer/README.md) | **Offline single-file app** | Splits each week-over-week efficiency change into its two real levers — throughput (SPH) and labor hours (TLH) — so an hours-cut gain is never mistaken for a productivity win. Companion to the Signal Lab; fully offline. |
| [ADK Shift-Brief Agent](starter-projects/adk-shift-brief-agent/README.md) | **Runnable starter kit (offline-tested)** | The forward path's first agent, built with Google's ADK: drafts shift briefs from labeled synthetic signals through read-only tools, with CI-enforced guardrails. Ready to register into Gemini Enterprise when access lands. |
| [AI Idea Intake Agent](starter-projects/ai-idea-intake-agent/README.md) | Concept and governance starter | Safe Teams/Copilot or Gemini-channel flow for AI ideas, feedback, and use-case triage. |
| [Delivery Markets Lab](starter-projects/fedex-delivery-markets/README.md) | Prototype reference | Synthetic-data, paper-only delivery-market concept demo. |
| [Forecast Foundation-Model Spike](starter-projects/forecast-foundation-model-spike/README.md) | Research spike (complete) | Chronos-Bolt vs the Signal Lab's simple ensemble (walk-forward MASE, synthetic fixtures) — the simple ensemble won, so the explainable baseline stays. |
| [FHE Private Scoring Spike](starter-projects/fhe-private-scoring-spike/README.md) | Research spike (complete) | Background research: measured benchmark of privacy-preserving (encrypted) idea-scoring — synthetic data, local only, research track. |

**To run the two offline tools** (Signal Lab and TLH/SPH Explorer): try them online first — [Signal Lab](https://raw.githack.com/arigatoexpress/AI-Efficiency/main/starter-projects/dock-efficiency-signal-lab/app/index.html) · [TLH/SPH Explorer](https://raw.githack.com/arigatoexpress/AI-Efficiency/main/starter-projects/tlh-sph-efficiency-explorer/app/index.html) — both load with synthetic demo data. To analyze real numbers, download the repo (green **Code** button → **Download ZIP**), unzip it, and double-click the tool's `app/index.html`: it runs entirely in your browser with no internet connection, so your data never leaves your machine.

---

## Team Operating Principles

1. **Protect people, customers, and the company first.**
2. Use AI for drafts, analysis support, and workflow acceleration — not unchecked decisions.
3. **Never paste confidential, regulated, customer, employee, package, route, security, or proprietary data** into public or unapproved AI tools.
4. Keep a human accountable for every external message, operational decision, and escalation.
5. Document what the AI touched, what data was used, what was verified, and what changed because of it.
6. Prefer small pilots with clear success metrics over broad, vague automation.

---

## Repository Structure

**Tech stack:** Static HTML hub · offline single-file tools · Markdown docs · Google AI Studio · Gemini · Cloud Run · React/Vite prototypes · *AI agent collaborators: see [AGENTS.md](AGENTS.md)*

```text
docs/
  ai-workplace-user-guide.md       ← Start here if you are new
  fedex-ai-literacy-guide.md       ← How we align with FedEx's AI program
  fedex-terminology.md             ← Quick reference for operations terms
  getting-started.md
  documentation-standard.md
  daily-ops-playbook.md            ← Printable run-it-every-day playbook
  pilot-program-template.md        ← Propose a pilot
  demo-script.md                   ← Present this repo to leadership
  data-source-catalog.md           ← Public-data sources, rights, caveats
  forecasting-model-license-review.md ← Phase 5 model license/repro gate
  foundry-integration-roadmap.md   ← Governance-gated Foundry export path
  teams-telegram-agent-roadmap.md  ← Planned intake-agent track
  fhe-zama-research.md             ← Privacy (FHE) research note
  governance/                      ← Checklists and policies
  technology/                      ← How-to guides for approved tools
    gemini-for-ops-managers.md
    chatgpt-copilot-workplace-guide.md
    google-ai-studio-guide.md
    agentic-ai-for-operations.md   ← The agency ladder, plainly
    google-cloud-adk-integration.md ← Vertex AI + ADK forward path
    gemini-enterprise-readiness.md ← Day-one plan for pending enterprise access
prompts/
  README.md                        ← Copy-paste prompts for daily work
  explorer.html                    ← Offline search-and-fill Prompt Explorer
  prompts.json                     ← Machine-readable index (generated)
  daily-operations.md
  safety-and-compliance.md
  peak-season-and-surge.md
  meeting-and-communication.md
  customer-and-contractor-comms.md
  linehaul-and-routing.md
  process-improvement.md
  data-and-reporting.md
  bid-and-opportunity-support.md
  governance-safe-use.md
starter-projects/
  README.md
  fedex-logistics-intelligence-system/  ← Full-stack app + docs
  dock-efficiency-signal-lab/           ← Offline SPC + forecasting app + docs
  tlh-sph-efficiency-explorer/          ← Offline TLH/SPH decomposition app + docs
  forecast-foundation-model-spike/      ← Chronos vs baseline benchmark (complete)
  fhe-private-scoring-spike/            ← FHE research benchmark (complete)
  adk-shift-brief-agent/                ← First ADK agent, offline-tested starter kit
  ai-idea-intake-agent/
  fedex-delivery-markets/
assets/
  hero-banner.svg
  dashboard-screenshot.png
  dashboard-preview.svg
  architecture-diagram.svg
  architecture-diagram-adk.svg     ← Gemini/Vertex AI/ADK forward path
  presentation-deck.html           ← Regional standup deck
.github/
  ISSUE_TEMPLATE/
```

---

## What Belongs Here

- Safe prompts that improve manager productivity.
- User guides written for non-technical operators.
- Pilot ideas with expected value, data needs, risks, and owners.
- Documentation for approved technology experiments such as Gemini and Google AI Studio.
- Governance-ready demo scripts, checklists, and meeting notes.
- Source-owned prototypes that use only public or synthetic data.

## What Does Not Belong Here

- Secrets, API keys, tokens, passwords, credentials, or private links.
- Real package tracking numbers, customer names, addresses, phone numbers, delivery photos, signatures, GPS traces, route manifests, or employee records.
- Live trading, wagering, money movement, order signing, or production customer communication automation.
- Material that implies official FedEx policy, endorsement, or production approval before that approval exists.

---

## How To Contribute

1. Open an issue using one of the templates.
2. Add or edit docs in a small pull request.
3. Include the use case, audience, data classification, expected benefit, and review status.
4. Ask for governance review before anything touches confidential data, production systems, customer communication, or external sharing.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full process.

---

## Status

This repo is ready for team documentation, prompt collection, public-data starter projects, and governance review. It is **not** a production FedEx system and should not be used with confidential or regulated data until the proper FedEx approvals are in place.

**Current focus:**
- CTO-team review feedback: **implemented** — cohesive FEC-audience messaging, the agentic AI track, and TLH/SPH efficiency decomposition are all live in the repo
- Validating the TLH/SPH Efficiency Explorer and Signal Lab against a real, locally-loaded weekly export during a pilot
- Evidence before adoption: forecasting upgrades must beat the simple, explainable ensemble in a walk-forward benchmark before earning a pilot (the first challenger didn't)
- Hardening the public data layer in the logistics intelligence app
- Preparing Foundry-ready export paths for when internal data access is approved
- Supporting the monthly CTO-team call, regional presentations, and pilot proposals

---

*Questions? Start with the [AI workplace user guide](docs/ai-workplace-user-guide.md) or open an issue.*
