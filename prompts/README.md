# Prompt Library

This folder contains copyable prompts for FEC supervisors and managers who are new to AI. Every prompt is designed for **FedEx operations contexts** — stations, sort hubs, P&D, linehaul, and peak season — while keeping sensitive data out.

## How To Use A Prompt

1. Copy a prompt.
2. Replace bracketed sections like `[paste notes here]`.
3. **Remove sensitive data** before using any AI tool.
4. Review the output before sharing or acting.
5. Improve the prompt and submit it back to the repo if it helped.

## Prompt Categories

| Category | Best For | File |
|----------|----------|------|
| [Prompt engineering basics](prompt-engineering-basics.md) | Writing better prompts from scratch | Beginners |
| [Daily operations](daily-operations.md) | Shift briefs, handoffs, escalations, after-action reviews | Any FEC supervisor or manager |
| [Safety and compliance](safety-and-compliance.md) | Safety huddles, near-miss reports, seasonal alerts, safety meeting agendas | Managers with safety responsibilities |
| [Peak season and surge](peak-season-and-surge.md) | Pre-peak planning, surge checklists, post-peak reviews, contractor coordination | Peak planners, sort managers |
| [Meeting and communication](meeting-and-communication.md) | Agendas, action items, emails, executive updates | All managers |
| [Customer and contractor comms](customer-and-contractor-comms.md) | Service alerts, escalation responses, ISP briefings, team recognition | P&D managers, customer-facing roles |
| [Linehaul and routing](linehaul-and-routing.md) | Feeder delays, alternate routing, P&D density, yard management, cross-dock timing | Linehaul managers, dispatch |
| [Process improvement](process-improvement.md) | Root cause analysis, improvement proposals, workflow documentation | Continuous improvement leads |
| [Data and reporting](data-and-reporting.md) | Summarizing metrics, building dashboards, explaining trends | Analysts and data-curious managers |
| [Bid and opportunity support](bid-and-opportunity-support.md) | Proposal drafts, capability summaries, risk assessments | Business development |
| [Governance-safe use](governance-safe-use.md) | Checking if a use case is safe, documenting AI use, review prep | Governance leads, reviewers |

## The Safe Prompt Rule

Never include real customer, employee, package, route, facility-sensitive, or
security-sensitive data unless the tool and workflow are approved for that data.

Use placeholders:

```text
[Station A]
[Shift 2]
[Customer group]
[Package volume range]
[Issue category]
[ISP name — if public and approved]
```

## Standard Output Request

Add this to the end of prompts when you want a practical manager-ready answer:

```text
Keep the answer concise. Separate facts from assumptions. Include "Needs
verification" for anything you cannot confirm. End with owners, next steps, and
risks.
```

## FedEx-Specific Prompt Tips

- Use FedEx terminology correctly. See the [terminology guide](../docs/fedex-terminology.md).
- Frame AI output as **drafts for manager review**, not final decisions.
- Include "Safety Above All" reminders in safety-related prompts.
- Reference the Purple Promise for customer-facing outputs.
- Label peak-season numbers as estimates until verified with internal systems.
