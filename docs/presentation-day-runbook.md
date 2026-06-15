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
- [ ] Keep `docs/presentation-leadership-brief.md` ready as the leave-behind.
- [ ] Keep `docs/pilot-candidate-shortlist.md` ready for the decision
  conversation.
- [ ] Keep `docs/presentation-proof-points.md` ready for Q&A about official
  FedEx alignment.
- [ ] Close or move any internal FedEx tools, email, chat, or private files away
  from the shared screen.

## Demo Flow

1. README: frame the repo as a public-safe enablement hub.
2. Prompt library: show fast manager value with copy-paste prompts.
3. Logistics app: show one station scenario, one risk signal, and one generated
   manager draft.
4. Governance: show the project checklist and pilot template.
5. Close: ask leaders to nominate one pilot owner, approve a 30-day prompt
   intake, and keep internal data out until the checklist is complete.

## Q&A Anchors

**Is this official FedEx software?**

No. It is a regional enablement repo and prototype hub. It aligns with public
FedEx AI direction, but it is not a production product or policy.

**Can we use real FedEx data?**

Not from this repo. Use public or synthetic data until a specific pilot has
approved tools, approved data handling, named owners, and governance signoff.

**Why does this matter now?**

FedEx has publicly announced enterprise AI literacy work and AI-enabled
logistics capabilities. The local opportunity is to help managers practice safe,
useful workflows before moving toward governed pilots.

**What is the ask today?**

Feedback, prompt ideas, and one small candidate pilot with clear data boundaries
and human review.

**Who owns this after the demo?**

Each pilot needs a named owner and backup owner before it starts. Until then,
this repo remains an enablement hub, not an operating workflow.

**What happens if someone submits sensitive data?**

Stop intake for that submission, remove the sensitive content, and do not use it
in public docs, demos, prompts, or AI tools.

**Does employee feedback train a model?**

Not in this repo. Feedback is used to improve prompts and documentation. Any
tool-specific model training or retention question must be answered by the
approved tool owner before use.

**Where would an approved internal-data pilot live?**

Outside this public repo, in an approved FedEx environment with documented
access controls, owners, retention rules, and governance approval.

**What metric decides continue, change, or stop?**

Define it before the pilot starts: time saved, quality score, error rate,
manager corrections, safety issues, and the explicit stop condition.

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
- Public proof points are collected in
  [presentation proof points](presentation-proof-points.md).
- The one-page leave-behind is
  [leadership brief](presentation-leadership-brief.md).
- Candidate first pilots are listed in
  [pilot candidate shortlist](pilot-candidate-shortlist.md).
