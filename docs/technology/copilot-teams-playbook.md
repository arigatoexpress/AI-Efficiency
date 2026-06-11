# Microsoft Copilot + Teams Playbook for Operations

Last reviewed: 2026-06-11

Our organization mostly works in Microsoft tools — Teams, Outlook, Excel, and
Copilot. This playbook is the operations-specific guide to using them well with
the repo's prompt library: which Copilot you actually have, how Microsoft says
to prompt it, what each level of the operation should use it for, and how to
grow from first prompt to power user.

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

Three products share the name. Knowing yours prevents the most common mistakes.

| Tier | What it is | What it can see | Use it for |
| --- | --- | --- | --- |
| **Consumer Copilot** (free, personal) | copilot.microsoft.com on a personal account | Public web only; **no enterprise protection** | Nothing work-related. Ever. |
| **Microsoft 365 Copilot Chat** (included with M365) | The Copilot app in Teams/Edge/m365copilot.com with your work account | Web + files you upload; enterprise data protection; **not** your email/chats/calendar | All of this repo's prompts — paste the prompt, paste scrubbed context, go |
| **Microsoft 365 Copilot** (paid license) | Copilot inside Word, Excel, Outlook, Teams meetings | Everything above **plus** your work emails, files, meetings, and chats ("Work mode") | Same prompts with less pasting — reference files and threads directly |

Practical test: if Copilot can summarize a meeting you didn't paste in, you have
the paid license. If not, you have Copilot Chat — every prompt in our library
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

In the Microsoft ecosystem, custom agents are built in **Copilot Studio** and
governed centrally (agent registry, admin controls, DLP). Copilot Studio
supports the open **MCP** and **A2A** protocols — the same open standards
Google's ecosystem speaks — which means our
[ADK shift-brief agent](../../starter-projects/adk-shift-brief-agent/README.md)
has a documented interop path rather than a platform bet. Whichever side hosts
the first governed agent, the rules from the
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
[Which Copilot is right for you](https://learn.microsoft.com/en-us/microsoft-365/copilot/which-copilot-for-your-organization) ·
[Learn about Copilot prompts](https://support.microsoft.com/en-us/topic/learn-about-copilot-prompts-f6c3b467-f07c-4db1-ae54-ffac96184dd5) ·
[Microsoft 365 for frontline workers](https://learn.microsoft.com/en-us/microsoft-365/frontline/flw-overview) ·
[Copilot Prompt Gallery](https://learn.microsoft.com/en-us/copilot/microsoft-365/copilot-prompt-gallery) ·
[Copilot Success Kit](https://adoption.microsoft.com/en-us/copilot/success-kit/)
