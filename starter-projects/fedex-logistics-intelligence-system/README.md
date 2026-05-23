# FedEx Logistics Intelligence System

## What This Is

FedEx Logistics Intelligence System is the Google AI Studio and Cloud Run
prototype for a station-ops intelligence console.

The useful product idea is simple: give operations managers one calm place to
review public external risk signals before a shift, especially weather, road,
airport, and regional disruption context.

This is not a production FedEx system. It is not connected to internal FedEx
package, route, employee, customer, security, or facility systems.

## Who It Helps

- Station and sort managers preparing a shift plan.
- Linehaul and feeder leaders watching public disruption signals.
- Regional AI efficiency team members who need a compelling but safe demo.
- IT and AI governance reviewers who need clear data boundaries.

## Current Verified App

Verified on 2026-05-23 through Google Cloud:

- AI Studio app:
  `https://ai.studio/apps/6f606096-3be8-4ed9-a3d8-a0b27fde25af`
- Cloud Run service:
  `fedex-logistics-intelligence-system`
- Public Cloud Run URL:
  `https://fedex-logistics-intelligence-system-s77j6bxyra-ue.a.run.app`
- Deployment label:
  managed by Google AI Studio
- Current source status:
  compiled deployment artifact with a live map-control hotfix; source should
  still be exported from AI Studio or rebuilt cleanly from this starter.

## What The Current Demo Does Well

- It immediately feels like an operations tool, not a generic chatbot.
- It focuses on mountain-region station risk, which is concrete and memorable.
- It uses public weather and seismic feeds for a more realistic story.
- It gives managers a visual way to discuss pass closures, detours, and feeder
  disruption.
- The live map controls and legend are now visible on desktop and phone-sized
  screens after the 2026-05-23 cache-busted v4 patch.

## What Must Be Improved

Before showing broadly, the app should be reframed from "command console" to
"manager decision-support prototype."

Replace or remove:

- fake CCTV claims;
- fake parcel audit counts;
- fake "authorized personnel" security language;
- fake production telemetry labels;
- direct "reroute command" language;
- any wording that implies official FedEx operational authority.

Add:

- a visible "prototype only" banner;
- source links for each public signal;
- clear labels for synthetic values;
- plain-English manager summaries;
- human review checkpoints;
- no live-action buttons.

## Best Station-Ops Use Cases

1. Morning readiness brief.
2. Weather and road risk summary.
3. Pass-closure impact checklist.
4. Shift handoff draft.
5. After-action summary after a disruption.
6. AI idea intake from managers who want a new workflow.

See [manager workflows](manager-workflows.md) for examples.

## Public Data Strategy

Use public, non-sensitive sources only:

- National Weather Service forecasts and alerts.
- Open-Meteo weather model forecasts.
- USGS earthquake event data.
- COtrip public road condition context.
- public FedEx location pages.
- public Gunnison airport information.

See [OSINT data map](osint-data-map.md) for source notes and cautions.

## Recommended V2 Product Shape

The next version should have five manager-friendly panels:

| Panel | Purpose |
| --- | --- |
| Shift Readiness | Shows the top three public risks for the next shift. |
| Station Impact | Explains what a public signal could mean for staffing, dock flow, and handoff quality. |
| Route Watch | Tracks public road, weather, and airport-adjacent risks without claiming internal route knowledge. |
| Manager Drafts | Generates shift briefs, escalation drafts, and after-action summaries. |
| Source Trail | Lists every public source used and what still needs human verification. |

## Safe Demo Positioning

Use this sentence:

```text
This is a public-data decision-support prototype. It helps managers notice and
explain regional risk faster, but it does not make operational decisions and it
does not use FedEx internal data.
```

## Do Not Use This For

- real package tracking;
- customer records;
- employee records;
- production route manifests;
- live dispatch commands;
- safety decisions without a human owner;
- external customer messages;
- confidential FedEx operational data.

## Next Engineering Step

First choice: export the AI Studio source to GitHub and replace the compiled
artifact with reviewable source code.

Second choice: rebuild the app as a clean React and Cloud Run starter using
[the AI Studio V2 prompt](ai-studio-v2-prompt.md).

Either path should keep the repo public-safe and should not introduce secrets,
private links, or internal data.

## Foundry Track

The regional-intel workbench now has a Foundry-ready export and Kadima discovery
slice for this prototype.

Current state as of 2026-05-23:

- Kadima connectivity verified through the existing Foundry configuration.
- Ontology metadata is readable.
- The public/synthetic logistics packet exports cleanly with zero dropped rows.
- Upload is intentionally dry-run blocked until approved dataset RIDs are mapped
  for the regional and logistics object files.

See [the Foundry integration roadmap](../../docs/foundry-integration-roadmap.md)
for the governed deployment path.
