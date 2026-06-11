# Governance Review — ADK Shift-Brief Agent

## What data it touches

- **Today:** only `sample_signals.json` — invented, clearly-labeled synthetic
  signals shipped in this folder. The tools import no network modules (verified
  by `test/run_checks.py` in CI).
- **Pilot (proposed, not approved):** the same public NWS / DOT feeds the
  logistics intelligence app already uses. Still no internal data.
- **Never (without a separate approved environment):** package, route,
  customer, employee, pricing, or security data.

## Where model calls go

- Running the checks: nowhere — no model call, no key, no network.
- Running the agent: the prompt and tool results go to the configured Gemini
  model (Gemini API or Vertex AI). First live runs happen under the enterprise
  account once granted, not personal keys. `.env` (keys) is gitignored.

## Agency level

Rung 2-3 of the [agency ladder](../../docs/technology/agentic-ai-for-operations.md):
plans tool calls toward a drafting goal, **cannot act** — no send, write,
dispatch, or reroute surface exists. Every output carries the mandatory
"Needs manager verification" footer.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Model invents a signal or drops a label | Instruction pins labels + skeleton from `format_brief`; demo script tells the presenter to check labels on screen; human review required on every draft. |
| Someone pastes sensitive content into the chat | `check_data_safety` flags tracking-number/email/phone/confidential patterns and the instruction requires declining flagged content; Safe Prompt Rule still applies (the gate is a seatbelt, not a guarantee). |
| Kit copied for a new agent without review | The README names this file as part of the template; the [project review checklist](../../docs/governance/project-review-checklist.md) applies to every new agent before sharing. |
| Tool surface widened silently | CI runs `test/run_checks.py`, which fails if network imports or send/dispatch-named tools appear. |

## Approval checklist (pre-pilot)

- [ ] Org team confirms Gemini Enterprise edition and data-protection terms
- [ ] Admin agrees to register the agent (ADK registration or A2A route)
- [ ] Real public-feed tools reviewed (sources, rate limits, attribution)
- [ ] Named human owner for the pilot
- [ ] Project review checklist completed
