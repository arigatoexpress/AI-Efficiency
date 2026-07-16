# How It Works: The ADK Shift-Brief Agent

*Part of the [How It Works series](README.md) — real systems, real runs, no mockups.*

## What This Is

Our first real **AI agent** — not a chatbot with a long prompt, but a model
that decides which tools to call, calls them, and assembles the results. Built
on Google's Agent Development Kit (ADK), the same framework the forward path
(Vertex AI Agent Engine, Gemini Enterprise) expects. It drafts shift briefs
from labeled synthetic signals through **read-only tools** — and the guardrails
are enforced by code and CI, not by politeness.

## What "Agent" Actually Means Here

A plain prompt gets one answer from whatever context you pasted in. An agent
runs a loop: the model reads your request, picks a tool, sees the result, picks
the next tool, and only then writes. The critical design decision is that **the
model never touches data directly — it can only work through the tools we hand
it**, and every one of our tools is read-only.

```text
  You: "Draft a pre-shift huddle brief for GUC (Gunnison)."
        │
        ▼
  ┌───────────────────────────── ADK AGENT LOOP ───────────────────────────┐
  │                                                                        │
  │   Gemini 2.5 Flash  ◀──────────── guardrail INSTRUCTION baked into     │
  │   (swappable via SHIFT_BRIEF_MODEL)           the agent definition     │
  │        │                                                               │
  │        │  decides which tool to call, one at a time:                   │
  │        ▼                                                               │
  │   ┌───────────────────── 5 TOOLS — ALL READ-ONLY ──────────────────┐   │
  │   │ list_stations()             → which stations exist             │   │
  │   │ get_public_weather(GUC)     → labeled synthetic weather        │   │
  │   │ get_public_road_context(GUC)→ labeled synthetic road status    │   │
  │   │ check_data_safety(text)     → regex gate: tracking-number      │   │
  │   │                               patterns, emails, phone numbers, │   │
  │   │                               confidentiality markers          │   │
  │   │ format_brief(GUC, type)     → markdown skeleton that KEEPS     │   │
  │   │                               every source label + footer      │   │
  │   └──────────────────────────────┬──────────────────────────────── ┘   │
  │                                  │ tools read ONLY from                │
  │                                  ▼ sample_signals.json                 │
  │            ┌───────────────────────────────────────────┐               │
  │            │ sample_signals.json — every entry labeled: │              │
  │            │ "SYNTHETIC DEMO (would be: public NWS      │               │
  │            │  forecast / CDOT advisory / ...)"          │               │
  │            └───────────────────────────────────────────┘               │
  │                                                                        │
  │   There is NO send tool. NO dispatch tool. NO write tool.              │
  │   The agent cannot act on the world even if asked to.                  │
  └────────────────────────────────┬───────────────────────────────────────┘
                                   ▼
   Draft brief, always ending verbatim:
   "Needs manager verification — AI draft from labeled public/synthetic
    signals only."
```

## Proof the Guardrails Hold: A Real Verification Run

The guardrails are tested offline — no API key, no network, no ADK install
needed — and CI runs this on every pull request. Captured from this repo:

```text
$ python3 starter-projects/adk-shift-brief-agent/test/run_checks.py

PASS  format_brief skeleton keeps source labels
PASS  format_brief requires the review footer
PASS  format_brief rejects unknown brief types
PASS  safety gate flags tracking-number-like content
PASS  safety gate flags emails and phone numbers
PASS  safety gate flags confidentiality markers
PASS  safety gate passes clean operational text
PASS  tools import no network modules
PASS  no send/dispatch/write tool surface

ALL CHECKS PASSED
```

Read those last two lines again — the test suite *proves* the tools import no
network modules and that no tool can send, dispatch, or write. If a future
change added an outbound capability, CI would fail before it merged.

## Why This Matters for the Forward Path

This is the pattern every future agent in the hub inherits:

1. **Tools define the blast radius.** The model can only do what the tools
   allow, and the tools are the review surface.
2. **Labels travel with the data.** Signals arrive labeled synthetic/public and
   the brief must keep the labels.
3. **The guardrails are tests, not promises.** CI enforces them per PR.
4. **Swap the data, keep the pattern.** In a governed pilot, the two lookup
   tools re-point at real public NWS/DOT feeds — nothing else changes.

When Gemini Enterprise access lands, this agent is ready to register as-is.

## Try It Yourself

```bash
cd starter-projects/adk-shift-brief-agent
pip install -r requirements.txt        # one dependency: google-adk
python3 test/run_checks.py             # guardrail checks, no key needed
adk run shift_brief_agent              # terminal chat (needs a Gemini key)
```

Full project docs: [starter project page](../../starter-projects/adk-shift-brief-agent/README.md).
