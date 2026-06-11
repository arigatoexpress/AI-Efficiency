# Agentic AI For Operations

Last reviewed: 2026-06-09

## What This Is

A plain-English guide to **agentic AI** — AI that can take steps and use tools,
not just answer a single question. It gives the team one shared way to talk
about agents: a four-rung **agency ladder**. The rung an output came from tells
you how much human review it needs.

The one-sentence version: **a chat answers; an agent acts.** Everything else in
this guide is about knowing which one you are looking at, and what that means
for review.

## Who It Helps

- FEC supervisors and managers who hear "AI agents" and want a working mental
  model without engineering language.
- Reviewers who need to judge how much oversight an AI-assisted output needs.
- Engineers looking for where the repo's agent work actually lives (this page
  indexes it; it does not duplicate it).

## Safe Data Rules (Read These First)

- **Public or synthetic data only**, in every rung, until FedEx IT and AI
  governance approve a separate, secured environment.
- **A human reviews every output.** Drafts keep their "Needs manager
  verification" line no matter which rung produced them.
- **Tools are the control surface.** An agent can only do what its tools allow.
  Every tool an agent can call must be justified, because each tool expands the
  agent's blast radius — what it can read, change, or send.
- **No action-taking tools** — nothing that dispatches, reroutes, messages a
  customer, moves money, or writes to an internal system — until governance
  approves an owner and a review path.
- **No internal FedEx package, route, customer, employee, pricing, or security
  data.** This boundary does not move.

## The Agency Ladder

"Agentic" is not a yes/no property. It is a ladder, and each rung up trades
more usefulness for more ways to be wrong. Use the rung to calibrate review.

| Rung | Name | What it does | Where this repo is |
|------|------|--------------|--------------------|
| 1 | **Assistant** | Answers and drafts in one turn. No tools, no steps — you paste context in, it writes text out. | **Live** — the [prompt library](../../prompts/README.md) and the Gemini drafts in [Station Ops Intelligence](../../starter-projects/fedex-logistics-intelligence-system/README.md). |
| 2 | **Tool-using assistant** | Reads a file, searches, or calculates **when you ask it to**. Still one task at a time, still your initiative. | **Live** — the offline apps: load a CSV, get computed signals ([Dock Efficiency Signal Lab](../../starter-projects/dock-efficiency-signal-lab/README.md), [TLH/SPH Efficiency Explorer](../../starter-projects/tlh-sph-efficiency-explorer/README.md)). |
| 3 | **Supervised agent** | Plans a few steps toward a goal, uses approved tools, and **pauses for human sign-off** before anything leaves the boundary. | **Planned** — the [AI idea intake agent](../teams-telegram-agent-roadmap.md), Teams-first, with a human review queue. |
| 4 | **Autonomous agent** | Runs a workflow end-to-end without a human in the loop. | **Not for FedEx operational data** until governance approves a secured environment, an owner, and an audit path. |

The safe habit, before you trust an output: **ask which rung it came from.**
A rung-1 draft needs a fact check. A rung-3 plan needs a person to approve each
consequential step. A rung-4 result on ops data should not exist here yet.

## Worked Example — The Same Task At Three Rungs

Task: prepare a pre-shift huddle brief.

- **Rung 1 (assistant):** you paste scrubbed notes and public weather into the
  [pre-shift huddle prompt](../../prompts/safety-and-compliance.md); the model
  returns a draft. *You* gathered the inputs; review means checking the facts
  you already know.
- **Rung 2 (tool-using assistant):** the Station Ops Intelligence app pulls the
  public weather and road signals itself when you open it, then drafts the
  brief from them. The tool did the fetching; review means checking the labeled
  sources it shows you.
- **Rung 3 (supervised agent):** an agent plans the brief — decides which
  public signals matter today, pulls them, assembles the draft — and then
  **stops** and hands it to you for sign-off before it goes anywhere. Review
  means approving both the draft and the steps it took.

Same task, same data rules, three different review jobs. That is the whole
point of the ladder.

## Where The Engineering Lives

This page is the manager-level map. The engineering detail is indexed, not
duplicated:

- **[Google Cloud + ADK integration](google-cloud-adk-integration.md)** — the
  forward path from direct Gemini calls to a first ADK agent ("draft a shift
  brief from public signals") with read-only, public-data tools, served via
  Vertex AI and hosted on Agent Engine.
- **[ADK shift-brief agent starter kit](../../starter-projects/adk-shift-brief-agent/README.md)**
  — that first agent, now built and tested offline: five read-only tools,
  synthetic signals, CI-enforced guardrails, ready to register when enterprise
  access lands.
- **[Gemini Enterprise readiness](gemini-enterprise-readiness.md)** — what we
  prepare while the access request is pending, and the day-one checklist.
- **[Teams/Telegram intake agent roadmap](../teams-telegram-agent-roadmap.md)**
  — the first real, governed rung-3 agent: idea intake with PII warnings, a
  human review queue, and no automatic external sends.

Everything in both documents stays on public or synthetic data with a human in
the loop until FedEx approves a secured environment.

## Do Not Use It For

- Justifying an action-taking agent because "the ladder has a rung 4." Rung 4
  is listed so we can name what we are **not** building yet.
- Letting any agent touch internal FedEx data, in any rung, in this repo.
- Skipping human review because an output "came from a smarter agent." Higher
  rungs need **more** review, not less.

## How To Start

1. Read the ladder table and find the tools you already use on it.
2. Next time an AI output reaches you, name its rung before you act on it.
3. If you have an idea that needs rung 3 ("it should gather X and propose Y"),
   write it up with the [pilot template](../pilot-program-template.md) — that is
   exactly the kind of pilot the intake agent track wants.

## Review And Approval

Aligned with the [project review checklist](../governance/project-review-checklist.md)
and the [AI use policy](../governance/ai-use-policy.md). Any move of a project
**up** a rung is a governance event: it needs a documented owner, a tool list,
and a review before it runs.

## Status

Reference guide. Rungs 1–2 are live in this repo on public/synthetic data;
rung 3 is a planned, governance-gated pilot; rung 4 is out of scope until
formal approval exists.
