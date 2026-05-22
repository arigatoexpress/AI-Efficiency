# Governance Review Notes

## Project

- Name: FedEx Logistics Intelligence System
- Status: AI Studio and Cloud Run prototype
- Audience: station and regional operations managers
- Current data class: public and synthetic only
- Production status: not production, not approved for live operational use

## Data Used

Allowed in the current prototype:

- public weather data;
- public road condition context;
- public seismic data;
- public location and airport context;
- synthetic station profile data;
- scrubbed manager-entered notes.

Not allowed:

- package tracking numbers;
- customer names, addresses, phone numbers, signatures, or delivery photos;
- employee records or performance notes;
- route manifests;
- facility security details;
- production dispatch data;
- internal FedEx screenshots;
- confidential bids, pricing, contracts, or revenue data.

## AI Behavior

Allowed:

- summarize public signals;
- draft huddle notes;
- draft handoffs;
- draft verification checklists;
- identify missing information;
- suggest what a human should verify.

Not allowed:

- make final operational decisions;
- claim a route, station, or package is affected from public data alone;
- send messages externally;
- trigger dispatch or routing actions;
- train a model from employee notes or screenshots without a separate approved
  data plan.

## Main Risks

| Risk | Mitigation |
| --- | --- |
| Public data mistaken for internal truth. | Show source labels and "needs internal verification" on every output. |
| Prototype appears like an official control system. | Remove command-console language and direct-action buttons. |
| Users paste sensitive information. | Add input warnings, redaction guidance, and intake rules. |
| AI overstates confidence. | Require uncertainty fields and source links. |
| Brand or governance confusion. | State that the app is a prototype and not official policy. |

## Approval Questions

- Is Teams/Copilot, Gemini, AI Studio, or another platform approved for the
  pilot?
- Can managers use public web data in this workflow?
- Can managers enter scrubbed notes?
- Can screenshots be submitted, or should screenshots stay disabled?
- Who reviews generated huddle notes before they are shared?
- Where should logs and submitted ideas be stored?
- What retention period should apply?

## Production Blockers

Do not call this production-ready until:

- source code is exported and reviewed;
- access control is defined;
- data classification is approved;
- public source terms and rate limits are reviewed;
- monitoring and logs are documented;
- owner and backup owner are named;
- human review flow is tested;
- governance approval is recorded.

## Recommended Pilot Boundary

Version 0 should be:

- read-only;
- public and synthetic data only;
- no screenshots;
- no internal system connections;
- no external sends;
- no automatic GitHub writes;
- human review before any shared output.
