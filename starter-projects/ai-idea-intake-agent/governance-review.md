# AI Idea Intake Agent Governance Review

## Current Status

Concept and governance starter. Not built. Not approved for production.

## Proposed Data

Start with:

- synthetic examples;
- plain-English idea descriptions;
- optional submitter role or work area;
- non-sensitive workflow summaries.

Do not collect:

- customer data;
- package data;
- employee records;
- HR or performance reviews;
- confidential screenshots;
- pricing or bid details;
- credentials;
- production logs.

## Key Governance Questions

- Which platform is approved first: Teams/Copilot, Gemini/Workspace, or another
  intake tool?
- Who owns the AI Ideas channel?
- Who reviews submitted ideas?
- What data classifications are allowed?
- Are screenshots allowed at all in version 0?
- Where are submissions retained?
- How long are submissions retained?
- Who can export ideas to GitHub?
- Should GitHub remain public for this repo, or should sensitive intake live in
  a private repo?

## Risk Table

| Risk | Why it matters | Safe first mitigation |
| --- | --- | --- |
| Sensitive screenshots | Screens may reveal customer, employee, route, or system data. | Disable screenshot ingestion or require manual scrub and review. |
| Employee feedback misuse | Feedback can become HR/performance data. | Keep intake workflow-focused; reject named-person reviews. |
| Over-automation | Bot could appear to approve or build ideas without review. | Human review required before issue, PR, or prototype. |
| Public repo leakage | This repo is public. | Only publish sanitized, approved summaries. |
| Model-training confusion | Employees may think feedback trains a model. | State that submissions build a reviewed knowledge base only. |
| Data retention | Ideas may include accidental sensitive details. | Define retention, deletion, and escalation process before launch. |

## Version 0 Approval Gates

- Platform owner approval.
- Privacy review.
- Security review.
- AI governance review.
- Channel owner named.
- Human reviewers named.
- Screenshot policy decided.
- Public/private repo routing decided.
- Retention period decided.
- Escalation path for accidental sensitive data.

## Recommended First Pilot

- 5 to 10 managers.
- Synthetic or non-sensitive ideas only.
- No screenshot uploads.
- Weekly human-reviewed summary.
- GitHub issues created only from sanitized, approved summaries.
- Success metric: number of useful prompt or guide updates created without
  collecting sensitive data.
