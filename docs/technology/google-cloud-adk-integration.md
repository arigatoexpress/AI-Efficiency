# Google Cloud, Vertex AI, and the Agent Development Kit (ADK)

Last reviewed: 2026-06-02

This guide explains the forward path for the logistics intelligence app: how it
moves from a quick Gemini prototype toward a governed, agent-based system on
Google Cloud. It is written for two audiences. The first sections are for
FEC supervisors and managers. The later sections are for engineers.

This is **not** approval to use confidential FedEx data. Everything here stays on
public, synthetic, or derived-public data, with a human reviewing every output,
until FedEx IT and AI governance approve a separate, secured environment. This is
not an official FedEx system.

Official references:

- [Vertex AI documentation](https://cloud.google.com/vertex-ai/docs)
- [Vertex AI Agent Engine](https://cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/overview)
- [Agent Development Kit (ADK) docs](https://google.github.io/adk-docs/)
- [ADK on GitHub](https://github.com/google/adk-python)
- [Gemini API quickstart](https://ai.google.dev/gemini-api/docs/quickstart)
- [Google AI Studio quickstart](https://ai.google.dev/gemini-api/docs/ai-studio-quickstart)
- [Cloud Run documentation](https://cloud.google.com/run/docs)

## The Stack In Plain English

Think of this as a path from "quick demo" to "supported product," one approved
step at a time.

| Stage | Tool | What it does for us |
| --- | --- | --- |
| Prototype | **Google AI Studio** | Turn an idea into a working Gemini demo fast. Where the current app started. |
| Model serving | **Gemini API / Vertex AI** | The actual AI model that drafts text. Vertex AI is the enterprise-grade way to serve it on Google Cloud. |
| Agent building | **Agent Development Kit (ADK)** | An open-source toolkit for building an "agent" — an assistant that can follow steps and use tools, not just answer once. |
| Agent hosting | **Vertex AI Agent Engine** | A managed Google Cloud runtime that runs an ADK agent for you, so we do not have to build and babysit the plumbing. |
| App hosting | **Cloud Run** | Where our React/Vite + Express app already runs. Scales up and down automatically. |
| Governed data (future) | **Palantir Foundry** | Gated. Only used later, after governance approves internal data, with provenance and access controls. |

The short version: **AI Studio is where we sketch. Vertex AI is where the model
runs for real. ADK is how we build a more capable assistant. Agent Engine is
where that assistant lives. Cloud Run is where managers reach the app. Foundry
stays behind a locked door until governance opens it.**

## What ADK Is (For Managers)

The Agent Development Kit is Google's open-source toolkit for building AI agents.
An **agent** is an AI assistant that can take a goal, work through a few steps,
and use approved "tools" (like a weather lookup) to finish a task — instead of
just answering a single question.

For us, the first useful agent is small and safe: **"draft a shift brief from
public signals."** Today the app already calls Gemini once to write that draft.
ADK lets us make that same drafting step more reliable — it can pull the public
weather and road signals itself, organize them, and return a clearly-labeled
draft for a manager to review.

Nothing about ADK removes the human. Every draft still says "Needs manager
verification," and no agent sends messages, dispatches routes, or touches
internal data.

## What ADK Is (For Engineers)

ADK is an open-source framework (Python is the most mature; other language
support is developing) for defining and running agents. The pieces that matter:

- **Agents** — a model (a Gemini model, served via Vertex AI or the Gemini API)
  plus instructions, plus a set of tools it is allowed to call. ADK supports
  single agents and multi-agent setups where a coordinator delegates to
  sub-agents.
- **Tools** — typed functions the agent may invoke (for example, "fetch the NWS
  alert for this station," "format a brief"). Tools are the control surface:
  an agent can only do what its tools allow, which is exactly where our
  guardrails live.
- **Orchestration** — ADK handles the loop of model reasoning, tool calls, and
  result handling, plus session and state management, so we are not writing that
  glue by hand.
- **Runtime portability** — an ADK agent can run locally for development and the
  same agent can be deployed to a managed runtime. **Vertex AI Agent Engine** is
  Google's managed runtime for hosting agents in production, handling sessions,
  scaling, and observability.

### The ManagerDrafts Call As The First ADK Agent

The app's `ManagerDrafts` panel (see
[`app/src/components/ManagerDrafts.tsx`](../../starter-projects/fedex-logistics-intelligence-system/app/src/components/ManagerDrafts.tsx))
already makes a server-side Gemini call to draft a pre-shift huddle, shift
handoff, or after-action summary, with a local template fallback when Gemini is
unavailable. That single call is the natural seam for the first ADK agent.

A conservative first design:

- **Agent goal:** "Draft a shift brief from public signals for review."
- **Tools (read-only, public data only):**
  - `get_public_weather(station)` — wraps the existing NWS / Open-Meteo lookups.
  - `get_public_road_context(station)` — wraps the existing public road feeds.
  - `format_brief(signals, brief_type)` — assembles the labeled draft.
- **Hard constraints baked into the agent and its tools:**
  - no tool that writes, sends, dispatches, or reroutes;
  - no tool that reads internal FedEx package, route, customer, employee, or
    security data;
  - every output carries source labels and a "Needs manager verification" line;
  - the existing local-template fallback path is preserved.

This keeps the agent's behavior bounded by the tools we hand it. The agent can
reason about which public signals matter, but it cannot act outside the
read-only, public-data surface we define.

## Where The Repo Is Today

The logistics intelligence app today is:

- **Prototyped in Google AI Studio** — the original demo and the
  `ai.studio` app link documented in the
  [Google AI Studio guide](google-ai-studio-guide.md).
- **Running on Cloud Run** — the live service is
  `fedex-logistics-intelligence-system`, deployed from a compiled AI Studio
  artifact, with a source-owned rebuild in the
  [starter project](../../starter-projects/fedex-logistics-intelligence-system/README.md).
- **Calling Gemini directly** — a single server-side Gemini call drafts manager
  briefs, with API keys kept server-side and a graceful local fallback.
- **Public/synthetic data only** — every signal is labeled public fact, model
  forecast, or synthetic demo; no internal FedEx data is connected.

In stack terms: we are at **AI Studio + direct Gemini calls on Cloud Run.** We
have not yet introduced ADK, Agent Engine, or any internal data.

## Where ADK Fits Next

A realistic, low-risk migration — each step is reviewable and reversible, and
none of it requires internal data:

1. **Move model serving toward Vertex AI.** Keep the same single drafting call,
   but serve the Gemini model through Vertex AI for enterprise-grade access
   controls, logging, and region settings. The app's behavior does not change
   for managers.
2. **Wrap the drafting call as one ADK agent.** Re-express the existing
   `ManagerDrafts` Gemini call as the "draft a shift brief from public signals"
   agent described above, with read-only public-data tools. Run it locally
   first; the app keeps its template fallback.
3. **Host the agent on Vertex AI Agent Engine.** Deploy the same agent to the
   managed runtime so the Express backend calls the hosted agent instead of
   making the model call directly. Cloud Run still serves the React/Vite app and
   the Express API.
4. **Keep the app on Cloud Run.** No change to where managers reach the product.
   The architecture becomes: Cloud Run app -> Agent Engine (ADK agent) ->
   Gemini via Vertex AI -> labeled draft -> manager review.

Each step is independently demonstrable for the regional presentation. None of
them broadens the data envelope.

## What Stays Gated Until Governance Approves

The following remain behind a **governance gate** and must not be built into a
live path until FedEx IT and AI governance approve a separate, secured
environment with the proper data classifications and access controls:

- **Palantir Foundry / internal data.** Any connection to governed internal data
  follows the [Foundry integration roadmap](../foundry-integration-roadmap.md):
  deterministic, provenance-checked export packets first; live Foundry datasets
  only after approved dataset RIDs and review rules exist. Today this is
  dry-run blocked.
- **Any tool that takes an action** — dispatch, reroute, customer messaging,
  payments, file writes, connected-app actions — stays out of every agent until
  there is an approved owner and governance sign-off.
- **Internal package, route, customer, employee, pricing, or security data** —
  never enters a public agent or a public repo. This boundary does not move.

## Governance Guardrails (Unchanged)

These rules carry over from the rest of the repo and apply to every stage above:

- **Public or synthetic data only** until a separate secured environment is
  approved.
- **Human-in-the-loop on every output.** Agents draft; managers decide. Every
  draft keeps its "Needs manager verification" line.
- **Not an official FedEx system.** Nothing here implies production authority or
  FedEx endorsement.
- **No internal package, route, customer, employee, or security data**, ever, in
  this workflow.
- **Tools are the control surface.** An agent can only do what its tools permit,
  so guardrails are enforced by limiting tools to read-only public data.

## Accuracy Notes

Product facts are described conservatively and may change; confirm against the
official references above before committing to specifics in a pilot:

- **ADK** is Google's open-source Agent Development Kit for building agents.
- **Vertex AI Agent Engine** is Google's managed runtime for hosting agents.
- **Gemini models** are served via Vertex AI and the Gemini API.
- **Cloud Run** is Google Cloud's managed container service, where the app runs.
- **Palantir Foundry** is a separate, governed internal-data platform and is
  gated in this repo.

Availability, regions, model versions, and pricing depend on Google terms,
account configuration, and company policy. Do not promise a capability until
someone has confirmed it in the approved account.

## Manager Rule (Carried Over)

If an agent suggests taking an action, sending something, changing a file, or
using connected or internal data, stop and ask:

- Is this tool approved for that data?
- Do I understand what action will happen?
- Would I be comfortable explaining this to governance?
- Has a human owner reviewed it?
