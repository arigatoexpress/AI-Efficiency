# Teams And Telegram Agent Roadmap

Last reviewed: 2026-05-23

The intake agent is a later phase. It should not be built as a self-training
bot that silently absorbs employee feedback. It should be a governed intake
assistant that turns safe submissions into reviewable ideas, issues, and pilot
packets.

## Preferred First Channel

Microsoft Teams or Microsoft 365 Copilot should be the first enterprise path if
FedEx IT confirms it is approved for this use.

Telegram should remain a dry-run prototype unless FedEx explicitly approves it
for the team.

## What The Agent Should Do

- collect AI ideas from managers;
- ask for use case, audience, data needed, expected value, and risk;
- warn users not to submit sensitive information;
- summarize submissions into a standard pilot template;
- route drafts to a human reviewer;
- optionally draft GitHub issues or repo docs after review;
- track status such as new, needs clarification, governance review, rejected,
  approved pilot, or shipped.

## What The Agent Should Not Do Yet

- send external messages;
- auto-create production tasks;
- train a model from employee messages;
- store screenshots without approval;
- ingest customer, package, employee, security, or route data;
- make operational recommendations without human review.

## Safe Intake Fields

```yaml
submitter_role:
station_or_region:
use_case:
current_pain:
who_it_helps:
data_needed:
data_classification_guess:
expected_time_saved:
risk_notes:
human_owner:
requested_next_step:
```

## Screenshot And Feedback Rules

Screenshots should be disabled by default.

If governance later allows screenshots:

- show a warning before upload;
- require user confirmation that sensitive data was removed;
- store outside public GitHub;
- run redaction before review;
- restrict access to named reviewers;
- define retention before collection starts.

## Repository Linkage

The agent should create drafts, not direct commits.

Safe outputs:

- GitHub issue draft;
- Markdown pilot packet draft;
- prompt-library contribution draft;
- governance checklist draft.

Unsafe outputs:

- direct commits to protected branches;
- automatic publication;
- external sends;
- actions in production systems.

## Security Baseline

- identity-aware access;
- role-based permissions;
- audit log for every submission and action;
- no secrets in prompts;
- no model training by default;
- retention policy before storage;
- human approval before any repo write or external message.

## First Pilot

Start with a text-only Teams intake flow:

1. User submits a non-sensitive AI idea.
2. Agent asks missing intake questions.
3. Agent classifies data risk.
4. Agent drafts a pilot packet.
5. Human reviewer approves, edits, rejects, or asks for more detail.
6. Approved drafts become GitHub issues or docs.
