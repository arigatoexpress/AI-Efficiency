# Bid And Opportunity Support Prompts

These prompts are for early, non-sensitive bid or opportunity support. They are
not a substitute for official pricing, procurement, legal, sales, or customer
commitments.

## Opportunity Intake

```text
Act as an FEC supervisor or manager helping organize a possible opportunity.

Opportunity summary:
[Paste non-sensitive summary.]

Return:
- What the opportunity appears to be
- Who should review it
- Information needed before a go/no-go decision
- Operational constraints to check
- Customer or legal commitments to avoid making too early
- Recommended next step

Do not invent pricing, capacity, service commitments, or approval status.
```

## Bid Readiness Checklist

```text
Create a bid readiness checklist from this non-sensitive description.

Description:
[Paste description.]

Return a checklist grouped by:
- Business fit
- Operational capacity
- Staffing
- Service-level risk
- Data needed
- Legal/compliance review
- Customer communication

Flag anything that needs official approval.
```

## Go / No-Go Brief

```text
Create a draft go/no-go brief.

Context:
[Paste non-sensitive context.]

Return:
- Recommendation: Go, No-go, or Needs more information
- Reasons supporting the recommendation
- Biggest risks
- Missing data
- Reviewers needed
- Next action

Do not make the final decision. This is a draft for human review.
```

## Customer-Facing Language Check

```text
Review this draft for risky customer-facing language.

Draft:
[Paste draft.]

Return:
- Commitments that may be too strong
- Claims that need verification
- Legal/compliance review triggers
- Safer wording
- Questions to ask before sending
```
