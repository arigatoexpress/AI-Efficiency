# AI Efficiency Team — Standup Demo Script

Use this script for a 10–15 minute walkthrough of the AI-Efficiency repo and the Logistics Intelligence System prototype.

## Audience

FedEx regional AI Efficiency group — mix of technical and non-technical operations leaders.

## Setup (Before the Meeting)

- [ ] Repo is public and README renders correctly
- [ ] Logistics Intelligence System app is running locally or deployed
- [ ] Browser tab open to the app dashboard
- [ ] Second tab open to the repo README
- [ ] Prompts folder ready to show
- [ ] No real data, secrets, or internal dashboards visible

---

## Opening (1 minute)

> "This repo is our operations-led AI efficiency hub. It is not a production FedEx system. It is a collection of prompts, guides, starter projects, and governance templates that any FedEx FEC supervisor or manager can use to get started with AI safely and productively."

> "Everything here uses public or synthetic data until formal governance approval is in place. That is intentional — we want to show value first, then scale responsibly."

---

## The README and Start Here Path (2 minutes)

**Show:** README.md

**Say:**
> "The README is written for a non-technical FEC supervisor or manager first. The 'Start Here' table tells them exactly where to click based on what they need."

**Point out:**
- The featured project section with the live screenshot
- The "Team Operating Principles" — especially #3 about never pasting sensitive data
- The "What Belongs Here / What Does Not Belong Here" boundaries

**Transition:**
> "Let's look at the prompts, because that is where most managers will start."

---

## The Prompt Library (3 minutes)

**Show:** `prompts/README.md` and open 2–3 specific prompt files

**Say:**
> "The prompt library is organized by what managers actually do every day. Not 'AI prompt engineering theory' — real tasks."

**Demo flow:**
1. Open `prompts/daily-operations.md` — show the Daily Manager Brief
2. Open `prompts/safety-and-compliance.md` — show the Pre-Shift Safety Huddle
3. Open `prompts/peak-season-and-surge.md` — show the Pre-Peak Contingency Brief

**Key message:**
> "Every prompt includes the safe-prompt rule: remove sensitive data first, review output before sharing, and keep a human in charge of every decision."

**Transition:**
> "Prompts are the quick win. The starter projects show what is possible when we build small tools around those workflows."

---

## Logistics Intelligence System Demo (5 minutes)

**Show:** The running app

**Say:**
> "This is our most mature starter project — a public-data decision-support dashboard for station-level FEC supervisors and managers. It is built with React and Express, and it uses Gemini for AI-generated briefs."

**Walk through each panel:**

### Shift Readiness
> "This panel shows public weather and road risk signals before a shift starts. Every data point is labeled as public fact, forecast, or synthetic demo. Managers know exactly what they can trust and what they need to verify internally."

### Station Impact
> "This shows how public signals might affect station operations — but it is explicitly framed as a decision-support tool, not a dispatch system. Nothing here touches real package data, route manifests, or customer information."

### Route Watch
> "Public road conditions from COtrip, weather alerts from NWS. If I-70 Vail Pass is closed, a manager sees it here first, then verifies with their own dispatch."

### Manager Drafts
> "Here is where Gemini helps. The manager selects a brief type — pre-shift, handoff, or after-action — and the system generates a draft using only the public signals already on screen."

**Click the Generate button** (or show a pre-generated draft)

> "Notice the language: 'Needs manager verification.' 'Synthetic demo value.' 'Verify with local conditions.' The AI never pretends to know real FedEx operations. It accelerates the manager's work; it does not replace their judgment."

### Source Trail
> "Every signal has a source link. If a senior leader asks 'where did that number come from?' the answer is right here — and it is a public source, not an internal system we are not allowed to expose."

**Transition:**
> "The app is a prototype. The governance behind it is what makes it safe to show."

---

## Governance and Pilot Readiness (2 minutes)

**Show:** `docs/governance/project-review-checklist.md` and `docs/pilot-program-template.md`

**Say:**
> "We are not asking anyone to approve production AI today. We are asking them to approve a pilot — a small experiment with synthetic data, clear metrics, and a human review step."

**Point out:**
- The 6-part review checklist
- The demo readiness checklist (no real data, no secrets, known limitations stated up front)
- The pilot template with success criteria, failure criteria, and risk review

**Key message:**
> "This is how we scale responsibly. Small pilots. Clear metrics. Synthetic data first. Then we bring IT, legal, and compliance into the conversation with evidence, not just ideas."

---

## Closing (1 minute)

**Say:**
> "FedEx is investing in AI literacy across the enterprise. This repo is our regional contribution to that effort — built by operations people, for operations people, with safety and governance built in from day one."

> "The repo is public. The prompts are copy-paste ready. The app is open source. We welcome feedback, improvements, and new pilot ideas from anyone in this group."

**Call to action:**
> "If you are a manager, start with the prompts. If you are technical, look at the starter projects. If you are a leader, use the pilot template to propose your first experiment. And if you have questions about governance, the checklist is your first stop."

---

## Q&A Prep

**Q: Can we use this with real FedEx data?**
> "Not yet. The repo is designed for public and synthetic data until your local governance approves a specific use case. The pilot template shows exactly how to propose that."

**Q: Is this an official FedEx product?**
> "No. This is a regional AI Efficiency team initiative. It aligns with FedEx's AI Education program, but it is not an official FedEx production system."

**Q: What about data security?**
> "No secrets, no customer data, no employee records, and no package information ever go into this repo or the prototype app. That is a hard boundary."

**Q: How do I contribute?**
> "Open an issue or a pull request. Every contribution needs a use case, audience, data classification, and expected benefit. See CONTRIBUTING.md."

**Q: What is next?**
> "We are hardening the public data layer, exploring a Foundry export path for when internal data access is approved, and collecting more prompts from real manager workflows."

---

*Demo script version: 2026-05-27. Adjust timing based on audience questions and technical depth.*
