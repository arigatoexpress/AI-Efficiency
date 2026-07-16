# Microsoft Copilot + Teams Playbook for Operations

Last reviewed: 2026-06-20

Our organization mostly works in Microsoft tools — Teams, Outlook, Excel, and
Copilot. This playbook is the operations-specific guide to using them well with
the repo's prompt library: which Copilot you actually have, how Microsoft says
to prompt it, what each level of the operation should use it for, and how to
grow from first prompt to power user.

> **GitHub Copilot vs. Microsoft 365 Copilot:** they share a name but serve
> different jobs. *GitHub Copilot* helps write and understand code inside VS
> Code and the terminal. *Microsoft 365 Copilot* helps with email, meetings,
> documents, and chats inside Outlook, Teams, Word, Excel, and PowerPoint. This
> playbook focuses on the Microsoft 365 work tools; the repo also stays
> model-agnostic, so code examples show how to point GitHub Copilot at
> OpenAI-compatible local endpoints where appropriate.

**Who this is for:** every level, package handler to managing director — the
role guide below is organized by job. **What not to do:** never paste work
content into the free consumer Copilot (copilot.microsoft.com on a personal
device) — it has no enterprise data protection. Work AI happens in the
work-managed tools only.

Companion pages: [prompt library](../../prompts/README.md) ·
[Prompt Explorer](https://raw.githack.com/arigatoexpress/AI-Efficiency/main/prompts/explorer.html) ·
[ChatGPT/Copilot workplace guide](chatgpt-copilot-workplace-guide.md) ·
[agency ladder](agentic-ai-for-operations.md)

## Which Copilot Do You Have?

Four products share the Copilot name. Knowing yours prevents the most common mistakes.

| Tier | What it is | What it can see | Use it for |
| --- | --- | --- | --- |
| **Consumer Copilot** (free, personal) | copilot.microsoft.com on a personal account | Public web only; **no enterprise protection** | Nothing work-related. Ever. |
| **Microsoft 365 Copilot Chat** (included with M365) | The Copilot app in Teams/Edge/m365copilot.com with your work account | Web + files you upload; enterprise data protection; **not** your email/chats/calendar | All of this repo's prompts — paste the prompt, paste scrubbed context, go |
| **Microsoft 365 Copilot** (paid license) | Copilot inside Word, Excel, Outlook, Teams meetings | Everything above **plus** your work emails, files, meetings, and chats via Microsoft Graph ("Work mode") | Same prompts with less pasting — reference files, meetings, and threads directly |
| **GitHub Copilot** (coding assistant) | AI pair-programming in VS Code, JetBrains, Vim/Neovim, and the terminal | Public code plus your open codebase; optional BYOK/local endpoints | Writing, explaining, and reviewing code; see the model-agnostic examples below |

Practical test: if Copilot can summarize a meeting you didn't paste in, you have
the paid Microsoft 365 Copilot license. If not, you have Copilot Chat — every prompt in our library
still works, because they carry their context inside the brackets.

## Prompt Like Microsoft Says To

Microsoft's official guidance for Copilot names **four elements** — and our
prompt library is already built on them:

| Microsoft's element | Meaning | In our prompts |
| --- | --- | --- |
| **Goal** (required) | What you want done | The first line of every prompt |
| **Context** | The situation, who's involved, why | The `[bracket]` fields you fill in |
| **Expectations** | Format, tone, length, audience | The "Return:" / "Rules:" block |
| **Source** | What information to work from | The "paste scrubbed notes" field — or, with a license, a referenced file |

Three habits Microsoft teaches that we adopt as standard:

1. **It's a conversation, not a search box.** The first draft is a starting
   point — reply with "shorter," "make item 3 an owner-and-deadline list,"
   "rewrite for frontline tone." Iterating is using it correctly.
2. **Order matters in long prompts**: instruction first, context second,
   source material last. Our prompts are structured that way on purpose.
3. **Always verify.** Fluent ≠ accurate. Check names, numbers, and dates
   before anything leaves your hands — the Safe Prompt Rule's second half.

**With the paid license**, two upgrades to our prompts: type `/` in the prompt
box to reference a specific file, email, or meeting instead of pasting
(Context IQ), and scope Copilot to a Teams channel to ask about that
workstream's history. The bracket versions remain the portable fallback that
works everywhere — including Gemini and ChatGPT.

## Model-Agnostic Use: GitHub Copilot With Local Or BYOK Endpoints

Microsoft 365 Copilot runs on Microsoft's managed models and does not let users
point it at a local Ollama instance. But *GitHub Copilot* has opened
model-agnostic wiring for developers, which keeps the coding side of the stack
from locking into one provider. These are developer-only options; they do not
change what general managers do in Outlook or Teams.

### GitHub Copilot CLI (terminal) — BYOK / OpenAI-compatible

GitHub Copilot CLI now supports **bring-your-own-key (BYOK)** endpoints that
speak the OpenAI Chat Completions API. That means a local Ollama instance,
vLLM, Azure OpenAI, or another OpenAI-compatible gateway can back Copilot CLI.

Required environment variables:

```bash
export COPILOT_PROVIDER_BASE_URL="http://localhost:11434/v1"   # Ollama OpenAI-compatible endpoint
export COPILOT_PROVIDER_TYPE="openai"                          # openai | azure | anthropic
export COPILOT_PROVIDER_API_KEY="unused"                       # Ollama ignores this by default
export COPILOT_MODEL="qwen2.5-coder:14b"                       # must support tool calling + streaming
```

Then run `copilot` commands as usual. Models must support **tool calling** and
**streaming**; for best results use a model with at least a 128K context window.
See GitHub's `copilot help providers` for provider-specific examples.

### VS Code Copilot Chat — "OAI Compatible" provider

VS Code Copilot Chat now supports adding an **OAI Compatible** provider. This
lets you route chat requests to an OpenAI-compatible base URL such as a local
Ollama server or an internal gateway.

Quick path:

1. Open Copilot Chat (`Ctrl+Shift+I` / `Cmd+Shift+I`).
2. Click the model picker → **Manage Models...**
3. Choose **OAI Compatible**.
4. Enter the base URL (`http://localhost:11434/v1` for local Ollama), an API
   key (any string for default Ollama), and the model ID.

For repeatable configuration, add the provider to VS Code settings:

```json
{
  "oaicopilot.baseUrl": "http://localhost:11434/v1",
  "oaicopilot.models": [
    {
      "id": "qwen2.5-coder:14b",
      "owned_by": "ollama",
      "apiMode": "ollama",
      "context_length": 128000,
      "max_tokens": 4096,
      "temperature": 0
    }
  ]
}
```

> **Enterprise note:** local/BYOK wiring is for local development and approved
> internal gateways only. Do not redirect work-managed Copilot clients to
> personal or unapproved endpoints, and do not use local models for confidential
> FedEx code or data without IT/security review.

## Where Copilot Lives In Your Day

- **Teams meetings** — recaps, action items, "what did I miss" during the
  meeting. Pair with the [meeting prompts](../../prompts/meeting-and-communication.md).
- **Teams chat/channels** — summarize long threads (up to 30 days back with a
  license).
- **Outlook** — thread summaries and reply drafts; pair with the
  professional-email prompt and edit in your own voice.
- **Excel** — natural-language tables, charts, and analysis; pair with the
  [data & reporting prompts](../../prompts/data-and-reporting.md).
- **Frontline Agent** (rolling out in Teams for frontline teams) — Microsoft's
  purpose-built assistant for exactly our workflows: shift-start summaries,
  end-of-shift handover drafts, SOP lookup. If our tenant enables it, the
  prompts in [daily operations](../../prompts/daily-operations.md) are the
  vocabulary to drive it.
- **Researcher / Analyst agents** (with license) — multi-step research and
  data analysis. Useful at senior-manager level and up for synthesis tasks.

## What Each Level Should Use AI For

From public FedEx role descriptions, matched to our library. Find your row,
start with those prompts.

| Level | Highest-value AI uses | Start with |
| --- | --- | --- |
| **Package handlers & couriers** | Plain-language safety briefings; understanding schedules and policies; customer exception wording (couriers) | [Safety huddle brief](../../prompts/safety-and-compliance.md) · [customer comms](../../prompts/customer-and-contractor-comms.md) |
| **Operations administrators** | Turning raw dispatch/compliance data into weekly reports; exception narratives; recurring report templates | [Data & reporting](../../prompts/data-and-reporting.md) · [daily operations](../../prompts/daily-operations.md) |
| **FEC supervisors** | Shift handoffs; coaching notes; safety talking points; escalation messages; schedule-change notices | [Daily operations](../../prompts/daily-operations.md) · [safety](../../prompts/safety-and-compliance.md) |
| **Operations / senior managers** | Performance narratives from metrics; root-cause writeups; staffing plans; budget variance explanations; QDM project charters | [Data & reporting](../../prompts/data-and-reporting.md) · [process improvement](../../prompts/process-improvement.md) |
| **District & regional leaders** | Multi-station synthesis for executive review; strategy and cascade communications; business cases | [Executive update](../../prompts/meeting-and-communication.md) · [bid & opportunity support](../../prompts/bid-and-opportunity-support.md) |

One rule does not vary by level: AI drafts, the person decides, and sensitive
data stays out of the prompt (see the
[governance-safe-use prompts](../../prompts/governance-safe-use.md)).

## Growing Skills: The Four-Level Ladder

The practical maturity path for a non-technical workforce, aligned with the
FedEx AI Education program (see the
[AI literacy guide](../fedex-ai-literacy-guide.md)):

1. **Aware** — knows what AI is and the data rules. Everyone, day one.
2. **User** — runs library prompts for their regular tasks, edits output,
   iterates. Target: most of the team.
3. **Champion** — improves prompts, contributes new ones back to this repo,
   coaches peers. Target: one or two per workgroup; this is how the library
   stays alive instead of going stale.
4. **Builder** — builds governed agents (Copilot Studio on the Microsoft side;
   [our ADK kit](../../starter-projects/adk-shift-brief-agent/README.md) on the
   Google side). Engineering plus governance review.

Useful external credentials (all beginner-friendly, no coding): Microsoft's
**AI Business Professional (AB-730)** certification, the free
**Career Essentials in Generative AI** course (Microsoft + LinkedIn), and
**Google AI Essentials**. Microsoft's
[Copilot Success Kit](https://adoption.microsoft.com/en-us/copilot/success-kit/)
includes a ready-made "Prompt-a-thon" format — a strong candidate for a team
session.

## Agents: The Microsoft Path And Ours

Microsoft now offers four agent-building surfaces, from business-user to
pro-developer:

| Surface | Best for | How it extends Copilot |
| --- | --- | --- |
| **SharePoint agents** | Teams/SharePoint content | Answer questions grounded in a SharePoint site or document library. |
| **Microsoft 365 Agent Builder** (formerly Copilot Studio agent builder) | Business users | Build agents with natural-language instructions and a web UI. |
| **Copilot Studio** | Low-code / IT pros | Build governed agents, add connectors, publish to Teams and M365 Copilot. Now supports **MCP apps** for tool access and the **A2A protocol** for multi-agent coordination. |
| **Declarative agents** (Microsoft 365 Agents Toolkit + VS Code) | Pro-developers | JSON/YAML agents with version control, granular knowledge sources, 90+ connectors, and direct Git-based lifecycle. |

**What changed in 2026:** the agent story has shifted from "Copilot Studio only"
to a spectrum. **Declarative agents** are the pro-developer path and can use the
same open standards as Google's ecosystem: **MCP** (Model Context Protocol) for
tools and **A2A** (Agent-to-Agent Protocol) for coordination. That means our
[ADK shift-brief agent](../../starter-projects/adk-shift-brief-agent/README.md)
has a documented interop path rather than a platform bet. Whichever surface
hosts the first governed agent, the rules from the
[agency ladder](agentic-ai-for-operations.md) apply unchanged: supervised
rungs only, tools are the control surface, human review on every output.

## Accuracy Notes

Microsoft product facts above (tiers, features, agent availability, GA dates)
were verified against learn.microsoft.com and microsoft.com as of the review
date and change quickly — especially agent features. Confirm in our own tenant
before promising a capability; licenses and admin settings decide what is
actually on. FedEx role descriptions summarize public careers material, not
internal policy.

Key references:
[Microsoft 365 Copilot overview](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-overview) ·
[Microsoft 365 Copilot extensibility](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/) ·
[Extend Copilot with declarative agents](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/overview-declarative-agent) ·
[Copilot Studio overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-what-is-copilot-studio) ·
[GitHub Copilot supported AI models](https://docs.github.com/en/copilot/using-github-copilot/ai-models/supported-ai-models-in-copilot) ·
[GitHub Copilot CLI BYOK providers](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-byok-models) ·
[Copilot Prompt Gallery](https://learn.microsoft.com/en-us/copilot/microsoft-365/copilot-prompt-gallery) ·
[Copilot Success Kit](https://adoption.microsoft.com/en-us/copilot/success-kit/)
