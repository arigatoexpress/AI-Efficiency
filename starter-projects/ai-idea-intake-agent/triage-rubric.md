# AI Idea Triage Rubric

Use this rubric to score submitted ideas before they become issues or starter
projects.

## Score 1: Value

| Score | Meaning |
| --- | --- |
| 1 | Nice to have, unclear value. |
| 2 | Helps one person or one rare task. |
| 3 | Helps a recurring team workflow. |
| 4 | Helps many managers or saves clear time. |
| 5 | High-value workflow with measurable impact and broad reuse. |

## Score 2: Data Safety

| Score | Meaning |
| --- | --- |
| 1 | Requires sensitive or restricted data. |
| 2 | Likely touches sensitive data. |
| 3 | Can be done with scrubbed data. |
| 4 | Can be done with synthetic or public data. |
| 5 | No sensitive data needed. |

## Score 3: Implementation Effort

| Score | Meaning |
| --- | --- |
| 1 | Needs production integration or heavy engineering. |
| 2 | Needs custom app plus approvals. |
| 3 | Needs a small prototype. |
| 4 | Needs a prompt, checklist, or guide. |
| 5 | Can be done today with existing approved tools. |

## Recommended Priority

High priority:

```text
Value >= 4, Data Safety >= 4, Effort >= 3
```

Good prompt-library candidate:

```text
Value >= 3, Data Safety >= 4, Effort >= 4
```

Governance-first:

```text
Data Safety <= 2
```

Hold:

```text
Requires HR, legal, safety, customer, package, pricing, or production-system
data and does not have an approved review path.
```
