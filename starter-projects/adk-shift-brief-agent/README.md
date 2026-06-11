# ADK Shift-Brief Agent — Starter Kit

> **Part of the [FedEx AI Efficiency Hub](../../README.md).** Public + synthetic data only · human review required.

The first runnable agent from the
[Google Cloud + ADK forward-path guide](../../docs/technology/google-cloud-adk-integration.md):
**"draft a shift brief from public signals, for manager review."** Built with
Google's open-source [Agent Development Kit (ADK)](https://google.github.io/adk-docs/),
and structured so an admin can register it into
[Gemini Enterprise](../../docs/technology/gemini-enterprise-readiness.md) when
our access lands.

It is also the **template**: copy this folder, swap the tools and instruction,
and you have the team's next agent with the guardrails already in place.

## Why the design is safe by construction

An ADK agent can only do what its tools allow — the tools are the control
surface. This agent's five tools are all read-only and fully offline:

| Tool | What it does | What it can't do |
| --- | --- | --- |
| `list_stations` | Lists the demo stations | — |
| `get_public_weather` | Labeled synthetic weather signals | No network; no real feeds yet |
| `get_public_road_context` | Labeled synthetic road signals | No network; no real feeds yet |
| `check_data_safety` | Flags tracking-number/email/phone/confidential patterns before use | A pass is a seatbelt, not a guarantee |
| `format_brief` | Assembles the labeled draft skeleton + mandatory review footer | Cannot send or save anything |

There is no tool that writes, sends, dispatches, reroutes, or reads anything
outside `sample_signals.json` (clearly labeled **synthetic demo data**). Every
draft must end with: *"Needs manager verification — AI draft from labeled
public/synthetic signals only."* In a governed pilot, the two lookup tools get
re-pointed at the same public NWS / DOT feeds the
[logistics intelligence app](../fedex-logistics-intelligence-system/README.md)
already uses — the agent itself does not change.

## Run the checks (no key, no network, no install)

```bash
python3 test/run_checks.py
```

This verifies the tools, the safety gate, the offline guarantee, and (when
google-adk is installed) the agent wiring. CI runs it on every PR.

## Run the agent (needs a Gemini API key or Vertex AI access)

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then fill in ONE auth path; .env is gitignored
adk run shift_brief_agent      # terminal chat
adk web                        # or the local dev UI
```

Try: *"Draft a pre-shift huddle for MEM."* The first **live** run should happen
under the enterprise account once access lands — not a personal key. See the
[Gemini Enterprise readiness page](../../docs/technology/gemini-enterprise-readiness.md).

**Model-agnostic by design:** the model is one string, overridable without a
code change (`SHIFT_BRIEF_MODEL` in `.env`). ADK also supports non-Gemini
models through its LiteLLM integration, so the same agent, tools, and
guardrail tests survive a model swap. Everything else is standard library —
the kit runs the same on any OS and hardware that runs Python 3.

## Files

| File | Purpose |
| --- | --- |
| `shift_brief_agent/agent.py` | The agent: model, instruction, guardrails, tools |
| `shift_brief_agent/tools.py` | The five read-only tools (pure standard library) |
| `shift_brief_agent/sample_signals.json` | Labeled synthetic demo signals |
| `test/run_checks.py` | Offline checks — run by CI |
| `requirements.txt` | `google-adk` pinned to the tested version |
| `.env.example` | Auth template (real `.env` stays gitignored) |
| `governance-review.md` | Data, risk, and approval notes |
| `demo-script.md` | Safe walkthrough for presenting it |

## What this is **not**

Not a production system, not connected to any FedEx data or feed, and not
authorized to take actions. It is the smallest honest demonstration of the
forward path: the same agent, governance-reviewed and admin-registered, is what
the team would pilot inside Gemini Enterprise.

---
### Part of the AI Efficiency platform
- **Hub / all tools:** [repo README](../../README.md) · [interactive hub page](https://raw.githack.com/arigatoexpress/AI-Efficiency/main/index.html)
- **Related:** [Google Cloud + ADK guide](../../docs/technology/google-cloud-adk-integration.md) · [Gemini Enterprise readiness](../../docs/technology/gemini-enterprise-readiness.md) · [Agentic AI for operations](../../docs/technology/agentic-ai-for-operations.md)
- **Governance:** [Project review checklist](../../docs/governance/project-review-checklist.md)
