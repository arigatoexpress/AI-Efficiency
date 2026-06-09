# Daily Operations Playbook

A printable, run-it-every-day playbook for a FedEx FEC supervisor or manager
running a station, sort hub, P&D, or linehaul operation. It walks through a full
shift — pre-shift, mid-shift, peak/surge, handoff, end of shift — plus a weekly
cadence. Each phase gives you a quick human checklist and one or two
ready-to-paste prompts for Gemini or ChatGPT.

This is **not** an official FedEx system. It does not connect to any FedEx system,
and it does not make decisions. It helps you think, draft, and communicate faster.
A human manager owns every decision.

## Who It Helps

- New and experienced FEC supervisors and managers who run a daily shift.
- P&D, sort, and linehaul managers who coordinate people, flow, and exceptions.
- Anyone who wants a calm, repeatable routine instead of firefighting from memory.

## When To Use It

- Print one phase per page and keep it at your desk or on a clipboard.
- Run the human checklist first. Use the AI prompt only when a draft would save time
  (a brief, a handoff, a message, an after-action).

## Do Not Use It For

- Real customer, package, route, employee, or facility-security data.
- Final safety, HR, legal, financial, or disciplinary decisions.
- Anything that sends a message or changes a system automatically.

---

## How To Use This Playbook

Think of it as **one page per phase of your day**. You do not read it cover to
cover. You jump to the phase you are in, run the short human checklist, and — only
if a draft would help — paste a prompt into Gemini or ChatGPT.

The rhythm is always the same:

1. **Do the human checklist first.** It is the real work. AI is optional.
2. **Scrub before you paste.** Remove anything sensitive (see the Safe Prompt Rule below).
3. **Use a prompt to draft, not to decide.** Treat every output as a first draft.
4. **Review against what you actually know.** If AI guessed, fix it or delete it.
5. **Edit it in your own voice.** Then share or act — as the human owner.

Every prompt here uses placeholders like `[Station A]` or `[volume range]`. Fill
them in with **scrubbed, non-sensitive** values only. Never type a real name,
address, tracking number, package count, route ID, or security detail.

---

## Safety Above All + The Safe Prompt Rule

> **Safety Above All** is FedEx's #1 operating value. This playbook never asks AI
> to make a safety call. It helps you prepare, communicate, and document — the
> decision stays with you.

**The Safe Prompt Rule:**

Never include real customer, employee, package, route, facility-sensitive, or
security-sensitive data unless the tool and workflow are approved for that data.

Use placeholders instead:

```text
[Station A]
[Shift 2]
[Customer group]
[Package volume range]
[Issue category]
[ISP name — if public and approved]
```

Three rules that apply to every prompt below:

1. **Remove sensitive data before you paste.** No real names, addresses, tracking
   numbers, package counts, route manifests, or security details.
2. **Review the output before you share or act.** Separate facts from assumptions.
   Confirm anything operational with internal systems and local leadership.
3. **A human owns every decision.** AI drafts. You verify, edit, and own it.

---

## Phase 1 — Pre-Shift / Start of Shift

Open the building, read public risk signals, and set the huddle.

### Quick checklist

- [ ] Walk the building: doors, lighting, dock, yard, walkways clear and safe.
- [ ] Confirm PPE available and Three Points of Contact reminders posted.
- [ ] Check public weather and public road/corridor conditions for your area.
- [ ] Confirm staffing for the shift; note any gaps (roles, not names).
- [ ] Note equipment status in general terms (e.g., "belt 2 down for repair").
- [ ] Set the top 3 priorities and one safety focus for the huddle.

### Prompt — Morning readiness brief

```text
Act as a practical FedEx FEC supervisor or manager preparing a pre-shift readiness brief.

Use only public information and the scrubbed context below. Do not make
operational decisions. Separate confirmed public facts from assumptions.

Context (scrubbed — no real names, addresses, tracking numbers, or package counts):
[Operation type: Station / Sort Hub / P&D / Linehaul]
[Shift window]
[Public weather summary]
[Public road or corridor conditions]
[General staffing notes — roles, not names]
[General equipment status]

Return:
- Top 3 public risks to watch (weather, road, equipment, staffing)
- Possible impact on station/hub flow
- What to verify with internal systems before acting
- Plain-English huddle talking points
- One safety focus for this shift

Keep it under 250 words. Put anything unclear under "Needs verification."
```

### Prompt — Pre-sort stand-up brief

```text
Draft a 2-minute stand-up brief for the team before the shift or sort starts.

Shift: [Twilight / Night / Day]
General volume context: [e.g., "typical Tuesday", "post-holiday", "peak surge"]
Equipment status (general): [e.g., all belts operational, chute 3 down]
Known constraints: [e.g., late feeder arrival expected, overflow lot in use]

Return:
- 1 safety focus for this shift
- 1 throughput goal or expectation (general)
- 1 coordination note (P&D, linehaul, or QA)
- 1 "watch for" item
- Closing: "Safety Above All. Questions?"

Under 150 words. No real names, package counts, or facility security details.
```

---

## Phase 2 — Mid-Shift / Flow & Exceptions

Watch the flow, triage exceptions, and coordinate with contractors and ISPs.

### Quick checklist

- [ ] Walk the floor; confirm safe work behaviors and clear travel paths.
- [ ] Compare today's flow to a normal day for this shift — note any anomaly.
- [ ] Triage open exceptions: what is urgent vs. what can wait.
- [ ] Confirm P&D, linehaul, QA, and ISP/contractor coordination is on track.
- [ ] Decide what needs escalation and who should make each call.
- [ ] Log near-misses or hazards; address them now.

### Prompt — Volume anomaly quick check

```text
Help me think through a volume anomaly at my [station / sort hub].

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

### Prompt — Escalation summary

```text
Summarize this issue for an escalation to senior management or a support team.

Issue notes (scrubbed):
[Paste scrubbed notes. No real customer names, addresses, tracking numbers,
or employee details.]

Return:
- Situation in 2 sentences
- Operational impact on station/hub flow
- Timeline
- Actions already taken
- Decision or help needed
- What information is missing

Use neutral language. Do not blame people. Flag assumptions.
```

### Prompt — ISP / contractor coordination note

```text
Act as a FedEx P&D manager writing a short coordination note to an ISP or
contractor partner.

Context (scrubbed):
[Operation type and shift]
[General issue or change — e.g., late inbound, density shift, weather risk]
[What you need from the partner, in general terms]

Return a brief, respectful note that:
- States the situation in plain English
- Explains the operational impact in general terms
- Makes a clear, specific request with a suggested time to reconnect
- Ends with a line reminding both sides to verify details with their own systems

No real names, addresses, route IDs, or package counts.
[ISP name — only if public and approved]
```

---

## Phase 3 — Peak / Surge Spike

When volume or weather breaks bad and the day stops looking normal.

### Quick checklist

- [ ] Pause and confirm: are people still working safely? Adjust pace if not.
- [ ] Name the surge driver in general terms (weather, volume, equipment, late feeder).
- [ ] Re-rank priorities: what must move, what can flex, what can wait.
- [ ] Identify the single biggest bottleneck right now.
- [ ] Decide what to escalate and who owns each next step (roles, not names).
- [ ] Communicate the plan to the team in one clear, calm message.

### Prompt — Surge response plan

```text
Act as a calm, practical FedEx FEC supervisor or manager responding to a surge.

Use only the scrubbed context below. Do not make operational decisions —
help me prepare options.

Context (scrubbed):
[Operation type and shift]
[Surge driver — e.g., weather, volume spike, equipment down, late linehaul]
[Constraints — staffing, equipment, time window, in general terms]

Return:
- The single most likely bottleneck to address first
- 3 options to relieve flow, with a one-line trade-off for each
- Who should own each next step (roles, not names)
- One safety reminder for working under pressure
- What to verify with internal systems before committing

Keep it short and scannable. Separate facts from assumptions.
```

### Prompt — Weather-to-work team message

```text
Public weather shows [wind / snow / low visibility / severe cold / heat] in our area.

Draft a short, calm message to the team that:
- Names the weather signal and why it matters for safety and flow
- Lists 2-3 dock, yard, ramp, or handoff considerations to "consider checking"
- Reminds everyone of Three Points of Contact and PPE
- Says clearly that final calls come from local leadership and internal systems

Use "consider checking" rather than "do this." Under 150 words.
No real names or facility security details.
```

---

## Phase 4 — Handoff

Hand the operation to the next shift cleanly, so nothing falls through.

### Quick checklist

- [ ] Confirm what changed since the last handoff.
- [ ] List what is still open and who is carrying it.
- [ ] Flag high-risk items (safety, customer, linehaul).
- [ ] Note decisions made by humans this shift.
- [ ] State what the next shift should check first.
- [ ] Include one safety reminder.

### Prompt — Shift handoff

```text
Turn these non-sensitive notes into a shift handoff for the incoming FedEx
FEC supervisor or manager.

Outgoing shift: [Day / Evening / Night]
Incoming shift: [Day / Evening / Night]
Tone: direct, calm, and action-oriented

Notes (scrubbed):
[Paste notes. Remove all real names, addresses, tracking numbers, and
package details.]

Return:
1. What changed since the last handoff
2. What is still open
3. High-risk items (safety, customer, linehaul)
4. Who owns each next step (roles, not names)
5. What to check first in the next shift
6. One safety reminder

Keep it under 250 words. Flag anything that needs confirmation.
```

---

## Phase 5 — End of Shift / After-Action

Close out cleanly and capture what to fix tomorrow.

### Quick checklist

- [ ] Run the closeout: holds/exceptions, misload or damage reporting status.
- [ ] Inspect and hand off equipment; note anything down.
- [ ] Document any safety incident or near-miss.
- [ ] Complete a general facility security check.
- [ ] Note the one thing that slowed the shift down.
- [ ] Capture one improvement idea for tomorrow.

### Prompt — End-of-shift closeout checklist

```text
Create an end-of-shift closeout checklist for a FedEx FEC supervisor or manager.

Shift: [Day / Evening / Night]
Operation type: [Station / Sort Hub / P&D / Linehaul]

Return a checklist with:
- Package holds and exceptions (general process check)
- Misload or damage reporting status
- Equipment inspection and handoff notes
- Communication to next shift (what they need to know)
- Safety incident or near-miss documentation
- Facility security check (general reminders)

Each item should have a checkbox and a notes line.
Include footer: "Verify all items with internal systems. This checklist is a
draft template."
```

### Prompt — After-action review

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
- Corrective actions with owners (roles, not names)
- Follow-up date

Separate confirmed facts from theories. No real employee names or incident IDs.
```

---

## Phase 6 — Weekly Cadence

Once a week, step back from the daily run.

### Quick checklist

- [ ] Hold a safety meeting; review near-misses and one safety focus.
- [ ] Review the week's metrics in general trends (not exact internal numbers).
- [ ] Pick **one** improvement idea to test next week.
- [ ] Recognize one team or partner win.
- [ ] Note anything to raise with senior leadership.

### Prompt — Weekly review and one improvement

```text
Act as a practical FedEx FEC supervisor or manager preparing a short weekly review.

Use only the scrubbed, general context below. Use general trends, not exact
internal numbers. Do not invent facts.

Context (scrubbed):
[Operation type]
[General trend notes — e.g., "flow steadier midweek", "more weather days"]
[Recurring friction point]
[Any safety items — near-misses in general terms]

Return:
- 3 takeaways from the week (plain English)
- 1 safety focus for next week
- 1 improvement idea to test, with how we would know it worked
- Who should own the improvement (role, not name)
- One open question to raise with senior leadership

Keep it under 250 words. Put anything unconfirmed under "Needs verification."
```

---

## Print Me — Daily One-Pager

Tape this up. Just the human steps — no prose, no AI required.

**PRE-SHIFT**
- [ ] Walk building: doors, dock, yard, walkways safe and clear
- [ ] PPE available; Three Points of Contact posted
- [ ] Check public weather + road conditions
- [ ] Confirm staffing; note gaps (roles, not names)
- [ ] Note equipment status
- [ ] Set top 3 priorities + 1 safety focus → huddle

**MID-SHIFT**
- [ ] Walk floor: safe behaviors, clear paths
- [ ] Compare flow to a normal day; note anomalies
- [ ] Triage open exceptions (urgent vs. wait)
- [ ] Confirm P&D / linehaul / QA / ISP coordination
- [ ] Decide what to escalate + who owns it
- [ ] Log and address near-misses now

**PEAK / SURGE**
- [ ] Confirm people are still working safely
- [ ] Name the surge driver
- [ ] Re-rank: must move / can flex / can wait
- [ ] Find the #1 bottleneck
- [ ] Escalate + assign owners (roles)
- [ ] Send one calm, clear team message

**HANDOFF**
- [ ] What changed
- [ ] What is still open + who carries it
- [ ] High-risk items (safety, customer, linehaul)
- [ ] Human decisions made this shift
- [ ] What next shift checks first
- [ ] One safety reminder

**END OF SHIFT**
- [ ] Closeout: holds, exceptions, misload/damage status
- [ ] Equipment inspected + handed off
- [ ] Document incidents / near-misses
- [ ] Facility security check
- [ ] Note the #1 thing that slowed us down
- [ ] Capture 1 improvement idea for tomorrow

**WEEKLY**
- [ ] Safety meeting + 1 safety focus
- [ ] Review metrics as general trends
- [ ] Pick 1 improvement to test
- [ ] Recognize 1 team or partner win
- [ ] Note items for senior leadership

**SAFE PROMPT RULE:** Scrub sensitive data → review the output → a human owns
every decision. Never paste real customer, employee, package, route, or security
data. **Safety Above All.**

---

This is a draft template, not an official FedEx system. Use synthetic or approved
non-sensitive data only. A human owner must review all outputs before they are
shared or acted on. See the [prompt library](../prompts/README.md) and
[FedEx terminology guide](fedex-terminology.md) for more.
