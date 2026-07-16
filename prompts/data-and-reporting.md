# Data And Reporting Prompts

## Report Summary

```text
Summarize this report for an FEC supervisor or manager.

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

## Derived Priority Metrics Executive Review

```text
Use this only in an AI tool approved for the data classification, and only to
review derived, scrubbed output from the Priority Metrics Intelligence
workflow. Do not accept a raw report as input.

Allowed input:
- The workflow's derived analysis.json or brief.md content after a human has
  confirmed it contains synthetic or approved non-sensitive aggregate data.

Not allowed:
- Raw reports, names, employee or customer data, package or tracking data,
  routes, addresses, manifests, facility-security details, source-system
  fields, free-text notes, or any other identifying or sensitive data.

Derived output:
[Paste the reviewed analysis.json or brief.md content here.]

Prepare an executive review with these sections:
1. Confirmed facts — state only values and periods present in the input.
2. Risks requiring human review.
3. Candidate hypotheses — preserve the label “candidate association.”
4. Baseline outlook — preserve its method, input window, and limitations.
5. Missing evidence and items that need verification.
6. Questions for the data owner.

Rules:
- Do not invent, estimate, interpolate, or complete a missing value.
- Do not make causal, driver, prediction, or guarantee claims from an
  association or baseline.
- Keep facts, hypotheses, and limitations separate.
- Recommend review questions only, not staffing, routing, personnel, dispatch,
  messaging, or other operational actions.
- Mark every unverified statement “Needs verification.”
- End by reminding the reviewer to verify important values against approved
  internal systems before sharing or acting.

Review the draft against the derived input. Remove any value or claim that is
not directly supported, and keep a human owner accountable for the final use.
```
