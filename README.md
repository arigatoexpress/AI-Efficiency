# AI Efficiency Team

<p align="center">
  <img src="assets/hero-banner.svg" alt="FedEx Logistics Intelligence System banner" width="100%">
</p>

> Operations-led AI efficiency hub for FedEx. Turns real operational friction into reusable prompts, starter projects, user guides, and governance-ready pilot packets — no coding required.

**Tech stack:** Markdown docs · Google AI Studio · Gemini · Cloud Run · React/Vite prototypes

*[Agent collaborators: see [AGENTS.md](AGENTS.md)]*

---

## Why This Matters for FedEx

FedEx moves millions of packages daily across Express, Ground, and Freight networks, generating over **2 petabytes of operational data every day**. In December 2025, FedEx launched a global **AI Education and Literacy program** to prepare team members for an AI-powered enterprise. This repo is our regional contribution to that mission — built by operations people, for operations people.

**What we believe:**
- AI should save managers time, not replace their judgment.
- The safest way to start is with public data, synthetic scenarios, and copy-paste prompts.
- Small pilots with clear metrics beat big promises with vague outcomes.
- Every AI output needs a human review step before it becomes a decision.

---

## Start Here — No Tech Background Required

| Area | What it is | Who it is for |
| --- | --- | --- |
| [AI workplace user guide](docs/ai-workplace-user-guide.md) | The foundational, plain-English guide for the least technical teammate. | Anyone new to AI |
| [FedEx AI literacy guide](docs/fedex-ai-literacy-guide.md) | How this repo aligns with FedEx's enterprise AI Education program. | Everyone |
| [Getting started](docs/getting-started.md) | The short first read for team members. | New team members |
| [Prompt library](prompts/README.md) | Copyable prompts for daily operations, safety, peak season, linehaul, and customer communication. | Managers who want quick wins |
| [Prompting basics](prompts/prompt-engineering-basics.md) | How to write better prompts without technical language. | Anyone using ChatGPT or Gemini |
| [Gemini guide](docs/technology/gemini-for-ops-managers.md) | How to use Gemini well and safely in an operations context. | Gemini users |
| [Governance checklist](docs/governance/project-review-checklist.md) | Review steps before sharing, piloting, or production use. | Team leads and reviewers |
| [Pilot template](docs/pilot-program-template.md) | Propose a small, measurable AI pilot with clear success criteria. | Managers ready to experiment |

---

## 🚀 Featured Project: Logistics Intelligence System

Our most mature starter project is a live, public-data decision-support dashboard for station operations managers.

<p align="center">
  <img src="assets/dashboard-screenshot.png" alt="Live dashboard screenshot showing Shift Readiness, Station Impact, Route Watch, and Manager Drafts panels" width="90%">
</p>

**What it does:**
- Shows public weather and road risk signals before a shift.
- Generates draft briefs (pre-shift huddle, handoff, after-action) with Gemini AI.
- Labels every data point as public fact, forecast, or synthetic demo.
- Never touches internal FedEx package, route, or customer data.

**Tech details:** React 18 + Vite frontend, Express + TypeScript backend, optional Gemini AI drafts.

**Live demo:** [https://fedex-logistics-intelligence-system-267358751314.us-east1.run.app](https://fedex-logistics-intelligence-system-267358751314.us-east1.run.app)  
**Try it locally:** See the [starter project page](starter-projects/fedex-logistics-intelligence-system/README.md) for screenshots, architecture, and a quick-start guide.

---

## Prompt Library at a Glance

Over **40 copy-paste prompts** organized by what FedEx managers actually do:

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

All prompts include the **Safe Prompt Rule**: remove sensitive data first, review output before sharing, and keep a human in charge of every decision.

---

## Presentation Deck

A browser-based slide deck for the regional standup is available at [`assets/presentation-deck.html`](assets/presentation-deck.html). Open it in any browser, navigate with arrow keys, and print to PDF if needed.

## Starter Projects

Early examples the team can learn from, improve, and submit for review.

| Project | Status | What it does |
| --- | --- | --- |
| [FedEx Logistics Intelligence System](starter-projects/fedex-logistics-intelligence-system/README.md) | **Live prototype + source-owned rebuild** | Public-data station-ops console for weather, road, and regional risk briefings. |
| [Dock Efficiency Signal Lab](starter-projects/dock-efficiency-signal-lab/README.md) | **Offline single-file app** | Process-control (SPC) + technical-analysis indicators + forecasting on weekly dock-efficiency KPIs; ranks top/bottom performers with $ impact and Scorecard focus. Fully offline — no data leaves the machine. |
| [AI Idea Intake Agent](starter-projects/ai-idea-intake-agent/README.md) | Concept and governance starter | Safe Teams/Copilot or Gemini-channel flow for AI ideas, feedback, and use-case triage. |
| [Delivery Markets Lab](starter-projects/fedex-delivery-markets/README.md) | Prototype reference | Synthetic-data, paper-only delivery-market concept demo. |

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

```text
docs/
  ai-workplace-user-guide.md       ← Start here if you are new
  fedex-ai-literacy-guide.md       ← How we align with FedEx's AI program
  fedex-terminology.md             ← Quick reference for operations terms
  getting-started.md
  documentation-standard.md
  pilot-program-template.md        ← Propose a pilot
  demo-script.md                   ← Present this repo to leadership
  governance/                      ← Checklists and policies
  technology/                      ← How-to guides for approved tools
prompts/
  README.md                        ← Copy-paste prompts for daily work
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
  ai-idea-intake-agent/
  fedex-delivery-markets/
assets/
  hero-banner.svg
  dashboard-screenshot.png
  dashboard-preview.svg
  architecture-diagram.svg
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
- Expanding the prompt library with real manager workflows
- Hardening the public data layer in the logistics intelligence app
- Preparing Foundry-ready export paths for when internal data access is approved
- Supporting regional AI Efficiency group presentations and pilot proposals

---

*Questions? Start with the [AI workplace user guide](docs/ai-workplace-user-guide.md) or open an issue.*
