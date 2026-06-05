# Delivery Markets Lab

> **Part of the [FedEx AI Efficiency Hub](../../index.html).** Public + synthetic data only · human review required.

## What This Is

Delivery Markets Lab is a synthetic-data, paper-only prototype for discussing
how a sensitive operations-adjacent product idea should be reviewed before any
real deployment.

The useful lesson is not "launch this exactly." The useful lesson is how to make
an ambitious prototype tangible while keeping governance, privacy, and safety
visible.

## Who It Helps

- Operations managers learning how to present AI/product ideas responsibly.
- IT and governance reviewers who need a concrete prototype to evaluate.
- The AI efficiency team as an example of safe demo boundaries.

## When To Use It

Use this starter for:

- executive or governance discussion;
- governance review examples;
- prototype storytelling;
- safety-boundary demonstrations;
- synthetic-data app review.

## Do Not Use It For

- real FedEx package data;
- real customer data;
- live FedEx API access;
- live trading, wagering, settlement, or order routing;
- customer communication;
- production operational decisions.

## Safe Data Rules

Use synthetic fixtures only. Do not add real tracking numbers, names, addresses,
delivery photos, route data, employee data, or customer records.

## Status

Prototype reference. Not production. Not approved for live use.

## Source References

- Local source repo: `/Users/aribs/Code/fedex-delivery-markets`
- GitHub source repo: `https://github.com/arigatoexpress/fedex-delivery-markets`
- AI Studio app: `https://ai.studio/apps/6f606096-3be8-4ed9-a3d8-a0b27fde25af`

The AI Studio link redirects to Google sign-in when accessed without an
authenticated Google session. Export source or add scrubbed screenshots before
using that app as the canonical review artifact.

## What It Demonstrates

Delivery Markets Lab is a paper-only, synthetic-data prototype for discussing
how an operations-adjacent AI/product idea should be reviewed before any real
deployment.

- synthetic package fixtures only;
- no real FedEx customer data;
- no production FedEx API access;
- no real money, wagering, settlement, or order routing;
- clear safety and readiness endpoints;
- human-readable docs for governance review.

## Why It Belongs In This Repo

The project is a strong starter for executive review because it shows the
right posture for ambitious AI ideas:

- make the prototype tangible;
- keep data fake until approved;
- expose live-action gates clearly;
- write down risks before asking for scale;
- separate demo value from production approval.

## Suggested Meeting Framing

This is an internal learning artifact. It shows how operations leaders can
prototype quickly while keeping governance in the loop. The project is not a
request to launch a live prediction market. It is a request for a repeatable
review pathway for AI-enabled operations ideas.

## Current Verification From Source Repo

The local source repo contains:

- TypeScript/React frontend;
- Hono API server;
- synthetic tracking fixtures;
- recipient-only claim simulation;
- private AMM paper-order simulation;
- testnet calldata preview;
- security and compliance documentation;
- `npm run verify` for typecheck, tests, and build.

Keep the source repo private unless the team explicitly approves a public
release.

## Next Steps

1. Export or link the AI Studio app source.
2. Add scrubbed screenshots.
3. Update the demo script with the exact current UI flow.
4. Ask governance which data classifications and tool approvals would be needed
   for any future FedEx sandbox version.
5. Keep this repo as the team-facing summary and the source repo as the code
   artifact.

---
### Part of the AI Efficiency platform
- **Hub / all tools:** [../../index.html](../../index.html)
- **Related:** [Google AI Studio guide](../../docs/technology/google-ai-studio-guide.md) (how to build/document a prototype like this safely)
- **Governance:** [Project review checklist](../../docs/governance/project-review-checklist.md)
