# Manager Workflows

These are the workflows that make the app useful for non-technical station
operations managers.

Each workflow should end with a human-reviewed draft, checklist, or summary. The
app should not make operational decisions by itself.

## 1. Morning Readiness Brief

Use when a manager wants a quick public-risk summary before the shift.

Inputs:

- station or region;
- shift time window;
- public weather and road signals;
- any manager-entered non-sensitive context.

Output:

- top three public risks;
- possible station impact;
- what needs verification;
- suggested manager questions for the pre-shift huddle.

Example prompt:

```text
Create a morning readiness brief for a station operations manager.

Use only public information and the synthetic station profile shown in the app.
Separate confirmed public facts from assumptions. Do not make operational
decisions.

Return:
- Top risks
- Possible station impact
- What to verify with internal systems
- Plain-English huddle talking points
```

## 2. Mountain Pass Disruption Review

Use when I-70, US-50, or another public corridor may affect linehaul timing.

Output:

- affected public corridor;
- public source link;
- likely categories of operational impact;
- safe internal verification questions.

Manager-safe wording:

```text
Public road conditions suggest a possible disruption. Verify with dispatch,
linehaul systems, and local leadership before changing any plan.
```

## 3. Weather-To-Work Checklist

Use when public weather shows wind, snow, low visibility, severe cold, or other
conditions that could affect people and flow.

Output:

- weather signal;
- why it matters;
- dock, yard, ramp, or handoff considerations;
- verification owner;
- draft message to the team.

The app should say "consider checking" rather than "do this."

## 4. Shift Handoff Draft

Use at the end of a shift to turn notes into a concise handoff.

Inputs:

- scrubbed manager notes;
- public risk signals from the app;
- unresolved questions.

Output:

- situation;
- risks;
- decisions made by humans;
- open items;
- owner and next check time.

Example prompt:

```text
Turn these scrubbed notes into a handoff for the incoming operations manager.
Keep it under 250 words. Flag anything that needs confirmation.

Notes:
[paste scrubbed notes]
```

## 5. After-Action Summary

Use after a disruption to capture lessons without blaming people.

Output:

- what happened;
- public factors involved;
- what went well;
- friction points;
- AI prompt or process improvement idea;
- follow-up owner.

Do not include employee performance comments, customer names, tracking numbers,
or private screenshots.

## 6. AI Idea Capture

Use when a manager sees a repeatable friction point.

Output:

- use case;
- data needed;
- sensitive-data risk;
- expected time saved;
- draft GitHub issue using the AI idea template.

This should connect to the
[AI Idea Intake Agent](../ai-idea-intake-agent/README.md), not bypass review.
