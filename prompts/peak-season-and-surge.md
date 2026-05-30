# Peak Season and Surge Planning Prompts

Peak season (roughly October through January) is the highest-stakes period for FedEx operations. These prompts help managers plan, communicate, and debrief without exposing real volume forecasts, staffing numbers, or customer data.

## Pre-Peak Contingency Brief

```text
Act as an operations manager preparing for peak season volume surge.

Station/Region: [General region name]
Historical context (scrubbed): [e.g., last year we saw volume increase in this general range]
Known constraints (non-sensitive): [e.g., parking lot repaving, new scanner rollout, contractor availability]

Return a pre-peak brief with:
- 3 likely pressure points (sort capacity, P&D routes, linehaul timing)
- 2 early-warning signals to watch
- 2 contingency options for each pressure point
- 1 staffing flexibility idea
- Communication plan for contractors/ISPs (if applicable)
- End with: "This is a planning draft. Confirm all numbers with internal systems."

Keep under 400 words. Use placeholders for any specific numbers.
```

## Daily Surge Checklist

```text
Create a daily surge-readiness checklist for an operations manager.

Return as a printable checklist with:
- Sort hub / station readiness (equipment, staffing plan, overflow space)
- P&D capacity (vehicle status, route density estimate, ISP communication)
- Linehaul / feeder window (pickup times, trailer availability, alternate routing)
- Customer communication (known delays, service alerts, Purple Promise reminders)
- End-of-shift closeout (package holds, misloads, damage reporting)

Each item should be a yes/no/needs attention checkbox with a notes line.
Include a footer: "Verify all numbers with internal systems. This checklist is a draft template."
```

## Post-Peak After-Action Review

```text
Draft a post-peak after-action review from scrubbed notes.

Region/General area: [Name]
Peak period: [General timeframe]
Key themes from notes: [e.g., sort capacity held well, P&D had weather delays, linehaul was tight on Tuesdays]

Return:
- What went well (3 items)
- What slowed us down (3 items)
- Root causes to investigate (2 items)
- 3 recommendations for next peak
- 1 metric to track year-over-year
- Owners and follow-up dates

Use general terms. No real customer names, package counts, or employee performance details.
```

## Contractor / ISP Coordination Brief (Ground)

```text
Draft a coordination brief for independent service providers (ISPs) before a surge period.

General area: [Region]
Expected change: [e.g., higher package density, extended delivery window, Sunday coverage]
Support available: [e.g., extra trailer drops, later pickup window, temporary overflow lot]

Return:
- What is changing and why (2 sentences)
- What ISPs should prepare (3 items)
- What support the station is providing (2 items)
- How to communicate issues (channel and response time)
- Reminder about safety and vehicle inspection priorities

Tone: partnership, not command. Under 250 words. No real contractor names or specific route details.
```

## Sort Hub Staffing Scenario Planner

```text
Help me think through sort hub staffing scenarios for a high-volume day.

Shift: [Day/Evening/Twilight/Night]
Known factors (scrubbed): [e.g., typical package range, equipment status, training level of available team]
Constraints: [e.g., break coverage, mandatory rotation, safety observer requirement]

Return 3 scenarios:
- Best case: everything goes smoothly
- Most likely: minor delays, one equipment issue
- Challenging: significant delay, staffing shortfall, or weather impact

For each scenario:
- Staffing arrangement (general roles, not names)
- Key risk points
- Trigger for escalating to next scenario
- Communication needed

Label all numbers as estimates. Add: "Verify staffing plans with HR and scheduling systems."
```

## Weather Contingency for Peak Volume

```text
Draft a weather contingency plan for peak-season operations.

General area: [Region]
Weather risk: [e.g., snow, ice, high wind, flooding]
Operational exposure: [e.g., mountain passes on linehaul routes, residential P&D on hills]

Return:
- Weather monitoring sources (public sources only: NWS, Open-Meteo, COtrip)
- Decision points and who makes them (roles, not names)
- 3 operational adjustments to consider
- Customer communication template (generic, no real names or tracking numbers)
- Recovery sequence when weather clears
- Safety reminder

Keep it practical. Under 350 words. All data sources must be public.
```
