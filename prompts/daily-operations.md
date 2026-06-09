# Daily Operations Prompts

These prompts cover the core daily workflow of a FedEx FEC supervisor or manager: shift briefs, handoffs, escalations, and after-action reviews. All prompts use scrubbed, non-sensitive data only.

## Daily Manager Brief

```text
Act as a FedEx FEC supervisor or manager preparing a concise daily brief for your station or hub.

Context (scrubbed — no real names, addresses, tracking numbers, or package counts):
[Paste non-sensitive shift notes, volume ranges, staffing notes, weather summary,
equipment notes, and known constraints.]

Create a daily brief with:
- Top 5 priorities for this shift
- Risks to watch (weather, road, equipment, staffing)
- Sort hub / P&D / linehaul coordination notes
- Decisions needed and who should make them
- Owner and next step for each item

Rules:
- Do not invent facts.
- Put unclear items under "Needs verification."
- Keep it under 300 words.
- Include a safety reminder.
```

## Shift Handoff

```text
Turn these non-sensitive notes into a shift handoff for the incoming FedEx FEC supervisor or manager.

Outgoing shift: [Day/Evening/Night]
Incoming shift: [Day/Evening/Night]
Tone: direct, calm, and action-oriented

Notes (scrubbed):
[Paste notes. Remove all real names, addresses, tracking numbers, and package details.]

Return:
1. What changed since the last handoff
2. What is still open
3. High-risk items (safety, customer, linehaul)
4. Who owns each next step (roles, not names)
5. What to check first in the next shift
6. One safety reminder
```

## Escalation Summary

```text
Summarize this issue for an escalation to senior management or a support team.

Issue notes (scrubbed):
[Paste scrubbed notes. No real customer names, addresses, tracking numbers, or employee details.]

Return:
- Situation in 2 sentences
- Operational impact on station/hub flow
- Timeline
- Actions already taken
- Decision or help needed
- What information is missing

Use neutral language. Do not blame people. Flag assumptions.
```

## After-Action Review

```text
Create an after-action review from these non-sensitive notes.

Event:
[Describe the event in general terms.]

Notes (scrubbed):
[Paste notes.]

Return:
- What happened (confirmed facts only)
- What went well
- What slowed us down
- Root causes to investigate
- Corrective actions with owners
- Follow-up date

Separate confirmed facts from theories. No real employee names or incident IDs.
```

## Pre-Sort Stand-Up Brief

```text
Draft a 2-minute stand-up brief for a sort hub team before the sort starts.

Shift: [Twilight / Night / Day]
General volume context: [e.g., "typical Tuesday", "post-holiday", "peak surge"]
Equipment status (general): [e.g., all belts operational, chute 3 down for repair]
Known constraints: [e.g., late feeder arrival expected, overflow lot in use]

Return:
- 1 safety focus for this sort
- 1 throughput goal or expectation (general)
- 1 coordination note (P&D, linehaul, or QA)
- 1 "watch for" item
- Closing: "Safety Above All. Questions?"

Under 150 words. No real names, package counts, or facility security details.
```

## End-of-Shift Closeout Checklist

```text
Create an end-of-shift closeout checklist for a FedEx FEC supervisor or manager.

Shift: [Day/Evening/Night]
Operation type: [Station / Sort Hub / P&D / Linehaul]

Return a checklist with:
- Package holds and exceptions (general process check)
- Misload or damage reporting status
- Equipment inspection and handoff notes
- Communication to next shift (what they need to know)
- Safety incident or near-miss documentation
- Facility security check (general reminders)

Each item should have a checkbox and a notes line.
Include footer: "Verify all items with internal systems. This checklist is a draft template."
```

## Volume Anomaly Quick Check

```text
Help me think through a volume anomaly at my station or hub.

General context: [e.g., "higher than typical Tuesday", "unexpected drop in outbound"]
Possible factors: [e.g., weather, local event, system issue, carrier delay]

Return:
- 3 most likely causes to investigate
- 2 quick checks (what to verify first)
- 1 communication needed (who to notify, in general terms)
- 1 safety implication
- End with: "This is an analysis draft. Confirm all facts with internal systems."

No real package counts, customer names, or route details.
```
