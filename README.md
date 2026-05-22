# AI Efficiency Team

This repository is the working hub for an operations-led AI efficiency team.
It is designed for non-technical FedEx operations managers who want practical,
safe, measurable ways to use AI in daily work.

The goal is simple: turn real operational friction into reusable prompts,
starter projects, user guides, and governance-ready pilot packets.

## Current Focus

- Help managers use AI for daily briefs, meeting notes, escalation summaries,
  route or station planning, process improvement, and training materials.
- Keep every use case grounded in approved data, human review, and measurable
  operational value.
- Build a clean project intake path so team members can propose, document,
  review, and improve AI tools without needing to be software engineers.
- Prepare executive-ready material for IT, AI governance, and CTO-office review.

## Start Here

| Area | What it is |
| --- | --- |
| [Getting started](docs/getting-started.md) | The plain-English first read for team members. |
| [Prompt library](prompts/README.md) | Copyable prompts for non-technical operations managers. |
| [Gemini guide](docs/technology/gemini-for-ops-managers.md) | How to use Gemini well and safely in an operations context. |
| [Google AI Studio guide](docs/technology/google-ai-studio-guide.md) | How we prototype, export, share, and review AI Studio apps. |
| [Governance checklist](docs/governance/project-review-checklist.md) | Review steps before sharing, piloting, or production use. |
| [Starter projects](starter-projects/README.md) | Early project folders the team can build from. |
| [CTO-office brief](docs/meeting-brief-cto-office.md) | Meeting-ready framing, demo notes, and review questions. |

## Team Operating Principles

1. Protect people, customers, and the company first.
2. Use AI for drafts, analysis support, and workflow acceleration, not unchecked
   decisions.
3. Never paste confidential, regulated, customer, employee, package, route,
   security, or proprietary data into public or unapproved AI tools.
4. Keep a human accountable for every external message, operational decision,
   and escalation.
5. Document what the AI touched, what data was used, what was verified, and what
   changed because of it.
6. Prefer small pilots with clear success metrics over broad, vague automation.

## Starter Projects

The first starter folders are:

- [FedEx Ops Bid Assistant](starter-projects/fedex-ops-bid-assistant/README.md):
  the AI Studio project placeholder for the newly published app.
- [Delivery Markets Lab](starter-projects/fedex-delivery-markets/README.md):
  the verified local codebase for the paper-only delivery-market concept.

Delivery Markets Lab references the existing local app at:

```text
/Users/aribs/Code/fedex-delivery-markets
```

That app is a paper-only, synthetic-data delivery-market concept demo. It is
useful as a governance conversation starter because it clearly separates:

- synthetic data from production FedEx data;
- paper/testnet simulation from real money or live orders;
- prototype learning from approved production deployment.

The Google AI Studio project link currently requires Google sign-in before the
app contents are visible:

```text
https://ai.studio/apps/6f606096-3be8-4ed9-a3d8-a0b27fde25af
```

When the app source is exported from AI Studio, add it under
`starter-projects/fedex-ops-bid-assistant/` or link the GitHub export in that
starter README.

## Repository Structure

```text
docs/
  getting-started.md
  meeting-brief-cto-office.md
  governance/
  technology/
prompts/
  README.md
  daily-operations.md
  meeting-and-communication.md
  process-improvement.md
  data-and-reporting.md
  bid-and-opportunity-support.md
  governance-safe-use.md
starter-projects/
  README.md
  fedex-ops-bid-assistant/
  fedex-delivery-markets/
.github/
  ISSUE_TEMPLATE/
```

## What Belongs Here

- Safe prompts that improve manager productivity.
- User guides written for non-technical operators.
- Pilot ideas with expected value, data needs, risks, and owners.
- Documentation for approved technology experiments such as Gemini and Google AI
  Studio.
- Governance-ready demo scripts, checklists, and meeting notes.

## What Does Not Belong Here

- Secrets, API keys, tokens, passwords, credentials, or private links.
- Real package tracking numbers, customer names, addresses, phone numbers,
  delivery photos, signatures, GPS traces, route manifests, or employee records.
- Live trading, wagering, money movement, order signing, or production customer
  communication automation.
- Material that implies official FedEx policy, endorsement, or production
  approval before that approval exists.

## How To Contribute

1. Open an issue using one of the templates.
2. Add or edit docs in a small pull request.
3. Include the use case, audience, data classification, expected benefit, and
   review status.
4. Ask for governance review before anything touches confidential data,
   production systems, customer communication, or external sharing.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full process.

## Status

This is an initialization pass. The repo is ready for team documentation,
prompt collection, and starter project intake. It is not a production system
and should not be used with confidential or regulated data until the proper
FedEx approvals are in place.
