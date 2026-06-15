# Presentation Day Runbook

Use this checklist the day before or morning of a regional AI Efficiency
presentation. It keeps the demo simple, public-safe, and easy to recover if the
live app or network acts up.

## Who this is for

Anyone presenting the AI Efficiency Team repo, prompt library, or Logistics
Intelligence System prototype to operations leaders.

## When to use it

- The night before a standup, leadership review, or pilot discussion.
- The morning of the meeting, before screen sharing.
- Any time someone else needs to run the demo without extra context.

## What not to do

- Do not show real package, customer, employee, route, or station-confidential
  data.
- Do not open internal dashboards, inboxes, chats, or documents while sharing.
- Do not describe the prototype as production-approved or connected to FedEx
  internal systems.
- Do not promise automation, dispatch decisions, or external messages without
  governance review.

## 20-Minute Prep

- [ ] Open the repo README and confirm the hero, dashboard screenshot, and links
  render cleanly.
- [ ] Open `assets/presentation-deck.html` in a browser and test left/right
  arrow navigation.
- [ ] Open the live Logistics Intelligence System app.
- [ ] Keep a second tab ready with
  `starter-projects/fedex-logistics-intelligence-system/README.md`.
- [ ] Open `prompts/README.md` plus one daily operations prompt and one safety
  prompt.
- [ ] Open `docs/governance/project-review-checklist.md` and
  `docs/pilot-program-template.md`.
- [ ] Close or move any internal FedEx tools, email, chat, or private files away
  from the shared screen.

## Demo Flow

1. README: frame the repo as a public-safe enablement hub.
2. Prompt library: show fast manager value with copy-paste prompts.
3. Logistics app: show one station scenario, one risk signal, and one generated
   manager draft.
4. Governance: show the project checklist and pilot template.
5. Close: ask for feedback, new prompt ideas, and one small pilot candidate.

## Backup Plan

If the live app is slow or unavailable, use the dashboard screenshot in the
README and the browser deck. Say:

> "The live prototype is only one part of the story. The important pattern is
> public or synthetic data, clear source labels, and human review before action."

Then continue with the prompt library, governance checklist, and pilot template.

## Final Talking Points

- This is a regional enablement hub, not a production FedEx system.
- The safest first wins are prompts, drafts, summaries, checklists, and pilots.
- Every AI output needs human review before it becomes a decision or message.
- Public or synthetic data comes first; internal data requires formal approval.
