# Delivery Markets Lab

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

The useful lesson for this team is not "launch this exactly." The useful lesson
is how to present a sensitive prototype responsibly:

- synthetic package fixtures only;
- no real FedEx customer data;
- no production FedEx API access;
- no real money, wagering, settlement, or order routing;
- clear safety and readiness endpoints;
- human-readable docs for governance review.

## Why It Belongs In This Repo

The project is a strong starter for CTO-office discussion because it shows the
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
