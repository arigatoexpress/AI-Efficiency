# AI Workplace User Guide

Last reviewed: 2026-05-22

This is the beginner guide for FEC supervisors, managers, and team members who
are new to AI. It is written for smart people who are busy, practical, and do not want
technical jargon.

## The One-Sentence Version

AI is a fast assistant that can draft, summarize, organize, compare, and explain
work, but a human still owns the decision, the facts, and the final message.

## What AI Can Help With

Use AI when you need a first draft, a cleaner version, or a second set of eyes.

Good workplace uses:

- turn rough notes into a shift handoff;
- summarize a meeting into action items;
- draft a professional email;
- make a checklist from a process;
- compare options before a manager decision;
- explain a technical topic in plain English;
- create training material from approved source content;
- prepare questions before a review meeting.

## What AI Should Not Do Alone

Do not let AI make final decisions about:

- safety;
- discipline;
- staffing consequences;
- customer promises;
- legal or compliance positions;
- pricing or bid commitments;
- production system changes;
- confidential or regulated data handling.

AI can help prepare a draft. It cannot replace the responsible manager.

## The Three Golden Rules

1. Do not paste sensitive data into an unapproved tool.
2. Do not trust an answer until you check it.
3. Do not send AI-written material externally until a human reviews it.

## Sensitive Data: Keep It Out

Do not paste:

- customer names, addresses, phone numbers, signatures, or photos;
- real tracking numbers;
- route manifests or facility-sensitive operating details;
- employee records or performance details;
- pricing, contract terms, or confidential bid information;
- passwords, tokens, API keys, screenshots with private links, or credentials.

Use placeholders instead:

```text
[Station A]
[Customer group]
[Shift 2]
[Package volume range]
[Issue category]
[Manager role]
```

## What A Prompt Is

A prompt is the instruction you type into AI.

Weak prompt:

```text
Make this better.
```

Stronger prompt:

```text
Rewrite these non-sensitive shift notes into a clear handoff for the incoming
FEC supervisor or manager. Keep it under 250 words. Separate confirmed facts from
items that need verification. End with owners and next steps.

Notes:
[paste scrubbed notes]
```

## The Best Beginner Prompt Formula

Use this structure:

```text
Role: Act as [role].
Task: Help me [task].
Context: Here is the background.
Rules: Do not invent facts. Flag uncertainty. Keep sensitive data out.
Output: Return [format].
```

Example:

```text
Role: Act as a practical FEC supervisor or manager.
Task: Turn my rough notes into a daily brief.
Context: These are scrubbed notes from yesterday's shift.
Rules: Do not invent facts. Flag missing owners and dates.
Output: Return 5 bullets, then a table with Owner, Action, Due Date, Risk.

Notes:
[paste notes]
```

## The Manager Review Checklist

Before using AI output, check:

- Are the facts correct?
- Are dates, numbers, names, and owners correct?
- Did the AI add anything that was not in the source?
- Is anything missing?
- Is the tone right for the audience?
- Is the output safe to share?
- Does a human still own the decision?

## Stoplight Guide

Green: usually safe with approved tools and non-sensitive data.

- summarizing public information;
- rewriting your own notes;
- creating a generic checklist;
- brainstorming training ideas;
- drafting an internal outline with no sensitive data.

Yellow: ask a manager or governance contact first.

- internal process data;
- station or route operations;
- customer-facing language;
- anything connected to a system of record;
- reports that may influence decisions.

Red: do not use without formal approval.

- customer/package data;
- employee records;
- legal, HR, safety, or disciplinary decisions;
- pricing, bids, contracts, or customer commitments;
- live automation that sends messages or changes systems.

## Which Tool Should I Use?

| Tool | Best for | Use with care |
| --- | --- | --- |
| ChatGPT | Drafting, research, project workspaces, analysis, reusable team prompts. | Do not assume private chats are shared unless you share them. Check connected apps before using work data. |
| Microsoft 365 Copilot (paid add-on) | Work inside Outlook, Teams, Word, Excel, PowerPoint, and Microsoft 365 files with Microsoft Graph context. | It can only use content you have permission to access, but sensitive data rules still apply. |
| Microsoft 365 Copilot Chat (included with M365) | Web + uploaded files in the Copilot app, Teams, or Edge with your work account. | Enterprise data protection; still follow the safe-data rules. |
| Gemini | Google ecosystem work, Gemini app, AI Studio prototypes, Workspace features, and newer Google AI tools. | Availability depends on plan, region, device, and company approval. |
| Google AI Studio | Prototyping apps from prompts and exporting code for review. | Use synthetic data until governance approves the use case. |

## Practical Examples

### Shift Handoff

```text
Turn these scrubbed notes into a shift handoff for the incoming operations
manager.

Return:
- What changed
- What is still open
- Risks to check first
- Owner and next step
- Items needing verification

Notes:
[paste notes]
```

### Meeting Notes

```text
Convert these meeting notes into action items.

Return a table:
Owner | Action | Due Date | Dependency | Risk if missed

If the owner or due date is missing, write "Needs assignment" or "Needs date."

Notes:
[paste notes]
```

### Email Draft

```text
Draft a professional internal email from these notes.

Audience:
[role or group]

Purpose:
[what should happen after they read it]

Rules:
- Keep it under 200 words.
- Do not add commitments.
- End with a clear ask.

Notes:
[paste notes]
```

### Process Improvement

```text
Act as a process improvement facilitator.

Problem:
[describe the issue without sensitive data]

Known facts:
[list facts]

Return:
- likely causes to investigate;
- quick checks;
- longer-term fixes;
- data needed;
- risks of acting too soon.
```

## What To Do When AI Is Wrong

Do not argue with it for twenty minutes. Reset the prompt.

Use:

```text
That answer added facts I did not provide. Try again using only the notes below.
If something is missing, put it under "Needs verification."
```

## How To Ask For Sources

Use:

```text
List the source for every important claim. If you cannot cite a source, put the
claim under "Needs verification."
```

For internal work, the source should be an approved internal document, system,
or manager-confirmed fact. For public facts, use the current web only when that
tool is approved.

## How To Save A Good Prompt

If a prompt works:

1. remove any sensitive details;
2. replace specifics with placeholders;
3. add it to the right prompt file in this repo;
4. include who it is for and when to use it.

## 10-Minute Practice Exercise

1. Take a harmless paragraph of notes.
2. Ask AI to summarize it in five bullets.
3. Ask AI to turn it into an email.
4. Ask AI to list what needs verification.
5. Compare the output to the original notes.

The goal is not magic. The goal is faster, cleaner work with human judgment
still in charge.

## Sources For Tool-Specific Sections

- [Google I/O 2026 announcements](https://blog.google/innovation-and-ai/technology/ai/google-io-2026-all-our-announcements/)
- [Google AI Studio at I/O 2026](https://blog.google/innovation-and-ai/technology/developers-tools/google-ai-studio-io-2026/)
- [Google Workspace updates at I/O 2026](https://blog.google/products-and-platforms/products/workspace/workspace-updates/)
- [Apps in ChatGPT](https://help.openai.com/en/articles/11487775-connectors-in-chatgpt)
- [Projects in ChatGPT](https://help.openai.com/en/articles/10169521-using-projects-in-chatgpt)
- [Microsoft 365 Copilot overview](https://learn.microsoft.com/en-us/microsoft-365/copilot/microsoft-365-copilot-overview)
