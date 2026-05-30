# Linehaul and Routing Prompts

Linehaul (long-distance transport between hubs and stations) and P&D routing are core FedEx operations. These prompts help managers plan, communicate, and problem-solve without exposing real route manifests, carrier contracts, or facility security details.

## Feeder Delay Communication

```text
Draft a communication about a feeder/linehaul delay for station awareness.

General route: [e.g., "eastbound mountain corridor"]
Cause: [General, e.g., "road closure", "weather hold", "mechanical"]
Estimated impact: [General timeframe]

Return:
- What is delayed (general lane description)
- Why (1 sentence, no blame)
- Expected recovery window
- Impact on sort schedule (general)
- Actions for station team (2 items)
- Who to contact for updates (role)

Under 200 words. No real driver names, trailer numbers, or carrier details.
```

## Alternate Routing Recommendation

```text
Help me evaluate alternate routing options for a disrupted linehaul lane.

Primary lane: [General description, e.g., "I-70 westbound through Vail Pass"]
Disruption: [General, e.g., "winter storm closure", "construction delay"]
Alternate options to consider: [List general routes]

Return:
- Pros and cons of each alternate (distance, time, risk, capacity)
- Recommended alternate with reasoning
- Trigger points for switching back to primary
- Communication needed (roles, not names)
- Safety considerations

Label all times and distances as estimates. Add: "Verify routes with carrier dispatch and official road sources."
```

## P&D Route Density Brief

```text
Draft a route density brief for P&D planning. Use only synthetic or public data.

Area type: [e.g., urban residential, suburban commercial, rural]
Day of week: [e.g., Tuesday, Saturday]
Seasonal factor: [e.g., peak, back-to-school, normal]

Return:
- Expected density profile (general description, not real numbers)
- 2 common bottleneck areas for this area type
- 1 efficiency opportunity
- 1 safety reminder for the area type
- Suggestion for ISP/contractor communication (if Ground)

All numbers are synthetic estimates. Verify with internal route planning systems.
```

## Sort Hub Throughput Quick Check

```text
Help me prepare a sort hub throughput quick-check brief.

Shift: [Day/Evening/Twilight/Night]
General volume context: [e.g., "typical Tuesday", "post-holiday return volume", "peak surge"]
Equipment status (general): [e.g., all belts operational, one chute down for maintenance]

Return:
- 3 things that typically slow throughput
- 2 early-warning signs to watch
- 1 staffing flexibility option
- 1 communication trigger (when to escalate)
- End with safety reminder

Use general operational knowledge. No real facility-specific details or employee names.
```

## Yard and Trailer Management Reminder

```text
Draft a yard and trailer management reminder for a sort hub or station.

Context: [e.g., peak volume, new trailer pool, contractor pickup window change]

Return:
- 3 yard safety rules
- 2 trailer check-in/check-out best practices
- 1 reminder about seal integrity
- 1 communication protocol for late or missing trailers
- Where to report issues (role-based, not specific contact)

Under 200 words. No real trailer numbers, seal numbers, or yard layouts.
```

## Cross-Dock Timing Coordination

```text
Draft a cross-dock timing coordination note for a hub operation.

Inbound windows: [General, e.g., "morning feeder from east", "afternoon feeder from west"]
Outbound windows: [General, e.g., "P&D dispatch", "evening linehaul departures"]
Known constraint: [General, e.g., "shorter sort window today", "equipment maintenance"]

Return:
- Inbound-to-outbound timeline (general time ranges)
- Critical handoff points
- 2 risks if inbound is delayed
- 1 mitigation for each risk
- Who needs to know (roles)

Label all times as estimates. Verify with internal scheduling systems.
```
