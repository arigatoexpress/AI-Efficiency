# ChatGPT And Copilot Workplace Guide

Last reviewed: 2026-06-20

This guide explains how to use ChatGPT and Microsoft 365 Copilot at work in a
simple, safe way. It is written for FEC supervisors and managers, not engineers.

> Our org works mostly in Microsoft tools — for the operations deep-dive
> (which Copilot you have, Microsoft's four prompt elements, role-by-role
> guidance, Frontline Agent, the skills ladder), see the
> **[Copilot + Teams playbook](copilot-teams-playbook.md)**.

## Simple Difference

ChatGPT is best for flexible drafting, analysis, reusable project workspaces,
and working with connected apps when approved.

Microsoft 365 Copilot is best when your work is already inside Microsoft 365:
Outlook, Teams, Word, Excel, PowerPoint, OneNote, and related files.

Use the tool that is closest to the work, but follow the same safety rules in
both.

## ChatGPT Basics

Use ChatGPT for:

- drafting emails and updates;
- summarizing notes;
- turning rough ideas into structured plans;
- building reusable prompts;
- researching public topics when web search is available;
- organizing long-running work in Projects.

OpenAI's current terminology calls connected tools "apps." Apps can let ChatGPT
search or reference external systems, run deep research across sources, sync
knowledge, or take selected actions depending on the plan and app.

## ChatGPT Projects

Use a Project when the work will continue over time.

Good project examples:

- AI Efficiency Team weekly meeting notes;
- FedEx Logistics Intelligence System review notes;
- executive review preparation;
- prompt library improvements;
- governance review packet.

Project setup:

1. Create a new Project.
2. Add a plain instruction, such as:

```text
Act as a practical FEC supervisor or manager. Be concise. Use plain English. Ask
clarifying questions when needed. Flag anything that requires verification or
governance review.
```

3. Add only approved, non-sensitive sources.
4. Keep project-specific chats inside the project.
5. Share only when the audience is allowed to see the content.

## Microsoft 365 Copilot Basics

Use Microsoft 365 Copilot when you want AI help inside Microsoft work tools:

- Outlook: summarize threads and draft replies.
- Teams: summarize meetings and chats.
- Word: create and edit drafts.
- Excel: ask questions about a spreadsheet or suggest formulas.
- PowerPoint: draft slides from approved material.
- OneNote: organize notes and plans.

Microsoft states that Microsoft 365 Copilot uses organizational data and the web
for licensed users, while Copilot Chat is web-based and can use data the user
provides. Copilot responses should respect the signed-in user's permissions, but
that does not remove the need for company data rules.

> **Developer note (2026):** GitHub Copilot Chat and CLI now let you switch
> models and, for CLI, point at an OpenAI-compatible endpoint such as a local
> Ollama instance (BYOK). That does not change Microsoft 365 Copilot's managed
> model behavior in Outlook/Teams, but it keeps the coding assistant
> model-agnostic. See the [Copilot + Teams playbook](copilot-teams-playbook.md)
> and [model-agnostic examples](copilot-model-agnostic-examples.md) for
> developer snippets.

## Prompt Formula For Both Tools

Use this:

```text
Goal: What do I need?
Context: What should the AI know?
Source: What material should it use?
Rules: What should it avoid?
Output: What format do I want?
```

Example:

```text
Goal: Create a manager-ready summary.
Context: This is for an internal operations update.
Source: Use only the notes below.
Rules: Do not add facts. Put uncertainty under "Needs verification."
Output: Return a short summary, then a table of action items.

Notes:
[paste scrubbed notes]
```

## Everyday Prompt Examples

### Outlook Or Email

```text
Draft a concise internal email from these notes. Keep it professional and direct.
Do not create new commitments. End with a clear ask.

Notes:
[paste notes]
```

### Teams Or Meeting Notes

```text
Summarize this meeting transcript into decisions, open questions, action items,
owners, and due dates. If an owner or date is missing, mark it "Needs assignment"
or "Needs date."
```

### Word Or Docs

```text
Turn this rough outline into a one-page guide for FEC supervisors and managers. Use plain
English, short sections, and a checklist at the end.
```

### Excel Or Reporting

```text
Review this non-sensitive metrics table. Explain what changed, what looks
unusual, what follow-up data is needed, and what decisions should wait for
confirmation.
```

## Privacy And Sharing Rules

- Do not paste sensitive data into unapproved tools.
- Do not share a chat or Project unless every person with access is allowed to
  see the content.
- Do not assume an admin, teammate, or manager can see your private chat unless
  you share it.
- Do not connect an app or file source unless the data is approved for that use.
- Use placeholders for customer, package, employee, route, and pricing details.

## Good Workflow

1. Start with non-sensitive notes.
2. Ask AI for a structured draft.
3. Ask AI to list uncertainty.
4. Check the source.
5. Edit in your own voice.
6. Save the prompt if it worked.

## Official References

- [Apps in ChatGPT](https://help.openai.com/en/articles/11487775-connectors-in-chatgpt)
- [Projects in ChatGPT](https://help.openai.com/en/articles/10169521-using-projects-in-chatgpt)
- [Managing data, sharing, and privacy in ChatGPT Business](https://help.openai.com/en/articles/8798634-managing-data-sharing-and-privacy-in-chatgpt-and-other-ai-chatbots)
- [Microsoft 365 Copilot overview](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-overview)
- [Craft effective prompts for Microsoft 365 Copilot](https://learn.microsoft.com/en-us/training/paths/craft-effective-prompts-copilot-microsoft-365/)
- [GitHub Copilot supported AI models](https://docs.github.com/en/copilot/using-github-copilot/ai-models/supported-ai-models-in-copilot)
