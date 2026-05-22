# Data And Reporting Prompts

## Report Summary

```text
Summarize this report for an operations manager.

Report text or non-sensitive extract:
[Paste text.]

Return:
- 5 key takeaways
- What changed from the prior period, if known
- Risks
- Recommended actions
- Questions to ask the data owner

Do not invent trends that are not visible in the data.
```

## Metrics Interpretation

```text
Help interpret these metrics.

Metrics:
[Paste non-sensitive metric names and values.]

Context:
[Describe time period and operation.]

Return:
- What looks normal
- What looks unusual
- Possible explanations
- Follow-up data needed
- Actions that are safe now
- Actions that should wait for confirmation
```

## Data Request Draft

```text
Draft a clear data request.

Business question:
[What are we trying to answer?]

Decision it supports:
[What decision depends on this?]

Return:
- Requested fields
- Time period
- Filters
- Granularity
- Privacy concerns
- Why each field is needed
- Suggested summary output
```

## Dashboard Feedback

```text
Review this dashboard description for manager usefulness.

Dashboard description:
[Paste description or field list.]

Return:
- What decisions it supports
- What is confusing
- Missing filters or context
- Metrics that need definitions
- Suggested layout improvements
- Risks of misinterpretation
```
