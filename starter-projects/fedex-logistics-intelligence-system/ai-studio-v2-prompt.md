# AI Studio V2 Prompt

Use this prompt to rebuild the current AI Studio app into a cleaner,
governance-safe station-ops prototype.

## Primary Build Prompt

```text
Build a full-stack Google AI Studio web app called Station Ops Intelligence
Console.

Audience:
Non-technical, station-level FEC supervisors and managers.

Purpose:
Help managers review public external risk signals before a shift. Focus on a
Gunnison, Colorado mountain-operations example using only public or synthetic
data.

Important safety framing:
- This is a prototype only.
- Do not claim it is an official FedEx production system.
- Do not use or request real FedEx package, route, customer, employee, security,
  facility, or confidential data.
- Do not include fake CCTV, fake parcel counts, fake internal telemetry, or
  "authorized personnel" production language.
- Do not include buttons that appear to reroute, dispatch, approve, send,
  escalate, or change a real operational plan.
- Every recommendation must say what needs human verification.

Core screens:
1. Shift Readiness
   - Top three public risks for the next shift.
   - What changed since the last check.
   - What a manager should verify internally.

2. Station Impact
   - Plain-English explanation of possible dock, yard, staffing, or handoff
     relevance.
   - Clear "possible impact, not confirmed impact" labels.

3. Route Watch
   - Public road/weather context for I-70, US-50, and Gunnison-area public
     routes.
   - Use public source links.
   - Do not claim to know real FedEx route plans.

4. Manager Drafts
   - Generate a pre-shift huddle note.
   - Generate a shift handoff.
   - Generate an after-action summary.
   - Each draft must include "Needs verification."

5. Source Trail
   - List every public source used.
   - Label each item as public fact, model forecast, synthetic demo data,
     manager note, or needs internal verification.

Data sources:
- National Weather Service API documentation:
  https://www.weather.gov/documentation/services-web-api
- Open-Meteo documentation:
  https://open-meteo.com/en/docs
- USGS earthquake API:
  https://earthquake.usgs.gov/fdsnws/event/1/
- COtrip public road condition site:
  https://www.cotrip.org/
- Public FedEx Gunnison location page:
  https://local.fedex.com/en-us/co/gunnison/47126
- Gunnison-Crested Butte Regional Airport public details:
  https://gunnisoncounty.org/703/Airfield-Details

Design:
- Clean operations dashboard, not a sci-fi command center.
- Dense but readable.
- Plain English.
- Accessible contrast.
- Stable responsive layout for desktop and tablet.
- Use clear status labels: Normal, Watch, Verify, Escalate to human.
- Add a top banner: "Prototype only. Public and synthetic data. Human review
  required."

Engineering:
- Keep API keys server-side only.
- Do not expose secrets in browser code.
- Cache public API responses responsibly.
- Show source timestamps.
- Fail gracefully when a public source is unavailable.
- Include a README, demo script, data map, and governance notes.

Output:
Generate the complete app and include clear source comments where public data is
mapped into manager-facing summaries.
```

## Follow-Up Prompts

Use these after the first build.

### Make It Manager-Readable

```text
Rewrite every label so a busy FEC supervisor or manager can understand it in under
five seconds. Remove military, hacker, surveillance, or production-command
language.
```

### Add Source Trail

```text
Add a source trail panel. Every risk card must show whether it came from a
public source, synthetic demo data, or a manager note. Add a "needs internal
verification" field.
```

### Remove Live-Action Risk

```text
Remove any button that appears to change a real operational plan. Replace those
buttons with "Draft verification checklist" or "Draft manager note."
```

### Export Packet

```text
Create a governance review packet in Markdown with data classification, public
sources, synthetic data, risks, human review path, and production blockers.
```

### Prepare For GitHub

```text
Prepare this project for GitHub export. Add README.md, demo-script.md,
governance-review.md, source-notes.md, .env.example, and a no-secrets checklist.
```
