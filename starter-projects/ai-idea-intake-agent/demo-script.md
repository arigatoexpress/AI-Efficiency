# AI Idea Intake Agent Demo Script

## Opening

This is a safe intake concept. The agent collects AI ideas and turns them into
reviewable use-case packets. It does not train a model, ingest confidential
screenshots, publish directly to GitHub, or make production changes.

## Demo Flow

1. Open the AI Ideas channel or show a mock Teams thread.
2. Submit a synthetic idea:

```text
I spend 20 minutes each day turning rough shift notes into a clear handoff. I
want an AI prompt that helps me organize the notes into priorities, risks, and
next steps.
```

3. Show the agent asking:
   - Who uses this?
   - What data is needed?
   - Is any sensitive data involved?
   - What output would save time?
   - Who should review it?
4. Show the draft intake packet.
5. Show the human review gate.
6. Show how an approved idea becomes a GitHub issue or prompt-library update.

## What To Emphasize

- The agent organizes ideas; it does not approve them.
- The agent creates a knowledge base; it does not train on employee data.
- Screenshots are scrubbed or rejected.
- Human reviewers decide what reaches GitHub.
- Sensitive categories route to governance before any pilot.

## Close

The value is a practical company-wide idea funnel: easier submissions, cleaner
triage, faster prompt reuse, and safer governance review.
